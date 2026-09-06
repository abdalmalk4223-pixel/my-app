import React, { useState } from 'react';
import { Shield, Lock, X, ArrowLeft } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess(data.token || ('admin_session_' + Date.now()));
        onClose();
      } else {
        setError(data.message || 'كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('تعذر الاتصال بالسيرفر، يرجى التأكد من تشغيل الخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#0a0c16]/90 backdrop-blur-2xl border border-white/[0.15] p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.6)] text-right relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-700/80 to-amber-600/80 border border-white/20 flex items-center justify-center shadow-lg shadow-rose-950/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">دخول الإدارة</h3>
            <p className="text-xs text-slate-400">
              أدخل كلمة المرور للوصول إلى لوحة التحكم
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-400/50 text-xs text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              كلمة مرور لوحة التحكم:
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-3 pl-10 border border-white/10 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 hover:from-rose-600 hover:to-amber-500 text-white font-bold text-xs sm:text-sm border border-white/20 shadow-md shadow-rose-950/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>جاري التحقق...</span>
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};