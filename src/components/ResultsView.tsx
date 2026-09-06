import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  HelpCircle,
  Layers,
  MessageSquare,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Download,
  Send,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Sparkles,
  Bot,
  User,
  Play,
  Pause,
  Sliders,
  Mic,
} from 'lucide-react';
import { Question, Flashcard, ChatMessage, SummaryLanguage } from '../types';

interface ResultsViewProps {
  summary: string;
  questions: Question[];
  flashcards: Flashcard[];
  language: SummaryLanguage;
  onLanguageChange: (lang: SummaryLanguage) => void;
  documentName: string;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  summary,
  questions,
  flashcards,
  language,
  onLanguageChange,
  documentName,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'questions' | 'flashcards' | 'chat'>('summary');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      sender: 'ai',
      text: 'أهلاً بك يا زميلي! تم تجهيز محتوى المحاضرة بنجاح. تفضل بطرح أي سؤال أو استفسار حول المادة وسأجيبك فوراً.',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  // Copy Summary
  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Natural AI Voice State & Controls
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.95);
  const [activeVoiceName, setActiveVoiceName] = useState<string>('ذكاء اصطناعي طبيعي');
  const speechQueueRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const isSpeakingRef = useRef<boolean>(false);

  // Stop speech on unmount or tab switch
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Find most natural human-like voice available in the client system
  const getBestNaturalVoice = (lang: string) => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const isEn = lang === 'en';

    if (isEn) {
      // Prioritize natural / neural English voices
      return (
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Jenny') || v.name.includes('Guy'))) ||
        voices.find((v) => v.lang.startsWith('en-US')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        null
      );
    } else {
      // Prioritize natural Arabic voices (Salma, Shakir, Google Arabic, Laila, Maged, Tarik)
      return (
        voices.find((v) => v.lang.startsWith('ar') && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural') || v.name.includes('Salma') || v.name.includes('Shakir') || v.name.includes('Google') || v.name.includes('Laila') || v.name.includes('Maged') || v.name.includes('Tarik') || v.name.includes('Naayf'))) ||
        voices.find((v) => v.lang.startsWith('ar')) ||
        null
      );
    }
  };

  // Clean Markdown & format text for fluid phonetic reading
  const prepareTextForNaturalSpeech = (rawText: string) => {
    return rawText
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[-*•]\s+/g, ' ')
      .replace(/[_~|—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Play natural speech sentence by sentence
  const playNextSentenceChunk = () => {
    if (!isSpeakingRef.current) return;
    if (currentChunkIndexRef.current >= speechQueueRef.current.length) {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    const chunk = speechQueueRef.current[currentChunkIndexRef.current];
    if (!chunk || !chunk.trim()) {
      currentChunkIndexRef.current++;
      playNextSentenceChunk();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk.trim());
    utterance.lang = language === 'en' ? 'en-US' : 'ar-SA';
    utterance.rate = speechSpeed;
    utterance.pitch = 1.0;

    const voice = getBestNaturalVoice(language);
    if (voice) {
      utterance.voice = voice;
      setActiveVoiceName(voice.name.replace(/Microsoft|Online|Natural|Google/g, '').trim() || 'صوت ذكي نقي');
    }

    utterance.onend = () => {
      currentChunkIndexRef.current++;
      // Brief natural pause between sentences
      setTimeout(() => {
        playNextSentenceChunk();
      }, 120);
    };

    utterance.onerror = () => {
      currentChunkIndexRef.current++;
      playNextSentenceChunk();
    };

    window.speechSynthesis.speak(utterance);
  };

  // High-fidelity Text-To-Speech Toggle
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('متصفحك لا يدعم قراءة النصوص صوتياً.');
      return;
    }

    if (isSpeaking) {
      isSpeakingRef.current = false;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const cleaned = prepareTextForNaturalSpeech(summary);
      // Split into natural human sentence clauses
      const sentences = cleaned
        .split(/(?<=[.،؟!؛\n])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 2);

      speechQueueRef.current = sentences.length > 0 ? sentences : [cleaned];
      currentChunkIndexRef.current = 0;
      isSpeakingRef.current = true;
      setIsSpeaking(true);

      const v = getBestNaturalVoice(language);
      if (v) {
        setActiveVoiceName(v.name.replace(/Microsoft|Online|Natural|Google/g, '').trim() || 'صوت طبيعي فائق النقاء');
      }

      playNextSentenceChunk();
    }
  };

  // Download Summary Text
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `ملخص_${documentName.replace(/\.[^/.]+$/, '')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle Question Answer Select
  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setShowExplanation((prev) => ({ ...prev, [questionId]: true }));
  };

  // Reset Quiz
  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowExplanation({});
  };

  // Send Chat Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || isChatSending) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now().toString(36),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          documentSummary: summary,
          history: chatMessages.slice(-6),
        }),
      });
      const data = await res.json();
      const replyText = data?.reply || (trimmed.match(/[a-zA-Z]{3,}/) 
        ? "I have noted your question! Based on the analyzed document, let's explore this concept directly."
        : "أهلاً بك! تم استلام استفسارك، وسأقوم بتوضيح هذا المفهوم في ضوء المحاضرة المشروحة خطوة بخطوة.");
      
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now().toString(36),
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.warn('Chat request notice:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now().toString(36),
          sender: 'ai',
          text: 'أهلاً بك! يمكنك إعادة طرح سؤالك وسأجيبك فوراً بتفصيل كامل.',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Helper function to render bold tags and inline accents
  const renderFormattedInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong
            key={i}
            className="font-bold text-amber-200 bg-amber-400/[0.12] px-1.5 py-0.5 rounded-md border border-amber-400/25 mx-0.5 inline-block text-[0.95em]"
          >
            {inner}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div id="results-view-container" className="w-full max-w-4xl mx-auto px-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Language Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] shadow-lg mb-6">
        <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>لغة التلخيص وتوليد الأسئلة:</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLanguageChange('bilingual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
              language === 'bilingual'
                ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-md shadow-rose-950/30'
                : 'bg-white/[0.05] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            🌐 ثنائي اللغة (Bilingual)
          </button>

          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-md shadow-rose-950/30'
                : 'bg-white/[0.05] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            GB English (شامل)
          </button>

          <button
            type="button"
            onClick={() => onLanguageChange('ar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
              language === 'ar'
                ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-md shadow-rose-950/30'
                : 'bg-white/[0.05] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            SA عربي (مع مصطلحات)
          </button>
        </div>
      </div>

      {/* Main Results Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-lg shadow-rose-950/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>التلخيص الشامل</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-lg shadow-rose-950/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-300" />
          <span>بنك الأسئلة التفاعلي</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/[0.1] text-amber-300 text-[10px] border border-white/10">
            {questions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'flashcards'
              ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-lg shadow-rose-950/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-300" />
          <span>بطاقات الاستذكار</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/[0.1] text-amber-300 text-[10px] border border-white/10">
            {flashcards.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/25 shadow-lg shadow-rose-950/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-300" />
          <span>المحادثة الذكية</span>
        </button>
      </div>

      {/* Tab 1: Comprehensive Summary */}
      {activeTab === 'summary' && (
        <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          {/* Top summary actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
              <h3 className="text-base font-bold text-white">
                الملخص الأكاديمي المكتمل
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-slate-200 hover:text-white text-xs font-medium border border-white/[0.12] hover:border-white/25 shadow-sm transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ التلخيص'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleSpeech}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-slate-200 hover:text-white text-xs font-medium border border-white/[0.12] hover:border-white/25 shadow-sm transition-all cursor-pointer"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300" />}
                <span>{isSpeaking ? 'إيقاف الصوت' : 'استماع صوتي'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-slate-200 hover:text-white text-xs font-medium border border-white/[0.12] hover:border-white/25 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>تحميل كملف</span>
              </button>
            </div>
          </div>

          {/* Natural AI Audio Player Bar */}
          <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-lg border border-white/[0.1] flex flex-wrap items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isSpeaking
                    ? 'bg-rose-600/90 text-white hover:bg-rose-500 shadow-rose-950/40 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:from-amber-400 hover:to-rose-500 shadow-amber-950/40 hover:scale-105 active:scale-95'
                }`}
                title={isSpeaking ? 'إيقاف القراءة الصوتية' : 'تشغيل القراءة الصوتية بالذكاء الاصطناعي'}
              >
                {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white mr-0.5" />}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-amber-300" />
                    <span>قارئ الذكاء الاصطناعي الطبيعي (Natural HD)</span>
                  </span>
                  {isSpeaking && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      قراءة صوتية نشطة
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>الصوت المعتمد:</span>
                  <span className="text-amber-200 font-medium">{activeVoiceName}</span>
                </div>
              </div>
            </div>

            {/* Audio Waveform Equalizer when speaking */}
            {isSpeaking && (
              <div className="flex items-end gap-1 h-5 px-2">
                <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms] h-4"></span>
                <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:150ms] h-5"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms] h-3"></span>
                <span className="w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:200ms] h-5"></span>
                <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:400ms] h-3"></span>
              </div>
            )}

            {/* Speed selection */}
            <div className="flex items-center gap-1.5 text-xs bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
              <span className="text-[10px] text-slate-400 px-1.5">السرعة:</span>
              {[
                { label: '0.85x', val: 0.85 },
                { label: '1.0x', val: 0.95 },
                { label: '1.15x', val: 1.15 },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => {
                    setSpeechSpeed(s.val);
                    if (isSpeaking) {
                      handleToggleSpeech(); // restart with new speed
                    }
                  }}
                  className={`px-2 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                    speechSpeed === s.val
                      ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formatted Markdown Content */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
            {summary.split('\n').map((line, idx) => {
              const trimmed = line.trim();
              if (trimmed.startsWith('### ')) {
                return (
                  <h3
                    key={idx}
                    className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-white pt-4 pb-1.5 border-b border-white/[0.1]"
                  >
                    {renderFormattedInline(trimmed.replace('### ', ''))}
                  </h3>
                );
              }
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={idx} className="text-base sm:text-lg font-bold text-amber-300 pt-2.5">
                    {renderFormattedInline(trimmed.replace('#### ', ''))}
                  </h4>
                );
              }
              if (trimmed.startsWith('> ')) {
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-400/25 backdrop-blur-md shadow-sm my-2 flex items-start gap-3"
                  >
                    <div className="text-amber-100 text-sm sm:text-base leading-relaxed font-medium">
                      {renderFormattedInline(trimmed.replace(/^>\s*/, ''))}
                    </div>
                  </div>
                );
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={idx} className="flex items-start gap-2.5 pr-2 py-0.5">
                    <span className="text-amber-400 font-bold mt-1 text-base flex-shrink-0">•</span>
                    <span className="text-slate-200 leading-relaxed">
                      {renderFormattedInline(trimmed.replace(/^[-*]\s+/, ''))}
                    </span>
                  </div>
                );
              }
              if (/^\d+\.\s/.test(trimmed)) {
                const num = trimmed.match(/^\d+\./)?.[0];
                return (
                  <div key={idx} className="flex items-start gap-2.5 pr-2 py-0.5">
                    <span className="text-amber-300 font-mono font-bold mt-0.5 text-xs px-2 py-0.5 rounded-lg bg-white/[0.06] border border-white/[0.1] flex-shrink-0">
                      {num}
                    </span>
                    <span className="text-slate-200 leading-relaxed">
                      {renderFormattedInline(trimmed.replace(/^\d+\.\s+/, ''))}
                    </span>
                  </div>
                );
              }
              if (trimmed === '---') {
                return <hr key={idx} className="border-white/[0.1] my-4" />;
              }
              if (!trimmed) {
                return <div key={idx} className="h-1.5" />;
              }
              return (
                <p key={idx} className="text-slate-300 leading-relaxed">
                  {renderFormattedInline(trimmed)}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Question Bank */}
      {activeTab === 'questions' && (
        <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-base font-bold text-white">
                بنك الأسئلة التفاعلي للامتحانات
              </h3>
              <p className="text-xs text-slate-400">
                اختر الإجابة وستحصل فوراً على التقييم الأكاديمي والشرح المفصل.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/[0.12] hover:border-white/25 transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة الاختبار</span>
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIndex) => {
              const selectedOpt = selectedAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] transition-all hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-700 to-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-white/20 shadow-sm">
                      {qIndex + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = selectedOpt === optIndex;
                      const isCorrect = optIndex === q.correctAnswerIndex;

                      let btnStyle = 'bg-white/[0.04] border-white/[0.1] text-slate-200 hover:border-white/30 hover:bg-white/[0.08]';
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-semibold shadow-[0_0_12px_rgba(52,211,153,0.2)]';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.2)]';
                        } else {
                          btnStyle = 'bg-white/[0.02] border-white/[0.05] text-slate-500 opacity-50';
                        }
                      }

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleAnswerSelect(q.id, optIndex)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md text-xs sm:text-sm text-right transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span className="flex-1">{opt}</span>
                          {isAnswered && isCorrect && (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mr-2" />
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mr-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation[q.id] && (
                    <div className="mt-3 p-3.5 rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/[0.1] text-xs text-slate-300 leading-relaxed animate-in fade-in duration-200">
                      <strong className="text-amber-300 ml-1">💡 التوضيح الأكاديمي:</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Smart Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
            <h3 className="text-base font-bold text-white">
              بطاقات الاستذكار السريع (Flashcards)
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] text-amber-300 backdrop-blur-md">
              بطاقة {currentCardIndex + 1} من {flashcards.length}
            </span>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-lg min-h-[220px] sm:min-h-[260px] rounded-3xl p-8 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border-2 border-white/[0.15] hover:border-amber-400/50 shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.02] select-none relative group"
          >
            <span className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/[0.08] text-amber-300 border border-white/15 backdrop-blur-md">
              {isFlipped ? 'الجواب والتعريف' : 'المصطلح أو السؤال'}
            </span>

            {flashcards[currentCardIndex]?.tag && (
              <span className="absolute top-4 left-4 text-[10px] px-2.5 py-0.5 rounded-md bg-rose-900/50 text-rose-200 border border-rose-500/30 backdrop-blur-sm">
                {flashcards[currentCardIndex].tag}
              </span>
            )}

            <div className="my-auto">
              {isFlipped ? (
                <p className="text-base sm:text-lg font-medium text-amber-200 leading-relaxed">
                  {flashcards[currentCardIndex]?.answer}
                </p>
              ) : (
                <h4 className="text-lg sm:text-xl font-extrabold text-white leading-relaxed">
                  {flashcards[currentCardIndex]?.question}
                </h4>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
              {isFlipped ? 'انقر للعودة إلى السؤال' : 'انقر على البطاقة لإظهار الإجابة'}
            </p>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsFlipped(false);
                setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
              }}
              className="p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-white border border-white/[0.12] hover:border-white/25 transition-all cursor-pointer shadow-sm"
              title="البطاقة السابقة"
            >
              <ChevronRight className="w-5 h-5 text-slate-200" />
            </button>

            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white text-xs font-bold border border-white/20 shadow-md shadow-rose-950/30 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
            >
              اقلب البطاقة
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFlipped(false);
                setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
              }}
              className="p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-white border border-white/[0.12] hover:border-white/25 transition-all cursor-pointer shadow-sm"
              title="البطاقة التالية"
            >
              <ChevronLeft className="w-5 h-5 text-slate-200" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Smart Chat */}
      {activeTab === 'chat' && (
        <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] p-5 sm:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col h-[480px]">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1 mb-4">
            {chatMessages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 items-start ${isAi ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAi
                        ? 'bg-gradient-to-br from-rose-700 to-amber-600 text-white border border-white/25 shadow-md'
                        : 'bg-white/[0.08] text-amber-300 border border-white/15'
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed backdrop-blur-md ${
                      isAi
                        ? 'bg-white/[0.05] text-slate-100 border border-white/[0.1] rounded-tr-none'
                        : 'bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white border border-white/20 rounded-tl-none font-medium'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="block text-[10px] text-slate-400 mt-1.5 text-left">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            {isChatSending && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-700 to-amber-600 text-white border border-white/25 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white/[0.05] backdrop-blur-md p-3 rounded-2xl border border-white/[0.1] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 pt-2 border-t border-white/[0.08]">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="اطرح أي استفسار أو سؤال حول موضوع المحاضرة..."
              disabled={isChatSending}
              className="flex-1 bg-white/[0.05] backdrop-blur-md text-white text-xs sm:text-sm rounded-2xl px-4 py-3 border border-white/[0.12] focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08] placeholder-slate-400 transition-all"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatSending}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-700/90 to-amber-600/90 text-white font-bold text-xs sm:text-sm border border-white/20 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-rose-950/30"
            >
              <Send className="w-4 h-4" />
              <span>إرسال</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
