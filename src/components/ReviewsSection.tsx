import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { REVIEWS_DATA } from '../data/guesthouseData';
import { Lang } from '../types/site';

interface ReviewsSectionProps {
  lang: Lang;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ lang }) => {
  return (
    <section className="py-20 bg-stone-950 text-stone-100 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-2">
              {lang === 'bn' ? 'অতিথিদের মতামত' : 'Guest Experiences'}
            </p>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {lang === 'bn' ? 'আমাদের অতিথিদের অভিজ্ঞতা' : 'Words From Our Valued Guests'}
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl self-start md:self-auto">
            <div className="text-3xl font-bold text-amber-400 font-mono tabular-nums">4.8</div>
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">380+ Verified Guest Reviews</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS_DATA.map((rev) => (
            <div
              key={rev.id}
              className="bg-stone-900/70 border border-stone-800 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">{rev.date}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 italic leading-relaxed mb-6">
                  “{rev.comment}”
                </p>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{rev.name}</h4>
                  <p className="text-[11px] text-stone-500">
                    {rev.location} · {rev.tripType}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
