import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  FileText,
  Palette,
  Users,
  Cpu,
  RefreshCw,
  ExternalLink,
  LogOut,
  Trash2,
  Eye,
  Check,
  Save,
  Lock,
  Upload,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertCircle,
  Download,
  Mail,
} from 'lucide-react';
import { SiteConfig, SummaryLog, StudentAccount } from '../types';

interface AdminDashboardProps {
  initialConfig: SiteConfig;
  onUpdateConfig: (newConfig: SiteConfig) => Promise<void>;
  onClose: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialConfig,
  onUpdateConfig,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'colors' | 'students' | 'summaries' | 'ai'>('ai');
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [summaries, setSummaries] = useState<SummaryLog[]>([]);
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', isError: false });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 2FA Admin OTP Email state
  const [adminEmail, setAdminEmail] = useState('aboode36955@gmail.com');
  const [emailMsg, setEmailMsg] = useState({ text: '', isError: false });
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Preview Modal for summary log
  const [previewLog, setPreviewLog] = useState<SummaryLog | null>(null);

  // Color extraction image input ref
  const colorImageInputRef = useRef<HTMLInputElement>(null);

  // Fetch summaries and students
  const fetchLogsAndStudents = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      if (data.success) {
        setSummaries(data.summaries || []);
        setStudents(data.students || []);
      }
      const settingsRes = await fetch('/api/admin/settings');
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.adminEmail) {
        setAdminEmail(settingsData.adminEmail);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchLogsAndStudents();
  }, []);

  // Save Config
  const handleSaveConfig = async () => {
    try {
      await onUpdateConfig(config);
      setSaveSuccessMsg('تم حفظ ونشر جميع التعديلات سحابياً بنجاح');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ text: '', isError: false });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'كلمة المرور الجديدة غير متطابقة مع التأكيد', isError: true });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordMsg({ text: 'يجب أن لا تقل كلمة المرور عن 4 خانات', isError: true });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ text: data.message || 'تم تحديث كلمة المرور بنجاح', isError: false });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ text: data.message || 'فشل التحديث', isError: true });
      }
    } catch (err) {
      setPasswordMsg({ text: 'حدث خطأ في الاتصال بالخادم', isError: true });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Change Admin 2FA Email
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg({ text: '', isError: false });

    if (!adminEmail || !adminEmail.includes('@')) {
      setEmailMsg({ text: 'يرجى إدخال بريد إلكتروني صحيح', isError: true });
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const res = await fetch('/api/admin/update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: adminEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailMsg({ text: data.message || 'تم تحديث بريد استلام رمز التحقق بنجاح', isError: false });
      } else {
        setEmailMsg({ text: data.message || 'فشل التحديث', isError: true });
      }
    } catch (err) {
      setEmailMsg({ text: 'حدث خطأ في الاتصال بالخادم', isError: true });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // Delete Summary Log
  const handleDeleteLog = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟')) return;
    try {
      const res = await fetch(`/api/admin/logs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSummaries((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Delete log error:', err);
    }
  };

  // Color extraction helper from uploaded image
  const handleExtractColorsFromImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;

        // Sample dominant colors
        const rgbToHex = (r: number, g: number, b: number) =>
          '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');

        const color1 = rgbToHex(data[0], data[1], data[2]);
        const color2 = rgbToHex(data[100], data[101], data[102]);
        const color3 = rgbToHex(data[200], data[201], data[202]);

        setConfig((prev) => ({
          ...prev,
          colors: {
            ...prev.colors,
            gold: color1 || prev.colors.gold,
            ember: color2 || prev.colors.ember,
            goldSoft: '#f5e4b3',
          },
        }));
        alert('تم استخراج لوحة ألوان متناسقة من الصورة وتطبيقها بنجاح!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#070913]/90 backdrop-blur-2xl text-slate-200 p-4 sm:p-6 select-text relative">
      {/* Top Admin Header Bar (Frosted Glass) */}
      <header className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-rose-950/30">
            <Settings className="w-6 h-6 text-amber-300 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">
              إدارة منصة تلخيص المهندس السحابية
            </h1>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>متصل ومحدث سحابياً</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-slate-200 hover:text-white text-xs sm:text-sm font-semibold border border-white/[0.12] hover:border-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-amber-300" />
            <span>عرض واجهة الموقع</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-md text-rose-200 hover:text-white text-xs sm:text-sm font-semibold border border-rose-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs (Frosted Glass) */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'content'
                ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-lg shadow-rose-950/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>نصوص ومحتوى الموقع</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'colors'
                ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-lg shadow-rose-950/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>الهوية والألوان</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('students');
              fetchLogsAndStudents();
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-lg shadow-rose-950/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>سجل حسابات الطلاب</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('summaries');
              fetchLogsAndStudents();
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'summaries'
                ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-lg shadow-rose-950/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>طلبات وسجلات التلخيص</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-lg shadow-rose-950/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>محرك الذكاء الاصطناعي</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="max-w-7xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto">
        {/* ================= TAB 1: TEXTS & SITE CONTENT ================= */}
        {activeTab === 'content' && (
          <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  تخصيص كافة نصوص ومحتوى الموقع
                </h2>
                <p className="text-xs text-slate-400">
                  أي تعديل تقوم بحفظه هنا سينعكس فوراً على صفحة الطالب
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 hover:from-rose-600 hover:to-amber-500 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer shadow-md shadow-rose-950/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>حفظ النصوص</span>
              </button>
            </div>

            {/* Section 1: Header texts */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                <span>ترويسة الموقع (HEADER)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">اسم الموقع الرئيسي</label>
                  <input
                    type="text"
                    value={config.header.siteName}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        header: { ...prev.header, siteName: e.target.value },
                      }))
                    }
                    className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">الوصف الفرعي بالترويسة</label>
                  <input
                    type="text"
                    value={config.header.subtitle}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        header: { ...prev.header, subtitle: e.target.value },
                      }))
                    }
                    className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">نص الشارة العلوية (Badge)</label>
                  <input
                    type="text"
                    value={config.header.badgeText}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        header: { ...prev.header, badgeText: e.target.value },
                      }))
                    }
                    className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Hero Section */}
            <div className="space-y-4 pt-4 border-t border-white/[0.08]">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                <span>القسم الترحيبي (HERO SECTION)</span>
              </h3>

              <div>
                <label className="block text-xs text-slate-300 mb-1.5">
                  العنوان الترحيبي الرئيسي / الآية الكريمة (يدعم أسطر متعددة)
                </label>
                <textarea
                  rows={2}
                  value={config.hero.verse}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, verse: e.target.value },
                    }))
                  }
                  className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1.5">النص الوصفي تحت العنوان</label>
                <textarea
                  rows={2}
                  value={config.hero.description}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, description: e.target.value },
                    }))
                  }
                  className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                />
              </div>
            </div>

            {/* Section 3: Upload Area Labels */}
            <div className="space-y-4 pt-4 border-t border-white/[0.08]">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                <span>منطقة رفع الملفات وتسميات الأزرار</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">النص الأساسي لمنطقة الرفع</label>
                  <input
                    type="text"
                    value={config.upload.mainText}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        upload: { ...prev.upload, mainText: e.target.value },
                      }))
                    }
                    className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">زر استخراج النص الرئيسي</label>
                  <input
                    type="text"
                    value={config.upload.extractBtnText}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        upload: { ...prev.upload, extractBtnText: e.target.value },
                      }))
                    }
                    className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1.5">
                  الوصف الفرعي لمنطقة الرفع (صيغ الملفات المدعومة)
                </label>
                <input
                  type="text"
                  value={config.upload.subText}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      upload: { ...prev.upload, subText: e.target.value },
                    }))
                  }
                  className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                />
              </div>
            </div>

            {/* Section 4: Footer and Login Policy */}
            <div className="space-y-4 pt-4 border-t border-white/[0.08]">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                <span>الفوتر وسياسة تسجيل الدخول</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    اسم صاحب الموقع في الفوتر (حقوق الملكية)
                  </label>
                  <input
                    type="text"
                    value={config.footer.ownerName}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, ownerName: e.target.value },
                      }))
                    }
                    className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="requireAuthCheck"
                    checked={config.footer.requireAuth}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, requireAuth: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded border-white/20 text-rose-600 focus:ring-amber-400 bg-white/10 cursor-pointer"
                  />
                  <label htmlFor="requireAuthCheck" className="text-xs text-slate-300 cursor-pointer">
                    <strong className="block text-white">إلزام الطلاب بتسجيل الدخول أولاً</strong>
                    عند التفعيل: لن يتمكن الطالب من استخراج الملفات وتحليلها إلا بعد تسجيل حسابه
                  </label>
                </div>
              </div>
            </div>

            {/* Section 5: Google AdSense */}
            <div className="space-y-4 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>إعلانات GOOGLE ADSENSE والربح من الموقع</span>
                </h3>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
                  <input
                    type="checkbox"
                    checked={config.ads.enabled}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        ads: { ...prev.ads, enabled: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded border-white/20 text-rose-600 focus:ring-amber-400 bg-white/10"
                  />
                  <span>تفعيل الإعلانات</span>
                </label>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1.5">
                  معرف الناشر في Google AdSense
                </label>
                <input
                  type="text"
                  value={config.ads.adSenseId}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: { ...prev.ads, adSenseId: e.target.value },
                    }))
                  }
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ستحصل على هذا المعرف فور قبول موقعك في برنامج Google AdSense (يبدأ بـ ca-pub-).
                </p>
              </div>
            </div>

            {/* Bottom Save Button */}
            <div className="pt-6 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white text-xs sm:text-sm font-extrabold border border-white/25 shadow-lg shadow-rose-950/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ ونشر جميع التعديلات سحابياً</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: IDENTITY & COLORS ================= */}
        {activeTab === 'colors' && (
          <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  تخصيص الألوان والمظهر البصري
                </h2>
                <p className="text-xs text-slate-400">
                  تطبيق ألوان المتغيرات الرسومية CSS Variables على واجهة الطالب مباشرة
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 hover:from-rose-600 hover:to-amber-500 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer shadow-md shadow-rose-950/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>حفظ الألوان</span>
              </button>
            </div>

            {/* Color Pickers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* Gold Primary */}
              <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  اللون الذهبي الرئيسي (--gold)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.colors.gold}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, gold: e.target.value },
                      }))
                    }
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={config.colors.gold}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, gold: e.target.value },
                      }))
                    }
                    className="flex-1 bg-white/[0.05] text-white text-xs rounded-xl px-3 py-2 border border-white/[0.12] focus:outline-none focus:border-amber-400/60"
                  />
                </div>
              </div>

              {/* Gold Soft */}
              <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  الذهبي الفاتح للنصوص (--gold-soft)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.colors.goldSoft}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, goldSoft: e.target.value },
                      }))
                    }
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={config.colors.goldSoft}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, goldSoft: e.target.value },
                      }))
                    }
                    className="flex-1 bg-white/[0.05] text-white text-xs rounded-xl px-3 py-2 border border-white/[0.12] focus:outline-none focus:border-amber-400/60"
                  />
                </div>
              </div>

              {/* Ember Burgundy */}
              <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  اللون العنابي للأزرار والمحادثة (--ember)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.colors.ember}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, ember: e.target.value },
                      }))
                    }
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={config.colors.ember}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, ember: e.target.value },
                      }))
                    }
                    className="flex-1 bg-white/[0.05] text-white text-xs rounded-xl px-3 py-2 border border-white/[0.12] focus:outline-none focus:border-amber-400/60"
                  />
                </div>
              </div>

              {/* Card Background */}
              <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  لون خلفية البطاقات والحاويات (--card)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.colors.card}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, card: e.target.value },
                      }))
                    }
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={config.colors.card}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, card: e.target.value },
                      }))
                    }
                    className="flex-1 bg-white/[0.05] text-white text-xs rounded-xl px-3 py-2 border border-white/[0.12] focus:outline-none focus:border-amber-400/60"
                  />
                </div>
              </div>

              {/* Page Background (Ink) */}
              <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  لون خلفية الصفحة بالكامل (--ink)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.colors.ink}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, ink: e.target.value },
                      }))
                    }
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={config.colors.ink}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, ink: e.target.value },
                      }))
                    }
                    className="flex-1 bg-white/[0.05] text-white text-xs rounded-xl px-3 py-2 border border-white/[0.12] focus:outline-none focus:border-amber-400/60"
                  />
                </div>
              </div>
            </div>

            {/* Auto-Extract from image section */}
            <div className="pt-6 border-t border-white/[0.08] text-center space-y-4">
              <input
                type="file"
                ref={colorImageInputRef}
                onChange={handleExtractColorsFromImage}
                accept="image/*"
                className="hidden"
              />

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-amber-300" />
                  <span>استخراج الألوان تلقائياً من صورة</span>
                </h3>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  ارفع أي صورة (شعار، تصميم، أو خلفية تعجبك) وسيتم استخراج وتوليد لوحة ألوان متناسقة للحقول أعلاه تلقائياً
                </p>
              </div>

              <button
                type="button"
                onClick={() => colorImageInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-white text-xs font-bold border border-white/[0.12] hover:border-white/25 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <Upload className="w-4 h-4 text-amber-300" />
                <span>اختر صورة لتحليل ألوانها</span>
              </button>
            </div>

            {/* Bottom Save Button */}
            <div className="pt-6 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white text-xs sm:text-sm font-extrabold border border-white/25 shadow-lg shadow-rose-950/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ الألوان في قاعدة البيانات</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: STUDENT ACCOUNTS LOG ================= */}
        {activeTab === 'students' && (
          <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  سجل حسابات الطلاب في المنصة
                </h2>
                <p className="text-xs text-slate-400">
                  يتم تسجيل كل طالب يقوم بإنشاء حساب في واجهة المنصة
                </p>
              </div>

              <button
                type="button"
                onClick={fetchLogsAndStudents}
                disabled={isLoadingData}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/[0.12] hover:border-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </button>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/[0.05] backdrop-blur-md text-slate-300 border-b border-white/[0.08]">
                  <tr>
                    <th className="p-3.5">اسم الطالب</th>
                    <th className="p-3.5">البريد الإلكتروني</th>
                    <th className="p-3.5">تاريخ التسجيل</th>
                    <th className="p-3.5">آخر تواجد</th>
                    <th className="p-3.5 text-center">العمليات المنجزة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="p-3.5 font-bold text-white">{student.name}</td>
                      <td className="p-3.5 text-slate-300">{student.email}</td>
                      <td className="p-3.5 text-slate-400">{student.registrationDate}</td>
                      <td className="p-3.5 text-slate-400">{student.lastActive}</td>
                      <td className="p-3.5 text-center font-bold text-emerald-400">
                        {student.operationsCount}
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        لا توجد حسابات مسجلة بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SUMMARIES LOGS ================= */}
        {activeTab === 'summaries' && (
          <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  أحدث المحاضرات والملخصات المنفذة
                </h2>
                <p className="text-xs text-slate-400">
                  متابعة سجلات الطلاب والملخصات المنشأة
                </p>
              </div>

              <button
                type="button"
                onClick={fetchLogsAndStudents}
                disabled={isLoadingData}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/[0.12] hover:border-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </button>
            </div>

            {/* Summaries Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/[0.05] backdrop-blur-md text-slate-300 border-b border-white/[0.08]">
                  <tr>
                    <th className="p-3.5">الطالب</th>
                    <th className="p-3.5">المستند</th>
                    <th className="p-3.5">التاريخ</th>
                    <th className="p-3.5">مقتطف من المحتوى</th>
                    <th className="p-3.5 text-center">معاينة</th>
                    <th className="p-3.5 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-200">
                  {summaries.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">
                        {log.studentName}
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-[200px] truncate">
                        {log.documentName}
                      </td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">{log.date}</td>
                      <td className="p-3.5 text-slate-400 max-w-[260px] truncate">
                        {log.excerpt}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setPreviewLog(log)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-amber-300 border border-white/[0.12] hover:border-white/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض</span>
                        </button>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {summaries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        لا توجد سجلات تلخيص منشأة بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: AI ENGINE & SECURITY ================= */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {/* Left Card: Change Admin Password */}
            <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-4 mb-5 border-b border-white/[0.08]">
                  <Lock className="w-5 h-5 text-amber-300" />
                  <h3 className="text-base font-bold text-white">
                    تغيير كلمة مرور دخول لوحة التحكم
                  </h3>
                </div>

                <p className="text-xs text-slate-400 mb-5">
                  غيّر رمز الدخول للوحة التحكم من هنا مباشرة.
                </p>

                {passwordMsg.text && (
                  <div
                    className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 backdrop-blur-md ${
                      passwordMsg.isError
                        ? 'bg-rose-500/20 border border-rose-400/50 text-rose-200'
                        : 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-200'
                    }`}
                  >
                    {passwordMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1.5">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1.5">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1.5">تأكيد كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 hover:from-rose-600 hover:to-amber-500 text-white font-bold text-xs sm:text-sm border border-white/20 shadow-md shadow-rose-950/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {isUpdatingPassword ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Card: Secure AI Engine Info */}
            <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-4 mb-5 border-b border-white/[0.08]">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <h3 className="text-base font-bold text-white">
                    محرك الذكاء الاصطناعي الآمن
                  </h3>
                </div>

                <div className="space-y-4 mb-6 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08]">
                    <span className="text-slate-400">حالة الخادم الوسيط:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>يعمل بأمان (Server-Side Proxy)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08]">
                    <span className="text-slate-400">الموديل المعتمد:</span>
                    <span className="text-amber-300 font-mono font-bold">gemini-3.8-flash</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08]">
                    <span className="text-slate-400">حماية المفتاح:</span>
                    <span className="text-white font-medium">مخفي تماماً عن المتصفح في الخادم</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-xs text-slate-300 leading-relaxed">
                  تم نقل ومعالجة طلبات الذكاء الاصطناعي بالكامل إلى جهة الخادم (Backend)، مما يحمي مفتاح الـ API الخاص بك من الظهور في أدوات التفتيش في المتصفح أو السرقة من أي زائر.
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.08] mt-6">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/ai/status');
                      const d = await res.json();
                      alert(`حالة المحرك: ${d.status}\nالموديل: ${d.model}\nوضع الأمان: ${d.proxyMode}\nتفاصيل: ${d.details}`);
                    } catch (e) {
                      alert('تعذر الوصول لحالة المحرك');
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-amber-300 text-xs font-bold border border-white/[0.12] hover:border-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Cpu className="w-4 h-4" />
                  <span>فحص حالة المحرك والاتصال بالخادم</span>
                </button>
              </div>
            </div>

            {/* Card 3: 2FA OTP Email Setting */}
            <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/[0.08]">
                  <Mail className="w-5 h-5 text-amber-300" />
                  <h3 className="text-base font-bold text-white">
                    البريد المعتمد لاستقبال رمز التحقق (OTP)
                  </h3>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  يتم إرسال رمز التحقق المكون من 6 أرقام إلى هذا البريد في كل مرة يتم فيها تسجيل الدخول بعد إدخال كلمة المرور.
                </p>

                {emailMsg.text && (
                  <div
                    className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 backdrop-blur-md ${
                      emailMsg.isError
                        ? 'bg-rose-500/20 border border-rose-400/50 text-rose-200'
                        : 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-200'
                    }`}
                  >
                    {emailMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                    <span>{emailMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1.5">البريد الإلكتروني المعتمد:</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08] dir-ltr text-right"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingEmail}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600/90 to-amber-600/90 hover:from-emerald-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm border border-white/20 shadow-md shadow-emerald-950/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {isUpdatingEmail ? 'جاري الحفظ...' : 'حفظ وتحديث بريد الـ OTP'}
                  </button>
                </form>
              </div>
            </div>

            {/* Card 4: Download New Admin File for Hosting */}
            <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/[0.08]">
                  <Download className="w-5 h-5 text-amber-300" />
                  <h3 className="text-base font-bold text-white">
                    تنزيل ملف صفحة الإدارة (admin.html)
                  </h3>
                </div>

                <div className="space-y-3 mb-5 text-xs text-slate-300 leading-relaxed">
                  <p>
                    هذا هو ملف صفحة الـ Admin الجديد والمطور بنظام الحماية المزدوج (كلمة المرور + رمز OTP عبر البريد الإلكتروني).
                  </p>
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-200">
                    💡 <b>تعليمات الرفع على الاستضافة:</b> قم بتنزيل هذا الملف ووضعه مكان الملف القديم في الاستضافة، مع إعادة تسميته إلى <code className="text-white font-mono bg-black/40 px-1.5 py-0.5 rounded">admin</code> قبل الرفع حتى يعمل بشكل صحيح ومباشر كما طلبت.
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08]">
                <a
                  href="/api/admin/download-admin-file"
                  download="admin.html"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold border border-white/20 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف admin.html الآن</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Summary Preview Modal */}
      {previewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[85vh] rounded-3xl bg-[#090b14]/90 backdrop-blur-2xl border border-white/[0.15] p-6 overflow-y-auto text-right shadow-[0_16px_50px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white">
                  {previewLog.documentName}
                </h3>
                <span className="text-xs text-slate-400">
                  الطالب: {previewLog.studentName} | التاريخ: {previewLog.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-200">
              <h4 className="text-sm font-bold text-amber-300">التلخيص الشامل:</h4>
              <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] whitespace-pre-wrap leading-relaxed">
                {previewLog.summary}
              </div>

              {previewLog.questions && previewLog.questions.length > 0 && (
                <>
                  <h4 className="text-sm font-bold text-amber-300">بنك الأسئلة المولد:</h4>
                  <div className="space-y-3">
                    {previewLog.questions.map((q, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08]">
                        <p className="font-bold text-white mb-2">{idx + 1}. {q.question}</p>
                        <ul className="list-disc pr-5 space-y-1 text-xs text-slate-300">
                          {q.options.map((opt, oIdx) => (
                            <li key={oIdx} className={oIdx === q.correctAnswerIndex ? 'text-emerald-400 font-bold' : ''}>
                              {opt} {oIdx === q.correctAnswerIndex && '✓ (الصحيحة)'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewLog(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 hover:from-rose-600 hover:to-amber-500 text-white text-xs font-bold border border-white/20 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
