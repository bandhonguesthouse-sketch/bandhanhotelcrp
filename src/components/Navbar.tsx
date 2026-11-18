import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { Lang, PublicSettings } from '../types/site';

interface NavbarProps {
  lang: Lang;
  settings: PublicSettings;
  onOpenBooking: (roomId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, settings, onOpenBooking }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: lang === 'bn' ? 'রুমসমূহ' : 'Rooms', href: '#rooms' },
    { label: lang === 'bn' ? 'প্যাকেজ' : 'Packages', href: '#packages' },
    { label: lang === 'bn' ? 'গ্যালারি' : 'Gallery', href: '#gallery' },
    { label: lang === 'bn' ? 'লোকেশন' : 'Location', href: '#location' },
    { label: lang === 'bn' ? 'ট্র্যাকিং' : 'Track Booking', href: '#track' },
  ];

  const brandTitle = lang === 'bn' ? settings.businessNameBn || settings.businessName : settings.businessName;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-stone-950/95 backdrop-blur-md text-stone-100 shadow-lg py-3.5 border-b border-stone-800'
          : 'bg-stone-950/80 backdrop-blur-sm text-stone-100 py-4 border-b border-stone-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#"
          className="font-serif-luxury text-lg sm:text-xl font-bold tracking-tight text-white hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
        >
          {brandTitle}
        </a>

        {/* Zone 2: 5 Single-line Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-amber-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="hidden md:flex items-center shrink-0">
          <button
            onClick={() => onOpenBooking()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'বুকিং করুন' : 'Book Stay'}</span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => onOpenBooking()}
            className="px-3 py-1.5 text-xs font-bold text-stone-950 bg-amber-500 rounded-lg whitespace-nowrap shrink-0"
          >
            {lang === 'bn' ? 'বুকিং' : 'Book'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="p-2 text-stone-200 hover:text-white rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-950 border-b border-stone-800 px-6 py-5 space-y-3 shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-stone-200 hover:text-amber-400 py-1.5"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenBooking();
            }}
            className="w-full mt-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs uppercase tracking-wider"
          >
            {lang === 'bn' ? 'অনলাইনে রুম বুক করুন' : 'Book Your Stay Online'}
          </button>
        </div>
      )}
    </header>
  );
};
