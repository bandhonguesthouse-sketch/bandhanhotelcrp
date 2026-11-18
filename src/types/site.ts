export type Lang = 'en' | 'bn';

export interface RoomItem {
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

export interface PackageItem {
  id: string;
  name: string;
  nameBn: string;
  nonAcPrice: number;
  acPrice: number;
  description: string;
  descriptionBn: string;
  duration: string;
}

export interface GalleryPhoto {
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

export interface OrderItem {
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

export interface PublicSettings {
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
  adminUsername?: string;
}

export interface PublicSiteData {
  rooms: RoomItem[];
  packages: PackageItem[];
  gallery: GalleryPhoto[];
  settings: PublicSettings;
}

export interface AdminStats {
  totalOrders: number;
  pending: number;
  confirmed: number;
  checkedIn: number;
  completed: number;
  cancelled: number;
  revenue: number;
  rooms: number;
  gallery: number;
  recentOrders: OrderItem[];
}

export interface AdminDataResponse extends PublicSiteData {
  orders: OrderItem[];
  stats: AdminStats;
}
