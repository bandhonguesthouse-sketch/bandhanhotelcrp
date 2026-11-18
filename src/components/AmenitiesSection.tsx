import React from 'react';
import {
  Wifi,
  Zap,
  Utensils,
  Clock,
  Sparkles,
  Car,
  Compass,
  Droplets,
  CheckCircle2,
} from 'lucide-react';
import { AMENITIES_LIST } from '../data/guesthouseData';
import { Lang } from '../types/site';

interface AmenitiesSectionProps {
  lang: Lang;
}

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ lang }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-amber-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Car':
        return <Car className="w-5 h-5 text-amber-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-amber-400" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-amber-400" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <section
      id="amenities"
      className="py-20 bg-stone-950 text-stone-100 scroll-mt-20 border-t border-stone-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-semibold text-amber-400 mb-2">
            {lang === 'bn' ? 'অতিথি সুবিধাসমূহ' : 'Guest Comforts'}
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white text-balance">
            {lang === 'bn'
              ? 'আরামদায়ক থাকার জন্য সকল আধুনিক সুবিধা'
              : 'Thoughtful Amenities for a Relaxed Stay'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AMENITIES_LIST.map((item) => (
            <div
              key={item.title}
              className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center mb-4">
                  {getIcon(item.icon)}
                </div>
                <h3 className="font-semibold text-white text-base mb-2">
                  {lang === 'bn' ? item.titleBn : item.title}
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {lang === 'bn' ? item.descBn : item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
