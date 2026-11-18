import React from 'react';
import { MapPin, Phone, Lock } from 'lucide-react';
import { Lang, PublicSettings } from '../types/site';

interface FooterProps {
  lang: Lang;
  settings: PublicSettings;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, settings, onNavigateAdmin }) => {
  const name = lang === 'bn' ? settings.businessNameBn || settings.businessName : settings.businessName;
  const address = lang === 'bn' ? settings.addressBn || settings.address : settings.address;

  return (
    <footer className="bg-stone-950 text-stone-400 text-xs border-t border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <span className="font-serif-luxury text-lg font-bold text-white block">{name}</span>
            <p className="text-stone-400 max-w-sm leading-relaxed">
              {lang === 'bn'
                ? 'শান্তিময় পরিবেশ, আধুনিক এসি/নন-এসি রুম ও ঘরোয়া খাবারের নির্ভরযোগ্য আবাসন।'
                : 'Warm hospitality, clean AC & Non-AC accommodations, and homestyle dining for families and business travelers.'}
            </p>
            <div className="pt-2 space-y-1.5">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${settings.footerContactNumber}`}
                  className="hover:text-amber-400 transition-colors font-mono"
                >
                  {settings.footerContactNumber}
                </a>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-200">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <a href="#rooms" className="hover:text-amber-400 transition-colors">
                  Rooms & Rates
                </a>
              </li>
              <li>
                <a href="#packages" className="hover:text-amber-400 transition-colors">
                  Stay Packages
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-amber-400 transition-colors">
                  Photo Gallery
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-amber-400 transition-colors">
                  Location & Map
                </a>
              </li>
              <li>
                <a href="#track" className="hover:text-amber-400 transition-colors">
                  Track Booking
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-200">Management</h4>
            <p className="text-stone-400 leading-relaxed">
              Manage bookings, room rates, photo gallery uploads, and Excel database exports.
            </p>
            <button
              onClick={onNavigateAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Panel (/admin)</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500">
          <p>
            © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
          </p>
          <p className="text-[11px]">
            Direct Reservations · Excel Database Backed
          </p>
        </div>
      </div>
    </footer>
  );
};
