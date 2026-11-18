import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require('xlsx') as typeof import('xlsx');

export interface RoomRecord {
  id: string;
  name: string;
  nameBn: string;
  type: 'ac' | 'non-ac';
  price: number;
  originalPrice: number;
  maxGuests: number;
  totalInventory: number;
  available: boolean;
  bedType: string;
  sizeSqFt: number;
  image: string;
  description: string;
  descriptionBn: string;
  amenities: string[];
  badge?: string;
}

export interface PackageRecord {
  id: string;
  name: string;
  nameBn: string;
  nonAcPrice: number;
  acPrice: number;
  description: string;
  descriptionBn: string;
  duration: string;
}

export interface GalleryRecord {
  id: string;
  title: string;
  titleBn: string;
  category: 'rooms' | 'interior' | 'exterior' | 'facilities';
  image: string;
  caption: string;
  captionBn: string;
  description: string;
  descriptionBn: string;
  specs: string;
  tags: string[];
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  guestName: string;
  phone: string;
  roomId: string;
  roomName: string;
  packageId: string;
  packageName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  roomType: string;
  unitRate: number;
  total: number;
  notes: string;
  status: 'Pending' | 'Confirmed' | 'Checked-in' | 'Completed' | 'Cancelled';
}

export interface SettingsRecord {
  businessName: string;
  businessNameBn: string;
  whatsappNumber: string;
  footerContactNumber: string;
  address: string;
  addressBn: string;
  checkInPolicy: string;
  checkOutPolicy: string;
  advancePaymentPolicy: string;
  securityPolicy: string;
  heroImage: string;
  logoImage: string;
  adminUsername: string;
  adminPassword: string;
}

export interface DatabaseState {
  rooms: RoomRecord[];
  packages: PackageRecord[];
  gallery: GalleryRecord[];
  orders: OrderRecord[];
  settings: SettingsRecord;
}

const DATA_DIR = path.join(process.cwd(), 'data');
export const DB_PATH = path.join(DATA_DIR, 'bandhan-database.xlsx');

const DEFAULT_STATE: DatabaseState = {
  rooms: [
    {
      id: 'deluxe-ac',
      name: 'Deluxe AC Room',
      nameBn: 'ডিলাক্স এসি রুম',
      type: 'ac',
      price: 2200,
      originalPrice: 2800,
      maxGuests: 2,
      totalInventory: 6,
      available: true,
      bedType: '1 Queen Bed',
      sizeSqFt: 240,
      image: '/src/assets/images/room_deluxe_bedroom_1793296300579.jpg',
      description: 'Elegantly furnished air-conditioned room with silent split AC, orthopedic queen mattress, warm bedside lighting, smart TV, and attached modern bath.',
      descriptionBn: 'সাইলেন্ট স্প্লিট এসি, আরামদায়ক কুইন বেড, স্মার্ট টিভি, হাই-স্পিড ওয়াই-ফাই এবং আধুনিক অ্যাটাচড বাথরুমসহ ছিমছাম ও পরিচ্ছন্ন রুম।',
      amenities: ['Split Air Conditioning', '100 Mbps Fiber Wi-Fi', '32" HD Smart TV', 'Attached Modern Bath', '24/7 Hot & Cold Water', 'Work Desk & Chair', 'Daily Housekeeping'],
      badge: 'Most Popular',
    },
    {
      id: 'executive-ac',
      name: 'Executive AC Suite',
      nameBn: 'এক্সিকিউটিভ এসি স্যুইট',
      type: 'ac',
      price: 3200,
      originalPrice: 4000,
      maxGuests: 3,
      totalInventory: 4,
      available: true,
      bedType: '1 King Bed + Sofa Lounge',
      sizeSqFt: 350,
      image: '/src/assets/images/room_executive_suite_1793296300643.jpg',
      description: 'Expansive master suite featuring a king bed, dedicated sofa lounge, executive workstation, mini refrigerator, and panoramic daylight windows.',
      descriptionBn: 'কিং সাইজ বেড, আলাদা সোফা লাউঞ্জ, কর্পোরেট ওয়ার্কস্টেশন, মিনি ফ্রিজ এবং প্রশস্ত জানালাসহ প্রিমিয়াম এক্সিকিউটিভ স্যুইট।',
      amenities: ['Inverter Split AC', '100 Mbps Wi-Fi', '43" 4K Smart TV', 'Dedicated Work Desk', 'Mini Refrigerator', 'Sofa Lounge Area', '24/7 IPS/Generator Backup'],
      badge: 'Luxury Choice',
    },
    {
      id: 'family-ac',
      name: 'Family Quad AC Suite',
      nameBn: 'ফ্যামিলি কোয়াড এসি স্যুইট',
      type: 'ac',
      price: 3800,
      originalPrice: 4800,
      maxGuests: 4,
      totalInventory: 3,
      available: true,
      bedType: '2 Double Beds',
      sizeSqFt: 400,
      image: '/src/assets/images/room_family_suite_1793296301625.jpg',
      description: 'Spacious family suite with two plush double beds, generous luggage storage, sunlit windows, and immediate room service access.',
      descriptionBn: 'পরিবারের সবার একসাথে থাকার জন্য দুটি ডাবল বেড, পর্যাপ্ত লাগেজ স্পেস এবং উজ্জ্বল প্রাকৃতিক আলোর সুবিধাসহ প্রশস্ত ফ্যামিলি স্যুইট।',
      amenities: ['Dual Split AC', 'High-Speed Wi-Fi', '43" LED Smart TV', 'Large Attached Bath', 'Double Wardrobe', 'Tea & Coffee Station', '24/7 Room Service'],
      badge: 'Family Friendly',
    },
    {
      id: 'standard-non-ac',
      name: 'Standard Non-AC Room',
      nameBn: 'স্ট্যান্ডার্ড নন-এসি রুম',
      type: 'non-ac',
      price: 1400,
      originalPrice: 1800,
      maxGuests: 2,
      totalInventory: 5,
      available: true,
      bedType: '1 Double Bed',
      sizeSqFt: 200,
      image: '/src/assets/images/room_deluxe_bedroom_1793296300579.jpg',
      description: 'Well-ventilated, airy budget room with ceiling fan, clean cotton linens, work table, high-speed Wi-Fi, and private attached washroom.',
      descriptionBn: 'সাশ্রয়ী বাজেটে পরিচ্ছন্ন ও খোলামেলা পরিবেশে থাকার জন্য আদর্শ রুম, সাথে থাকছে ফ্রি ওয়াই-ফাই ও অ্যাটাচড বাথরুম।',
      amenities: ['High-Speed Ceiling Fan', '100 Mbps Wi-Fi', 'Attached Bathroom', 'Clean Cotton Bedding', '24/7 Power Backup', 'Drinking Water'],
      badge: 'Best Value',
    },
  ],
  packages: [
    {
      id: 'pkg-24h',
      name: '24-Hour Classic Stay',
      nameBn: '২৪ ঘণ্টা ক্লাসিক স্টে',
      nonAcPrice: 1400,
      acPrice: 2200,
      description: 'Standard 24-hour lodging with complimentary Wi-Fi, daily housekeeping, and 24/7 power backup.',
      descriptionBn: 'ফ্রি ওয়াই-ফাই, ডেইলি হাউসকিপিং এবং ২৪/৭ জেনারেটর ব্যাকআপসহ সম্পূর্ণ ২৪ ঘণ্টার রুম প্যাকেজ।',
      duration: '24 Hours',
    },
    {
      id: 'pkg-breakfast',
      name: 'Bed & Homestyle Breakfast',
      nameBn: 'রুম + সকালের নাশতা প্যাকেজ',
      nonAcPrice: 1650,
      acPrice: 2500,
      description: 'Includes fresh morning breakfast (Paratha/Toast, Egg, Tea/Coffee) served hot to your room.',
      descriptionBn: 'সকালের গরম নাশতা (পরোটা/টোস্ট, ডিম, চা/কফি) সহ আরামদায়ক থাকার বিশেষ প্যাকেজ।',
      duration: '24 Hours + Breakfast',
    },
    {
      id: 'pkg-dayuse',
      name: 'Day-Use Transit Refresh',
      nameBn: 'ডে-ইউজ ট্রানজিট প্যাকেজ (৬ ঘণ্টা)',
      nonAcPrice: 900,
      acPrice: 1400,
      description: 'Short 6-hour daytime stay (between 9:00 AM and 8:00 PM) for business travelers or transit rest.',
      descriptionBn: 'সকাল ৯টা থেকে রাত ৮টার মধ্যে ৬ ঘণ্টার বিশ্রাম ও ফ্রেশ হওয়ার জন্য সাশ্রয়ী ডে-ইউজ প্যাকেজ।',
      duration: '6 Hours (Daytime)',
    },
    {
      id: 'pkg-fullboard',
      name: 'Full Board (All Meals Included)',
      nameBn: 'ফুল বোর্ড (সকাল, দুপুর ও রাতের খাবারসহ)',
      nonAcPrice: 2150,
      acPrice: 3000,
      description: 'Worry-free stay including Breakfast, Traditional Homestyle Lunch, and Dinner.',
      descriptionBn: 'সকালের নাশতা, দুপুরের ঘরোয়া ভাত-মাছ/মাংস ও রাতের খাবারসহ ঝামেলামুক্ত প্যাকেজ।',
      duration: '24 Hours + All Meals',
    },
  ],
  gallery: [
    {
      id: 'gal-ext-1',
      title: 'Main Facade & Illuminated Canopy Entrance',
      titleBn: 'মূল ভবন ও আলোকসজ্জিত প্রবেশপথ',
      category: 'exterior',
      image: '/src/assets/images/hero_bandhan_facade_1793296299466.jpg',
      caption: 'Welcoming exterior facade with illuminated signage and dedicated private driveway.',
      captionBn: 'সুসজ্জিত আলোকসজ্জা ও নিরাপদ পার্কিং ড্রাইভওয়েসহ বন্ধন গেস্ট হাউসের মূল প্রবেশদ্বার।',
      description: 'Our architectural facade welcomes travelers day and night with bright canopy lighting, gated driveway security, and attentive staff at the entrance.',
      descriptionBn: 'দিন ও রাত ২৪ ঘণ্টা নিরাপদ গেট, সিসিটিভি নজরদারি এবং অতিথিদের অভ্যর্থনার জন্য সার্বক্ষণিক কর্মী।',
      specs: '24/7 Security Gate · Private Parking Driveway',
      tags: ['Building Facade', 'Night Lighting', 'Private Driveway'],
    },
    {
      id: 'gal-rm-1',
      title: 'Deluxe AC Double Bedroom',
      titleBn: 'ডিলাক্স এসি ডাবল বেডরুম',
      category: 'rooms',
      image: '/src/assets/images/room_deluxe_bedroom_1793296300579.jpg',
      caption: 'Crisp cotton linens, orthopedic queen bed, warm bedside lamps, and silent split AC.',
      captionBn: 'পরিষ্কার সাদা কটন বেডশিট, আরামদায়ক কুইন বেড ও সাইলেন্ট স্প্লিট এসিসহ ডিলাক্স রুম।',
      description: 'Spotlessly sanitized deluxe bedroom featuring wooden headboard, warm ambient lighting, sound-insulated windows, and an attached western bathroom.',
      descriptionBn: 'সর্বোচ্চ পরিচ্ছন্নতা, সাউন্ড-প্রুফ জানালা এবং আধুনিক অ্যাটাচড বাথরুমসহ আরামদায়ক থাকার নিশ্চয়তা।',
      specs: '240 sq. ft. · Queen Bed · Split AC',
      tags: ['Deluxe AC', 'Queen Bed', 'Attached Bath'],
    },
    {
      id: 'gal-rm-2',
      title: 'Executive Suite Living & Bedroom',
      titleBn: 'এক্সিকিউটিভ স্যুইট ও লাউঞ্জ',
      category: 'rooms',
      image: '/src/assets/images/room_executive_suite_1793296300643.jpg',
      caption: 'King bedroom with plush sofa seating, corporate work desk, and wide city windows.',
      captionBn: 'কিং বেড, সোফা লাউঞ্জ, কর্পোরেট ওয়ার্ক ডেস্ক এবং চমৎকার ভিউসহ এক্সিকিউটিভ স্যুইট।',
      description: 'Designed for executives and couples who value extra space. Includes an ergonomic workspace, armchairs, smart TV, and high-speed fiber internet.',
      descriptionBn: 'ব্যবসায়িক ও পারিবারিক ভ্রমণের জন্য প্রশস্ত জায়গা, কাজের টেবিল এবং আরামদায়ক সোফা লাউঞ্জ।',
      specs: '350 sq. ft. · King Bed · Work Desk',
      tags: ['Executive Suite', 'Sofa Lounge', 'Workstation'],
    },
    {
      id: 'gal-rm-3',
      title: 'Family Quad Room with Twin Double Beds',
      titleBn: 'ফ্যামিলি কোয়াড রুম (ডাবল বেড)',
      category: 'rooms',
      image: '/src/assets/images/room_family_suite_1793296301625.jpg',
      caption: 'Generous family room configuration with two large beds, sunlit windows, and luggage bench.',
      captionBn: 'দুটি বড় ডাবল বেড, পর্যাপ্ত সূর্যের আলো এবং লাগেজ রাখার সুবিধাসহ ফ্যামিলি রুম।',
      description: 'Ideal for families of 4. Features matching orthopedic double beds, generous wardrobe storage, and quiet atmosphere.',
      descriptionBn: '৪ জনের পরিবারের একসাথে থাকার জন্য উপযোগী দুটি বড় বেড ও প্রশস্ত রুম।',
      specs: '400 sq. ft. · 2 Double Beds · Up to 4 Guests',
      tags: ['Family Room', 'Twin Beds', 'Daylight'],
    },
    {
      id: 'gal-int-1',
      title: 'Reception Lobby & Guest Waiting Lounge',
      titleBn: 'রিসেপশন লবি ও গেস্ট লাউঞ্জ',
      category: 'interior',
      image: '/src/assets/images/common_lobby_lounge_1793296333862.jpg',
      caption: 'Air-conditioned ground floor reception lobby with plush sofas and 24-hour concierge.',
      captionBn: 'আরামদায়ক সোফা ও ২৪ ঘণ্টা রিসেপশন সেবাসহ শীতাতপ নিয়ন্ত্রিত ওয়েটিং লাউঞ্জ।',
      description: 'Guests enjoy swift check-in, comfortable marble-floored lounge seating, daily newspapers, and helpful travel desk support anytime.',
      descriptionBn: 'দ্রুত চেক-ইন, আরামদায়ক বসার ব্যবস্থা এবং ভ্রমণ সংক্রান্ত যেকোনো সহায়তার জন্য ২৪ ঘণ্টা ফ্রন্ট ডেস্ক।',
      specs: 'Open 24 Hours · Express Check-In Desk',
      tags: ['24/7 Reception', 'Waiting Lounge', 'Concierge'],
    },
    {
      id: 'gal-fac-1',
      title: 'In-House Homestyle Kitchen & Dining Service',
      titleBn: 'ঘরোয়া খাবার ও ডাইনিং সার্ভিস',
      category: 'facilities',
      image: '/src/assets/images/dining_thali_delight_1793296301240.jpg',
      caption: 'Freshly prepared homestyle meals, traditional thalis, and personalized in-room dining.',
      captionBn: 'স্বাস্থ্যসম্মত পরিবেশে রান্না করা টাটকা ঘরোয়া খাবার এবং রুম সার্ভিস সুবিধা।',
      description: 'Our in-house kitchen prepares authentic homestyle meals on demand using fresh local ingredients and pure spices.',
      descriptionBn: 'টাটকা বাজারের উপকরণে তৈরি গরম ভাত, মাছ, মাংস, ডাল ও সকালের নাশতার সুব্যবস্থা।',
      specs: 'Breakfast · Lunch · Dinner · Room Service',
      tags: ['Homestyle Food', 'Hygienic Kitchen', 'Room Dining'],
    },
    {
      id: 'gal-fac-2',
      title: 'Rooftop Garden Terrace & Sunset Deck',
      titleBn: 'রুফটপ গার্ডেন ও রিলাক্সেশন ডেক',
      category: 'facilities',
      image: '/src/assets/images/common_rooftop_terrace_1793296334599.jpg',
      caption: 'Peaceful open-air rooftop garden with wooden pergolas, flora, and lounge chairs.',
      captionBn: 'বিকেলের চা ও নির্মল বাতাসের জন্য সবুজে ঘেরা শান্তিময় রুফটপ গার্ডেন।',
      description: 'A serene rooftop retreat where guests unwind with evening tea, enjoy fresh breeze, and take in calm sunset views.',
      descriptionBn: 'অতিথিদের অবসর সময় কাটানোর জন্য গাছপালা ও আরামদায়ক চেয়ারে সাজানো ছাদবাগান।',
      specs: 'Open 6:00 AM – 10:00 PM for All Guests',
      tags: ['Rooftop Terrace', 'Garden Lounge', 'Open Air'],
    },
    {
      id: 'gal-ext-2',
      title: 'Landscaped Garden Walkway & Courtyard',
      titleBn: 'ল্যান্ডস্কেপড গার্ডেন ও হাঁটার পথ',
      category: 'exterior',
      image: '/src/assets/images/exterior_garden_entrance_1793296333894.jpg',
      caption: 'Illuminated stone garden pathway surrounded by tropical greenery and outdoor seating.',
      captionBn: 'সবুজ গাছপালা ও সন্ধ্যার আলোয় সজ্জিত শান্ত ও নিরাপদ বাগান প্রাঙ্গণ।',
      description: 'Enclosed private courtyard garden with stone walkways and outdoor chairs offering a tranquil oasis away from street noise.',
      descriptionBn: 'শহরের কোলাহলমুক্ত নিরিবিলি পরিবেশে হাঁটাহাঁটি ও বসার জন্য পরিচ্ছন্ন আঙিনা।',
      specs: 'Private Enclosed Compound · Evening Lights',
      tags: ['Garden Courtyard', 'Outdoor Seating', 'Greenery'],
    },
  ],
  orders: [
    {
      id: 'BGH-904218',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      guestName: 'Tanvir Ahmed',
      phone: '01711234567',
      roomId: 'executive-ac',
      roomName: 'Executive AC Suite',
      packageId: 'pkg-breakfast',
      packageName: 'Bed & Homestyle Breakfast',
      checkIn: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      guests: 2,
      nights: 2,
      roomType: 'ac',
      unitRate: 2500,
      total: 5000,
      notes: 'Airport pickup requested if available.',
      status: 'Confirmed',
    },
    {
      id: 'BGH-518329',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      guestName: 'Nusrat Jahan',
      phone: '01819876543',
      roomId: 'family-ac',
      roomName: 'Family Quad AC Suite',
      packageId: 'pkg-fullboard',
      packageName: 'Full Board (All Meals Included)',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      guests: 4,
      nights: 2,
      roomType: 'ac',
      unitRate: 3000,
      total: 6000,
      notes: 'Family visiting with elderly parents, prefer lower floor.',
      status: 'Checked-in',
    },
  ],
  settings: {
    businessName: 'Bandhan Guest House',
    businessNameBn: 'বন্ধন গেস্ট হাউস',
    whatsappNumber: '+8801711000000',
    footerContactNumber: '+880 1711-000000',
    address: 'House 24, Road 7, Sector 4, Uttara, Dhaka 1230 (10 mins from Hazrat Shahjalal Int\'l Airport)',
    addressBn: 'বাড়ি ২৪, রোড ৭, সেক্টর ৪, উত্তরা, ঢাকা ১২৩০ (হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর থেকে ১০ মিনিট)',
    checkInPolicy: 'Standard check-in starts at 12:00 PM. Early check-in is subject to room availability.',
    checkOutPolicy: 'Standard check-out is at 11:00 AM. Late check-out options available on request.',
    advancePaymentPolicy: 'Pay directly upon check-in or confirm priority booking with 20% advance via bKash/Nagad/Card.',
    securityPolicy: 'Valid National ID (NID) or Passport is mandatory for all adult guests at check-in. 24/7 CCTV & security desk.',
    heroImage: '/src/assets/images/hero_bandhan_facade_1793296299466.jpg',
    logoImage: '',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'bandhan123',
  },
};

function safeJsonParse<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function boolFromCell(val: unknown, fallback = true): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() !== 'false' && val !== '0';
  if (typeof val === 'number') return val !== 0;
  return fallback;
}

function writeWorkbookToDisk(state: DatabaseState): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const wb = XLSX.utils.book_new();

  const roomsSheet = XLSX.utils.json_to_sheet(
    state.rooms.map((r) => ({
      ...r,
      amenities: JSON.stringify(r.amenities || []),
    }))
  );
  XLSX.utils.book_append_sheet(wb, roomsSheet, 'Rooms');

  const packagesSheet = XLSX.utils.json_to_sheet(state.packages);
  XLSX.utils.book_append_sheet(wb, packagesSheet, 'Packages');

  const gallerySheet = XLSX.utils.json_to_sheet(
    state.gallery.map((g) => ({
      ...g,
      tags: JSON.stringify(g.tags || []),
    }))
  );
  XLSX.utils.book_append_sheet(wb, gallerySheet, 'Gallery');

  const ordersSheet = XLSX.utils.json_to_sheet(state.orders);
  XLSX.utils.book_append_sheet(wb, ordersSheet, 'Orders');

  const settingsRows = Object.entries(state.settings).map(([key, value]) => ({
    key,
    value: String(value ?? ''),
  }));
  const settingsSheet = XLSX.utils.json_to_sheet(settingsRows);
  XLSX.utils.book_append_sheet(wb, settingsSheet, 'Settings');

  const tmpPath = `${DB_PATH}.${process.pid}.${Date.now()}.tmp.xlsx`;
  XLSX.writeFile(wb, tmpPath);
  fs.renameSync(tmpPath, DB_PATH);
}

function loadWorkbookFromDisk(): DatabaseState {
  if (!fs.existsSync(DB_PATH)) {
    const initial = structuredClone(DEFAULT_STATE);
    writeWorkbookToDisk(initial);
    return initial;
  }

  try {
    const wb = XLSX.readFile(DB_PATH);

    const roomsRaw = wb.Sheets['Rooms'] ? XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Rooms']) : [];
    const rooms: RoomRecord[] = roomsRaw.length
      ? roomsRaw.map((row) => ({
          id: String(row.id || ''),
          name: String(row.name || ''),
          nameBn: String(row.nameBn || ''),
          type: row.type === 'non-ac' ? 'non-ac' : 'ac',
          price: Number(row.price) || 0,
          originalPrice: Number(row.originalPrice) || Number(row.price) || 0,
          maxGuests: Number(row.maxGuests) || 2,
          totalInventory: Number(row.totalInventory) || 1,
          available: boolFromCell(row.available, true),
          bedType: String(row.bedType || '1 Double Bed'),
          sizeSqFt: Number(row.sizeSqFt) || 220,
          image: String(row.image || ''),
          description: String(row.description || ''),
          descriptionBn: String(row.descriptionBn || ''),
          amenities: safeJsonParse<string[]>(row.amenities, []),
          badge: row.badge ? String(row.badge) : undefined,
        }))
      : structuredClone(DEFAULT_STATE.rooms);

    const packagesRaw = wb.Sheets['Packages'] ? XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Packages']) : [];
    const packages: PackageRecord[] = packagesRaw.length
      ? packagesRaw.map((row) => ({
          id: String(row.id || ''),
          name: String(row.name || ''),
          nameBn: String(row.nameBn || ''),
          nonAcPrice: Number(row.nonAcPrice) || 0,
          acPrice: Number(row.acPrice) || 0,
          description: String(row.description || ''),
          descriptionBn: String(row.descriptionBn || ''),
          duration: String(row.duration || '24 Hours'),
        }))
      : structuredClone(DEFAULT_STATE.packages);

    const galleryRaw = wb.Sheets['Gallery'] ? XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Gallery']) : [];
    const gallery: GalleryRecord[] = galleryRaw.length
      ? galleryRaw.map((row) => ({
          id: String(row.id || ''),
          title: String(row.title || ''),
          titleBn: String(row.titleBn || ''),
          category: (['rooms', 'interior', 'exterior', 'facilities'].includes(String(row.category))
            ? String(row.category)
            : 'rooms') as GalleryRecord['category'],
          image: String(row.image || ''),
          caption: String(row.caption || ''),
          captionBn: String(row.captionBn || ''),
          description: String(row.description || ''),
          descriptionBn: String(row.descriptionBn || ''),
          specs: String(row.specs || ''),
          tags: safeJsonParse<string[]>(row.tags, []),
        }))
      : structuredClone(DEFAULT_STATE.gallery);

    const ordersRaw = wb.Sheets['Orders'] ? XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Orders']) : [];
    const orders: OrderRecord[] = ordersRaw.map((row) => ({
      id: String(row.id || ''),
      createdAt: String(row.createdAt || ''),
      guestName: String(row.guestName || ''),
      phone: String(row.phone || ''),
      roomId: String(row.roomId || ''),
      roomName: String(row.roomName || ''),
      packageId: String(row.packageId || ''),
      packageName: String(row.packageName || ''),
      checkIn: String(row.checkIn || ''),
      checkOut: String(row.checkOut || ''),
      guests: Number(row.guests) || 1,
      nights: Number(row.nights) || 1,
      roomType: String(row.roomType || 'ac'),
      unitRate: Number(row.unitRate) || 0,
      total: Number(row.total) || 0,
      notes: String(row.notes || ''),
      status: (['Pending', 'Confirmed', 'Checked-in', 'Completed', 'Cancelled'].includes(String(row.status))
        ? String(row.status)
        : 'Pending') as OrderRecord['status'],
    }));

    const settingsRaw = wb.Sheets['Settings']
      ? XLSX.utils.sheet_to_json<{ key: string; value: string }>(wb.Sheets['Settings'])
      : [];
    const settings: SettingsRecord = { ...DEFAULT_STATE.settings };
    for (const row of settingsRaw) {
      if (row.key && row.key in settings) {
        (settings as unknown as Record<string, string>)[row.key] = String(row.value ?? '');
      }
    }

    return { rooms, packages, gallery, orders, settings };
  } catch (err) {
    console.error('Failed to read Excel DB, falling back to default state:', err);
    const initial = structuredClone(DEFAULT_STATE);
    writeWorkbookToDisk(initial);
    return initial;
  }
}

let state: DatabaseState = loadWorkbookFromDisk();
let writeQueue: Promise<void> = Promise.resolve();

function persistState(): Promise<void> {
  const snapshot = structuredClone(state);
  writeQueue = writeQueue.then(() => {
    writeWorkbookToDisk(snapshot);
  });
  return writeQueue;
}

export function getPublicData() {
  const { adminPassword: _hidden, adminUsername: _user, ...publicSettings } = state.settings;
  return {
    rooms: state.rooms,
    packages: state.packages,
    gallery: state.gallery,
    settings: publicSettings,
  };
}

export function getAdminData(): DatabaseState {
  return structuredClone(state);
}

export async function getSettings(): Promise<SettingsRecord> {
  return { ...state.settings };
}

export async function addOrder(order: OrderRecord): Promise<OrderRecord> {
  state.orders.unshift(order);
  await persistState();
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderRecord['status']
): Promise<OrderRecord | null> {
  const order = state.orders.find((o) => o.id.toUpperCase() === id.toUpperCase());
  if (!order) return null;
  order.status = status;
  await persistState();
  return order;
}

export async function updateRoom(
  id: string,
  patch: Partial<RoomRecord>
): Promise<RoomRecord | null> {
  const room = state.rooms.find((r) => r.id === id);
  if (!room) return null;
  Object.assign(room, patch);
  await persistState();
  return room;
}

export async function updatePackage(
  id: string,
  patch: Partial<PackageRecord>
): Promise<PackageRecord | null> {
  const pkg = state.packages.find((p) => p.id === id);
  if (!pkg) return null;
  Object.assign(pkg, patch);
  await persistState();
  return pkg;
}

export async function addGallery(item: GalleryRecord): Promise<GalleryRecord> {
  state.gallery.unshift(item);
  await persistState();
  return item;
}

export async function deleteGallery(id: string): Promise<boolean> {
  const index = state.gallery.findIndex((g) => g.id === id);
  if (index === -1) return false;
  state.gallery.splice(index, 1);
  await persistState();
  return true;
}

export async function updateSettings(
  patch: Partial<SettingsRecord>
): Promise<SettingsRecord> {
  Object.assign(state.settings, patch);
  await persistState();
  return { ...state.settings };
}
