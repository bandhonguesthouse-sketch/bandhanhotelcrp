import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RoomsSection } from './components/RoomsSection';
import { PackagesSection } from './components/PackagesSection';
import { GallerySection } from './components/GallerySection';
import { TrackBookingSection } from './components/TrackBookingSection';
import { LocationSection } from './components/LocationSection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { DiningSection } from './components/DiningSection';
import { ReviewsSection } from './components/ReviewsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Lang, PublicSiteData } from './types/site';

const INITIAL_FALLBACK: PublicSiteData = {
  rooms: [],
  packages: [],
  gallery: [],
  settings: {
    businessName: 'Bandhan Guest House',
    businessNameBn: 'বন্ধন গেস্ট হাউস',
    whatsappNumber: '+8801711000000',
    footerContactNumber: '+880 1711-000000',
    address: 'House 24, Road 7, Sector 4, Uttara, Dhaka 1230',
    addressBn: 'বাড়ি ২৪, রোড ৭, সেক্টর ৪, উত্তরা, ঢাকা ১২৩০',
    checkInPolicy: 'Standard check-in starts at 12:00 PM.',
    checkOutPolicy: 'Standard check-out is at 11:00 AM.',
    advancePaymentPolicy: 'Pay directly at check-in or via bKash/Nagad/Card.',
    securityPolicy: 'Valid National ID (NID) or Passport required at check-in.',
    heroImage: '/src/assets/images/hero_bandhan_facade_1793296299466.jpg',
    logoImage: '',
  },
};

export default function App() {
  const [route, setRoute] = useState<'site' | 'admin'>(() =>
    window.location.pathname.startsWith('/admin') ? 'admin' : 'site'
  );
  const [lang, setLang] = useState<Lang>('en');
  const [siteData, setSiteData] = useState<PublicSiteData>(INITIAL_FALLBACK);
  const [loading, setLoading] = useState(true);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | undefined>(undefined);
  const [initialBookingData, setInitialBookingData] = useState<
    | {
        checkIn: string;
        checkOut: string;
        guests: number;
        packageId?: string;
      }
    | undefined
  >(undefined);

  const loadPublicData = useCallback(async () => {
    try {
      const res = await fetch('/api/public/data', { cache: 'no-store' });
      if (res.ok) {
        const data: PublicSiteData = await res.json();
        setSiteData(data);
      }
    } catch {
      // keep fallback state if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(window.location.pathname.startsWith('/admin') ? 'admin' : 'site');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (route === 'site' && window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 150);
      }
    }
  }, [route, loading]);

  const navigateTo = (target: 'site' | 'admin') => {
    const nextPath = target === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setRoute(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (
    roomId?: string,
    initialData?: { checkIn: string; checkOut: string; guests: number; packageId?: string }
  ) => {
    setPreselectedRoomId(roomId);
    setInitialBookingData(initialData);
    setIsBookingOpen(true);
  };

  if (route === 'admin') {
    return (
      <AdminDashboard
        onBackToSite={() => navigateTo('site')}
        onDataUpdated={loadPublicData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950">
      <Navbar
        lang={lang}
        settings={siteData.settings}
        onOpenBooking={handleOpenBooking}
      />

      <main className="flex-1">
        <Hero
          lang={lang}
          onChangeLang={setLang}
          settings={siteData.settings}
          rooms={siteData.rooms}
          packages={siteData.packages}
          onOpenBooking={handleOpenBooking}
        />

        <RoomsSection
          lang={lang}
          rooms={siteData.rooms}
          onOpenBooking={handleOpenBooking}
        />

        <PackagesSection
          lang={lang}
          packages={siteData.packages}
          onSelectPackage={(packageId) =>
            handleOpenBooking(siteData.rooms[0]?.id, {
              checkIn: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
              guests: 2,
              packageId,
            })
          }
        />

        <GallerySection
          lang={lang}
          gallery={siteData.gallery}
          onBookRoom={() => handleOpenBooking()}
        />

        <TrackBookingSection lang={lang} />

        <LocationSection lang={lang} settings={siteData.settings} />

        <DiningSection lang={lang} />

        <AmenitiesSection lang={lang} />

        <ReviewsSection lang={lang} />

        <ContactSection lang={lang} settings={siteData.settings} />
      </main>

      <Footer
        lang={lang}
        settings={siteData.settings}
        onNavigateAdmin={() => navigateTo('admin')}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        lang={lang}
        rooms={siteData.rooms}
        packages={siteData.packages}
        settings={siteData.settings}
        preselectedRoomId={preselectedRoomId}
        initialData={initialBookingData}
      />
    </div>
  );
}
