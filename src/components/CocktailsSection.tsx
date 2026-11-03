import React, { useState } from 'react';
import { CocktailItem } from '../types';
import { Wine, MapPin, Sparkles, Flag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CocktailsSectionProps {
  cocktails: CocktailItem[];
  onReport: (targetType: 'cocktail', targetId: string, title: string) => void;
  onOrderOrReserve?: (item: CocktailItem) => void;
}

export const CocktailsSection: React.FC<CocktailsSectionProps> = ({
  cocktails,
  onReport,
  onOrderOrReserve,
}) => {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = [
    { key: 'All', label: language === 'si' ? 'සියල්ල' : 'All' },
    { key: 'Signature Cocktail', label: language === 'si' ? 'සිග්නේචර් කොක්ටේල්' : 'Signature Cocktail' },
    { key: 'Tapas & Bites', label: language === 'si' ? 'තපස් සහ බයිට්ස්' : 'Tapas & Bites' }
  ];

  const filtered = selectedCategory === 'All' 
    ? cocktails 
    : cocktails.filter(c => c.category === selectedCategory);

  return (
    <section className="my-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            {t.cocktailsTitle} <Wine className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.cocktailsSubtitle}
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-[#121218] border border-white/10 p-5 flex flex-col sm:flex-row gap-5 hover:border-amber-500/40 transition-all shadow-xl"
          >
            {/* Cocktail Thumbnail */}
            <div className="relative w-full sm:w-40 h-44 rounded-2xl overflow-hidden shrink-0 bg-neutral-900 border border-white/5">
              <img
                src={
                  !item.imageUrl || item.imageUrl.startsWith('/src/assets/')
                    ? item.category === 'Tapas & Bites'
                      ? 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80'
                      : 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80'
                    : item.imageUrl
                }
                alt={item.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  const fallback = item.category === 'Tapas & Bites'
                    ? 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80';
                  if ((e.target as HTMLImageElement).src !== fallback) {
                    (e.target as HTMLImageElement).src = fallback;
                  }
                }}
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-amber-300 font-semibold border border-amber-400/20">
                {language === 'si'
                  ? item.category === 'Tapas & Bites' ? 'තපස් / බයිට්ස්' : 'සිග්නේචර් කොක්ටේල්'
                  : item.category}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-white leading-snug">
                    {item.name}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-sm text-amber-300">
                      {t.lkrPrice} {item.priceLKR.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E63946]" />
                    <span>{item.venueName}</span>
                  </span>
                  <span>·</span>
                  <span>{item.city}</span>
                </div>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Ingredients Pills */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => onReport('cocktail', item.id, item.name)}
                  className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <Flag className="w-3 h-3" />
                  <span>{t.reportItem}</span>
                </button>

                <button
                  onClick={() => onOrderOrReserve && onOrderOrReserve(item)}
                  className="py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{t.venueSpecial}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
