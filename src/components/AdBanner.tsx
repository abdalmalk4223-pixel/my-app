import React from 'react';
import { Sparkles } from 'lucide-react';
import { SiteConfig } from '../types';

interface AdBannerProps {
  config: SiteConfig;
}

export const AdBanner: React.FC<AdBannerProps> = ({ config }) => {
  if (!config.ads.enabled) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-12">
      <div className="relative rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-6 text-center overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        {/* Badge */}
        <span className="absolute top-3 right-4 text-[10px] font-semibold px-2.5 py-0.5 rounded bg-white/[0.08] text-slate-400 border border-white/10 backdrop-blur-sm">
          إعلان
        </span>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <h4 className="text-xs sm:text-sm font-bold text-amber-300">
            مساحة إعلانية مخصصة (Google AdSense Ready)
          </h4>
        </div>

        <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
          هذه المساحة مهيأة تلقائياً لعرض إعلانات Google AdSense أو الرعايات الإعلانية للجامعات والشركات فور تفعيل الحساب.
        </p>

        {config.ads.adSenseId && config.ads.adSenseId !== 'ca-pub-XXXXXXXXXXXXXXXX' && (
          <div className="mt-3 text-[10px] text-slate-500">
            معرف الناشر النشط: {config.ads.adSenseId}
          </div>
        )}
      </div>
    </div>
  );
};
