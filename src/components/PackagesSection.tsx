import React from 'react';
import { Clock, Check, ArrowRight } from 'lucide-react';
import { Lang, PackageItem } from '../types/site';

interface PackagesSectionProps {
  lang: Lang;
  packages: PackageItem[];
  onSelectPackage: (packageId: string) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  lang,
  packages,
  onSelectPackage,
}) => {
  return (
    <section id="packages" className="py-20 bg-stone-900/60 text-stone-100 scroll-mt-20 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-semibold text-amber-400 mb-2">
            {lang === 'bn' ? 'সাশ্রয়ী স্টে প্যাকেজ' : 'Flexible Stay Packages'}
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
            {lang === 'bn'
              ? 'আপনার প্রয়োজন অনুযায়ী এসি ও নন-এসি প্যাকেজ'
              : 'Transparent Packages for Every Schedule'}
          </h2>
          <p className="mt-2 text-stone-400 text-sm sm:text-base leading-relaxed">
            {lang === 'bn'
              ? '৬ ঘণ্টার ট্রানজিট ডে-ইউজ থেকে শুরু করে খাবারসহ ২৪ ঘণ্টার পূর্ণাঙ্গ প্যাকেজ—সবকিছুর রেট নির্ধারিত ও স্বচ্ছ।'
              : 'Choose from 6-hour transit day-use, Bed & Breakfast, or Full Board meal packages with clear AC and Non-AC tariffs.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, idx) => (
            <div
              key={pkg.id}
              className="bg-stone-950 border border-stone-800 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
                  <span className="font-mono tabular-nums text-amber-400 font-semibold">
                    0{idx + 1}.
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    {pkg.duration}
                  </span>
                </div>

                <h3 className="font-serif-luxury text-lg font-bold text-white mb-2">
                  {lang === 'bn' ? pkg.nameBn || pkg.name : pkg.name}
                </h3>

                <p className="text-xs text-stone-400 leading-relaxed mb-5">
                  {lang === 'bn' ? pkg.descriptionBn || pkg.description : pkg.description}
                </p>

                {/* Tabular AC / Non-AC Rate Comparison */}
                <div className="space-y-2.5 py-4 border-y border-stone-800/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">
                      {lang === 'bn' ? 'নন-এসি রুম রেট' : 'Non-AC Room Rate'}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-stone-200 text-sm">
                      ৳{pkg.nonAcPrice.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300 font-medium">
                      {lang === 'bn' ? 'এসি রুম রেট' : 'AC Room Rate'}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-amber-400 text-base">
                      ৳{pkg.acPrice.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => onSelectPackage(pkg.id)}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-amber-500 text-stone-200 hover:text-stone-950 border border-stone-700 hover:border-amber-500 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{lang === 'bn' ? 'এই প্যাকেজ বেছে নিন' : 'Book This Package'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-stone-400">
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'bn' ? 'কোনো হিডেন চার্জ নেই' : 'No hidden service charges'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'bn' ? 'বিকাশ, নগদ ও ক্যাশে পেমেন্ট' : 'bKash, Nagad, Card & Cash accepted'}</span>
          </span>
        </div>
      </div>
    </section>
  );
};
