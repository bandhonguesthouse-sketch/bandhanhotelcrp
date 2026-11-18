const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./lib/db');

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'assets', 'img', 'uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const sessions = new Map();
const loginAttempts = new Map();
const SESSION_TTL = 12 * 60 * 60 * 1000;

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req, limit = 8 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('ফাইল অনেক বড় (সর্বোচ্চ ৬ মেগাবাইট)'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('অবৈধ JSON'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function issueToken(username) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { username, expires: Date.now() + SESSION_TTL });
  return token;
}

function authUser(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+([a-f0-9]{64})$/i);
  if (!match) return null;
  const session = sessions.get(match[1]);
  if (!session) return null;
  if (session.expires < Date.now()) {
    sessions.delete(match[1]);
    return null;
  }
  return session;
}

function requireAuth(req, res) {
  const user = authUser(req);
  if (!user) {
    json(res, 401, { error: 'লগইন প্রয়োজন। আবার লগইন করুন।' });
    return null;
  }
  return user;
}

const ALLOWED_STATUS = ['Pending', 'Confirmed', 'Checked-in', 'Completed', 'Cancelled'];

function cleanText(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function normalizePhone(value) {
  return String(value || '').replace(/[\s-]/g, '');
}

function validPhone(phone) {
  return /^(?:\+?880|0)1[3-9]\d{8}$/.test(phone);
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function dateNights(checkIn, checkOut) {
  if (!validDate(checkIn) || !validDate(checkOut)) return 1;
  const a = new Date(checkIn + 'T00:00:00Z').getTime();
  const b = new Date(checkOut + 'T00:00:00Z').getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 1;
  return Math.max(1, Math.ceil((b - a) / 86400000));
}

function newOrderId(existing) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const taken = new Set(existing.map((o) => o.id.toUpperCase()));
  for (let attempt = 0; attempt < 20; attempt++) {
    let id = 'BGH-';
    for (let i = 0; i < 6; i++) id += alphabet[crypto.randomInt(alphabet.length)];
    if (!taken.has(id)) return id;
  }
  return 'BGH-' + crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
}

function publicSettings(settings) {
  const { adminPassword, ...rest } = settings;
  return rest;
}

function statsFrom(orders, rooms, gallery) {
  const count = (status) => orders.filter((o) => o.status === status).length;
  const earned = orders.filter((o) => ['Confirmed', 'Checked-in', 'Completed'].includes(o.status));
  return {
    totalOrders: orders.length,
    pending: count('Pending'),
    confirmed: count('Confirmed'),
    checkedIn: count('Checked-in'),
    completed: count('Completed'),
    cancelled: count('Cancelled'),
    revenue: earned.reduce((sum, o) => sum + o.total, 0),
    rooms: rooms.length,
    gallery: gallery.length,
    recentOrders: orders.slice(0, 6),
  };
}

function detectImage(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 8 && buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buffer.length >= 6 && buffer.slice(0, 6).toString() === 'GIF87a') return 'gif';
  if (buffer.length >= 6 && buffer.slice(0, 6).toString() === 'GIF89a') return 'gif';
  if (buffer.length >= 12 && buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}

async function saveImageFromDataUrl(dataUrl) {
  const match = /^data:image\/(?:png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=\s]+)$/.exec(String(dataUrl || ''));
  if (!match) throw Object.assign(new Error('শুধু JPG, PNG, WEBP বা GIF ছবি আপলোড করুন'), { status: 400 });
  const buffer = Buffer.from(match[1].replace(/\s/g, ''), 'base64');
  if (buffer.length > 6 * 1024 * 1024) throw Object.assign(new Error('ছবির সাইজ সর্বোচ্চ ৬ মেগাবাইট'), { status: 413 });
  const ext = detectImage(buffer);
  if (!ext) throw Object.assign(new Error('ছবির ফাইলটি সঠিক নয়'), { status: 400 });
  const name = `up-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return '/assets/img/uploads/' + name;
}

async function handleApi(req, res, url) {
  const pathname = url.pathname;
  const method = req.method;

  if (pathname === '/api/public/data' && method === 'GET') {
    return json(res, 200, db.getPublicData());
  }

  if (pathname === '/api/bookings' && method === 'POST') {
    const body = await readBody(req);
    const guestName = cleanText(body.guestName, 80);
    const phone = normalizePhone(body.phone);
    const notes = cleanText(body.notes, 500);
    if (guestName.length < 2) return json(res, 400, { error: 'নাম সঠিকভাবে দিন' });
    if (!validPhone(phone)) return json(res, 400, { error: 'সঠিক মোবাইল নম্বর দিন (যেমন 017XXXXXXXX)' });
    const data = db.getPublicData();
    const room = data.rooms.find((r) => r.id === body.roomId) || data.rooms[0];
    if (!room) return json(res, 500, { error: 'কোনো রুম পাওয়া যায়নি' });
    if (!room.available) return json(res, 409, { error: 'এই রুমটি এখন বুকিংয়ের জন্য বন্ধ আছে' });
    const pkg = data.packages.find((p) => p.id === body.packageId) || null;
    const checkIn = validDate(body.checkIn) ? body.checkIn : '';
    const checkOut = validDate(body.checkOut) ? body.checkOut : '';
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      return json(res, 400, { error: 'চেক-আউট তারিখ চেক-ইনের পরে হতে হবে' });
    }
    const nights = dateNights(checkIn, checkOut);
    const unitRate = pkg ? (room.type === 'ac' ? pkg.acPrice : pkg.nonAcPrice) : room.price;
    if (!unitRate || unitRate <= 0) return json(res, 500, { error: 'রুমের ভাড়া সেট করা নেই' });
    const guests = Math.min(6, Math.max(1, Number(body.guests) || 1));
    const existing = db.getAdminData().orders;
    const order = {
      id: newOrderId(existing),
      createdAt: new Date().toISOString(),
      guestName,
      phone,
      roomId: room.id,
      roomName: room.name,
      packageId: pkg ? pkg.id : '',
      packageName: pkg ? pkg.name : 'Standard',
      checkIn,
      checkOut,
      guests,
      nights,
      roomType: room.type,
      unitRate,
      total: unitRate * nights,
      notes,
      status: 'Pending',
    };
    await db.addOrder(order);
    const settings = data.settings;
    const wa = String(settings.whatsappNumber || '').replace(/[^\d+]/g, '');
    const message = [
      `Booking: ${order.id}`,
      `Name: ${order.guestName}`,
      `Phone: ${order.phone}`,
      `Room: ${order.roomName}`,
      `Package: ${order.packageName}`,
      `Dates: ${order.checkIn || '-'} to ${order.checkOut || '-'}`,
      `Total: BDT ${order.total}`,
    ].join('\n');
    return json(res, 201, {
      booking: order,
      whatsappUrl: wa ? `https://wa.me/${wa.replace(/^\+/, '')}?text=${encodeURIComponent(message)}` : '',
    });
  }

  if (pathname === '/api/bookings/track' && method === 'GET') {
    const code = String(url.searchParams.get('code') || '').trim().toUpperCase();
    if (!code) return json(res, 400, { error: 'বুকিং আইডি দিন' });
    const order = db.getAdminData().orders.find((o) => o.id.toUpperCase() === code);
    if (!order) return json(res, 404, { error: 'এই আইডিতে কোনো বুকিং পাওয়া যায়নি' });
    return json(res, 200, {
      booking: {
        id: order.id,
        guestName: order.guestName,
        roomName: order.roomName,
        packageName: order.packageName,
        checkIn: order.checkIn,
        checkOut: order.checkOut,
        guests: order.guests,
        nights: order.nights,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  }

  if (pathname === '/api/admin/login' && method === 'POST') {
    const ip = req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = loginAttempts.get(ip) || { count: 0, reset: now + 15 * 60 * 1000 };
    if (now > record.reset) {
      record.count = 0;
      record.reset = now + 15 * 60 * 1000;
    }
    if (record.count >= 10) return json(res, 429, { error: 'অনেকবার ভুল হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।' });
    const body = await readBody(req);
    const settings = await db.getSettings();
    const ok = cleanText(body.username, 60) === settings.adminUsername && String(body.password || '') === settings.adminPassword;
    if (!ok) {
      record.count += 1;
      loginAttempts.set(ip, record);
      return json(res, 401, { error: 'ইউজারনেম বা পাসওয়ার্ড ভুল' });
    }
    loginAttempts.delete(ip);
    return json(res, 200, { token: issueToken(settings.adminUsername), username: settings.adminUsername });
  }

  if (pathname === '/api/admin/logout' && method === 'POST') {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+([a-f0-9]{64})$/i);
    if (match) sessions.delete(match[1]);
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/admin/data' && method === 'GET') {
    if (!requireAuth(req, res)) return;
    const data = db.getAdminData();
    return json(res, 200, {
      ...data,
      settings: publicSettings(data.settings),
      stats: statsFrom(data.orders, data.rooms, data.gallery),
    });
  }

  if (pathname === '/api/admin/stats' && method === 'GET') {
    if (!requireAuth(req, res)) return;
    const data = db.getAdminData();
    return json(res, 200, statsFrom(data.orders, data.rooms, data.gallery));
  }

  if (pathname === '/api/admin/orders' && method === 'GET') {
    if (!requireAuth(req, res)) return;
    const data = db.getAdminData();
    return json(res, 200, { orders: data.orders, stats: statsFrom(data.orders, data.rooms, data.gallery) });
  }

  const orderStatusMatch = pathname.match(/^\/api\/admin\/orders\/([A-Za-z0-9-]+)$/);
  if (orderStatusMatch && (method === 'PATCH' || method === 'PUT')) {
    if (!requireAuth(req, res)) return;
    const body = await readBody(req);
    if (!ALLOWED_STATUS.includes(body.status)) return json(res, 400, { error: 'অবৈধ স্ট্যাটাস' });
    const updated = await db.updateOrderStatus(orderStatusMatch[1], body.status);
    if (!updated) return json(res, 404, { error: 'অর্ডার পাওয়া যায়নি' });
    return json(res, 200, { ok: true, status: updated.status });
  }

  const roomMatch = pathname.match(/^\/api\/admin\/rooms\/([a-z0-9-]+)$/);
  if (roomMatch && method === 'PUT') {
    if (!requireAuth(req, res)) return;
    const body = await readBody(req);
    const patch = {};
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0 || price > 1000000) return json(res, 400, { error: 'ভাড়া সঠিকভাবে দিন' });
      patch.price = price;
    }
    if (body.available !== undefined) patch.available = !!body.available;
    if (body.image !== undefined) patch.image = cleanText(body.image, 300);
    if (body.name !== undefined) patch.name = cleanText(body.name, 100);
    if (body.nameBn !== undefined) patch.nameBn = cleanText(body.nameBn, 100);
    if (body.description !== undefined) patch.description = cleanText(body.description, 500);
    if (body.descriptionBn !== undefined) patch.descriptionBn = cleanText(body.descriptionBn, 500);
    if (body.maxGuests !== undefined) patch.maxGuests = Number(body.maxGuests) || 2;
    if (body.totalInventory !== undefined) patch.totalInventory = Number(body.totalInventory) || 1;
    const updated = await db.updateRoom(roomMatch[1], patch);
    if (!updated) return json(res, 404, { error: 'রুম পাওয়া যায়নি' });
    return json(res, 200, { ok: true });
  }

  const packageMatch = pathname.match(/^\/api\/admin\/packages\/([a-z0-9-]+)$/);
  if (packageMatch && method === 'PUT') {
    if (!requireAuth(req, res)) return;
    const body = await readBody(req);
    const patch = {};
    for (const key of ['nonAcPrice', 'acPrice']) {
      if (body[key] === undefined) continue;
      const value = Number(body[key]);
      if (!Number.isFinite(value) || value < 0 || value > 1000000) return json(res, 400, { error: 'ভাড়া সঠিকভাবে দিন' });
      patch[key] = value;
    }
    if (body.name !== undefined) patch.name = cleanText(body.name, 100);
    if (body.nameBn !== undefined) patch.nameBn = cleanText(body.nameBn, 100);
    const updated = await db.updatePackage(packageMatch[1], patch);
    if (!updated) return json(res, 404, { error: 'প্যাকেজ পাওয়া যায়নি' });
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/admin/upload' && method === 'POST') {
    if (!requireAuth(req, res)) return;
    const body = await readBody(req, 10 * 1024 * 1024);
    const imagePath = await saveImageFromDataUrl(body.dataUrl);
    return json(res, 201, { path: imagePath });
  }

  if (pathname === '/api/admin/gallery' && method === 'POST') {
    if (!requireAuth(req, res)) return;
    const body = await readBody(req, 10 * 1024 * 1024);
    let image = cleanText(body.image, 300);
    if (body.dataUrl) image = await saveImageFromDataUrl(body.dataUrl);
    if (!image) return json(res, 400, { error: 'ছবি দিন' });
    const item = {
      id: 'gal-' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex'),
      title: cleanText(body.title, 120) || 'Bandhan Guest House',
      titleBn: cleanText(body.titleBn, 120) || cleanText(body.title, 120) || 'বন্ধন গেস্ট হাউস',
      category: ['rooms', 'interior', 'exterior', 'facilities'].includes(body.category) ? body.category : 'rooms',
      image,
      caption: cleanText(body.caption, 300),
      captionBn: cleanText(body.captionBn, 300),
    };
    await db.addGallery(item);
    return json(res, 201, { item });
  }

  const galleryMatch = pathname.match(/^\/api\/admin\/gallery\/([A-Za-z0-9-]+)$/);
  if (galleryMatch && method === 'DELETE') {
    if (!requireAuth(req, res)) return;
    const data = db.getAdminData();
    const item = data.gallery.find((g) => g.id === galleryMatch[1]);
    const removed = await db.deleteGallery(galleryMatch[1]);
    if (!removed) return json(res, 404, { error: 'ছবি পাওয়া যায়নি' });
    if (item && item.image.startsWith('/assets/img/uploads/')) {
      try { fs.unlinkSync(path.join(PUBLIC_DIR, item.image)); } catch {}
    }
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/admin/settings' && method === 'PUT') {
    if (!requireAuth(req, res)) return;
    const body = await readBody(req);
    const allowed = [
      'businessName', 'businessNameBn', 'whatsappNumber', 'footerContactNumber',
      'address', 'addressBn', 'checkInPolicy', 'checkOutPolicy', 'advancePaymentPolicy',
      'securityPolicy', 'heroImage', 'logoImage', 'adminUsername',
    ];
    const patch = {};
    for (const key of allowed) {
      if (body[key] !== undefined) patch[key] = cleanText(body[key], 500);
    }
    if (patch.adminUsername && patch.adminUsername.length < 3) return json(res, 400, { error: 'ইউজারনেম কমপক্ষে ৩ অক্ষর' });
    const settings = await db.updateSettings(patch);
    return json(res, 200, { ok: true, settings: publicSettings(settings) });
  }

  if (pathname === '/api/admin/password' && method === 'POST') {
    if (!requireAuth(req, res)) return;
    const body = await readBody(req);
    const settings = await db.getSettings();
    if (String(body.currentPassword || '') !== settings.adminPassword) {
      return json(res, 400, { error: 'বর্তমান পাসওয়ার্ড ভুল' });
    }
    const next = String(body.newPassword || '');
    if (next.length < 6) return json(res, 400, { error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর' });
    await db.updateSettings({ adminPassword: next });
    sessions.clear();
    return json(res, 200, { ok: true, reauth: true });
  }

  if (pathname === '/api/admin/export' && method === 'GET') {
    if (!requireAuth(req, res)) return;
    const buffer = fs.readFileSync(db.DB_PATH);
    res.writeHead(200, {
      'Content-Type': MIME['.xlsx'],
      'Content-Disposition': 'attachment; filename="bandhan-database.xlsx"',
      'Content-Length': buffer.length,
      'Cache-Control': 'no-store',
    });
    return res.end(buffer);
  }

  return json(res, 404, { error: 'API endpoint পাওয়া যায়নি' });
}

function serveStatic(req, res, url) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/admin' || pathname === '/admin/') pathname = '/admin/index.html';
  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404</h1><p>পেজটি পাওয়া যায়নি। <a href="/">হোমে ফিরুন</a></p>');
    }
    const ext = path.extname(filePath).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.ico'].includes(ext);
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': isImage ? 'public, max-age=3600' : 'no-cache',
    };
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    try {
      await handleApi(req, res, url);
    } catch (err) {
      const status = err.status || (err.code === 'EXCEL_LOCKED' ? 503 : err.code === 'DB_MISSING' ? 500 : 500);
      if (status >= 500) console.error(err);
      json(res, status, { error: err.message || 'সার্ভার সমস্যা হয়েছে' });
    }
    return;
  }
  serveStatic(req, res, url);
});

server.listen(PORT, HOST, () => {
  console.log('Bandhan Guest House server running:');
  console.log(`  Site  : http://localhost:${PORT}/`);
  console.log(`  Admin : http://localhost:${PORT}/admin`);
  console.log(`  Excel : ${db.DB_PATH}`);
});
