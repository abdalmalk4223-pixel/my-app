import React, { useState } from 'react';
import { KeyRound, Mail, User, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { StudentAccount } from '../types';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: StudentAccount) => void;
  mandatory?: boolean;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mandatory = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await fetch('/api/students/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const student: StudentAccount = {
        id: 'std_' + Date.now().toString(36),
        name: name.trim() || email.split('@')[0],
        email: email.trim().toLowerCase(),
        registrationDate: new Date().toLocaleDateString('ar-EG'),
        lastActive: 'الآن',
        operationsCount: 1,
      };

      localStorage.setItem('tlkhees_student', JSON.stringify(student));
      onSuccess(student);
      onClose();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#0a0c16]/85 backdrop-blur-2xl border border-white/[0.15] p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.6)] text-right relative">
        {!mandatory && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-700/80 to-amber-600/80 border border-white/20 flex items-center justify-center shadow-lg shadow-rose-950/30">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              تسجيل حساب الطالب
            </h3>
            <p className="text-xs text-slate-400">
              سجل مجاناً لحفظ تلخيصاتك ومتابعة تقدمك الدراسي
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-400/50 text-xs text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              اسم الطالب (أو اسم الشهرة):
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: عبدالملك"
                className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-3 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08] placeholder-slate-500"
              />
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              البريد الإلكتروني الجامعي أو الشخصي:
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-xl px-4 py-3 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08] placeholder-slate-500"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 hover:from-rose-600 hover:to-amber-500 text-white font-bold text-xs sm:text-sm border border-white/20 shadow-lg shadow-rose-950/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isLoading ? 'جاري التسجيل...' : 'دخول المنصة وحفظ الحساب'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
