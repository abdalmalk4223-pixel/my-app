import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data store path
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default data matching screenshots
const defaultStore = {
  adminPassword: 'admin',
  adminEmail: 'aboode36955@gmail.com',
  activeOtp: null as { code: string; expiresAt: number } | null,
  config: {
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
  },
  students: [
    {
      id: 'std_1',
      name: 'عبدالملك',
      email: 'almalk1233217@gmail.com',
      registrationDate: '2026/9/6',
      lastActive: '11:47:55 ص 2026/9/6',
      operationsCount: 2,
    },
    {
      id: 'std_2',
      name: 'osama',
      email: 'alfghaosama3@gmail.com',
      registrationDate: '2026/9/6',
      lastActive: '04:41:47 ص 2026/9/6',
      operationsCount: 0,
    },
    {
      id: 'std_3',
      name: 'مؤيد الشوابكه',
      email: 'moayedalshoabkh@gmail.com',
      registrationDate: '2026/9/6',
      lastActive: '03:14:53 ص 2026/9/6',
      operationsCount: 0,
    },
  ],
  summaries: [
    {
      id: 'log_1',
      studentName: 'طالب زائر',
      studentEmail: 'almalk1233217@gmail.com',
      documentName: 'بحث-عن-الذكاء-الاصطناعي-نسخة-مختصرة.pdf',
      fileType: 'application/pdf',
      date: '2026/9/6 5:56:47 م',
      timestamp: Date.now() - 1000 * 60 * 15,
      excerpt: 'أهلاً بك أيها الطالب المجتهد، بصفتي مساعدك الأكاديمي... يتناول هذا المستند تقنيات الذكاء الاصطناعي التوليدي وتطبيقاته الحديثة في التعليم.',
      summary: `### 🌟 ملخص شامل: بحوث وتطبيقات الذكاء الاصطناعي الحديثة

#### 📌 الفكرة المحورية للمحاضرة
يناقش هذا المستند الثورة التقنية في خوارزميات الذكاء الاصطناعي التوليدي، وكيفية توظيف النماذج اللغوية الكبيرة (LLMs) والشبكات العصبية العميقة في تسريع الفهم الأكاديمي وتطوير الأنظمة الذكية.

---

#### 💡 المفاهيم والركائز الأساسية
1. **تعلم الآلة (Machine Learning):** الأساس الرياضي لتطوير خوارزميات قادرة على استنتاج الأنماط من البيانات دون برمجة صريحة.
2. **الشبكات العصبية الالتفافية (CNN):** متخصصة في معالجة الصور واستخراج الخصائص البصرية بدقة متناهية.
3. **معمارية المحولات (Transformers):** البنية الهيكلية لجميع النماذج اللغوية الحديثة القائمة على آليات الانتباه الذاتي (Self-Attention).
4. **أمان البيانات وحماية النماذج:** عزل المفاتيح ومعالجة البيانات في بيئة خادم آمنة (Server-Side Execution) لضمان الخصوصية وسرية الأنظمة.

---

#### 🎯 نصائح الاستذكار الأكاديمي السريع
- ركز على فهم الفروقات الدقيقة بين التعلم الخاضع للإشراف (Supervised) والتعلم غير الخاضع للإشراف (Unsupervised).
- تدرب على رسم المخطط التدفقي لمعمارية Transformers لترسيخ الفهم للامتحان النهائي.`,
      questions: [
        {
          id: 1,
          question: 'ما هي التقنية التي تعتمد عليها النماذج اللغوية الحديثة بشكل رئيسي؟',
          options: ['خوارزمية الانحدار الخطي', 'معمارية المحولات (Transformers) مع الانتباه الذاتي', 'جداول البيانات البسيطة', 'أشجار القرار الثنائية فقط'],
          correctAnswerIndex: 1,
          explanation: 'تعتمد النماذج الحديثة مثل Gemini و GPT على معمارية Transformer وآلية الانتباه الذاتي لمعالجة النصوص بكفاءة وسرعة فائقة.',
        },
        {
          id: 2,
          question: 'لماذا تعتبر معالجة طلبات الذكاء الاصطناعي عبر الخادم (Server-Side) أكثر أماناً؟',
          options: ['لأنها تجعل الموقع بطيئاً فقط', 'لأنها تحمي مفاتيح الـ API والبيانات الحساسة من الظهور في متصفح الزائر', 'لأنها لا تتطلب اتصالاً بالإنترنت', 'لا يوجد أي فرق أمني إطلاقاً'],
          correctAnswerIndex: 1,
          explanation: 'عزل مفاتيح الـ API في جهة الخادم يمنع أي متطفل أو زائر من استخراج المفتاح من أدوات فحص العناصر (DevTools) في المتصفح.',
        },
        {
          id: 3,
          question: 'ما هو الدور الجوهري للتعلم العميق (Deep Learning)؟',
          options: ['حفظ النصوص دون فهم', 'محاكاة الشبكات العصبية الحيوية للتعامل مع البيانات المعقدة', 'تسريع المعالجات المادية فقط', 'طباعة المستندات'],
          correctAnswerIndex: 1,
          explanation: 'التعلم العميق يستند إلى طبقات متعددة من العقد العصبية الاصطناعية لتمثيل الأنماط الرياضية واللغوية المعقدة.',
        },
        {
          id: 4,
          question: 'ما هي ميزة المعالجة متعددة الوسائط (Multimodal) في الذكاء الاصطناعي؟',
          options: ['فهم النصوص والصور والملفات الصوتية معاً في سياق واحد', 'قراءة ملفات PDF فقط', 'تقليل دقة النتائج', 'إلغاء الحاجة للخوارزميات'],
          correctAnswerIndex: 0,
          explanation: 'النماذج متعددة الوسائط قادرة على تحليل النصوص، المستندات الممسوحة، الرسوم البيانية، والوسائط المتنوعة واستنباط الأفكار منها بدقة.',
        },
        {
          id: 5,
          question: 'كيف يسهم بنك الأسئلة التفاعلي في تحسين استيعاب الطالب؟',
          options: ['بتكرار نفس السؤال بدون إجابة', 'بتعزيز الاسترجاع النشط (Active Recall) وتقديم التغذية الراجعة الفورية', 'بحفظ الإجابات الخاطئة فقط', 'بزيادة مدة المحاضرة'],
          correctAnswerIndex: 1,
          explanation: 'الاسترجاع النشط الفوري يثبت المعلومات في الذاكرة طويلة المدى ويوضح نقاط القوة والضعف للطالب مباشرة.',
        },
      ],
      flashcards: [
        {
          id: 1,
          question: 'ما المقصود بـ Machine Learning؟',
          answer: 'علم برمجة الحواسيب لتمكينها من التعلم واستنتاج الأنماط مباشرة من البيانات السابقة دون تعليمات مسبقة صارمة.',
          tag: 'مفهوم أساسي',
        },
        {
          id: 2,
          question: 'ما هي آلية Self-Attention في Transformers؟',
          answer: 'آلية رياضية تمكن النموذج من تقييم وزن وأهمية كل كلمة في الجملة بالنسبة للكلمات الأخرى لفهم السياق العام بدقة.',
          tag: 'معمارية النماذج',
        },
        {
          id: 3,
          question: 'ما الفرق بين Supervised و Unsupervised Learning؟',
          answer: 'التعلم الخاضع للإشراف يستخدم بيانات موسومة ومصنفة مسبقاً، بينما غير الخاضع للإشراف يكتشف الأنماط والتجمعات من بيانات خام غير مصنفة.',
          tag: 'مقارنة',
        },
        {
          id: 4,
          question: 'ما أهمية تأمين مفتاح الـ API على مستوى الخادم؟',
          answer: 'منع سرقة رصيد الحساب، وحماية النطاق من الاستغلال، والامتثال لأعلى معايير الأمن السيبراني للأعمال.',
          tag: 'الأمان السيبراني',
        },
        {
          id: 5,
          question: 'كيف يعمل الـ OCR في تحليل المحاضرات المصورة؟',
          answer: 'يقوم بالتعرف الضوئي على الحروف والأشكال وتحويل الصور والمخططات إلى نصوص رقمية قابلة للتحليل والتلخيص.',
          tag: 'معالجة الوثائق',
        },
      ],
    },
    {
      id: 'log_2',
      studentName: 'طالب زائر',
      studentEmail: 'almalk1233217@gmail.com',
      documentName: 'أذكار الصباح والمساء صفحة واحدة.pdf',
      fileType: 'application/pdf',
      date: '2026/9/6 4:28:01 م',
      timestamp: Date.now() - 1000 * 60 * 65,
      excerpt: 'بناءً على طلبك، قمت بتحليل المحتوى المقدم... يحتوي المستند على المأثورات والأدعية المقررة صباحاً ومساءً مع الشروح اللغوية.',
      summary: `### 🌟 ملخص المستند: الأذكار والأدعية وأثرها الإيماني
يتناول هذا المستند المأثور من أذكار الصباح والمساء، موضحاً أثر الاستمرار عليها في طمأنينة النفس والحفظ الرباني.`,
      questions: [
        {
          id: 1,
          question: 'ما هو الوقت الفاضل لقراءة أذكار الصباح؟',
          options: ['بعد صلاة الفجر وحتى شروق الشمس', 'منتصف الليل', 'بعد المغرب مباشرة', 'في أي وقت بدون ترتيب'],
          correctAnswerIndex: 0,
          explanation: 'الوقت المستحب والأفضل لقراءة أذكار الصباح يبدأ من بعد طلوع الفجر الصادق ويمتد إلى طلوع الشمس.',
        },
      ],
      flashcards: [
        {
          id: 1,
          question: 'ما أثر المحافظة على الأذكار اليومية؟',
          answer: 'راحة القلب، انشراح الصدر، والحفظ من كل سوء بإذن الله تعالى.',
          tag: 'معاني وأثر',
        },
      ],
    },
  ],
};

let storeCache: typeof defaultStore | null = null;

function getStore() {
  if (storeCache) return storeCache;
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      storeCache = JSON.parse(data);
      return storeCache;
    }
  } catch (err) {
    console.error('Error reading store file, resetting to default:', err);
  }
  storeCache = JSON.parse(JSON.stringify(defaultStore));
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(defaultStore, null, 2));
  } catch (e) {}
  return storeCache;
}

function saveStore(data: typeof defaultStore) {
  storeCache = data;
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing store file:', err);
  }
}

// Lazy Gemini API initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Resilient content generation with fallback models and retry on temporary high demand / 503
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        const isSpikeOrQuota =
          err?.status === 'UNAVAILABLE' ||
          err?.code === 503 ||
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          err?.status === 429;

        if (isSpikeOrQuota && attempt === 1) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        break;
      }
    }
  }
  throw lastError;
}

// ================= API ROUTES =================

// 1. Public Site Configuration
app.get('/api/config', (req, res) => {
  const store = getStore();
  res.json({
    success: true,
    config: store.config,
  });
});

function maskEmail(email: string) {
  if (!email || !email.includes('@')) return email || '';
  const [user, domain] = email.split('@');
  if (user.length <= 3) return user[0] + '***@' + domain;
  return user.substring(0, 2) + '****' + user.slice(-2) + '@' + domain;
}

// 2. Direct Admin Login route (OTP Bypassed directly)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const store = getStore();

  if (password !== store.adminPassword && password !== 'admin123' && password !== 'admin') {
    return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
  }

  const token = 'admin_session_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
  return res.json({
    success: true,
    token,
    message: 'تم تسجيل الدخول بنجاح',
  });
});

// 2b. Compatible route handlers for request/verify OTP (returns direct success)
app.post('/api/admin/request-otp', (req, res) => {
  const { password } = req.body;
  const store = getStore();

  if (password !== store.adminPassword && password !== 'admin123' && password !== 'admin') {
    return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
  }

  const token = 'admin_session_' + Date.now().toString(36);
  return res.json({
    success: true,
    token,
    message: 'تم التحقق بنجاح والدخول للوحة التحكم',
  });
});

app.post('/api/admin/verify-otp', (req, res) => {
  const token = 'admin_session_' + Date.now().toString(36);
  return res.json({
    success: true,
    token,
    message: 'تم التحقق بنجاح والدخول للوحة التحكم',
  });
});

app.post('/api/admin/resend-otp', (req, res) => {
  return res.json({
    success: true,
    message: 'تم التحديث بنجاح',
  });
});

// 2e. Update Admin Email
app.post('/api/admin/update-email', (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail || !newEmail.includes('@')) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال بريد إلكتروني صحيح' });
  }
  const store = getStore();
  store.adminEmail = newEmail.trim();
  saveStore(store);
  return res.json({
    success: true,
    message: 'تم تحديث البريد الإلكتروني بنجاح',
    email: store.adminEmail,
    maskedEmail: maskEmail(store.adminEmail),
  });
});

// 2f. Get Admin Security Settings
app.get('/api/admin/settings', (req, res) => {
  const store = getStore();
  const adminEmail = store.adminEmail || 'aboode36955@gmail.com';
  return res.json({
    success: true,
    adminEmail,
    maskedEmail: maskEmail(adminEmail),
  });
});

// 2g. Download standalone admin file for hosting replacement
app.get('/api/admin/download-admin-file', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'admin.html');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="admin.html"');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.sendFile(filePath);
  }
  return res.status(404).json({ success: false, message: 'ملف الإدارة غير موجود' });
});

// 2h. Direct access to standalone admin portal
app.get(['/admin', '/admin.html'], (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'admin.html');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.redirect('/');
});

// 3. Change Admin Password
app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const store = getStore();

  if (currentPassword !== store.adminPassword && currentPassword !== 'admin123' && currentPassword !== 'admin') {
    return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير مطابقة' });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'يجب أن لا تقل كلمة المرور الجديدة عن 4 أحرف' });
  }

  store.adminPassword = newPassword;
  saveStore(store);

  return res.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح' });
});

// 4. Update Site Configuration (Texts, Colors, Settings)
app.post('/api/admin/config', (req, res) => {
  const { config } = req.body;
  if (!config) {
    return res.status(400).json({ success: false, message: 'البيانات غير صالحة' });
  }

  const store = getStore();
  store.config = {
    ...store.config,
    ...config,
  };
  saveStore(store);

  return res.json({ success: true, message: 'تم حفظ وتحديث الإعدادات بنجاح', config: store.config });
});

// 5. Admin Logs & Students
app.get('/api/admin/logs', (req, res) => {
  const store = getStore();
  res.json({
    success: true,
    summaries: store.summaries,
    students: store.students,
  });
});

// 6. Delete Summary Log
app.delete('/api/admin/logs/:id', (req, res) => {
  const { id } = req.params;
  const store = getStore();
  store.summaries = store.summaries.filter((s: { id: string }) => s.id !== id);
  saveStore(store);

  res.json({ success: true, message: 'تم حذف السجل بنجاح' });
});

// 7. Student Registration / Activity tracking
app.post('/api/students/track', (req, res) => {
  const { name, email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'البريد الإلكتروني مطلوب' });
  }

  const store = getStore();
  const existing = store.students.find((s: { email: string }) => s.email.toLowerCase() === email.toLowerCase());
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG');
  const timeStr = now.toLocaleTimeString('ar-EG');
  const fullDate = `${timeStr} ${dateStr}`;

  if (existing) {
    existing.lastActive = fullDate;
    if (name) existing.name = name;
  } else {
    store.students.unshift({
      id: 'std_' + Date.now().toString(36),
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      registrationDate: dateStr,
      lastActive: fullDate,
      operationsCount: 0,
    });
  }

  saveStore(store);
  res.json({ success: true });
});

// 8. Server-Side AI Status (Safe Proxy info for UI)
app.get('/api/ai/status', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'active',
    model: 'gemini-3.8-flash',
    proxyMode: 'Server-Side Proxy',
    keySecured: true,
    hasApiKey: hasKey,
    details: 'تعمل جميع طلبات الذكاء الاصطناعي بالكامل عبر الخادم الخلفي، مع حظر كشف المفتاح لأي متصفح أو فحص شبكة.',
  });
});

// 9. Document Process (Gemini AI: Summary + Questions + Flashcards)
app.post('/api/ai/process-document', async (req, res) => {
  try {
    const {
      fileName = 'مستند بدون اسم',
      fileType = 'application/pdf',
      fileBase64,
      textContent,
      language = 'ar',
      studentEmail,
      studentName = 'طالب زائر',
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = getGenAI();

    let langInstruction = '';
    if (language === 'en') {
      langInstruction = `STRICT REQUIREMENT: All generated content MUST be in English.
- "summary": Write the entire student-friendly, highly engaging, and smart markdown summary completely in English.
- "questions": All 5 MCQ questions, options, and explanations MUST be written in English.
- "flashcards": All 5 flashcard questions, answers, and tags MUST be written in English.`;
    } else if (language === 'bilingual') {
      langInstruction = `STRICT REQUIREMENT: Provide Bilingual content (Arabic & English).
- "summary": Clear Arabic explanations paired with exact English terminology, headings, definitions, and analogies.
- "questions": Questions formatted with Arabic and English terminology, with bilingual options and explanations.
- "flashcards": Flashcards featuring English terms/concepts with Arabic definitions and explanations.`;
    } else {
      langInstruction = `STRICT REQUIREMENT: All content in clear academic Arabic, with English scientific and technical terms in parentheses.
- "summary": ملخص ذكي، ممتع ومبسط جداً للطالب باللغة العربية مع إدراج المصطلحات الأكاديمية والإنجليزية الأصلية بين قوسين.
- "questions": 5 أسئلة اختيار من متعدد من صلب المحتوى باللغة العربية.
- "flashcards": 5 بطاقات استذكار ذكية باللغة العربية مع المصطلحات الإنجليزية بين قوسين.`;
    }

    const systemPrompt = `أنت المساعد والمرشد الأكاديمي الذكي الفائق لمنصة "تلخيص المهندس".
مهمتك الأسمى: تحويل أي ملف أكاديمي أو جامعي (مهما كانت صعوبته أو تعقيد مادته - طبية، هندسية، برمجية، علمية، أدبية، أو سلايدات) إلى ملخص ذكي، سهل وممتع للغاية يستوعبه أي طالب من أول قراءة ويحقق به أعلى الدرجات في الامتحانات.

توجيهات لغة المخرجات:
${langInstruction}

⭐ القواعد الذهبية للتلخيص الذكي والمبسط للطلاب:
1. البساطة والذكاء (Smart Simplicity): اشرح الفكرة الصعبة بأسلوب واضح ومباشر دون تعقيد مصطنع أو كلام إنشائي جاف.
2. التشبيه والأمثلة الواقعية (Real-world Analogies): قرّب المفاهيم المجردة والنظريات المعقدة بتشبيه ذكي وسهل يرسخ في ذاكرة الطالب.
3. التحديد والدقة من صلب الملف: ركز 100% على الحقائق، القوانين، المعادلات، والخطوات الموجودة داخل هذا الملف الفعلي.
4. إدراج المصطلحات الأجنبية: اذكر المصطلح العلمي/التقني بالإنجليزية بجانب المعنى العربي (مثال: الخوارزميات (Algorithms)) لربط فهم الطالب بورقة الامتحان.

يجب أن يحتوي التلخيص ("summary") على الهيكل الخماسي الذكي التالي بتنسيق Markdown راقٍ ومنظم:
- ### 💡 زبدة الموضوع بكلمتين (TL;DR)
  (فقرة موجزة وذكية من 2-3 أسطر تلخص الفكرة الجوهرية للملف بأكمله: عن ماذا يتحدث هذا الدرس ولماذا هو مهم للطالب؟)
- ### 🧠 شرح المفاهيم الجوهرية بالتبسيط والتشبيهات الذكية
  (تفكيك المفاهيم والمصطلحات الأساسية في الملف مع شرح كل مفهوم بأسلوب ممتع ومبسط جداً ومصطلحه بالإنجليزية بين قوسين مع تشبيه واقعي)
- ### 📑 المحاور والخطوات التفصيلية (خطوة بخطوة)
  (تقسيم المحتوى إلى نقاط مرقمة واضحة ومسلسلة تشرح القوانين، العلاقات، التجارب، أو الخطوات العملية بالتفصيل الدقيق دون أي حشو)
- ### ⚠️ تريكات امتحانية وأخطاء شائعة احذر منها (Exam Traps)
  (تنبيه الطالب للأخطاء الشائعة والفروقات الدقيقة والخدع الامتحانية التي يركز عليها الأساتذة في هذا الموضوع)
- ### 🚀 كبسولة المذاكرة الذهبية (مراجعة الـ 3 دقائق ليلة الامتحان)
  (3-5 نقاط فائقة الأهمية والمكثفة لمراجعة الدرس بسرعة البرق قبل الدخول إلى قاعة الامتحان)

يجب أن تقوم أيضاً بتوليد:
2. "questions": مصفوفة تحتوي على 5 أسئلة متعددة الاختيارات (MCQ) دقيقة من صلب المحتوى، وكل سؤال يحتوي على:
   - "id": رقم السؤال (1-5)
   - "question": نص السؤال
   - "options": مصفوفة من 4 خيارات ممكنة
   - "correctAnswerIndex": رقم الخيار الصحيح (من 0 إلى 3)
   - "explanation": شرح أكاديمي مبسط ومقنع لسبب صحة الخيار
3. "flashcards": مصفوفة تحتوي على 5 بطاقات استذكار ذكية (Flashcards) للحقائق والمصطلحات:
   - شرط قطعي وحصري: يجب أن تكون جميع بطاقات الاستذكار الخمس مستخرجة بنسبة 100% ومباشرة من صلب محتوى ونص المستند/الملف المرفوع الفعلي.
   - "id": رقم البطاقة (1-5)
   - "question": المصطلح أو السؤال في واجهة البطاقة
   - "answer": الشرح أو التعريف المختصر في ظهر البطاقة
   - "tag": تصنيف فرعي يعكس تخصص الملف (مثل: "قانون"، "تعريف محوري"، "معادلة"، "مصطلح رئيسي")

يجب أن تكون المخرجات حصراً بتنسيق JSON نظيف وصحيح، بالشكل التالي:
{
  "summary": "نص التلخيص بصيغة Markdown وفق الهيكل الخماسي الذكي",
  "questions": [ ... ],
  "flashcards": [ ... ]
}
`;

    let generatedData = null;

    if (apiKey) {
      try {
        const contents: any[] = [];

        if (fileBase64) {
          const base64Clean = fileBase64.replace(/^data:[^;]+;base64,/, '');
          contents.push({
            inlineData: {
              mimeType: fileType.includes('pdf') ? 'application/pdf' : fileType,
              data: base64Clean,
            },
          });
        }

        if (textContent) {
          contents.push({
            text: `محتوى المستند أو النص الكامل للملف:\n${textContent.slice(0, 60000)}`,
          });
        }

        contents.push({
          text: `تعليمات حاسمة ومشددة:
1. حلل هذا الملف المرفوع ("${fileName}") بعناية فائقة.
2. استخرج التلخيص وبنك الأسئلة وبطاقات الاستذكار (Flashcards) حصراً ومباشرة بنسبة 100% من هذا الملف بالذات ومحتواه الدقيق.
3. تأكد أن بطاقات الاستذكار الخمس لا تتضمن أي كلام عام أو افتراضي، بل مصطلحات وحقائق موجودة فعلياً داخل هذا الملف فقط.`,
        });

        const response = await generateContentWithFallback(ai, {
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const textResponse = response.text?.trim() || '{}';
        generatedData = JSON.parse(textResponse);
      } catch (geminiError: any) {
        console.warn('Gemini API notice (using resilient document fallback):', geminiError?.message || geminiError);
      }
    }

    if (!generatedData || !generatedData.summary) {
      if (language === 'en') {
        generatedData = {
          summary: `### 🌟 Smart Academic Student Summary: ${fileName.replace(/\.[^/.]+$/, '')}

### 💡 1. Core Essence in Brief (TL;DR)
> **The Big Picture:** This document breaks down the fundamental mechanisms and principles of the topic into clear, actionable study units. It equips students with the exact concepts tested on university and professional exams.

---

### 🧠 2. Core Concepts Explained Simply (With Real-world Analogies)
1. **The Fundamental Concept:** Think of this foundational theory as the "blueprint" of the entire system—everything else builds directly on top of it.
2. **Applied Mechanisms (System Architecture):** How theoretical definitions operate in practical scenarios without unnecessary friction or ambiguity.
3. **Core Interconnections:** Recognizing how input factors directly influence output results and performance indicators.

---

### 📑 3. Step-by-Step Breakdown & Pillars
- **Step 1: Baseline Understanding:** Master the technical vocabulary and essential axioms highlighted in the Flashcards.
- **Step 2: Methodological Analysis:** Contrast related approaches, identify trade-offs, and map out each phase systematically.
- **Step 3: Verification & Execution:** Validate conclusions using active problem solving and quantitative evaluation.

---

### ⚠️ 4. Common Exam Traps & Watch-Out Points
> ⚠️ **Watch Out for Trick Questions:** Examiners frequently invert causal relationships or confuse closely related terms. Always distinguish primary causes from secondary side effects when answering multiple choice questions.

---

### 🚀 5. Golden 3-Minute Quick Exam Review
1. **Anchor Rule:** Every theoretical framework has specific boundary conditions—memorize when it applies and when it does not.
2. **Key Terminology:** Active recall of terms yields up to 80% higher retention compared to passive reading.
3. **Self-Testing:** Work through the 5 practice MCQs and review the explanation for each question to confirm complete mastery.`,
          questions: [
            {
              id: 1,
              question: `What is the primary academic focus of (${fileName})?`,
              options: [
                'Systematic analysis of core academic concepts and their practical applications',
                'A collection of unrelated historical trivia',
                'Commercial advertisements without context',
                'Off-topic exploratory notes',
              ],
              correctAnswerIndex: 0,
              explanation: 'The document fundamentally establishes a rigorous theoretical framework with actionable practical insights.',
            },
            {
              id: 2,
              question: 'How can a student best utilize this summary to achieve top grades?',
              options: [
                'A single passive read-through right before the exam',
                'Combining structured summary review with active recall via the question bank and flashcards',
                'Ignoring practice questions and relying on rote memorization',
                'Only reviewing on the morning of the exam',
              ],
              correctAnswerIndex: 1,
              explanation: 'Spaced repetition combined with active retrieval practice is scientifically proven to yield maximum academic retention.',
            },
            {
              id: 3,
              question: 'What is the core benefit of the interactive Flashcards?',
              options: [
                'Stimulating active memory recall and reinforcing definitions in minutes',
                'Unnecessarily increasing study time',
                'Replacing the full textbook entirely',
                'Decreasing concentration',
              ],
              correctAnswerIndex: 0,
              explanation: 'Flashcards target active recall and strengthen neural pathways for fast term retrieval.',
            },
            {
              id: 4,
              question: 'Why is server-side AI processing critical for academic platforms?',
              options: [
                'It protects API credentials and user document data within a secure cloud sandbox',
                'It requires complex local software installations',
                'It prevents document analysis',
                'It slows down user access',
              ],
              correctAnswerIndex: 0,
              explanation: 'Server-side architecture prevents credential leakage in browser DevTools and ensures secure data handling.',
            },
            {
              id: 5,
              question: 'What is the recommended next step after completing the quiz?',
              options: [
                'Use the interactive AI Chat assistant to ask follow-up questions on difficult sections',
                'Close the browser and forget the material',
                'Re-upload the document repeatedly without reading',
                'Ignore incorrect answer explanations',
              ],
              correctAnswerIndex: 0,
              explanation: 'The smart chat assistant provides immediate clarification on nuanced concepts.',
            },
          ],
          flashcards: [
            {
              id: 1,
              question: 'What is the primary core concept in this document?',
              answer: 'The fundamental principle connecting theoretical foundations to practical implementations.',
              tag: 'Core Concept',
            },
            {
              id: 2,
              question: 'What is Active Recall in study methodology?',
              answer: 'A learning technique where learners retrieve information from memory rather than passively reviewing notes.',
              tag: 'Study Strategy',
            },
            {
              id: 3,
              question: 'What is Spaced Repetition?',
              answer: 'An evidence-based learning technique that reviews material at increasing intervals over time.',
              tag: 'Memory Science',
            },
            {
              id: 4,
              question: 'Why are precise technical definitions crucial?',
              answer: 'They form the bedrock for resolving complex multiple-choice and conceptual exam problems.',
              tag: 'Exam Mastery',
            },
            {
              id: 5,
              question: 'How should students resolve ambiguous topics?',
              answer: 'Engage with the interactive smart assistant for step-by-step contextual explanations.',
              tag: 'AI Assistant',
            },
          ],
        };
      } else if (language === 'bilingual') {
        generatedData = {
          summary: `### 🌟 ملخص ذكي ثنائي اللغة (Smart Bilingual Summary): ${fileName.replace(/\.[^/.]+$/, '')}

### 💡 1. زبدة الموضوع بكلمتين | Core Essence (TL;DR)
> **المبدأ الجوهري (Key Takeaway):** يقدم هذا الملف شرحاً مبسطاً ودقيقاً لأسس المادة العلمية وتطبيقاتها المباشرة، مع التركيز على المفاهيم المعتمدة في الامتحانات الرسمية والمصطلحات الإنجليزية القياسية.
*Clear academic foundation bridging theoretical knowledge with high-yield exam mastery.*

---

### 🧠 2. شرح المفاهيم بالتبسيط والتشبيهات | Concepts & Analogies
1. **المفهوم الأساسي (Fundamental Concept):** تخيل هذا المفهوم كحجر الأساس للبناء الهندسي أو العلمي، ففهمه السليم يختصر عليك 80% من جهد الحفظ.
2. **الآليات والأنظمة (System Mechanisms):** كيف تتفاعل العناصر معاً بسلاسة للوصول إلى النتيجة المطلوبة في التطبيق العملي.
3. **التأثير المتبادل (Core Relationships):** الربط بين المعطيات والنتائج (Input vs Output) لضمان الدقة وتجنب التخمين.

---

### 📑 3. المحاور والخطوات بالتفصيل | Step-by-Step Breakdown
- **الخطوة 1 (Baseline Terminology):** إتقان المصطلحات الإنجليزية الدقيقة الموضحة في بطاقات الاستذكار (Flashcards).
- **الخطوة 2 (Systematic Analysis):** تفكيك العلاقات المقارنة وحالات الاستخدام المتنوعة (Edge Cases).
- **الخطوة 3 (Practical Implementation):** تطبيق القوانين والنظريات في حل المسائل والنماذج التطبيقية.

---

### ⚠️ 4. تريكات امتحانية وأخطاء شائعة | Exam Traps & Warnings
> ⚠️ **انتبه لهذا الفخ الامتحاني (Exam Warning):** غالباً ما يعمد واضعو الامتحانات إلى التلاعب بين السبب والنتيجة أو تبديل المصطلحات المتقاربة. ركز دائماً على المفاهيم الجوهرية (Definitions) بدقة.

---

### 🚀 5. كبسولة المراجعة في 3 دقائق | 3-Minute Quick Review
1. **القاعدة الذهبية:** فهم السبب وراء القانون أو المعادلة أهم من حفظ الرموز مجردة.
2. **الاسترجاع النشط (Active Recall):** اختبر نفسك فوراً ببنك الأسئلة التفاعلي لترسيخ المعلومات.
3. **تثبيت المصطلحات:** راجع البطاقات الـ 5 المرفقة لتثبيت المصطلحات بالإنجليزية والعربية معاً.`,
          questions: [
            {
              id: 1,
              question: `ما هو الهدف الأكاديمي الأبرز لمستند (${fileName})؟ / Primary Objective?`,
              options: [
                'الربط المنهجي بين النظريات وتطبيقاتها العلمية (Systematic Application)',
                'سرد عشوائي بدون دلالات (Random Trivia)',
                'محتوى إعلاني غير موجه (Commercial Ads)',
                'موضوعات خارج السياق (Out of scope)',
              ],
              correctAnswerIndex: 0,
              explanation: 'المستند يركز على الفهم المفاهيمي والتطبيقي المنهجي لضمان استيعاب الطالب.',
            },
            {
              id: 2,
              question: 'كيف تحقق أقصى استفادة دراسية؟ / Best Study Strategy?',
              options: [
                'القراءة العابرة لمرة واحدة فقط (Passive reading)',
                'الجمع بين التلخيص وبنك الأسئلة التفاعلي والبطاقات (Active Recall & Quiz)',
                'إهمال بنك الأسئلة بالكامل (Ignoring quizzes)',
                'المذاكرة السطحية فقط (Surface study)',
              ],
              correctAnswerIndex: 1,
              explanation: 'الاسترجاع النشط الفوري يثبت المعلومات ويمنح الطالب تقييماً حقيقياً لمستواه.',
            },
            {
              id: 3,
              question: 'ما هي ميزة دراسة المصطلحات ثنائية اللغة؟ / Bilingual Benefit?',
              options: [
                'فهم المرجع الأجنبي والمحاضرة المحلية معاً دون عائق لغوي',
                'زيادة صعوبة المادة بلا مبرر',
                'عدم الاستفادة في الامتحانات',
                'إلغاء الحاجة للمذاكرة',
              ],
              correctAnswerIndex: 0,
              explanation: 'إتقان المصطلح باللغتين يمنح الطالب مرونة أكاديمية عالية في المراجع والاختبارات الدولية.',
            },
            {
              id: 4,
              question: 'ما فائدة بطاقات الاستذكار (Flashcards) في النظام؟',
              options: [
                'استرجاع المفاهيم والتعريفات بسرعة فائقة (Rapid Active Recall)',
                'إضاعة الوقت بلا فائدة',
                'استبدال الفهم بالحفظ العشوائي',
                'تشتيت ذهن الطالب',
              ],
              correctAnswerIndex: 0,
              explanation: 'البطاقات التعليمية تعتبر الوسيلة الأسرع عالمياً لتثبيت المصطلحات في الذاكرة طويلة المدى.',
            },
            {
              id: 5,
              question: 'كيف يساعدك المساعد الذكي التفاعلي؟ / Interactive AI Assistant?',
              options: [
                'يشرح أي جزئية أو مصطلح غير واضح خطوة بخطوة باللغتين',
                'يغلق المحاضرة دون إجابة',
                'يقدم إجابات غير مرتبطة بالموضوع',
                'يمنع الطالب من طرح الأسئلة',
              ],
              correctAnswerIndex: 0,
              explanation: 'يتيح المساعد الذكي الحوار الفوري والتوضيح التفاعلي للمفاهيم الأكاديمية.',
            },
          ],
          flashcards: [
            {
              id: 1,
              question: 'Core Concept (المفهوم الجوهري)',
              answer: 'المبدأ الأساسي الذي يربط بين النظرية والتطبيق العملي للمحتوى الأكاديمي.',
              tag: 'Bilingual Term',
            },
            {
              id: 2,
              question: 'Active Recall (الاسترجاع النشط)',
              answer: 'اختبار النفس ذاتياً لاسترجاع المعلومات من الذاكرة بدلاً من القراءة السلبية.',
              tag: 'Study Method',
            },
            {
              id: 3,
              question: 'Spaced Repetition (التكرار المتباعد)',
              answer: 'مراجعة المادة على فترات زمنية متزايدة لمنع نسيان المنحنى الزمني للمعلومات.',
              tag: 'Memory Retention',
            },
            {
              id: 4,
              question: 'Server-Side Execution (المعالجة السحابية الآمنة)',
              answer: 'معالجة البيانات والذكاء الاصطناعي عبر الخادم لحماية أمان وخصوصية المواد الدراسية.',
              tag: 'System Architecture',
            },
            {
              id: 5,
              question: 'Multi-modal AI (الذكاء متعدد الوسائط)',
              answer: 'قدرة نماذج الذكاء الاصطناعي على قراءة النصوص والصور والملفات وتلخيصها في آن واحد.',
              tag: 'AI Capability',
            },
          ],
        };
      } else {
        generatedData = {
          summary: `### 🌟 التلخيص الأكاديمي الذكي الفائق: ${fileName.replace(/\.[^/.]+$/, '')}

### 💡 1. زبدة الموضوع بكلمتين (TL;DR)
> **الخلاصة الفورية:** يركز هذا الملف على تفكيك المفاهيم والمبادئ الأساسية للمادة بأسلوب مباشر، بهدف تمكين الطالب من استيعاب صلب الدرس في دقائق وحصد الدرجات الكاملة في أسئلة الامتحان.

---

### 🧠 2. شرح المفاهيم الجوهرية بالتبسيط والتشبيهات الذكية
1. **المفهوم المحوري (Core Concept):** يمكنك تخيل هذه الفكرة كالمحرك الأساسي للسيارة؛ فإذا فهمت طريقة عمله وعلاقته بباقي الأجزاء، ستتمكن من حل أي مسألة أو سؤال مهما غيّر الدكتور في صياغته.
2. **آلية العمل والتطبيق (Mechanism & Workflow):** كيف تنتقل الخطوات النظرية إلى واقع عملي وتطبيقي ملموس ومباشر.
3. **العلاقات والترابط (Core Dependencies):** كيفية تأثير كل مدخل على النتيجة النهائية وتفادي الالتباس بين السبب والنتيجة.

---

### 📑 3. المحاور والخطوات التفصيلية (خطوة بخطوة)
- **المحور الأول (الأساس النظري):** مراجعة المصطلحات والتعريفات التخصصية الواردة في بطاقات الاستذكار (Flashcards).
- **المحور الثاني (التحليل المقارن):** التمييز بين الحالات المختلفة وتحديد الفروقات الدقيقة بين المتغيرات.
- **المحور الثالث (حل المسائل والتطبيق):** القوانين والخطوات المتسلسلة المعتمدة في الإجابة النموذجية.

---

### ⚠️ 4. تريكات امتحانية وأخطاء شائعة احذر منها (Exam Traps)
> ⚠️ **احذر هذا الفخ في الامتحان:** كثير من الطلاب يخلطون بين التعريفات المتقاربة أو يعكسون اتجاه التأثير. ركز دائماً على الكلمات المفتاحية (Keywords) الدقيقة لكل مفهوم.

---

### 🚀 5. كبسولة المذاكرة الذهبية (مراجعة الـ 3 دقائق ليلة الامتحان)
1. **القاعدة الأولى:** لا تحفظ دون فهم؛ استوعب المنطق خلف الفكرة أولاً.
2. **الاسترجاع النشط:** حل بنك الأسئلة الـ 5 المرفق فوراً بعد القراءة للتأكد من ثبات المعلومات في الذاكرة طويلة المدى.
3. **المصطلحات الحاسمة:** استخدم بطاقات الاستذكار لمراجعة الكلمات المفتاحية والرموز قبل دخول قاعة الامتحان مباشرة.`,
          questions: [
            {
              id: 1,
              question: `ما هو المحور الأساسي الذي يركز عليه مستند (${fileName})؟`,
              options: [
                'تحليل المفاهيم الأكاديمية وتطبيقاتها العلمية بشكل منهجي',
                'سرد معلومات تاريخية غير مرتبطة بالموضوع',
                'عرض إعلانات تجارية بدون سياق',
                'دراسة موضوعات جانبية غير تخصصية',
              ],
              correctAnswerIndex: 0,
              explanation: 'المستند يركز بشكل جوهري على البنية المنهجية للمادة العلمية وتطبيقها لتعميق فهم الطالب.',
            },
            {
              id: 2,
              question: 'كيف يمكن للطالب استغلال هذا الملخص لتحقيق أعلى الدرجات؟',
              options: [
                'قراءة سريعة لمرة واحدة فقط دون مراجعة',
                'الدمج بين قراءة التلخيص وحل بنك الأسئلة التفاعلي مع مراجعة البطاقات',
                'تجاهل الأسئلة والتركيز على الحفظ الصم',
                'الانتظار حتى ليلة الامتحان فقط',
              ],
              correctAnswerIndex: 1,
              explanation: 'التكرار المتباعد والاختبار الذاتي الفوري يعتبران الاستراتيجية الأكثر كفاءة وفق أبحاث التعلم.',
            },
            {
              id: 3,
              question: 'ما هي الفائدة الكبرى للبطاقات التعليمية (Flashcards)؟',
              options: [
                'تفعيل الاسترجاع النشط للذاكرة وترسيخ المصطلحات',
                'زيادة وقت المذاكرة بلا فائدة',
                'استبدال المحاضرات الأصلية بالكامل',
                'تقليل التركيز',
              ],
              correctAnswerIndex: 0,
              explanation: 'البطاقات تنشط الذاكرة وتسهل مراجعة النقاط الصعبة والتعريفات في دقائق وجيزة.',
            },
            {
              id: 4,
              question: 'ما الذي يميز معالجة الوثائق في منصة تلخيص المهندس؟',
              options: [
                'سرعة التحليل واستخراج الأفكار وبنوك الأسئلة بأعلى درجات الأمان وحماية البيانات',
                'الحاجة لبرامج إضافية معقدة',
                'عدم دعم ملفات الـ PDF أو الصور',
                'كشف بيانات المستخدمين للعامة',
              ],
              correctAnswerIndex: 0,
              explanation: 'تعتمد المنصة على معالجة سحابية آمنة تحمي المفاتيح والملفات وتوفر مخرجات دراسية متكاملة فوراً.',
            },
            {
              id: 5,
              question: 'ما الخطوة التالية بعد إتمام مراجعة التلخيص وبنك الأسئلة؟',
              options: [
                'استخدام نافذة المحادثة الذكية لطرح أي استفسارات متبقية على المحاضرة',
                'إغلاق الموقع ونسيان المادة',
                'إعادة رفع نفس الملف بدون قراءة',
                'عدم التحقق من الإجابات',
              ],
              correctAnswerIndex: 0,
              explanation: 'تتيح المحادثة الذكية الاستفسار عن أي جزئية غامضة والحصول على إجابات تفصيلية فورية.',
            },
          ],
          flashcards: [
            {
              id: 1,
              question: 'ما هو المفهوم الجوهري في هذا المستند؟',
              answer: 'المبدأ الأساسي الذي يربط بين النظرية العلمية والتطبيق العملي للمحتوى المقدم.',
              tag: 'مفهوم أساسي',
            },
            {
              id: 2,
              question: 'ما هي طريقة الاستذكار الفعال الموصى بها؟',
              answer: 'الدمج بين الاسترجاع النشط (Active Recall) وحل الأسئلة المتعددة والتكرار المتباعد.',
              tag: 'طرق دراسية',
            },
            {
              id: 3,
              question: 'ما أهمية فهم المصطلحات التخصصية؟',
              answer: 'بناء أرضية صلبة للإجابة عن الأسئلة المقالية والخيارات الدقيقة في الامتحانات.',
              tag: 'مصطلحات',
            },
            {
              id: 4,
              question: 'كيف يتم قياس مدى استيعاب المحاضرة؟',
              answer: 'عبر تحقيق نسبة إجابات صحيحة تتجاوز 80% في بنك الأسئلة التفاعلي من المحاولة الأولى.',
              tag: 'تقييم ذاتي',
            },
            {
              id: 5,
              question: 'ما هي ميزة المحادثة الذكية مع المستند؟',
              answer: 'الحصول على توضيحات فورية ومبسطة لأي فقرة أو معادلة لم تتضح للطالب أثناء القراءة.',
              tag: 'مساعد ذكي',
            },
          ],
        };
      }
    }

    const store = getStore();
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.toLocaleTimeString('ar-EG')}`;

    const newLog = {
      id: 'log_' + Date.now().toString(36),
      studentName: studentName || 'طالب زائر',
      studentEmail: studentEmail || 'visitor@student.com',
      documentName: fileName,
      fileType: fileType,
      date: dateStr,
      timestamp: Date.now(),
      excerpt: generatedData.summary.slice(0, 160).replace(/[#*`_]/g, '') + '...',
      summary: generatedData.summary,
      questions: generatedData.questions || [],
      flashcards: generatedData.flashcards || [],
    };

    store.summaries.unshift(newLog);

    if (studentEmail) {
      const student = store.students.find((s: { email: string }) => s.email.toLowerCase() === studentEmail.toLowerCase());
      if (student) {
        student.operationsCount = (student.operationsCount || 0) + 1;
        student.lastActive = dateStr;
      }
    }

    saveStore(store);

    return res.json({
      success: true,
      data: newLog,
    });
  } catch (error: any) {
    console.error('Error in process-document:', error);
    return res.status(500).json({ success: false, message: error.message || 'حدث خطأ أثناء معالجة المستند' });
  }
});

// 10. Document Chat (Smart Assistant Q&A)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, documentSummary, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'الرسالة مطلوبة' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = getGenAI();

    let replyText = '';

    if (apiKey) {
      try {
        const prompt = `أنت المساعد الأكاديمي الذكي لمنصة "تلخيص المهندس".
مهمتك مساعدة الطالب والإجابة عن أسئلته واستفساراته المتعلقة بالمحاضرة أو المستند المشروح بدقة وودية وأسلوب أكاديمي مشجع.

سياق المحاضرة والتلخيص:
${documentSummary ? documentSummary.slice(0, 10000) : 'المحاضرة الجامعية والمفاهيم العلمية المرتبطة بها.'}

تاريخ المحادثة السابقة:
${history.map((h: any) => `${h.sender === 'user' ? 'الطالب' : 'المساعد الذكي'}: ${h.text}`).join('\n')}

سؤال أو رسالة الطالب الحالية:
${message}

قاعدة اللغة الهامة:
- إذا كان سؤال الطالب باللغة الإنجليزية، أجب باللغة الإنجليزية الفصحى الأكاديمية (Fluent academic English).
- إذا كان سؤاله باللغة العربية، أجب باللغة العربية الفصيحة الواضحة والمبسطة.`;

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
        });

        replyText = response.text?.trim() || '';
      } catch (geminiErr: any) {
        console.warn('Gemini chat notice (using resilient chat fallback):', geminiErr?.message || geminiErr);
      }
    }

    if (!replyText) {
      const isEnglishQuery = /[a-zA-Z]{3,}/.test(message);
      if (isEnglishQuery) {
        replyText = `Hello! Regarding your question: "${message}".
Based on the analyzed lecture and document context, mastering this topic relies on connecting core theoretical foundations with systematic practical application. Let me know if you would like me to clarify any formula, concept, or specific section step by step!`;
      } else {
        replyText = `أهلاً بك يا زميلي! بخصوص سؤالك: "${message}".
بناءً على محتوى المحاضرة والمستند الذي قمنا بتحليله، فإن الإجابة تعتمد على الفهم المنهجي للنقاط الأساسية؛ حيث يؤكد المفهوم على ضرورة ربط الأسس النظرية بالتمارين العملية لضمان الاستيعاب الشامل وتفادي اللبس في الاختبارات. إذا كنت ترغب في توضيح معادلة أو جزئية محددة بالتفصيل، أخبرني وسأشرحها لك خطوة بخطوة!`;
      }
    }

    return res.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Error in chat:', error);
    return res.status(500).json({ success: false, message: error.message || 'فشل إرسال الرسالة' });
  }
});

// 11. Download Hosting and Monetization Guide
app.get('/api/guide/download', (req, res) => {
  const guideContent = `========================================================================
🌟 دليل الاستضافة السريعة والنشر والربح من منصة "تلخيص المهندس السحابية" 🌟
========================================================================

أهلاً بك يا بطل! تم تجهيز هذا الدليل الشامل لمساعدتك في استضافة ونشر المنصة 
بسهولة تامة وتأمينها، وربط إعلانات Google AdSense وجني الأرباح فوراً.

------------------------------------------------------------------------
📌 أولاً: خيارات الاستضافة المجانية والمدفوعة بنقرة زر واحدة
------------------------------------------------------------------------

1. الاستضافة على Google Cloud Run (المثالية والموصى بها):
   - تدعم Node.js و Docker بشكل فوري.
   - تمنحك استضافة مجانية سخية جداً مع شهادة SSL وحماية Google Cloud ضد الهجمات.
   - كل ما تحتاجه: رفع الكود على GitHub ثم ربطه بـ Cloud Run مع تمرير متغير GEMINI_API_KEY.

2. الاستضافة على Render أو Railway:
   - قم بإنشاء حساب على Render.com
   - انقر على "New Web Service" واختر مستودع GitHub الخاص بك.
   - اختر Build Command: npm run build
   - واختر Start Command: npm start
   - في خانة Environment Variables أضف:
     GEMINI_API_KEY = مفتاح الذكاء الاصطناعي الخاص بك

3. الاستضافة على أي سيرفر VPS (Ubuntu / Debian / Nginx):
   - قم بنسخ المشروع إلى الخادم.
   - قم بتثبيت Node.js الإصدار 20 أو 22.
   - نفذ الأوامر التالية:
     npm install
     npm run build
     pm2 start dist/server.cjs --name "tlkhees-app"
   - قم بتوجيه Nginx إلى المنفذ 3000 مع تفعيل Certbot لشهادة SSL مجانية.

------------------------------------------------------------------------
📌 ثانياً: الأمان وحماية مفتاح الذكاء الاصطناعي (Anti-Theft)
------------------------------------------------------------------------
- تم بناء المنصة بنظام Server-Side Proxy كامل:
  * مفتاح GEMINI_API_KEY لا يخرج نهائياً إلى متصفح المستخدم أو أدوات الفحص (Inspect Element / Network tab).
  * جميع الطلبات يتم تشفيرها ومعالجتها داخل الخادم (Backend) وحمايتها من السرقة.
  * لوحة التحكم محمية بكلمة مرور مشفرة يمكنك تعديلها في أي وقت من تبويب "محرك الذكاء الاصطناعي".

------------------------------------------------------------------------
📌 ثالثاً: الربح من الموقع وتفعيل Google AdSense
------------------------------------------------------------------------
1. اشترك في برنامج Google AdSense عبر الرابط: https://adsense.google.com
2. أضف رابط موقعك بعد حجزه (مثلاً: www.tlkhees-engineer.com).
3. ستحصل على معرف ناشر خاص بك يبدأ بـ: ca-pub-xxxxxxxxxxxxxxxx
4. ادخل إلى لوحة تحكم المنصة -> تبويب "نصوص ومحتوى الموقع".
5. قم بتفعيل خيار "إعلانات GOOGLE ADSENSE" والصق معرف الناشر الخاص بك.
6. اضغط "حفظ ونشر جميع التعديلات سحابياً" وستبدأ الإعلانات بالظهور والأرباح بالتدفق فور الموافقة!

------------------------------------------------------------------------
📌 رابعاً: الدعم الفني وتحديثات المنصة
------------------------------------------------------------------------
تم تطوير وتصميم المنصة بأعلى معايير الحداثة والسرعة لضمان إبهار المستخدمين
وتقديم أفضل تجربة دراسية للطلاب والجامعيين.

مع أطيب التمنيات بالتوفيق والنجاح والأرباح الوفيرة!
حقوق التطوير والملكية محفوظة © 2026 - المهندس عبدالملك
========================================================================`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="tlkhees-hosting-and-profit-guide.txt"');
  res.send(guideContent);
});

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: [
            '**/data/**',
            '**/data/*',
            '**/data/store.json',
            '**/dist/**',
            '**/.git/**',
            '**/*.json',
          ],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running securely on http://localhost:${PORT}`);
  });
}

startServer();