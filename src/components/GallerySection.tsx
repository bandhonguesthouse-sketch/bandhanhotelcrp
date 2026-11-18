import React, { useState, useEffect, useCallback } from 'react';
import {
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  Bed,
  Coffee,
  Building2,
  Layers,
  Calendar,
  ZoomIn,
  ZoomOut,
  Utensils,
} from 'lucide-react';
import { GalleryPhoto, Lang } from '../types/site';

interface GallerySectionProps {
  lang: Lang;
  gallery: GalleryPhoto[];
  onBookRoom?: () => void;
}

type FilterKey = 'all' | 'rooms' | 'interior' | 'exterior' | 'facilities';

export const GallerySection: React.FC<GallerySectionProps> = ({
  lang,
  gallery,
  onBookRoom,
}) => {
  const [activeCategory, setActiveCategory] = useState<FilterKey>('all');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);

  const filteredItems =
    activeCategory === 'all'
      ? gallery
      : gallery.filter((item) => item.category === activeCategory);

  const counts = {
    all: gallery.length,
    rooms: gallery.filter((i) => i.category === 'rooms').length,
    interior: gallery.filter((i) => i.category === 'interior').length,
    exterior: gallery.filter((i) => i.category === 'exterior').length,
    facilities: gallery.filter((i) => i.category === 'facilities').length,
  };

  const categoryLabel = (cat: GalleryPhoto['category']) => {
    if (lang === 'bn') {
      switch (cat) {
        case 'rooms':
          return 'রুম ও স্যুইট';
        case 'interior':
          return 'কমন এরিয়া ও লবি';
        case 'exterior':
          return 'বাইরের দৃশ্য';
        case 'facilities':
          return 'ডাইনিং ও সুবিধাসমূহ';
      }
    }
    switch (cat) {
      case 'rooms':
        return 'Rooms & Suites';
      case 'interior':
        return 'Common Areas';
      case 'exterior':
        return 'Exterior Views';
      case 'facilities':
        return 'Dining & Terrace';
    }
  };

  const selectedItem =
    selectedItemIndex !== null ? filteredItems[selectedItemIndex] || null : null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedItemIndex === null || filteredItems.length === 0) return;
      if (e.key === 'Escape') {
        setSelectedItemIndex(null);
        setIsZoomed(false);
      } else if (e.key === 'ArrowRight') {
        setSelectedItemIndex((prev) =>
          prev !== null ? (prev + 1) % filteredItems.length : 0
        );
        setIsZoomed(false);
      } else if (e.key === 'ArrowLeft') {
        setSelectedItemIndex((prev) =>
          prev !== null
            ? (prev - 1 + filteredItems.length) % filteredItems.length
            : 0
        );
        setIsZoomed(false);
      }
    },
    [selectedItemIndex, filteredItems.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedItemIndex !== null && filteredItems.length > 0) {
      setSelectedItemIndex((selectedItemIndex + 1) % filteredItems.length);
      setIsZoomed(false);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedItemIndex !== null && filteredItems.length > 0) {
      setSelectedItemIndex(
        (selectedItemIndex - 1 + filteredItems.length) % filteredItems.length
      );
      setIsZoomed(false);
    }
  };

  const filterButtons: Array<{
    key: FilterKey;
    label: string;
    icon: React.ReactNode;
    count: number;
  }> = [
    {
      key: 'all',
      label: lang === 'bn' ? 'সব ছবি' : 'All Views',
      icon: <Layers className="w-3.5 h-3.5" />,
      count: counts.all,
    },
    {
      key: 'rooms',
      label: lang === 'bn' ? 'রুমসমূহ' : 'Rooms',
      icon: <Bed className="w-3.5 h-3.5" />,
      count: counts.rooms,
    },
    {
      key: 'interior',
      label: lang === 'bn' ? 'কমন এরিয়া' : 'Common Areas',
      icon: <Coffee className="w-3.5 h-3.5" />,
      count: counts.interior,
    },
    {
      key: 'exterior',
      label: lang === 'bn' ? 'বাইরের দৃশ্য' : 'Exterior Views',
      icon: <Building2 className="w-3.5 h-3.5" />,
      count: counts.exterior,
    },
    {
      key: 'facilities',
      label: lang === 'bn' ? 'সুবিধাসমূহ' : 'Facilities',
      icon: <Utensils className="w-3.5 h-3.5" />,
      count: counts.facilities,
    },
  ];

  return (
    <section
      id="gallery"
      className="py-20 bg-stone-900 text-stone-100 scroll-mt-20 border-t border-stone-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Interactive Category Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-2">
              {lang === 'bn' ? 'ফটো গ্যালারি' : 'Visual Showcase'}
            </p>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
              {lang === 'bn'
                ? 'গেস্ট হাউসের রুম, কমন এরিয়া ও বাইরের পরিবেশ'
                : 'Photo Gallery & Living Spaces'}
            </h2>
            <p className="mt-2 text-stone-400 max-w-2xl text-sm sm:text-base">
              {lang === 'bn'
                ? 'আমাদের শীতাতপ নিয়ন্ত্রিত রুম, রিসেপশন লাউঞ্জ, রুফটপ গার্ডেন এবং মূল ভবনের বাস্তব চিত্র দেখুন।'
                : 'Browse authentic photographs of our rooms, welcoming reception lounge, rooftop terrace, dining space, and exterior gardens.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1.5 bg-stone-950/90 rounded-xl border border-stone-800 self-start">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => {
                  setActiveCategory(btn.key);
                  setSelectedItemIndex(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCategory === btn.key
                    ? 'bg-amber-500 text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                {btn.icon}
                <span>{btn.label}</span>
                <span className="font-mono tabular-nums text-[11px] opacity-80">
                  ({btn.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-stone-950 border border-stone-800 rounded-2xl text-sm text-stone-400">
            {lang === 'bn'
              ? 'এই ক্যাটাগরিতে এখনো কোনো ছবি যোগ করা হয়নি।'
              : 'No photos in this category yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => {
              const title = lang === 'bn' ? item.titleBn || item.title : item.title;
              const caption = lang === 'bn' ? item.captionBn || item.caption : item.caption;
              const desc =
                lang === 'bn'
                  ? item.descriptionBn || item.description || caption
                  : item.description || caption;

              return (
                <article
                  key={item.id}
                  onClick={() => setSelectedItemIndex(idx)}
                  className="group bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/50 transition-colors flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900">
                    <img
                      src={item.image}
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex p-2 bg-stone-900/90 border border-stone-700 rounded-lg text-amber-400 shadow">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>

                    {item.specs && (
                      <div className="absolute bottom-3 left-3 right-3 text-[11px] text-stone-300 truncate font-mono">
                        {item.specs}
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-amber-400/90 mb-1.5">
                        <span>{categoryLabel(item.category)}</span>
                        {item.tags?.length > 0 && (
                          <>
                            <span aria-hidden="true" className="text-stone-600">
                              ·
                            </span>
                            <span className="text-stone-400 truncate">
                              {item.tags.slice(0, 2).join(' · ')}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {title}
                      </h3>

                      {caption && (
                        <p className="mt-2 text-xs font-medium text-stone-300 italic leading-snug">
                          “{caption}”
                        </p>
                      )}

                      {desc && (
                        <p className="mt-2 text-xs text-stone-400 leading-relaxed line-clamp-3">
                          {desc}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                      <span className="text-stone-500">
                        {lang === 'bn' ? 'বড় করে দেখুন' : 'Click to inspect'}
                      </span>
                      <span className="text-amber-400 font-medium inline-flex items-center gap-1 group-hover:underline">
                        <span>{lang === 'bn' ? 'বিস্তারিত' : 'Enlarge'}</span>
                        <Maximize2 className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Interactive Lightbox */}
      {selectedItem !== null && selectedItemIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col overflow-hidden"
          onClick={() => setSelectedItemIndex(null)}
        >
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-800 bg-stone-950/80 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-xs">
              <span className="text-amber-400 font-semibold">
                {categoryLabel(selectedItem.category)}
              </span>
              <span aria-hidden="true" className="text-stone-600">
                ·
              </span>
              <span className="text-stone-400 font-mono tabular-nums">
                {selectedItemIndex + 1} / {filteredItems.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg cursor-pointer"
                title="Zoom"
              >
                {isZoomed ? (
                  <ZoomOut className="w-5 h-5" />
                ) : (
                  <ZoomIn className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                className={`p-2 rounded-lg cursor-pointer ${
                  showDetailsPanel
                    ? 'text-amber-400 bg-stone-800'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
                title="Toggle Caption & Description"
              >
                <Info className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setSelectedItemIndex(null);
                  setIsZoomed(false);
                }}
                className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg cursor-pointer"
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 flex flex-col lg:flex-row relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6 overflow-auto bg-stone-950 select-none">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                referrerPolicy="no-referrer"
                className={`max-h-[75vh] lg:max-h-[85vh] w-auto max-w-full rounded-lg shadow-2xl object-contain transition-transform duration-300 ${
                  isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-stone-900/85 hover:bg-stone-800 text-white border border-stone-700 shadow-xl cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-stone-900/85 hover:bg-stone-800 text-white border border-stone-700 shadow-xl cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {showDetailsPanel && (
              <div className="w-full lg:w-96 bg-stone-900 border-t lg:border-t-0 lg:border-l border-stone-800 p-6 flex flex-col justify-between overflow-y-auto max-h-[40vh] lg:max-h-full">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-amber-400">
                      {categoryLabel(selectedItem.category)}
                    </span>
                    <h3 className="font-serif-luxury text-xl font-bold text-white mt-1">
                      {lang === 'bn'
                        ? selectedItem.titleBn || selectedItem.title
                        : selectedItem.title}
                    </h3>
                  </div>

                  {(selectedItem.caption || selectedItem.captionBn) && (
                    <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl">
                      <span className="text-[11px] font-semibold text-amber-400 block mb-1">
                        {lang === 'bn' ? 'ক্যাপশন' : 'Caption'}
                      </span>
                      <p className="text-sm text-stone-200 italic leading-relaxed">
                        “
                        {lang === 'bn'
                          ? selectedItem.captionBn || selectedItem.caption
                          : selectedItem.caption}
                        ”
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-semibold text-stone-400 block mb-1.5">
                      {lang === 'bn' ? 'বিস্তারিত বিবরণ' : 'Description'}
                    </span>
                    <p className="text-sm text-stone-300 leading-relaxed">
                      {lang === 'bn'
                        ? selectedItem.descriptionBn ||
                          selectedItem.description ||
                          selectedItem.captionBn
                        : selectedItem.description || selectedItem.caption}
                    </p>
                  </div>

                  {selectedItem.specs && (
                    <div className="pt-3 border-t border-stone-800 text-xs text-stone-300 font-mono">
                      {selectedItem.specs}
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-stone-800 space-y-2.5">
                  <button
                    onClick={() => {
                      setSelectedItemIndex(null);
                      onBookRoom?.();
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>
                      {lang === 'bn' ? 'রুম বুকিং করুন' : 'Book Your Stay'}
                    </span>
                  </button>
                  <p className="text-[11px] text-stone-500 text-center">
                    ← / → to navigate · Esc to close
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
