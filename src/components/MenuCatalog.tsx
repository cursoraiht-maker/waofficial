import React from 'react';
import { POSTRELAND_MENU } from '../data/menu';
import { MenuItem } from '../types';
import { Cake, Sparkles, MessageCircle, Heart, Users, Tag } from 'lucide-react';

interface MenuCatalogProps {
  onSelectPrompt: (prompt: string) => void;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({ onSelectPrompt }) => {
  return (
    <div className="space-y-6">
      {/* Catalog Hero Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-[#3b1e16] to-[#24130d] text-rose-50 p-6 sm:p-8 rounded-3xl shadow-md border border-rose-950/40 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 text-rose-300 font-semibold text-xs tracking-wider uppercase">
            <Cake className="w-4 h-4 text-amber-300" />
            Carta de Repostería Artesanal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Menú &amp; Especialidades de Postreland
          </h2>
          <p className="text-xs sm:text-sm text-rose-100/90 mt-2 leading-relaxed">
            Nuestros postres son horneados diariamente con mantequilla de campo, chocolate belga auténtico y frutas frescas. El bot de WhatsApp tiene conocimiento de todas las porciones, ingredientes y disponibilidad.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10 text-9xl select-none pointer-events-none">
          🍰
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {POSTRELAND_MENU.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-stone-200/90 hover:border-rose-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header with emoji and category */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {item.emoji}
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-stone-900 block font-mono">
                    {item.price}
                  </span>
                  <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Title & highlight */}
              <h3 className="font-bold text-stone-900 text-sm leading-snug group-hover:text-rose-700 transition-colors">
                {item.name}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium my-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{item.highlight}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" /> {item.portions}
                </span>
                <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                  Disponible
                </span>
              </div>

              <button
                onClick={() => onSelectPrompt(item.suggestedPrompt)}
                className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-[#128c7e] hover:text-white text-stone-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Consultar este postre al bot</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
