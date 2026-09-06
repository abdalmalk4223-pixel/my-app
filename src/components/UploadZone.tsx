import React, { useRef, useState } from 'react';
import { UploadCloud, FolderOpen, Image as ImageIcon, FileText, X, Sparkles, Loader2, Smartphone, Globe } from 'lucide-react';
import { SiteConfig, SummaryLanguage } from '../types';

interface UploadZoneProps {
  config: SiteConfig;
  selectedFile: {
    file?: File;
    name: string;
    sizeFormatted: string;
    base64?: string;
    textContent?: string;
  } | null;
  onFileSelect: (fileData: {
    file?: File;
    name: string;
    sizeFormatted: string;
    base64?: string;
    textContent?: string;
  } | null) => void;
  onExtract: () => void;
  isLoading: boolean;
  language?: SummaryLanguage;
  onLanguageChange?: (lang: SummaryLanguage) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  config,
  selectedFile,
  onFileSelect,
  onExtract,
  isLoading,
  language = 'ar',
  onLanguageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' بايت';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(2) + ' كيلوبايت';
    const mb = kb / 1024;
    return mb.toFixed(2) + ' ميجابايت';
  };

  const processFile = (file: File) => {
    const sizeFormatted = formatFileSize(file.size);
    const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md');

    const reader = new FileReader();
    if (isText) {
      reader.onload = (e) => {
        onFileSelect({
          file,
          name: file.name,
          sizeFormatted,
          textContent: e.target?.result as string,
        });
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        onFileSelect({
          file,
          name: file.name,
          sizeFormatted,
          base64: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-10">
      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        className="hidden"
        accept="image/*"
        capture="environment"
      />

      {/* Main Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-300 backdrop-blur-xl ${
          isDragOver
            ? 'border-amber-400 bg-white/[0.08] shadow-[0_0_35px_rgba(251,191,36,0.25)]'
            : 'border-white/[0.14] bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
        }`}
      >
        {/* Cloud Upload Circle */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-rose-950/40 mb-5 transform transition-all duration-300 hover:scale-110 hover:border-amber-400/50">
          <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.4)]" />
        </div>

        {/* Text */}
        <h3 className="text-base sm:text-lg font-bold text-white mb-2">
          {config.upload.mainText}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
          {config.upload.subText}
        </p>

        {/* Two Interactive Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 hover:from-rose-600 hover:to-amber-500 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/20 shadow-lg shadow-rose-950/30 hover:shadow-amber-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-amber-200" />
            <span>تصفح مدير الملفات والمستندات</span>
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-slate-200 hover:text-white font-medium text-xs sm:text-sm border border-white/[0.12] hover:border-white/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm"
          >
            <ImageIcon className="w-4 h-4 text-amber-300" />
            <span>اختيار صورة أو لقطة</span>
          </button>
        </div>

        {/* Mobile Note */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-[11px] sm:text-xs text-slate-400">
          <Smartphone className="w-3.5 h-3.5 text-amber-300" />
          <span>على الهاتف: الزر يفتح مدير ملفات وتنزيلات هاتفك مباشرة دون فتح الكاميرا أو الصور إجبارياً.</span>
        </div>
      </div>

      {/* Selected File Card */}
      {selectedFile && (
        <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/[0.15] shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-rose-600/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="إلغاء الملف"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex-1 text-center truncate">
            <p className="text-xs sm:text-sm font-bold text-white truncate">
              {selectedFile.name}
            </p>
            <span className="text-[11px] text-slate-400">
              {selectedFile.sizeFormatted}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/[0.08] text-amber-300 border border-white/15">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* Language Picker */}
      {onLanguageChange && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 p-2.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.1] max-w-md mx-auto">
          <span className="text-xs text-slate-300 font-medium ml-1 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>لغة التلخيص والأسئلة:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onLanguageChange('ar')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                language === 'ar'
                  ? 'bg-gradient-to-r from-rose-700 to-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              🇸🇦 عربي
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-gradient-to-r from-rose-700 to-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('bilingual')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                language === 'bilingual'
                  ? 'bg-gradient-to-r from-rose-700 to-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              🌐 ثنائي (Bilingual)
            </button>
          </div>
        </div>
      )}

      {/* Primary Action Button (استخراج المحتوى وبدء التحليل) */}
      <div className="mt-6 flex flex-col items-center justify-center gap-2">
        <button
          type="button"
          onClick={onExtract}
          disabled={isLoading}
          className={`relative group px-8 sm:px-12 py-3.5 sm:py-4 rounded-full backdrop-blur-md text-white font-extrabold text-sm sm:text-base tracking-wide border shadow-[0_0_25px_rgba(251,191,36,0.25)] hover:shadow-[0_0_40px_rgba(251,191,36,0.45)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-3 overflow-hidden ${
            selectedFile
              ? 'bg-gradient-to-r from-rose-700/90 via-amber-600/90 to-amber-500/90 border-white/30'
              : 'bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 border-white/15 text-slate-300'
          }`}
        >
          {/* Shimmer light effect on hover */}
          <span className="absolute top-0 right-0 w-1/2 h-full bg-white/15 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none"></span>

          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-amber-200" />
              <span>جاري استخراج وتحليل المستند بالذكاء الاصطناعي...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              <span>{config.upload.extractBtnText}</span>
            </>
          )}
        </button>
        {!selectedFile && (
          <p className="text-[11px] text-slate-500">
            يرجى سحب ملف أو النقر على «تصفح مدير الملفات» أولاً
          </p>
        )}
      </div>
    </div>
  );
};
