import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import * as db from './server/db.ts';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'assets', 'img', 'uploads');
const SRC_IMAGES_DIR = path.join(process.cwd(), 'src', 'assets', 'images');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

interface SessionRecord {
  username: string;
  expires: number;
}

interface LoginAttemptRecord {
  count: number;
  reset: number;
}

const sessions = new Map<string, SessionRecord>();
const loginAttempts = new Map<string, LoginAttemptRecord>();
const SESSION_TTL = 12 * 60 * 60 * 1000;
const ALLOWED_STATUS: Array<db.OrderRecord['status']> = [
  'Pending',
  'Confirmed',
  'Checked-in',
  'Completed',
  'Cancelled',
];

function issueToken(username: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { username, expires: Date.now() + SESSION_TTL });
  return token;
}

function authUser(req: Request): SessionRecord | null {
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

function requireAuth(req: Request, res: Response): SessionRecord | null {
  const user = authUser(req);
  if (!user) {
    res.status(401).json({ error: 'লগইন প্রয়োজন। আবার লগইন করুন।' });
    return null;
  }
  return user;
}

function cleanText(value: unknown, max: number): string {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function normalizePhone(value: unknown): string {
  return String(value || '').replace(/[\s-]/g, '');
}

function validPhone(phone: string): boolean {
  return /^(?:\+?880|0)1[3-9]\d{8}$/.test(phone);
}

function validDate(value: unknown): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function dateNights(checkIn: string, checkOut: string): number {
  if (!validDate(checkIn) || !validDate(checkOut)) return 1;
  const a = new Date(checkIn + 'T00:00:00Z').getTime();
  const b = new Date(checkOut + 'T00:00:00Z').getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 1;
  return Math.max(1, Math.ceil((b - a) / 86400000));
}

function newOrderId(existing: db.OrderRecord[]): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const taken = new Set(existing.map((o) => o.id.toUpperCase()));
  for (let attempt = 0; attempt < 20; attempt++) {
    let id = 'BGH-';
    for (let i = 0; i < 6; i++) id += alphabet[crypto.randomInt(alphabet.length)];
    if (!taken.has(id)) return id;
  }
  return 'BGH-' + crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
}

function publicSettings(settings: db.SettingsRecord) {
  const { adminPassword: _hidden, ...rest } = settings;
  return rest;
}

function statsFrom(
  orders: db.OrderRecord[],
  rooms: db.RoomRecord[],
  gallery: db.GalleryRecord[]
) {
  const count = (status: db.OrderRecord['status']) =>
    orders.filter((o) => o.status === status).length;
  const earned = orders.filter((o) =>
    ['Confirmed', 'Checked-in', 'Completed'].includes(o.status)
  );
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

function detectImage(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'png';
  }
  if (buffer.length >= 6 && buffer.subarray(0, 6).toString() === 'GIF87a') return 'gif';
  if (buffer.length >= 6 && buffer.subarray(0, 6).toString() === 'GIF89a') return 'gif';
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString() === 'RIFF' &&
    buffer.subarray(8, 12).toString() === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

async function saveImageFromDataUrl(dataUrl: unknown): Promise<string> {
  const match = /^data:image\/(?:png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=\s]+)$/.exec(
    String(dataUrl || '')
  );
  if (!match) {
    throw Object.assign(new Error('শুধু JPG, PNG, WEBP বা GIF ছবি আপলোড করুন'), { status: 400 });
  }
  const buffer = Buffer.from(match[1].replace(/\s/g, ''), 'base64');
  if (buffer.length > 6 * 1024 * 1024) {
    throw Object.assign(new Error('ছবির সাইজ সর্বোচ্চ ৬ মেগাবাইট'), { status: 413 });
  }
  const ext = detectImage(buffer);
  if (!ext) {
    throw Object.assign(new Error('ছবির ফাইলটি সঠিক নয়'), { status: 400 });
  }
  const name = `up-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return '/assets/img/uploads/' + name;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use('/assets/img/uploads', express.static(UPLOAD_DIR, { maxAge: '1h' }));
  app.use('/src/assets/images', express.static(SRC_IMAGES_DIR, { maxAge: '1h' }));

  // Public API
  app.get('/api/public/data', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(db.getPublicData());
  });

  app.post('/api/bookings', async (req, res, next) => {
    try {
      const body = req.body || {};
      const guestName = cleanText(body.guestName, 80);
      const phone = normalizePhone(body.phone);
      const notes = cleanText(body.notes, 500);
      if (guestName.length < 2) {
        return res.status(400).json({ error: 'নাম সঠিকভাবে দিন (কমপক্ষে ২ অক্ষর)' });
      }
      if (!validPhone(phone)) {
        return res.status(400).json({ error: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন 017XXXXXXXX)' });
      }

      const data = db.getPublicData();
      const room = data.rooms.find((r) => r.id === body.roomId) || data.rooms[0];
      if (!room) return res.status(500).json({ error: 'কোনো রুম পাওয়া যায়নি' });
      if (!room.available) {
        return res.status(409).json({ error: 'এই রুমটি এখন বুকিংয়ের জন্য বন্ধ আছে' });
      }

      const pkg = data.packages.find((p) => p.id === body.packageId) || null;
      const checkIn = validDate(body.checkIn) ? String(body.checkIn) : '';
      const checkOut = validDate(body.checkOut) ? String(body.checkOut) : '';
      if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
        return res.status(400).json({ error: 'চেক-আউট তারিখ চেক-ইনের পরে হতে হবে' });
      }

      const nights = dateNights(checkIn, checkOut);
      const unitRate = pkg ? (room.type === 'ac' ? pkg.acPrice : pkg.nonAcPrice) : room.price;
      if (!unitRate || unitRate <= 0) {
        return res.status(500).json({ error: 'রুমের ভাড়া সেট করা নেই' });
      }

      const guests = Math.min(6, Math.max(1, Number(body.guests) || 1));
      const existing = db.getAdminData().orders;
      const order: db.OrderRecord = {
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

      return res.status(201).json({
        booking: order,
        whatsappUrl: wa ? `https://wa.me/${wa.replace(/^\+/, '')}?text=${encodeURIComponent(message)}` : '',
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/bookings/track', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const code = String(req.query.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'বুকিং আইডি দিন' });
    const order = db.getAdminData().orders.find((o) => o.id.toUpperCase() === code);
    if (!order) return res.status(404).json({ error: 'এই আইডিতে কোনো বুকিং পাওয়া যায়নি' });

    return res.json({
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
  });

  // Admin Authentication
  app.post('/api/admin/login', async (req, res, next) => {
    try {
      const ip = req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const record = loginAttempts.get(ip) || { count: 0, reset: now + 15 * 60 * 1000 };
      if (now > record.reset) {
        record.count = 0;
        record.reset = now + 15 * 60 * 1000;
      }
      if (record.count >= 10) {
        return res.status(429).json({ error: 'অনেকবার ভুল হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।' });
      }
      const body = req.body || {};
      const settings = await db.getSettings();
      const ok =
        cleanText(body.username, 60) === settings.adminUsername &&
        String(body.password || '') === settings.adminPassword;
      if (!ok) {
        record.count += 1;
        loginAttempts.set(ip, record);
        return res.status(401).json({ error: 'ইউজারনেম বা পাসওয়ার্ড ভুল' });
      }
      loginAttempts.delete(ip);
      return res.json({ token: issueToken(settings.adminUsername), username: settings.adminUsername });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+([a-f0-9]{64})$/i);
    if (match) sessions.delete(match[1]);
    return res.json({ ok: true });
  });

  // Admin Protected Routes
  app.get('/api/admin/data', (req, res) => {
    if (!requireAuth(req, res)) return;
    res.setHeader('Cache-Control', 'no-store');
    const data = db.getAdminData();
    return res.json({
      ...data,
      settings: publicSettings(data.settings),
      stats: statsFrom(data.orders, data.rooms, data.gallery),
    });
  });

  app.get('/api/admin/stats', (req, res) => {
    if (!requireAuth(req, res)) return;
    res.setHeader('Cache-Control', 'no-store');
    const data = db.getAdminData();
    return res.json(statsFrom(data.orders, data.rooms, data.gallery));
  });

  app.get('/api/admin/orders', (req, res) => {
    if (!requireAuth(req, res)) return;
    res.setHeader('Cache-Control', 'no-store');
    const data = db.getAdminData();
    return res.json({
      orders: data.orders,
      stats: statsFrom(data.orders, data.rooms, data.gallery),
    });
  });

  const handleOrderStatusUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireAuth(req, res)) return;
      const body = req.body || {};
      if (!ALLOWED_STATUS.includes(body.status)) {
        return res.status(400).json({ error: 'অবৈধ স্ট্যাটাস' });
      }
      const updated = await db.updateOrderStatus(String(req.params.id), body.status);
      if (!updated) return res.status(404).json({ error: 'অর্ডার পাওয়া যায়নি' });
      return res.json({ ok: true, status: updated.status });
    } catch (err) {
      next(err);
    }
  };
  app.patch('/api/admin/orders/:id', handleOrderStatusUpdate);
  app.put('/api/admin/orders/:id', handleOrderStatusUpdate);

  app.put('/api/admin/rooms/:id', async (req, res, next) => {
    try {
      if (!requireAuth(req, res)) return;
      const body = req.body || {};
      const patch: Partial<db.RoomRecord> = {};
      if (body.price !== undefined) {
        const price = Number(body.price);
        if (!Number.isFinite(price) || price < 0 || price > 1000000) {
          return res.status(400).json({ error: 'ভাড়া সঠিকভাবে দিন' });
        }
        patch.price = price;
      }
      if (body.originalPrice !== undefined) {
        const orig = Number(body.originalPrice);
        if (Number.isFinite(orig) && orig >= 0) patch.originalPrice = orig;
      }
      if (body.available !== undefined) patch.available = !!body.available;
      if (body.image !== undefined) patch.image = cleanText(body.image, 300);
      if (body.name !== undefined) patch.name = cleanText(body.name, 100);
      if (body.nameBn !== undefined) patch.nameBn = cleanText(body.nameBn, 100);
      if (body.description !== undefined) patch.description = cleanText(body.description, 500);
      if (body.descriptionBn !== undefined) patch.descriptionBn = cleanText(body.descriptionBn, 500);
      if (body.maxGuests !== undefined) patch.maxGuests = Number(body.maxGuests) || 2;
      if (body.totalInventory !== undefined) patch.totalInventory = Number(body.totalInventory) || 1;

      const updated = await db.updateRoom(String(req.params.id), patch);
      if (!updated) return res.status(404).json({ error: 'রুম পাওয়া যায়নি' });
      return res.json({ ok: true, room: updated });
    } catch (err) {
      next(err);
    }
  });

  app.put('/api/admin/packages/:id', async (req, res, next) => {
    try {
      if (!requireAuth(req, res)) return;
      const body = req.body || {};
      const patch: Partial<db.PackageRecord> = {};
      for (const key of ['nonAcPrice', 'acPrice'] as const) {
        if (body[key] === undefined) continue;
        const value = Number(body[key]);
        if (!Number.isFinite(value) || value < 0 || value > 1000000) {
          return res.status(400).json({ error: 'ভাড়া সঠিকভাবে দিন' });
        }
        patch[key] = value;
      }
      if (body.name !== undefined) patch.name = cleanText(body.name, 100);
      if (body.nameBn !== undefined) patch.nameBn = cleanText(body.nameBn, 100);
      if (body.description !== undefined) patch.description = cleanText(body.description, 300);
      if (body.descriptionBn !== undefined) patch.descriptionBn = cleanText(body.descriptionBn, 300);

      const updated = await db.updatePackage(String(req.params.id), patch);
      if (!updated) return res.status(404).json({ error: 'প্যাকেজ পাওয়া যায়নি' });
      return res.json({ ok: true, package: updated });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/upload', async (req, res, next) => {
    try {
      if (!requireAuth(req, res)) return;
      const body = req.body || {};
      const imagePath = await saveImageFromDataUrl(body.dataUrl);
      return res.status(201).json({ path: imagePath });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/gallery', async (req, res, next) => {
    try {
      if (!requireAuth(req, res)) return;
      const body = req.body || {};
      let image = cleanText(body.image, 300);
      if (body.dataUrl) image = await saveImageFromDataUrl(body.dataUrl);
      if (!image) return res.status(400).json({ error: 'ছবি দিন' });

      const category = ['rooms', 'interior', 'exterior', 'facilities'].includes(body.category)
        ? (body.category as db.GalleryRecord['category'])
        : 'rooms';

      const item: db.GalleryRecord = {
        id: 'gal-' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex'),
        title: cleanText(body.title, 120) || 'Bandhan Guest House',
        titleBn: cleanText(body.titleBn, 120) || cleanText(body.title, 120) || 'বন্ধন গেস্ট হাউস',
        category,
        image,
        caption: cleanText(body.caption, 300),
        captionBn: cleanText(body.captionBn, 300),
        description: cleanText(body.description, 500) || cleanText(body.caption, 300),
        descriptionBn: cleanText(body.descriptionBn, 500) || cleanText(body.captionBn, 300),
        specs: cleanText(body.specs, 160),
        tags: Array.isArray(body.tags) ? body.tags.map((t: unknown) => cleanText(t, 40)).filter(Boolean) : [category],
      };

      await db.addGallery(item);
      return res.status(201).json({ item });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/admin/gallery/:id', async (req, res, next) => {
    try {
      if (!requireAuth(req, res)) return;
      const id = String(req.params.id);
      const data = db.getAdminData();
      const item = data.gallery.find((g) => g.id === id);
      const removed = await db.deleteGallery(id);
      if (!removed) return res.status(404).json({ error: 'ছবি পাওয়া যায়নি' });
      if (item && item.image.startsWith('/assets/img/uploads/')) {
        const fileName = path.basename(item.image);
        try {
          fs.unlinkSync(path.join(UPLOAD_DIR, fileName));
        } catch {
          // ignore missing file
        }
      }
      return res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.put('/api/admin/settings', async (req, res, next) => {
    try {
      if (!requireAuth(req, res)) return;
      const body = req.body || {};
      const allowed: Array<keyof db.SettingsRecord> = [
        'businessName',
        'businessNameBn',
        'whatsappNumber',
        'footerContactNumber',
        'address',
        'addressBn',
        'checkInPolicy',
        'checkOutPolicy',
        'advancePaymentPolicy',
        'securityPolicy',
        'heroImage',
        'logoImage',
        'adminUsername',
      ];
      const patch: Partial<db.SettingsRecord> = {};
      for (const key of allowed) {
        if (body[key] !== undefined) patch[key] = cleanText(body[key], 500);
      }
      if (patch.adminUsername && patch.adminUsername.length < 3) {
        return res.status(400).json({ error: 'ইউজারনেম কমপক্ষে ৩ অক্ষর' });
      }
      const settings = await db.updateSettings(patch);
      return res.json({ ok: true, settings: publicSettings(settings) });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/password', async (req, res, next) => {
    try {
      if (!requireAuth(req, res)) return;
      const body = req.body || {};
      const settings = await db.getSettings();
      if (String(body.currentPassword || '') !== settings.adminPassword) {
        return res.status(400).json({ error: 'বর্তমান পাসওয়ার্ড ভুল' });
      }
      const nextPass = String(body.newPassword || '');
      if (nextPass.length < 6) {
        return res.status(400).json({ error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর' });
      }
      await db.updateSettings({ adminPassword: nextPass });
      sessions.clear();
      return res.json({ ok: true, reauth: true });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/admin/export', (req, res) => {
    if (!requireAuth(req, res)) return;
    if (!fs.existsSync(db.DB_PATH)) {
      return res.status(404).json({ error: 'Database file not found' });
    }
    const buffer = fs.readFileSync(db.DB_PATH);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="bandhan-database.xlsx"',
      'Content-Length': buffer.length,
      'Cache-Control': 'no-store',
    });
    return res.end(buffer);
  });

  // Unknown API routes return JSON 404
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint পাওয়া যায়নি' });
  });

  // Error handler for API
  app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: err.message || 'সার্ভার সমস্যা হয়েছে' });
  });

  // Vite middleware in dev or dist static files in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log('Bandhan Guest House server running:');
    console.log(`  Site  : http://localhost:${PORT}/`);
    console.log(`  Admin : http://localhost:${PORT}/admin`);
    console.log(`  Excel : ${db.DB_PATH}`);
  });
}

startServer();
