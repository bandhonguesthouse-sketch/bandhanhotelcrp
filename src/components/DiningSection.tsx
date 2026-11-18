import React from 'react';
import { Utensils, Clock, Check } from 'lucide-react';
import { Lang } from '../types/site';

interface DiningSectionProps {
  lang: Lang;
}

export const DiningSection: React.FC<DiningSectionProps> = ({ lang }) => {
  const mealTimings = [
    {
      name: lang === 'bn' ? 'সকালের নাশতা' : 'Morning Breakfast',
      time: '7:30 AM – 10:30 AM',
      highlight:
        lang === 'bn'
          ? 'গরম পরোটা/রুটি, সবজি, ডিম, চা ও কফি'
          : 'Paratha/Toast, Vegetable Curry, Eggs, Tea & Coffee',
    },
    {
      name: lang === 'bn' ? 'দুপুরের খাবার' : 'Homestyle Lunch',
      time: '12:30 PM – 3:30 PM',
      highlight:
        lang === 'bn'
          ? 'ভাত, মাছ ভুনা/কারি, ডাল, ভর্তা ও সালাদ'
          : 'Steamed Rice, Fish Curry, Lentils, Bhorta & Salad',
    },
    {
      name: lang === 'bn' ? 'রাতের খাবার' : 'Evening Dinner',
      time: '7:30 PM – 10:30 PM',
      highlight:
        lang === 'bn'
          ? 'গরম রুটি/ভাত, চিকেন কষা, সবজি ও ডাল'
          : 'Fresh Roti/Rice, Chicken Kosha, Mixed Veg & Dal',
    },
  ];

  return (
    <section
      id="dining"
      className="py-20 bg-stone-900 text-stone-100 scroll-mt-20 border-t border-stone-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-800 aspect-[4/3]">
              <img
                src="/src/assets/images/dining_thali_delight_1793296301240.jpg"
                alt="Homestyle dining service at Bandhan Guest House"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-2 inline-flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ঘরোয়া খাবার' : 'Culinary Comfort'}</span>
              </p>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {lang === 'bn'
                  ? 'স্বাস্থ্যসম্মত ঘরোয়া খাবারের ব্যবস্থা'
                  : 'Fresh Homestyle Kitchen & Room Dining'}
              </h2>
              <p className="mt-3 text-stone-400 text-sm sm:text-base leading-relaxed">
                {lang === 'bn'
                  ? 'বাইরের অস্বাস্থ্যকর খাবার নয়—আমাদের নিজস্ব কিচেনে প্রতিবেলার খাবার অর্ডার অনুযায়ী টাটকা রান্না করে পরিবেশন করা হয়।'
                  : 'Enjoy wholesome, freshly cooked homestyle meals prepared to order in our clean in-house kitchen and served directly to your room.'}
              </p>
            </div>

            <div className="space-y-3">
              {mealTimings.map((meal) => (
                <div
                  key={meal.name}
                  className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-white text-sm block">{meal.name}</span>
                    <span className="text-stone-400">{meal.highlight}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-medium shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{meal.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>In-Room Dining</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Pure RO Water</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
