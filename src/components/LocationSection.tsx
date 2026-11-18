import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Copy,
  Check,
  ExternalLink,
  Phone,
  Train,
  Plane,
  Car,
  Bus,
  Building,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { LANDMARKS_DATA } from '../data/guesthouseData';
import { Lang, PublicSettings } from '../types/site';

interface LocationSectionProps {
  lang: Lang;
  settings: PublicSettings;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ lang, settings }) => {
  const [copied, setCopied] = useState(false);
  const [transitTab, setTransitTab] = useState<'metro' | 'airport' | 'train' | 'car'>('airport');
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'transit' | 'shopping' | 'business' | 'attraction'
  >('all');

  const displayAddress = lang === 'bn' ? settings.addressBn || settings.address : settings.address;
  const displayName =
    lang === 'bn' ? settings.businessNameBn || settings.businessName : settings.businessName;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    settings.businessName + ' ' + settings.address
  )}`;

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    'Uttara Sector 4 Dhaka'
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const filteredLandmarks =
    activeCategory === 'all'
      ? LANDMARKS_DATA
      : LANDMARKS_DATA.filter((l) => l.category === activeCategory);

  return (
    <section
      id="location"
      className="py-20 bg-stone-950 text-stone-100 scroll-mt-20 border-t border-stone-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-semibold text-amber-400 mb-2">
            {lang === 'bn' ? 'অবস্থান ও যাতায়াত' : 'Prime Connectivity'}
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white text-balance">
            {lang === 'bn' ? 'লোকেশন ও যাতায়াত নির্দেশিকা' : 'Location & Travel Directions'}
          </h2>
          <p className="mt-3 text-stone-400 text-sm sm:text-base leading-relaxed">
            {lang === 'bn'
              ? 'বিমানবন্দর, মেট্রোরেল এবং রেলওয়ে স্টেশনের অতি সন্নিকটে শান্ত ও নিরাপদ আবাসিক পরিবেশ।'
              : 'Strategically located in a calm residential sector just minutes from the International Airport, Metro Rail, and commercial plazas.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14">
          <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{lang === 'bn' ? 'ইন্টারেক্টিভ ম্যাপ' : 'Interactive Map'}</span>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300"
              >
                <span>Open Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="relative w-full h-[360px] sm:h-[400px] bg-stone-950">
              <iframe
                title="Bandhan Guest House Location Map"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(95%)' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>

            <div className="p-4 bg-stone-900 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-stone-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {lang === 'bn'
                    ? '২৪ ঘণ্টা সিকিউরিটি গেট ও পার্কিং সুবিধা'
                    : '24-Hour Gated Entry & Secure Parking'}
                </span>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-medium inline-flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'জিপিএস ডিরেকশন' : 'GPS Directions'}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">
                  {lang === 'bn' ? 'ঠিকানা' : 'Full Address'}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-md cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-white">{displayName}</h3>
                <p className="mt-2 text-sm text-stone-300 leading-relaxed">{displayAddress}</p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <a
                  href={`tel:${settings.footerContactNumber}`}
                  className="flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-lg"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'bn' ? 'কল করুন' : 'Call Reception'}</span>
                </a>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg shadow"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'ম্যাপ দেখুন' : 'Navigate'}</span>
                </a>
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-semibold text-stone-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{lang === 'bn' ? 'প্রধান ট্রানজিট দূরত্ব' : 'Estimated Transit Times'}</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                    <Plane className="w-3.5 h-3.5 text-amber-400" />
                    <span>Airport (DAC)</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono tabular-nums">3.4 km</p>
                  <span className="text-[11px] text-stone-400">~10 mins drive</span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                    <Train className="w-3.5 h-3.5 text-amber-400" />
                    <span>Metro MRT-6</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono tabular-nums">1.8 km</p>
                  <span className="text-[11px] text-stone-400">~6 mins drive</span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                    <Bus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Airport Rly Stn</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono tabular-nums">3.1 km</p>
                  <span className="text-[11px] text-stone-400">~9 mins drive</span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>Shopping Plaza</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono tabular-nums">1.1 km</p>
                  <span className="text-[11px] text-stone-400">~4 mins drive</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transit Guide Tabs */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800">
            <div>
              <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
                {lang === 'bn' ? 'আসার সহজ উপায়' : 'How to Reach Bandhan Guest House'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                {lang === 'bn'
                  ? 'বিমানবন্দর, মেট্রোরেল, ট্রেন বা ব্যক্তিগত গাড়িতে আসার নির্দেশনা।'
                  : 'Select your arrival mode for clear directions.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-950 rounded-xl border border-stone-800 self-start">
              {[
                { key: 'airport' as const, label: 'From Airport', icon: <Plane className="w-3.5 h-3.5" /> },
                { key: 'metro' as const, label: 'Metro Rail', icon: <Train className="w-3.5 h-3.5" /> },
                { key: 'train' as const, label: 'Railway', icon: <Bus className="w-3.5 h-3.5" /> },
                { key: 'car' as const, label: 'Private Car', icon: <Car className="w-3.5 h-3.5" /> },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTransitTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                    transitTab === t.key ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 text-sm text-stone-300 space-y-2.5 leading-relaxed">
            {transitTab === 'airport' && (
              <p>
                Exit Hazrat Shahjalal International Airport onto Dhaka–Mymensingh Highway heading north towards Uttara. Turn at Jasimuddin Road / Sector 4 approach (approx. 10 minutes drive). Pre-arranged chauffeur pickup is available upon request during booking.
              </p>
            )}
            {transitTab === 'metro' && (
              <p>
                Take MRT Line-6 and exit at Uttara Centre or Uttara North station. Take an electric rickshaw or ride-share directly to Sector 4, Road 7 (6 minutes).
              </p>
            )}
            {transitTab === 'train' && (
              <p>
                Arrive at Dhaka Airport Railway Station (3.1 km away). Cross to the Uttara side via Airport Road and reach Bandhan Guest House in under 10 minutes by CNG, Uber, or Pathao.
              </p>
            )}
            {transitTab === 'car' && (
              <p>
                Wide residential approach roads allow easy sedan and SUV entry. Enjoy complimentary private gated parking inside our compound with 24/7 CCTV monitoring.
              </p>
            )}
          </div>
        </div>

        {/* Nearby Landmarks Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
              {lang === 'bn' ? 'নিকটবর্তী গুরুত্বপূর্ণ স্থান' : 'Nearby Landmarks & Transit Hubs'}
            </h3>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['all', 'transit', 'business', 'shopping', 'attraction'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-lg capitalize cursor-pointer whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-stone-950 font-semibold'
                      : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  {cat === 'all' ? 'All Places' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLandmarks.map((landmark) => (
              <div
                key={landmark.name}
                className="bg-stone-900 border border-stone-800 rounded-xl p-4.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-amber-400 font-medium capitalize">{landmark.category}</span>
                    <span className="font-mono tabular-nums text-stone-300 font-semibold">
                      {landmark.distance}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    {lang === 'bn' ? landmark.nameBn : landmark.name}
                  </h4>
                  <p className="mt-2 text-xs text-stone-400 leading-relaxed">
                    {lang === 'bn' ? landmark.descriptionBn : landmark.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-mono">{landmark.timeByCar} drive</span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                      settings.address
                    )}&destination=${encodeURIComponent(landmark.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Route</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
