import React from 'react';
import { Sparkles, Shield, KeyRound, LogOut, CheckCircle2 } from 'lucide-react';
import { SiteConfig, StudentAccount, InternetSpeed } from '../types';
import { InternetSpeedSelector } from './InternetSpeedSelector';

interface HeaderProps {
  config: SiteConfig;
  currentStudent: StudentAccount | null;
  currentSpeed: InternetSpeed;
  onSpeedChange: (speed: InternetSpeed) => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onLogoutStudent: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  currentStudent,
  currentSpeed,
  onSpeedChange,
  onOpenAuth,
  onOpenAdmin,
  onLogoutStudent,
}) => {
  return (
    <header className="w-full max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08]">
      {/* Right side in RTL: Logo & Branding */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-rose-950/30 transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/[0.12]">
          <Sparkles className="w-6 h-6 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-sm">
              {config.header.siteName}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 font-medium">
            {config.header.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Frosted Badge & Internet Speed Selector */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] backdrop-blur-md border border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-xs font-semibold text-amber-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span>{config.header.badgeText}</span>
        </div>

        {/* Internet Speed Selector option */}
        <InternetSpeedSelector
          currentSpeed={currentSpeed}
          onSpeedChange={onSpeedChange}
        />
      </div>

      {/* Left side in RTL: Action buttons */}
      <div className="flex items-center gap-2.5">
        {currentStudent ? (
          <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/[0.12] shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-amber-300 max-w-[110px] truncate">
              {currentStudent.name}
            </span>
            <button
              onClick={onLogoutStudent}
              title="تسجيل الخروج"
              className="text-slate-400 hover:text-rose-400 transition-colors p-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 hover:from-rose-600 hover:to-amber-500 backdrop-blur-md text-white border border-white/20 text-xs md:text-sm font-semibold shadow-lg shadow-rose-950/30 hover:shadow-amber-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </button>
        )}

        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-slate-300 hover:text-white border border-white/[0.12] hover:border-white/25 text-xs md:text-sm font-medium hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm"
        >
          <Shield className="w-3.5 h-3.5 text-amber-300" />
          <span>لوحة التحكم</span>
        </button>
      </div>
    </header>
  );
};
