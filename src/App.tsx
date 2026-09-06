import React, { useState, useEffect } from 'react';
import { SiteConfig, StudentAccount, SummaryLanguage, Question, Flashcard, InternetSpeed } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { UploadZone } from './components/UploadZone';
import { ResultsView } from './components/ResultsView';
import { AdBanner } from './components/AdBanner';
import { Footer } from './components/Footer';
import { StudentAuthModal } from './components/StudentAuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';

// Default initial config matching screenshots
const initialDefaultConfig: SiteConfig = {
  header: {
    siteName: 'تلخيص المهندس',
    subtitle: 'المساعد الدراسي الذكي',
    badgeText: 'الملف عليك والتلخيص علينا',
  },
  hero: {
    verse: '﴿ يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ ﴾',
    description: 'ارفع مستنداتك أو صور المحاضرات والملخصات لتحليلها فوراً، وتلخيصها، واستخراج بنك أسئلة نموذجي دون قيود',
  },
  upload: {
    mainText: 'اسحب الملف أو الصورة إلى هنا، أو انقر للاختيار',
    subText: 'يدعم جميع أنواع الملفات: PDF و PowerPoint (PPTX) و Word (DOCX) والصور (PNG, JPG) عبر OCR',
    extractBtnText: 'استخراج المحتوى وبدء التحليل',
    summaryBtnText: 'إعداد التلخيص الذكي',
    questionBtnText: 'توليد بنك الأسئلة',
  },
  footer: {
    ownerName: 'المهندس عبدالملك',
    requireAuth: false,
  },
  ads: {
    enabled: true,
    adSenseId: 'ca-pub-XXXXXXXXXXXXXXXX',
  },
  colors: {
    gold: '#c89b3c',
    goldSoft: '#f3df9b',
    ember: '#6e1a24',
    ink: '#0e0d0b',
    card: '#161411',
  },
};

export default function App() {
  const [config, setConfig] = useState<SiteConfig>(initialDefaultConfig);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isStudentAuthOpen, setIsStudentAuthOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<StudentAccount | null>(null);

  // Selected file state - begins empty until user selects or drags their file
  const [selectedFile, setSelectedFile] = useState<{
    file?: File;
    name: string;
    sizeFormatted: string;
    base64?: string;
    textContent?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<SummaryLanguage>('ar');
  const [internetSpeed, setInternetSpeed] = useState<InternetSpeed>('stable');

  // Results state - hidden until user uploads and extracts their specific document
  const [results, setResults] = useState<{
    summary: string;
    questions: Question[];
    flashcards: Flashcard[];
    documentName: string;
  } | null>(null);

  // Restore cached file and results on mount (protects against browser reloads)
  useEffect(() => {
    try {
      const cachedFile = sessionStorage.getItem('tlkhees_active_file');
      if (cachedFile) {
        setSelectedFile(JSON.parse(cachedFile));
      }
      const cachedResults = sessionStorage.getItem('tlkhees_active_results');
      if (cachedResults) {
        setResults(JSON.parse(cachedResults));
      }
    } catch (e) {
      console.warn('Notice loading cached session state:', e);
    }
  }, []);

  // Fetch initial config from server
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
          applyColors(data.config.colors);
        }
      })
      .catch((err) => console.error('Error loading config:', err));

    // Load logged in student if any
    const savedStudent = localStorage.getItem('tlkhees_student');
    if (savedStudent) {
      try {
        setCurrentStudent(JSON.parse(savedStudent));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Apply colors to root CSS variables
  const applyColors = (colors: SiteConfig['colors']) => {
    if (!colors) return;
    const root = document.documentElement;
    root.style.setProperty('--gold', colors.gold);
    root.style.setProperty('--gold-soft', colors.goldSoft);
    root.style.setProperty('--ember', colors.ember);
    root.style.setProperty('--ink', colors.ink);
    root.style.setProperty('--card', colors.card);
  };

  // Update Config from Admin Dashboard
  const handleUpdateConfig = async (newConfig: SiteConfig) => {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: newConfig }),
    });
    const data = await res.json();
    if (data.success) {
      setConfig(data.config);
      applyColors(data.config.colors);
    }
  };

  // Handle File Selection with Session Persistence
  const handleFileSelect = (fileData: {
    file?: File;
    name: string;
    sizeFormatted: string;
    base64?: string;
    textContent?: string;
  } | null) => {
    setSelectedFile(fileData);
    if (!fileData) {
      setResults(null);
      try {
        sessionStorage.removeItem('tlkhees_active_file');
        sessionStorage.removeItem('tlkhees_active_results');
      } catch (e) {}
    } else {
      try {
        // Cache file info safely in session
        const toCache = {
          name: fileData.name,
          sizeFormatted: fileData.sizeFormatted,
          textContent: fileData.textContent,
          base64: fileData.base64 && fileData.base64.length < 3000000 ? fileData.base64 : undefined,
        };
        sessionStorage.setItem('tlkhees_active_file', JSON.stringify(toCache));
      } catch (e) {}
    }
  };

  // Process Document
  const handleExtractDocument = async () => {
    if (!selectedFile) {
      alert('يرجى اختيار ملف أو صورة أولاً للبدء بالتحليل');
      return;
    }

    // Check mandatory login policy
    if (config.footer.requireAuth && !currentStudent) {
      setIsStudentAuthOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/process-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.file?.type || (selectedFile.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
          fileBase64: selectedFile.base64,
          textContent: selectedFile.textContent,
          language: language,
          studentEmail: currentStudent?.email,
          studentName: currentStudent?.name,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const resData = {
          summary: data.data.summary,
          questions: data.data.questions || [],
          flashcards: data.data.flashcards || [],
          documentName: selectedFile.name,
        };
        setResults(resData);
        try {
          sessionStorage.setItem('tlkhees_active_results', JSON.stringify(resData));
        } catch (e) {}

        setTimeout(() => {
          document.getElementById('results-view-container')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);

        // Update student operations count locally
        if (currentStudent) {
          const updated = {
            ...currentStudent,
            operationsCount: (currentStudent.operationsCount || 0) + 1,
          };
          setCurrentStudent(updated);
          localStorage.setItem('tlkhees_student', JSON.stringify(updated));
        }
      } else {
        alert(data.message || 'حدث خطأ أثناء معالجة المستند');
      }
    } catch (err) {
      console.error('Extraction error:', err);
      alert('فشل الاتصال بالخادم الذكي');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to different language and re-process or adjust
  const handleLanguageChange = (newLang: SummaryLanguage) => {
    setLanguage(newLang);
    if (selectedFile && results) {
      // automatically re-extract in the chosen language if already extracted
      setIsLoading(true);
      fetch('/api/ai/process-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.file?.type || (selectedFile.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
          fileBase64: selectedFile.base64,
          textContent: selectedFile.textContent,
          language: newLang,
          studentEmail: currentStudent?.email,
          studentName: currentStudent?.name,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const resData = {
              summary: data.data.summary,
              questions: data.data.questions || [],
              flashcards: data.data.flashcards || [],
              documentName: selectedFile.name,
            };
            setResults(resData);
            try {
              sessionStorage.setItem('tlkhees_active_results', JSON.stringify(resData));
            } catch (e) {}
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  // Open Admin
  const handleOpenAdmin = () => {
    const token = sessionStorage.getItem('admin_session');
    if (token) {
      setIsAdminView(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = (token: string) => {
    sessionStorage.setItem('admin_session', token);
    setIsAdminView(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('admin_session');
    setIsAdminView(false);
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('tlkhees_student');
    setCurrentStudent(null);
  };

  // If Admin View is active, render Admin Dashboard
  if (isAdminView) {
    return (
      <AdminDashboard
        initialConfig={config}
        onUpdateConfig={handleUpdateConfig}
        onClose={() => setIsAdminView(false)}
        onLogout={handleAdminLogout}
      />
    );
  }

  // Student Frontend View
  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-[#f1f5f9] selection:bg-amber-400/30 selection:text-amber-200 relative overflow-x-hidden">
      {/* Frosted Glass ambient luminous mesh light spots */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-rose-600/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 rounded-full bg-indigo-600/15 blur-[130px]" />
        <div className="absolute -bottom-32 right-1/3 w-96 h-96 rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          config={config}
          currentStudent={currentStudent}
          currentSpeed={internetSpeed}
          onSpeedChange={setInternetSpeed}
          onOpenAuth={() => setIsStudentAuthOpen(true)}
          onOpenAdmin={handleOpenAdmin}
          onLogoutStudent={handleStudentLogout}
        />

        {/* Hero Section */}
        <HeroSection config={config} />

        {/* Upload Zone */}
        <UploadZone
          config={config}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onExtract={handleExtractDocument}
          isLoading={isLoading}
          language={language}
          onLanguageChange={handleLanguageChange}
        />

        {/* Results View (Summary, Quiz, Flashcards, Chat) */}
        {results && (
          <ResultsView
            summary={results.summary}
            questions={results.questions}
            flashcards={results.flashcards}
            language={language}
            onLanguageChange={handleLanguageChange}
            documentName={results.documentName}
          />
        )}

        {/* Google AdSense Ready Banner */}
        <AdBanner config={config} />

        {/* Footer with links and guide download */}
        <Footer config={config} />
      </div>

      {/* Student Auth Modal */}
      <StudentAuthModal
        isOpen={isStudentAuthOpen}
        onClose={() => setIsStudentAuthOpen(false)}
        onSuccess={(student) => setCurrentStudent(student)}
        mandatory={config.footer.requireAuth && !currentStudent}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
