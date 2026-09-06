import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SiteConfig } from '../types';

interface FooterProps {
  config: SiteConfig;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'about' | 'contact' | null>(null);

  return (
    <footer className="w-full max-w-5xl mx-auto px-4 pt-8 pb-12 border-t border-white/[0.08] text-center">
      {/* Navigation Policy Links */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 mb-6">
        <button
          type="button"
          onClick={() => setActiveModal('privacy')}
          className="hover:text-white transition-colors cursor-pointer"
        >
          🛡️ سياسة الخصوصية (Privacy Policy)
        </button>
        <span className="text-white/20">•</span>
        <button
          type="button"
          onClick={() => setActiveModal('terms')}
          className="hover:text-white transition-colors cursor-pointer"
        >
          📄 شروط الاستخدام (Terms of Service)
        </button>
        <span className="text-white/20">•</span>
        <button
          type="button"
          onClick={() => setActiveModal('about')}
          className="hover:text-white transition-colors cursor-pointer"
        >
          ℹ️ عن المنصة (About Us)
        </button>
        <span className="text-white/20">•</span>
        <button
          type="button"
          onClick={() => setActiveModal('contact')}
          className="hover:text-white transition-colors cursor-pointer"
        >
          ✉️ اتصل بنا (Contact)
        </button>
      </div>

      {/* Copyright Notice */}
      <div className="space-y-1 text-xs text-slate-400">
        <p className="font-medium">
          جميع الحقوق محفوظة © 2026 –{' '}
          <span className="text-amber-300 font-bold">{config.footer.ownerName}</span>
        </p>
        <p className="text-[11px] text-slate-500">
          منصة سحابية متخصصة في مساعدة الطلاب وتحليل وتلخيص المحاضرات والملخصات الأكاديمية بالذكاء الاصطناعي
        </p>
      </div>

      {/* Informational Policy Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e121e]/90 backdrop-blur-2xl border border-white/[0.15] p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-white">
                {activeModal === 'privacy' && '🛡️ سياسة الخصوصية وأمان البيانات'}
                {activeModal === 'terms' && '📄 شروط وأحكام الاستخدام'}
                {activeModal === 'about' && 'ℹ️ نبذة عن منصة تلخيص المهندس'}
                {activeModal === 'contact' && '✉️ تواصل مع إدارة المنصة'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
              {activeModal === 'privacy' && (
                <>
                  <p>
                    تولي منصة <strong>تلخيص المهندس</strong> أقصى درجات الأهمية لخصوصية بياناتك ومستنداتك الأكاديمية.
                  </p>
                  <p>
                    • يتم استخراج وتحليل الملفات عبر بيئة خادم آمنة ومعزولة (Server-Side Execution).
                  </p>
                  <p>
                    • لا يتم مشاركة أو بيع أي بيانات لأطراف خارجية إطلاقاً، وتظل ملكية المواد للطلاب وأعضاء الهيئة التعليمية.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    تم توفير هذه المنصة للمساعدة في تيسير الدراسة الجامعية والمدرسية وتسريع الاستيعاب والمراجعة.
                  </p>
                  <p>
                    • يُتاح للطلاب تلخيص المحاضرات والكتب واستخراج بنوك الأسئلة للاستخدام التعليمي الذاتي.
                  </p>
                  <p>
                    • يُحظر استخدام المنصة في أي أنشطة تنتهك حقوق الملكية الفكرية للمؤلفين أو تنتهك لوائح الاختبارات الأكاديمية.
                  </p>
                </>
              )}

              {activeModal === 'about' && (
                <>
                  <p>
                    <strong>تلخيص المهندس:</strong> منصة دراسية فائقة الذكاء، تهدف إلى إحداث نقلة نوعية في حياة الطلاب الجامعيين.
                  </p>
                  <p>
                    تجمع المنصة بين تقنيات الذكاء الاصطناعي التوليدي الأكثر تطوراً، وبنوك الأسئلة التفاعلية المعززة، وبطاقات الاستذكار السريع، لتمكين الطلاب من تحقيق أعلى الدرجات بأقل مجهود.
                  </p>
                </>
              )}

              {activeModal === 'contact' && (
                <>
                  <p>
                    نحن هنا دائماً لخدمتك وتطوير تجربتك الدراسية إلى الأفضل!
                  </p>
                  <p>
                    • البريد الإلكتروني المباشر للدعم الفني: <span className="text-amber-300">support@tlkhees-engineer.com</span>
                  </p>
                  <p>
                    • للإعلانات والرعايات التجارية والشراكات الجامعية: تواصل معنا عبر لوحة تحكم المنصة.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white text-xs font-bold border border-white/20 shadow-md shadow-rose-950/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
