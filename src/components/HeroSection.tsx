import React from 'react';
import { SiteConfig } from '../types';

interface HeroSectionProps {
  config: SiteConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config }) => {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 pt-10 pb-8 text-center">
      {/* Quranic Verse Calligraphy */}
      <div className="relative inline-block mb-5">
        <h2 className="font-quran text-2xl sm:text-3xl md:text-4xl text-amber-200 font-normal leading-relaxed tracking-wide drop-shadow-[0_2px_16px_rgba(251,191,36,0.35)] select-none">
          {config.hero.verse}
        </h2>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal">
        {config.hero.description}
      </p>
    </section>
  );
};
