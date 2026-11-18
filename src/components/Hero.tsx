import React, { useState } from 'react';
import { Calendar, MapPin, ShieldCheck, Wifi, ArrowRight, Phone, Globe } from 'lucide-react';
import { Lang, PackageItem, PublicSettings, RoomItem } from '../types/site';

interface HeroProps {
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  settings: PublicSettings;
  rooms: RoomItem[];
  packages: PackageItem[];
  onOpenBooking: (
    roomId?: string,
    initialData?: { checkIn: string; checkOut: string; guests: number; packageId?: string }
  ) => void;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onChangeLang,
  settings,
  rooms,
  packages,
  onOpenBooking,
}) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(formatDate(tomorrow));
  const [checkOut, setCheckOut] = useState(formatDate(dayAfter));
  const [guests, setGuests] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]?.id || 'deluxe-ac');
  const [selectedPackage, setSelectedPackage] = useState(packages[0]?.id || '');

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenBooking(selectedRoom || rooms[0]?.id, {
      checkIn,
      checkOut,
      guests,
      packageId: selectedPackage,
    });
  };

  const heroImage =
    settings.heroImage || '/src/assets/images/hero_bandhan_facade_1793296299466.jpg';

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-stone-950 text-stone-100">
      {/* Background Visual with Measured Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={settings.businessName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/75 to-stone-900/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean Metadata Line & Language Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-300">
            <span className="text-amber-400 font-semibold">
              {lang === 'bn' ? '৪.৮/৫ অতিথি রেটিং' : 'Rated 4.8/5 by 380+ Guests'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{lang === 'bn' ? settings.addressBn : settings.address}</span>
          </div>

          {/* Interactive Language Segmented Control */}
          <div className="inline-flex items-center gap-1 p-1 bg-stone-900/90 border border-stone-800 rounded-lg">
            <Globe className="w-3.5 h-3.5 text-amber-400 ml-2 mr-1" />
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                lang === 'en' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('bn')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                lang === 'bn' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-300 hover:text-white'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Main Display Headline */}
        <div className="max-w-3xl">
          <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight text-balance mb-5">
            {lang === 'bn'
              ? 'বন্ধন গেস্ট হাউস — শান্তিময় পরিবেশ ও আধুনিক আতিথেয়তা'
              : 'Warm Hospitality & Serene Stays at Bandhan Guest House'}
          </h1>

          <p className="text-base sm:text-lg text-stone-300 leading-relaxed mb-8 max-w-2xl">
            {lang === 'bn'
              ? 'আধুনিক এসি ও নন-এসি রুম, সাশ্রয়ী ডে-ইউজ ও ২৪ ঘণ্টার প্যাকেজ, ঘরোয়া খাবার এবং এয়ারপোর্টের সন্নিকটে নিরাপদ আবাসন ব্যবস্থা।'
              : 'Spacious AC & Non-AC rooms, flexible 24-hour and day-use packages, authentic homestyle dining, and seamless proximity to the Airport and Metro.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <a
              href="#rooms"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>{lang === 'bn' ? 'রুম ও ভাড়া দেখুন' : 'Explore Rooms & Rates'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#gallery"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-stone-200 hover:text-white bg-stone-900/85 hover:bg-stone-800 border border-stone-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>{lang === 'bn' ? 'ফটো গ্যালারি' : 'Photo Gallery'}</span>
            </a>

            <a
              href={`tel:${settings.footerContactNumber}`}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-300 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span className="tabular-nums">{settings.footerContactNumber}</span>
            </a>
          </div>
        </div>

        {/* Full-Width 5-Column Quick Availability Strip */}
        <div className="bg-stone-900/95 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleQuickCheck} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                {lang === 'bn' ? 'চেক-ইন তারিখ' : 'Check-In Date'}
              </label>
              <input
                type="date"
                value={checkIn}
                min={formatDate(today)}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 text-stone-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                {lang === 'bn' ? 'চেক-আউট তারিখ' : 'Check-Out Date'}
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 text-stone-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                {lang === 'bn' ? 'রুম নির্বাচন করুন' : 'Select Room'}
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 text-stone-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {lang === 'bn' ? room.nameBn : room.name} (৳{room.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                {lang === 'bn' ? 'প্যাকেজ ও অতিথি' : 'Package & Guests'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="bg-stone-950 border border-stone-700 text-stone-100 rounded-lg px-2 py-2.5 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">{lang === 'bn' ? 'রুম রেট' : 'Room Rate'}</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {lang === 'bn' ? p.nameBn : p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="bg-stone-950 border border-stone-700 text-stone-100 rounded-lg px-2 py-2.5 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      {g} {lang === 'bn' ? 'জন' : g > 1 ? 'Guests' : 'Guest'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2.5 px-4 rounded-lg text-sm shadow transition-colors flex items-center justify-center gap-2 cursor-pointer h-[42px]"
              >
                <Calendar className="w-4 h-4" />
                <span>{lang === 'bn' ? 'বুকিং করুন' : 'Book Now'}</span>
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lang === 'bn' ? '২৪/৭ জেনারেটর ও এসি ব্যাকআপ' : '24/7 Power & AC Backup'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lang === 'bn' ? 'ফ্রি ১০০ এমবিপিএস ওয়াই-ফাই' : 'Free 100 Mbps Wi-Fi'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lang === 'bn' ? 'এয়ারপোর্ট থেকে ১০ মিনিট' : '10 Mins from Airport'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lang === 'bn' ? 'লাইভ বুকিং ট্র্যাকিং আইডি' : 'Instant Tracking ID'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
