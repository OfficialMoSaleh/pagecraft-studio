/**
 * Full-Scale Editorial Landing Page Engine
 * Supports multi-section websites, interactive product catalogs, multi-tier pricing,
 * image library, smart natural-language prompt extraction, and Gemini AI generation.
 */

export const DESIGN_THEMES = {
  editorial: {
    id: 'editorial',
    name: 'ورقي دافئ',
    fontFamily: "'Cairo', Georgia, serif",
    bgClass: 'bg-[#F8F6F2] text-[#1A1917]',
    textMain: 'text-[#1A1917]',
    textMuted: 'text-[#66635B]',
    borderClass: 'border-[#E5E2DC]',
    surfaceClass: 'bg-[#F1EFEA]',
    cardClass: 'bg-white border border-[#E5E2DC]',
    accentBtn: 'bg-[#1A1917] text-[#F8F6F2] hover:bg-[#33312E]',
    secondaryBtn: 'bg-transparent text-[#1A1917] border border-[#C8C4BC] hover:bg-[#EAE7E0]',
    tagClass: 'text-[#66635B] border-b border-[#C8C4BC]',
    badgeBg: 'bg-[#EAE6DF] text-[#1A1917]',
  },
  minimal: {
    id: 'minimal',
    name: 'أبيض محايد',
    fontFamily: "'Cairo', system-ui, sans-serif",
    bgClass: 'bg-white text-zinc-900',
    textMain: 'text-zinc-900',
    textMuted: 'text-zinc-500',
    borderClass: 'border-zinc-200',
    surfaceClass: 'bg-zinc-50',
    cardClass: 'bg-white border border-zinc-200',
    accentBtn: 'bg-zinc-900 text-white hover:bg-zinc-800',
    secondaryBtn: 'bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50',
    tagClass: 'text-zinc-500 border-b border-zinc-200',
    badgeBg: 'bg-zinc-100 text-zinc-800',
  },
  forest: {
    id: 'forest',
    name: 'أخضر طبيعي',
    fontFamily: "'Cairo', Georgia, serif",
    bgClass: 'bg-[#F4F6F4] text-[#14221A]',
    textMain: 'text-[#14221A]',
    textMuted: 'text-[#4F6156]',
    borderClass: 'border-[#DCE3DD]',
    surfaceClass: 'bg-[#E9EFEA]',
    cardClass: 'bg-white border border-[#DCE3DD]',
    accentBtn: 'bg-[#1B3B2B] text-white hover:bg-[#254D39]',
    secondaryBtn: 'bg-transparent text-[#1B3B2B] border border-[#B8C7BC] hover:bg-[#E2EAE4]',
    tagClass: 'text-[#1B3B2B] border-b border-[#B8C7BC]',
    badgeBg: 'bg-[#DCE7DF] text-[#1B3B2B]',
  },
  charcoal: {
    id: 'charcoal',
    name: 'داكن رسمي',
    fontFamily: "'Cairo', system-ui, sans-serif",
    bgClass: 'bg-[#141413] text-[#F2F0EC]',
    textMain: 'text-[#F2F0EC]',
    textMuted: 'text-[#9A9891]',
    borderClass: 'border-[#262624]',
    surfaceClass: 'bg-[#1C1C1A]',
    cardClass: 'bg-[#1C1C1A] border border-[#2C2C29]',
    accentBtn: 'bg-[#F2F0EC] text-[#141413] hover:bg-[#DBD8D0]',
    secondaryBtn: 'bg-transparent text-[#F2F0EC] border border-[#363633] hover:bg-[#222220]',
    tagClass: 'text-[#9A9891] border-b border-[#363633]',
    badgeBg: 'bg-[#262624] text-[#F2F0EC]',
  },
};

export const IMAGE_LIBRARY = [
  { category: 'عطور وعناية', label: 'زجاجة عطر كلاسيكية', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80' },
  { category: 'عطور وعناية', label: 'مجموعة زيوت طبيعية', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80' },
  { category: 'عطور وعناية', label: 'عطر فاخر داكن', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=80' },
  { category: 'قهوة ومطاعم', label: 'قهوة مختصة وتقطير', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80' },
  { category: 'قهوة ومطاعم', label: 'حبوب بن محمصة', url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1000&q=80' },
  { category: 'قهوة ومطاعم', label: 'مخبوزات وحلويات', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80' },
  { category: 'أزياء ومنتجات', label: 'أزياء عصرية معلقة', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80' },
  { category: 'أزياء ومنتجات', label: 'ساعة وإكسسوارات', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80' },
  { category: 'تقنية ومكاتب', label: 'مساحة عمل هادئة', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80' },
  { category: 'تقنية ومكاتب', label: 'برمجة وتطوير', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80' },
  { category: 'ديكور وعقارات', label: 'تصميم داخلي حديث', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80' },
  { category: 'ديكور وعقارات', label: 'أثاث خشبي طبيعي', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80' },
];

export const PRESET_PROMPTS = [
  {
    title: 'دار عطور وزيوت طبيعية',
    prompt: 'دار عطور محلية باسم "أثر" تعتمد على الزيوت الطبيعية الخالصة وتعتيق الأخشاب العطرية يدوياً بأسعار تبدأ من 340 ج.م وشحن مجاني',
    theme: 'editorial',
  },
  {
    title: 'محمصة قهوة مختصة',
    prompt: 'محمصة قهوة مختصة باسم "صفوة" تقدم محاصيل طازجة محمصة أسبوعياً من إثيوبيا وكولومبيا مع أدوات تحضير V60',
    theme: 'forest',
  },
  {
    title: 'استوديو تصميم وتطوير مواقع',
    prompt: 'استوديو مستقل باسم "مدار" لتصميم الهويات الرقمية وتطوير مواقع وتطبيقات الشركات الناشئة',
    theme: 'minimal',
  },
  {
    title: 'علامة أزياء وملابس كتان',
    prompt: 'براند ملابس وأزياء صيفية من الكتان الطبيعي والقطن المصري بتصاميم مريحة وعصرية للجنسين',
    theme: 'editorial',
  },
  {
    title: 'مكتب تصميم داخلي وديكور',
    prompt: 'مكتب هندسي للتصميم الداخلي وتنفيذ الديكورات الخشبية المودرن وتأثيث المنازل والمكاتب',
    theme: 'charcoal',
  },
];

export const DEFAULT_SECTIONS = {
  announcement: true,
  hero: true,
  heroImage: true,
  stats: true,
  catalog: true,
  features: true,
  process: true,
  pricing: true,
  testimonial: true,
  faq: true,
  orderForm: true,
};

export const DEFAULT_SECTION_ORDER = [
  'hero',
  'stats',
  'catalog',
  'features',
  'process',
  'pricing',
  'testimonial',
  'faq',
  'orderForm',
];

export const DEFAULT_LAYOUTS = {
  hero: 'editorial',
  stats: 'strip',
  catalog: 'grid',
  features: 'columns',
  process: 'cards',
  pricing: 'columns',
  testimonial: 'grid',
};

export const SECTION_LAYOUT_OPTIONS = {
  hero: [
    { id: 'editorial', label: 'مجلة كلاسيكي (صورة بالأسفل)' },
    { id: 'split', label: 'مقسوم يمين ويسار (Split)' },
    { id: 'centered', label: 'مركزي متماثل (Centered)' },
  ],
  stats: [
    { id: 'strip', label: 'شريط أفقي متصل' },
    { id: 'cards', label: 'بطاقات مستقلة' },
    { id: 'minimal', label: 'فواصل خطية بسيطة' },
  ],
  catalog: [
    { id: 'grid', label: 'شبكة بطاقات (3 أعمدة)' },
    { id: 'list', label: 'قائمة أفقية مفصلة (Menu)' },
    { id: 'featured', label: 'عنصر رئيسي بارز + شبكة' },
  ],
  features: [
    { id: 'columns', label: '٣ أعمدة مرقمة' },
    { id: 'rows', label: 'صفوف أفقية تحريرية' },
    { id: 'cards', label: 'بطاقات مؤطرة' },
  ],
  process: [
    { id: 'cards', label: 'بطاقات أفقية' },
    { id: 'timeline', label: 'مسار خطي متسلسل' },
  ],
  pricing: [
    { id: 'columns', label: '٣ بطاقات متجاورة' },
    { id: 'horizontal', label: 'صفوف مقارنة أفقية' },
  ],
  testimonial: [
    { id: 'grid', label: 'شبكة آراء ثنائية' },
    { id: 'editorialQuote', label: 'اقتباس مركزي كبير' },
  ],
};

/**
 * Helper to extract custom details (price, brand name, discount) from user prompt text
 */
function extractPromptDetails(promptText) {
  const result = {
    extractedBrand: null,
    extractedPrice: null,
    extractedDiscount: null,
  };

  // Look for name in quotes: "اسم" or «اسم» or باسم كذا
  const quoteMatch = promptText.match(/["«']([^"»']{2,25})["»']/);
  if (quoteMatch) {
    result.extractedBrand = quoteMatch[1].trim();
  } else {
    const namedMatch = promptText.match(/(?:باسم|إسمه|اسمه)\s+([^\s،,.]{2,15}(?:\s+[^\s،,.]{2,15})?)/);
    if (namedMatch) {
      result.extractedBrand = namedMatch[1].trim();
    }
  }

  // Look for price number
  const priceMatch = promptText.match(/(\d{2,6})\s*(ج\.م|جنيه|ريال|ر\.س|دولار|\$|درهم)/);
  if (priceMatch) {
    result.extractedPrice = `${priceMatch[1]} ${priceMatch[2] === 'جنيه' ? 'ج.م' : priceMatch[2] === 'ريال' ? 'ر.س' : priceMatch[2]}`;
  }

  // Look for discount
  const discountMatch = promptText.match(/خصم\s*(\d{1,2})\s*%/);
  if (discountMatch) {
    result.extractedDiscount = `خصم خاص ${discountMatch[1]}% لفترة محدودة`;
  }

  return result;
}

export function generatePageData(promptText = '', themeKey = 'editorial') {
  const text = promptText.toLowerCase();
  const { extractedBrand, extractedPrice, extractedDiscount } = extractPromptDetails(promptText);

  // Extract core topic (first 2-3 meaningful words) for custom prompts
  const cleanedTopic = promptText
    .replace(/["«'][^"»']*["»']/g, '')
    .replace(/(?:باسم|إسمه|اسمه)\s+\S+/g, '')
    .replace(/\d+\s*(?:ج\.م|جنيه|ريال|ر\.س|دولار|\$|%)/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(' ');
  const topicLabel = cleanedTopic.length > 2 ? cleanedTopic : 'المنتج';
  const baseNumericPrice = extractedPrice ? ( parseInt(extractedPrice.replace(/[^\d]/g, ''), 10) || 350 ) : 350;

  let niche = 'general';
  if (text.includes('عطر') || text.includes('مسك') || text.includes('زيوت') || text.includes('بخور')) {
    niche = 'perfume';
  } else if (text.includes('قهوة') || text.includes('كافيه') || text.includes('بن') || text.includes('محمصة') || text.includes('مخبوزات')) {
    niche = 'coffee';
  } else if (text.includes('ملابس') || text.includes('أزياء') || text.includes('كتان') || text.includes('شنط') || text.includes('موضة')) {
    niche = 'fashion';
  } else if (text.includes('ديكور') || text.includes('أثاث') || text.includes('داخلي') || text.includes('عقار') || text.includes('معماري')) {
    niche = 'interior';
  } else if (text.includes('تصميم') || text.includes('استشار') || text.includes('تطوير') || text.includes('استوديو')) {
    niche = 'studio';
  } else if (text.includes('كورس') || text.includes('تدريب') || text.includes('برمج') || text.includes('هندسة')) {
    niche = 'course';
  }

  const templates = {
    perfume: {
      theme: 'editorial',
      announcement: extractedDiscount || 'التوصيل مجاني لجميع الطلبات فوق 600 ج.م مع عينة تجربة مجانية',
      brandName: extractedBrand || 'أَثَر للعطور',
      category: 'تركيبات عطرية يدوية',
      headline: 'عطور هادئة تُصنع على مهل من أندر الأخشاب والزيوت الطبيعية.',
      subheadline: 'نعتمد في تركيباتنا على التعتيق الطبيعي الطويل دون إضافات صناعية حادة، لنقدم رائحة متزنة تدوم طويلاً وتنسجم مع حضورك اليومي.',
      primaryCta: 'تصفح المجموعة',
      secondaryCta: 'باقات التوفير',
      heroImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
      stats: [
        { value: '+4,200', label: 'زجاجة تم تسليمها' },
        { value: '45 يوماً', label: 'مدة التعتيق الطبيعي' },
        { value: '32%', label: 'تركيز الزيت العطري النقي' },
        { value: '14 يوماً', label: 'ضمان الاسترجاع الكامل' },
      ],
      catalogTitle: 'المجموعة العطرية الحالية',
      catalogSubtitle: 'اختر العطور المناسبة لذوقك وأضفها مباشرة إلى سلة طلبك',
      products: [
        {
          id: 'prod_1',
          name: 'عطر سكون — خشب الصندل والبرغموت',
          category: 'عطور خشبية',
          price: 340,
          oldPrice: 420,
          desc: 'مزيج دافئ من خشب الصندل الهندي مع لمسة منعشة من البرغموت الطبيعي، مناسب للعمل واللقاءات اليومية.',
          image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
          tag: 'الأكثر طلباً',
        },
        {
          id: 'prod_2',
          name: 'عطر مِداد — عود كمبودي وعنبر',
          category: 'عطور شرقية',
          price: 410,
          oldPrice: 490,
          desc: 'تركيبة مسائية عميقة تجمع بين دهن العود المعتق والعنبر الصافي مع نفحات خفيفة من الزعفران.',
          image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
          tag: 'إصدار المساء',
        },
        {
          id: 'prod_3',
          name: 'عطر نَدى — مسك أبيض وزهور القطن',
          category: 'عطور ناعمة',
          price: 290,
          oldPrice: 350,
          desc: 'إحساس بالنقاء والهدوء يدوم طوال اليوم بفضل المسك الأبيض الصافي وخلاصة السوسن.',
          image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
          tag: 'هادئ ومنعش',
        },
      ],
      features: [
        { num: '01', title: 'زيوت عطرية نقية', desc: 'نستورد خلاصات العود والصندل والبرغموت من مصادرها الأصلية بتركيز نقي.' },
        { num: '02', title: 'تعتيق يدوي متأنٍ', desc: 'تُترك كل دفعة لمدة لا تقل عن ستة أسابيع حتى تتجانس النوتات العطرية بهدوء.' },
        { num: '03', title: 'تجربة قبل الاقتناء', desc: 'يصل مع كل زجاجة عينة مخصصة للتجربة، مع إمكانية الاسترجاع الكامل خلال أسبوعين.' },
      ],
      processSteps: [
        { step: '01', title: 'اختيار العطر', desc: 'اختر عطرك المفضل أو مجموعة العينات من القائمة.' },
        { step: '02', title: 'تعبئة وتغليف خاص', desc: 'تُعبأ الزجاجة وتُغلف يدوياً مع كتابة اسمك على البطاقة.' },
        { step: '03', title: 'تجربة العينة أولاً', desc: 'جرّب العينة المرفقة فور استلام الطلب قبل فتح الزجاجة الأساسية.' },
      ],
      pricingTiers: [
        {
          id: 'tier_1',
          name: 'زجاجة مفردة (100 مل)',
          price: extractedPrice || '340 ج.م',
          subtitle: 'مناسبة للتجربة الأولى والاقتناء الشخصي',
          features: ['زجاجة عطر 100 مل من اختيارك', 'عينة خارجية 3 مل للتجربة', 'ضمان استرجاع لمدة 14 يوماً'],
          highlighted: false,
        },
        {
          id: 'tier_2',
          name: 'المجموعة الثنائية (الأكثر توفيراً)',
          price: '620 ج.م',
          subtitle: 'زجاجتان من اختيارك مع شحن مجاني كامل',
          features: ['زجاجتا عطر 100 مل من اختيارك', '٣ عينات مجانية لكامل المجموعة', 'شحن مجاني لجميع المحافظات', 'تغليف إهداء فاخر'],
          highlighted: true,
        },
        {
          id: 'tier_3',
          name: 'صندوق الاقتناء الكامل (3 عطور)',
          price: '880 ج.م',
          subtitle: 'المجموعة الكاملة للصباح والمساء والمناسبات',
          features: ['الثلاثة عطور الكاملة (300 مل إجمالاً)', 'تولة مسك أبيض هدية مجانية', 'شحن سريع ومجاني خلال 24 ساعة'],
          highlighted: false,
        },
      ],
      price: extractedPrice || '340 ج.م',
      oldPrice: '420 ج.م',
      offerTitle: 'المجموعة الأساسية (100 مل)',
      offerSubtitle: 'تشمل الزجاجة الرئيسية + عينة التجربة المنفصلة + التوصيل لباب المنزل.',
      testimonials: [
        { quote: 'رائحة متزنة جداً وراقية، ليست صاخبة أو مزعجة بل هادئة وثابتة طوال اليوم.', author: 'كريم المنشاوي', role: 'القاهرة' },
        { quote: 'فكرة العينة المنفصلة مع العطر ممتازة جداً وتعطي ثقة كبيرة قبل فتح العلبة.', author: 'مريم عبد العزيز', role: 'الإسكندرية' },
        { quote: 'عطر مداد فخم جداً في المناسبات المسائية، والتغليف يصل بشكل أنيق ومحترم.', author: 'يوسف النجار', role: 'المنصورة' },
      ],
      testimonial: {
        quote: 'رائحة متزنة جداً وراقية، ليست صاخبة أو مزعجة بل هادئة وثابتة طوال اليوم.',
        author: 'كريم المنشاوي — القاهرة',
      },
      faqs: [
        { q: 'كيف يمكنني تجربة العطر قبل فتح العبوة؟', a: 'نرفق مع كل طلب عينة خارجية صغيرة لنفس العطر، يمكنك تجربتها ليوم كامل، وإن لم تناسبك يمكنك إرجاع الزجاجة المغلقة واسترداد المبلغ.' },
        { q: 'كم يستغرق التوصيل؟', a: 'يتم التوصيل خلال يومي عمل داخل المدن الرئيسية ومن ثلاثة إلى أربعة أيام لباقي المناطق.' },
        { q: 'هل العطور مناسبة للجنسين؟', a: 'نعم، جميع تركيباتنا مصممة بتوازن بين الأخشاب والحمضيات والمسك لتناسب الرجال والنساء.' },
      ],
      currency: 'ج.م',
      deliveryFee: 45,
      whatsappPhone: '201000000000',
      whatsappMessage: 'مرحباً، أود تأكيد طلبي من أثر للعطور:',
      sections: { ...DEFAULT_SECTIONS },
    },

    coffee: {
      theme: 'forest',
      announcement: extractedDiscount || 'تحميص هذا الأسبوع متاح الآن — الشحن مجاني للطلبات فوق 500 ج.م',
      brandName: extractedBrand || 'مَحْمَصة صَفوة',
      category: 'محاصيل قهوة مختصة',
      headline: 'حبوب بن مختارة بعناية، تُحمص أسبوعياً للحفاظ على قمة نضارتها.',
      subheadline: 'نتعامل مباشرة مع المزارع المستدامة في إثيوبيا وكولومبيا لنقدم محاصيل ذات إيحاءات طبيعية واضحة تناسب القهوة المقطرة والإسبريسو.',
      primaryCta: 'تصفح المحاصيل',
      secondaryCta: 'باقات الاشتراك',
      heroImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85',
      stats: [
        { value: '+88', label: 'تقييم جودة المحاصيل (SCA)' },
        { value: '48 ساعة', label: 'من التحميص إلى باب بيتك' },
        { value: '6 مزارع', label: 'مصادر فردية موثقة' },
        { value: '100%', label: 'أرابيكا مختصة نقية' },
      ],
      catalogTitle: 'محاصيل الأسبوع الطازجة',
      catalogSubtitle: 'تُحمص الدفعات بكميات محدودة وتُطحن حسب أداة التحضير الخاصة بك',
      products: [
        {
          id: 'cof_1',
          name: 'إثيوبيا ييرغاشيف (250 جم)',
          category: 'معالجة مجففة',
          price: 260,
          oldPrice: 295,
          desc: 'إيحاءات فاكهية واضحة من التوت الأزرق والياسمين مع قوام متوسط، مثالية للتقطير V60 وكيمكس.',
          image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
          tag: 'مفضل للتقطير',
        },
        {
          id: 'cof_2',
          name: 'كولومبيا سوبريمو (250 جم)',
          category: 'معالجة مغسولة',
          price: 240,
          oldPrice: 270,
          desc: 'توازن كلاسيكي غني بإيحاءات الكراميل والشوكولاتة الداكنة والبندق، رائع للإسبريسو ومشروبات الحليب.',
          image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
          tag: 'مثالي للإسبريسو',
        },
        {
          id: 'cof_3',
          name: 'غواتيمالا أنتيغوا (250 جم)',
          category: 'حمص متوسط',
          price: 255,
          oldPrice: 280,
          desc: 'حلاوة متوازنة مع لمسات من الكاكاو والتفاح الأخضر، يناسب جميع أدوات التحضير اليومية.',
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
          tag: 'متوازن يومي',
        },
      ],
      features: [
        { num: '01', title: 'تحميص حديث أسبوعياً', desc: 'نقوم بتحميص الدفعات يومي الأحد والأربعاء لضمان وصول البن في أفضل حالة.' },
        { num: '02', title: 'مصادر فردية موثقة', desc: 'كل عبوة تحمل تفاصيل المزرعة، السلالة، الارتفاع، وطريقة المعالجة بدقة.' },
        { num: '03', title: 'درجة طحن حسب أسلوبك', desc: 'تتوفر الحبوب كاملة أو مطحونة خصيصاً لأدوات التقطير V60 أو الكيمكس أو الإسبريسو.' },
      ],
      processSteps: [
        { step: '01', title: 'انتقاء الحبوب الخضراء', desc: 'نختبر عينات الحصاد الجديد ونختار المحاصيل الأعلى تقييماً.' },
        { step: '02', title: 'التحميص المتوازن', desc: 'نضبط مسار الحرارة لإبراز الحلاوة الطبيعية لكل محصول دون مرارة.' },
        { step: '03', title: 'التعبئة بصمام حفظ النضارة', desc: 'تُعبأ الحبوب فور تبريدها في أكياس محكمة تحفظ الزيوت العطرية.' },
      ],
      pricingTiers: [
        {
          id: 'c_tier_1',
          name: 'عبوة مفردة (250 جم)',
          price: extractedPrice || '260 ج.م',
          subtitle: 'لتجربة محصول واحد من اختيارك',
          features: ['250 جم بن مختص حديث التحميص', 'اختيار الحبوب كاملة أو مطحونة', 'دليل مقترح لوصفة التحضير'],
          highlighted: false,
        },
        {
          id: 'c_tier_2',
          name: 'صندوق المحاصيل الثلاثية (750 جم)',
          price: '690 ج.م',
          subtitle: 'ثلاثة محاصيل متنوعة (إثيوبي + كولومبي + غواتيمالي)',
          features: ['3 عبوات × 250 جم (تكفي أكثر من 45 كوباً)', 'فلاتر V60 ورقية هدية مجانية', 'شحن مجاني لباب المنزل'],
          highlighted: true,
        },
        {
          id: 'c_tier_3',
          name: 'باقة المكتب والعائلة (1.5 كجم)',
          price: '1,290 ج.م',
          subtitle: 'توفير 20% للاستهلاك الشهري المستمر',
          features: ['6 عبوات من اختيارك (1.5 كجم)', 'شحن مجاني سريع', 'أولوية في محاصيل الإصدار المحدود'],
          highlighted: false,
        },
      ],
      price: extractedPrice || '690 ج.م',
      oldPrice: '755 ج.م',
      offerTitle: 'صندوق المحاصيل الثلاثية (750 جم)',
      offerSubtitle: 'ثلاث عبوات مختلفة (250 جم لكل محصول) لتجربة إيحاءات متنوعة.',
      testimonials: [
        { quote: 'نظافة المحصول ووضوح النكهات في التقطير ممتازة جداً، والتغليف يحفظ الرائحة لأطول فترة.', author: 'سارة عبد الرحمن', role: 'الإسكندرية' },
        { quote: 'المحصول الإثيوبي من أفضل ما جربت هذا العام، تاريخ التحميص كان قبل استلامي بيومين فقط.', author: 'طارق علام', role: 'القاهرة' },
      ],
      testimonial: {
        quote: 'نظافة المحصول ووضوح النكهات في التقطير ممتازة جداً، والتغليف يحفظ الرائحة لأطول فترة.',
        author: 'سارة عبد الرحمن — الإسكندرية',
      },
      faqs: [
        { q: 'هل يُفضل طلب الحبوب كاملة أم مطحونة؟', a: 'ننصح بطلب الحبوب كاملة إذا كان لديك مطحنة منزلية للحفاظ على الزيوت العطرية، كما نوفر طحناً دقيقاً حسب أداة التحضير عند الطلب.' },
        { q: 'متى يُشحن الطلب بعد التحميص؟', a: 'يُشحن الطلب في اليوم التالي للتحميص مباشرة مع صمام خاص لتفريغ الغازات بأمان.' },
      ],
      currency: 'ج.م',
      deliveryFee: 40,
      whatsappPhone: '201000000000',
      whatsappMessage: 'مرحباً، أود طلب المحاصيل التالية من محمصة صفوة:',
      sections: { ...DEFAULT_SECTIONS },
    },

    fashion: {
      theme: 'editorial',
      announcement: extractedDiscount || 'تشكيلة الكتان الطبيعي متوفرة الآن — استبدال المقاسات مجاناً',
      brandName: extractedBrand || 'نَسِيج للأزياء',
      category: 'ملابس كتان وقطن طبيعي',
      headline: 'تصاميم مريحة من الكتان الطبيعي والقطن الخالص تدوم معك مواسم طويلة.',
      subheadline: 'نبتعد عن الأقمشة الصناعية لنقدم قطعاً أساسية بقصات مدروسة وخياطة متقنة تمنحك الراحة والأناقة في الاستخدام اليومي.',
      primaryCta: 'تصفح التشكيلة',
      secondaryCta: 'جدول المقاسات',
      heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85',
      stats: [
        { value: '100%', label: 'ألياف طبيعية (كتان وقطن)' },
        { value: 'مجاني', label: 'استبدال المقاس خلال 14 يوماً' },
        { value: '+3,500', label: 'عميل دائم' },
        { value: 'محلي', label: 'حياكة وتشطيب يدوي دقيق' },
      ],
      catalogTitle: 'القطع الأساسية المتوفرة',
      catalogSubtitle: 'اختر القطع والمقاسات المناسبة وأضفها لطلبك مباشرة',
      products: [
        {
          id: 'fash_1',
          name: 'قميص كتان طبيعي — بيج رملي',
          category: 'قمصان',
          price: 680,
          oldPrice: 820,
          desc: 'منسوج من الكتان المعالج المغسول مسبقاً لمنع الانكماش ومنح ملمس ناعم ومريح طوال اليوم.',
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
          tag: 'كتان 100%',
        },
        {
          id: 'fash_2',
          name: 'بنطلون كتان بقصة مريحة — زيتي داكن',
          category: 'بناطيل',
          price: 740,
          oldPrice: 890,
          desc: 'قصة مستقيمة مريحة مع خصر مرن خفي، يناسب الإطلالات الكاجوال والرسمية الهادئة.',
          image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
          tag: 'قصة مريحة',
        },
        {
          id: 'fash_3',
          name: 'تيشيرت قطن مصري ثقيل — أبيض عاجي',
          category: 'أساسيات',
          price: 390,
          oldPrice: 450,
          desc: 'قطن مصري طويل التيلة بوزن 240 جم، يحافظ على تماسك ياقته ولونه بعد الغسيل المتكرر.',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
          tag: 'قطن طويل التيلة',
        },
      ],
      features: [
        { num: '01', title: 'أقمشة تتنفس طبيعياً', desc: 'نستخدم الكتان والقطن الطبيعي غير المخلوط بالبوليستر لضمان أقصى درجات الراحة.' },
        { num: '02', title: 'معالجة ضد الانكماش', desc: 'تُغسل جميع الأقمشة وتُعالج حرارياً قبل القص لضمان ثبات المقاس بعد الغسيل.' },
        { num: '03', title: 'قياس وتبديل مرن', desc: 'يمكنك معاينة القطعة عند الاستلام، أو طلب استبدال المقاس مجاناً بكل سهولة.' },
      ],
      processSteps: [
        { step: '01', title: 'اختيار القطع والمقاس', desc: 'حدد القطع المطلوبة واكتب مقاسك المعتاد في نموذج الطلب.' },
        { step: '02', title: 'تأكيد المقاس هاتفياً', desc: 'يتواصل معك فريقنا لمراجعة القياسات بالسنتيمتر لضمان الدقة.' },
        { step: '03', title: 'التوصيل والمعاينة', desc: 'يصلك الطلب خلال 48 ساعة مع إمكانية المعاينة قبل الاستلام.' },
      ],
      pricingTiers: [
        {
          id: 'f_tier_1',
          name: 'قطعة منفردة',
          price: extractedPrice || '680 ج.م',
          subtitle: 'أي قميص أو بنطلون من التشكيلة',
          features: ['كتان طبيعي 100% معالج', 'معاينة الطلب عند الاستلام', 'استبدال مقاس مجاني'],
          highlighted: false,
        },
        {
          id: 'f_tier_2',
          name: 'الطقم الكامل (قميص + بنطلون)',
          price: '1,280 ج.م',
          subtitle: 'وفر 140 ج.م عند طلب الطقم المتناسق',
          features: ['قميص كتان + بنطلون كتان من اختيارك', 'شحن مجاني لجميع المحافظات', 'أولوية التبديل والاسترجاع'],
          highlighted: true,
        },
        {
          id: 'f_tier_3',
          name: 'مجموعة الصيف (3 قطع)',
          price: '1,590 ج.م',
          subtitle: 'قميص + بنطلون + تيشيرت قطن مصري',
          features: ['ثلاث قطع أساسية متكاملة', 'شحن مجاني سريع', 'حقيبة قماشية لحفظ الملابس'],
          highlighted: false,
        },
      ],
      price: extractedPrice || '1,280 ج.م',
      oldPrice: '1,420 ج.م',
      offerTitle: 'باقة الطقم الكامل (قميص + بنطلون)',
      offerSubtitle: 'اختر الألوان والمقاسات المفضلة لك مع شحن مجاني ومعاينة عند الاستلام.',
      testimonials: [
        { quote: 'خامة الكتان باردة ومريحة جداً، والمقاس مضبوط تماماً كما في الجدول.', author: 'رامي حسن', role: 'القاهرة' },
        { quote: 'تشطيب الخياطة والأزرار الخشبية يعطي القطعة مظهراً فخماً جداً مقارنة بالسعر.', author: 'نهى كامل', role: 'الجيزة' },
      ],
      testimonial: {
        quote: 'خامة الكتان باردة ومريحة جداً، والمقاس مضبوط تماماً كما في الجدول.',
        author: 'رامي حسن — القاهرة',
      },
      faqs: [
        { q: 'كيف أعرف مقاسي المضبوط؟', a: 'بمجرد تسجيل طلبك، يتواصل معك فريقنا لتأكيد الطول والوزن وترشيح المقاس الأنسب لك بدقة.' },
        { q: 'هل يتوفر الاستبدال إذا لم يناسبني المقاس؟', a: 'بالتأكيد، نوفر استبدالاً مجانياً للمقاس خلال 14 يوماً من الاستلام.' },
      ],
      currency: 'ج.م',
      deliveryFee: 50,
      whatsappPhone: '201000000000',
      whatsappMessage: 'مرحباً، أود طلب القطع التالية من نسيج للأزياء:',
      sections: { ...DEFAULT_SECTIONS },
    },

    interior: {
      theme: 'charcoal',
      announcement: 'نستقبل حجوزات المعاينة الهندسية وتصميم الفراغات السكنية والتجارية لهذا الشهر',
      brandName: extractedBrand || 'تَكْوين للتصميم الداخلي',
      category: 'عمارة داخلية وتأثيث مساحات',
      headline: 'نصمم مساحات داخلية هادئة تجمع بين الوظيفة العملية والجمال المعماري.',
      subheadline: 'نحول الشقق السكنية والمكاتب إلى بيئات مريحة ومدروسة الإضاءة والخامات، مع إشراف هندسي دقيق من المخطط الأول وحتى وضع آخر قطعة أثاث.',
      primaryCta: 'احجز معاينة هندسية',
      secondaryCta: 'أعمالنا المنفذة',
      heroImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
      stats: [
        { value: '+85', label: 'مشروعاً سكنياً وتجارياً منفذاً' },
        { value: '100%', label: 'التزام بالميزانية المتفق عليها' },
        { value: '3D', label: 'معاينة واقعية قبل التنفيذ' },
        { value: '5 سنوات', label: 'ضمان على أعمال التأسيس' },
      ],
      catalogTitle: 'خدماتنا ووحدات الأثاث المخصصة',
      catalogSubtitle: 'اختر الخدمة أو الوحدة المطلوبة لإضافتها إلى طلب المعاينة والتسعير',
      products: [
        {
          id: 'int_1',
          name: 'تصميم ثلاثي الأبعاد لغرفة المعيشة',
          category: 'تصميم 3D',
          price: 4500,
          oldPrice: 5500,
          desc: 'يشمل توزيع الأثاث، دراسة الإضاءة، اختيار الألوان والخامات، ومخططات التنفيذ التفصيلية.',
          image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
          tag: 'شامل المخططات',
        },
        {
          id: 'int_2',
          name: 'طاولة طعام خشب بلوط طبيعي (6 أفراد)',
          category: 'أثاث مصنع يدوياً',
          price: 14800,
          oldPrice: 17000,
          desc: 'مصنوعة بالكامل من خشب البلوط الطبيعي المعالج بزيوت حماية تحفظ ملمس الخشب الطبيعي.',
          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
          tag: 'خشب طبيعي',
        },
        {
          id: 'int_3',
          name: 'باقة استشارة وتنسيق ألوان وإضاءة',
          category: 'استشارات',
          price: 1800,
          oldPrice: 2500,
          desc: 'جلسة هندسية لمراجعة مساحتك الحالية واقتراح تعديلات الإضاءة والفرش والألوان.',
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
          tag: 'زيارة أو أونلاين',
        },
      ],
      features: [
        { num: '01', title: 'مخططات تنفيذية دقيقة', desc: 'تستلم رسومات هندسية واضحة للكهرباء والسباكة والنجارة تمنع أي أخطاء أثناء التنفيذ.' },
        { num: '02', title: 'شفافية في التكلفة', desc: 'نقدم جدول كميات ومواصفات (BOQ) مفصلاً بكل بند قبل البدء لضبط الميزانية.' },
        { num: '03', title: 'إشراف وتنفيذ متكامل', desc: 'فريقنا الهندسي يتولى متابعة الصناع والموردين لضمان جودة التشطيب في الموعد المحدد.' },
      ],
      processSteps: [
        { step: '01', title: 'المعاينة ورفع المقاسات', desc: 'زيارة الموقع لرفع المساحات بدقة وفهم احتياجات الأسرة.' },
        { step: '02', title: 'التصميم المعماري 3D', desc: 'تقديم تصور واقعي كامل للمساحة وتعديله حتى رضاك التام.' },
        { step: '03', title: 'التنفيذ والتسليم', desc: 'إدارة كافة مراحل التشطيب والفرش وفق الجدول الزمني.' },
      ],
      pricingTiers: [
        {
          id: 'i_tier_1',
          name: 'باقة التصميم المعماري (للمتر)',
          price: extractedPrice || '250 ج.م / م²',
          subtitle: 'للتصميم الثلاثي الأبعاد والمخططات الهندسية',
          features: ['توزيع الفرش المعماري 2D', 'لقطات ثلاثية الأبعاد 3D واقعية', 'مخططات الكهرباء والإضاءة والأسقف'],
          highlighted: false,
        },
        {
          id: 'i_tier_2',
          name: 'باقة التصميم والإشراف الكامل',
          price: '450 ج.م / م²',
          subtitle: 'الحل المتكامل من التصميم حتى تسليم المفتاح',
          features: ['كافة مميزات باقة التصميم 3D', 'جدول كميات وميزانية تفصيلية', 'إشراف هندسي كامل على التنفيذ', 'خصم خاص لدى معارض الأثاث والإضاءة'],
          highlighted: true,
        },
        {
          id: 'i_tier_3',
          name: 'استشارة تأثيث وفرش سريع',
          price: '3,500 ج.م',
          subtitle: 'للشقق المشطبة التي تحتاج لتنسيق الفرش والألوان',
          features: ['زيارة ميدانية للموقع', 'قائمة مشتريات محددة بالأسعار والأماكن', 'تنسيق الإضاءة والستائر والسجاد'],
          highlighted: false,
        },
      ],
      price: extractedPrice || '250 ج.م / م²',
      oldPrice: '',
      offerTitle: 'باقة التصميم المعماري المتكامل',
      offerSubtitle: 'احجز معاينة أولية لمناقشة تفاصيل وحدتك السكنية أو مكتبك.',
      testimonials: [
        { quote: 'التصميم الثلاثي الأبعاد طابق الواقع بنسبة 100%، ووفر علينا الكثير من التعديلات المكلفة أثناء التشطيب.', author: 'م. وائل درويش', role: 'التجمع الخامس' },
      ],
      testimonial: {
        quote: 'التصميم الثلاثي الأبعاد طابق الواقع بنسبة 100%، ووفر علينا الكثير من التعديلات المكلفة أثناء التشطيب.',
        author: 'م. وائل درويش — التجمع الخامس',
      },
      faqs: [
        { q: 'هل يمكن تنفيذ التصميم على مراحل حسب الميزانية؟', a: 'نعم، نضع لك خطة تنفيذية مقسمة لمراحل واضحة لتتمكن من التنفيذ بالسرعة التي تناسب ميزانيتك.' },
        { q: 'ما المناطق التي تغطونها في المعاينة والتنفيذ؟', a: 'نغطي القاهرة الكبرى والإسكندرية في التنفيذ المباشر، ونقدم خدمات التصميم والمخططات لكافة المحافظات ودول الخليج.' },
      ],
      currency: 'ج.م',
      deliveryFee: 0,
      whatsappPhone: '201000000000',
      whatsappMessage: 'مرحباً، أود حجز معاينة أو استشارة تصميم داخلي:',
      sections: { ...DEFAULT_SECTIONS },
    },

    studio: {
      theme: 'minimal',
      announcement: 'متاحون لاستقبال مشروعين جديدين فقط خلال هذا الشهر لضمان أعلى جودة تنفيذ',
      brandName: extractedBrand || 'مَدار للاستشارات والتصميم',
      category: 'تصميم وتطوير منتجات رقمية',
      headline: 'نساعد الشركات الناشئة على بناء منتجات رقمية واضحة وسريعة.',
      subheadline: 'نركز على جوهر المنتج وتجربة المستخدم الفعلية بعيداً عن التعقيد البصري، لنحول فكرتك إلى واجهة عملية قابلة للنمو.',
      primaryCta: 'استعرض خدماتنا',
      secondaryCta: 'باقات العمل',
      heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
      stats: [
        { value: '+45', label: 'مشروعاً رقمياً تم إطلاقه' },
        { value: '14 يوماً', label: 'متوسط مدة تسليم الواجهات' },
        { value: '99%', label: 'نسبة الأداء والسرعة (Lighthouse)' },
        { value: '30 يوماً', label: 'دعم فني مجاني بعد الإطلاق' },
      ],
      catalogTitle: 'الخدمات الرقمية المتاحة للطلب',
      catalogSubtitle: 'يمكنك اختيار خدمة محددة أو دمج أكثر من خدمة في طلب واحد',
      products: [
        {
          id: 'st_1',
          name: 'تصميم وتطوير صفحة هبوط تعريفية',
          category: 'مواقع ويب',
          price: 250,
          oldPrice: 350,
          desc: 'صفحة متكاملة متجاوبة مع الجوال، مصممة لرفع معدل تحويل الزوار إلى عملاء مع ربط مباشر بواتساب.',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          tag: 'تسليم خلال 5 أيام',
        },
        {
          id: 'st_2',
          name: 'تصميم تجربة وواجهات تطبيق (UI/UX)',
          category: 'تصميم Figma',
          price: 450,
          oldPrice: 600,
          desc: 'تصميم شاشات التطبيق بالكامل على Figma مع نظام تصميم (Design System) ونموذج تفاعلي قابل للتجربة.',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
          tag: 'شامل النموذج التفاعلي',
        },
        {
          id: 'st_3',
          name: 'بناء منصة ويب متكاملة (Full-Stack MVP)',
          category: 'تطوير شامل',
          price: 950,
          oldPrice: 1200,
          desc: 'برمجة الواجهة الأمامية والخلفية وقواعد البيانات مع لوحة تحكم متكاملة جاهزة لاستقبال المستخدمين.',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
          tag: 'تسليم مفتاح',
        },
      ],
      features: [
        { num: '01', title: 'وضوح التجربة أولاً', desc: 'نبني هيكل الصفحات ومسار المستخدم بناءً على سلوك العملاء الحقيقي وليس الافتراضات.' },
        { num: '02', title: 'تنفيذ هندسي متقن', desc: 'كود نظيف وسريع الاستجابة يضمن أداءً عالياً على جميع الشاشات والأجهزة.' },
        { num: '03', title: 'تسليم منظم ومباشر', desc: 'جدول زمني واضح ومحدد من اليوم الأول وحتى إطلاق النسخة الأولى للمستخدمين.' },
      ],
      processSteps: [
        { step: '01', title: 'جلسة الفهم والتخطيط', desc: 'تحديد أهداف المشروع والجمهور المستهدف وهيكل الصفحات.' },
        { step: '02', title: 'التصميم البصري والمراجعة', desc: 'بناء الواجهات ومشاركتها معك لإجراء أي تعديلات مطلوبة.' },
        { step: '03', title: 'البرمجة والإطلاق', desc: 'تحويل التصميم إلى كود حي ورفعه على النطاق الخاص بك.' },
      ],
      pricingTiers: [
        {
          id: 's_tier_1',
          name: 'باقة صفحة الهبوط السريعة',
          price: extractedPrice || '$250',
          subtitle: 'لإطلاق منتج جديد أو حملة إعلانية مركزة',
          features: ['تصميم مخصص متجاوب مع الجوال', 'كتابة وتحسين النصوص التسويقية', 'ربط نماذج الطلب وواتساب', 'تسليم خلال 5 أيام عمل'],
          highlighted: false,
        },
        {
          id: 's_tier_2',
          name: 'باقة موقع الشركة المتكامل',
          price: '$550',
          subtitle: 'حتى 6 صفحات مع لوحة تحكم سهلة للمحتوى',
          features: ['تصميم هوية رقمية متكاملة للموقع', 'تهيئة كاملة لمحركات البحث (SEO)', 'سرعة تحميل فائقة وحماية كاملة', 'دعم فني مجاني لمدة شهر'],
          highlighted: true,
        },
        {
          id: 's_tier_3',
          name: 'باقة المنتج الرقمي (MVP)',
          price: '$950',
          subtitle: 'للشركات الناشئة والتطبيقات التفاعلية',
          features: ['تصميم UI/UX كامل على Figma', 'تطوير Front-end و Back-end', 'ربط بوابات الدفع وقواعد البيانات'],
          highlighted: false,
        },
      ],
      price: extractedPrice || '$450',
      oldPrice: '',
      offerTitle: 'باقة تصميم وتطوير الواجهة الكاملة',
      offerSubtitle: 'تشمل دراسة التجربة، التصميم على Figma، والتكويد الكامل الجاهز للنشر.',
      testimonials: [
        { quote: 'التعامل مع الفريق كان منظماً وهادئاً، التزموا بالموعد المحدد وخرج الموقع بأبسط وأفضل صورة ممكنة.', author: 'أحمد شريف', role: 'شريك مؤسس' },
      ],
      testimonial: {
        quote: 'التعامل مع الفريق كان منظماً وهادئاً، التزموا بالموعد المحدد وخرج الموقع بأبسط وأفضل صورة ممكنة.',
        author: 'أحمد شريف — شريك مؤسس',
      },
      faqs: [
        { q: 'كم تستغرق دورة العمل الكاملة؟', a: 'تستغرق معظم المشاريع ما بين أسبوع إلى ثلاثة أسابيع، مقسمة إلى مرحلة التخطيط والتصميم ثم مرحلة التطوير والاختبار.' },
        { q: 'هل أستلم الملفات المصدرية بالكامل؟', a: 'نعم، تنتقل إليك ملكية ملفات التصميم ومستودع الكود البرمجي بالكامل فور انتهاء المشروع.' },
      ],
      currency: '$',
      deliveryFee: 0,
      whatsappPhone: '201000000000',
      whatsappMessage: 'مرحباً، أرغب في طلب الخدمات التالية من استوديو مدار:',
      sections: { ...DEFAULT_SECTIONS },
    },

    course: {
      theme: 'charcoal',
      announcement: 'باب التسجيل مفتوح الآن للدفعة الجديدة — المتبقي 4 مقاعد فقط',
      brandName: extractedBrand || 'مَعهد البناء البرمجي',
      category: 'برنامج تطبيقي متقدم',
      headline: 'إتقان هندسة البرمجيات وبناء الأنظمة من خلال التطبيق الفعلي.',
      subheadline: 'ورشة عمل مكثفة تمتد لستة أسابيع، نركز فيها على كتابة كود نظيف، فهم المعمارية البرمجية، وبناء مشروع متكامل جاهز للإنتاج.',
      primaryCta: 'محاور البرنامج',
      secondaryCta: 'خيارات التسجيل',
      heroImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=85',
      stats: [
        { value: '6 أسابيع', label: 'تدريب تطبيقي مكثف' },
        { value: '15 مشاركاً', label: 'الحد الأقصى لكل مجموعة' },
        { value: '+320', label: 'مهندساً تخرجوا من البرنامج' },
        { value: '1-on-1', label: 'مراجعة فردية للكود أسبوعياً' },
      ],
      catalogTitle: 'المسارات والورش المتاحة',
      catalogSubtitle: 'اختر المسار المناسب لمستواك الحالي وأضفه لطلب التسجيل',
      products: [
        {
          id: 'crs_1',
          name: 'معسكر هندسة الواجهات الحديثة (React & Architecture)',
          category: '6 أسابيع',
          price: 1400,
          oldPrice: 1800,
          desc: 'إتقان إدارة الحالة، الأداء، الاختبارات الأوتوماتيكية، وبناء تطبيقات قابلة للتوسع.',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
          tag: 'الدفعة القادمة',
        },
        {
          id: 'crs_2',
          name: 'ورشة تصميم الأنظمة والخلفية (Backend & System Design)',
          category: '4 أسابيع',
          price: 1200,
          oldPrice: 1500,
          desc: 'بناء واجهات برمجية مؤمنة، تصميم قواعد البيانات، والتعامل مع الضغط العالي.',
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
          tag: 'مستوى متقدم',
        },
        {
          id: 'crs_3',
          name: 'جلسة مراجعة السيرة الذاتية والتحضير للمقابلات التقنية',
          category: 'جلسة فردية',
          price: 450,
          oldPrice: 600,
          desc: 'مقابلة تجريبية كاملة لمدة 60 دقيقة مع تقرير مفصل بنقاط القوة والتحسين في مشاريعك.',
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
          tag: 'مقابلة 1-on-1',
        },
      ],
      features: [
        { num: '01', title: 'مراجعة فردية للكود', desc: 'جلسات نقاش أسبوعية لمراجعة الكود الخاص بك وتحسين طريقة تفكيرك الهندسي.' },
        { num: '02', title: 'بناء نظام متكامل', desc: 'العمل على مشروع واحد عميق يشمل الواجهة، الخلفية، قواعد البيانات، والاختبارات.' },
        { num: '03', title: 'مجموعات صغيرة ومحدودة', desc: 'نقبل 15 مشاركاً فقط في كل دفعة لضمان التركيز وجودة المتابعة لكل فرد.' },
      ],
      processSteps: [
        { step: '01', title: 'التسجيل وتحديد المستوى', desc: 'اختيار المسار المناسب واستلام خطة التحضير الأولية.' },
        { step: '02', title: 'التطبيق الأسبوعي المباشر', desc: 'لقاءات تفاعلية ومهام برمجية عملية يتم تصحيحها فردياً.' },
        { step: '03', title: 'مناقشة مشروع التخرج', desc: 'نشر مشروعك النهائي على الإنترنت وتجهيزه للعرض في سيرتك الذاتية.' },
      ],
      pricingTiers: [
        {
          id: 'cr_tier_1',
          name: 'الحضور المسجل والمحتوى الكامل',
          price: '850 ج.م',
          subtitle: 'للتعلم الذاتي بالسرعة التي تناسبك',
          features: ['الوصول الكامل لجميع المحاضرات المسجلة', 'الملفات المصدرية والمشاريع المرجعية', 'دخول مجتمع النقاش البرمجي'],
          highlighted: false,
        },
        {
          id: 'cr_tier_2',
          name: 'البرنامج التفاعلي المباشر (الأكثر طلباً)',
          price: extractedPrice || '1,400 ج.م',
          subtitle: 'حضور مباشر + مراجعة أسبوعية للكود',
          features: ['حضور كافة اللقاءات الأسبوعية المباشرة', 'مراجعة فردية للكود (Code Review)', 'بناء ومناقشة مشروع التخرج', 'شهادة إتمام موثقة'],
          highlighted: true,
        },
        {
          id: 'cr_tier_3',
          name: 'باقة التوجيه الفردي المكثف',
          price: '2,200 ج.م',
          subtitle: 'البرنامج المباشر + 4 جلسات توجيه فردية خاصة',
          features: ['جميع مميزات البرنامج المباشر', '4 جلسات فردية خاصة (1-on-1)', 'مراجعة وتجهيز الـ CV وحساب GitHub'],
          highlighted: false,
        },
      ],
      price: extractedPrice || '1,400 ج.م',
      oldPrice: '',
      offerTitle: 'الاشتراك الكامل في البرنامج (6 أسابيع)',
      offerSubtitle: 'يشمل اللقاءات الأسبوعية المباشرة، مراجعة المشاريع، والوصول الدائم للمحتوى.',
      testimonials: [
        { quote: 'أكثر تجربة تعليمية غيرت نظرتي لكتابة الكود وتنظيم المشاريع بشكل احترافي بعيداً عن الحشو.', author: 'عمر ياسين', role: 'مطور واجهات' },
      ],
      testimonial: {
        quote: 'أكثر تجربة تعليمية غيرت نظرتي لكتابة الكود وتنظيم المشاريع بشكل احترافي بعيداً عن الحشو.',
        author: 'عمر ياسين — مطور واجهات',
      },
      faqs: [
        { q: 'ما المستوى المطلوب للالتحاق بالبرنامج؟', a: 'يُشترط الإلمام بأساسيات لغة JavaScript ومبادئ HTML/CSS، حيث يركز البرنامج على البناء المتقدم والهيكلة.' },
        { q: 'مواعيد اللقاءات الأسبوعية؟', a: 'تُعقد اللقاءات المسائية يومي السبت والثلاثاء من كل أسبوع، وتُحفظ التسجيلات للمراجعة في أي وقت.' },
      ],
      currency: 'ج.م',
      deliveryFee: 0,
      whatsappPhone: '201000000000',
      whatsappMessage: 'مرحباً، أود التسجيل في المسارات التالية:',
      sections: { ...DEFAULT_SECTIONS },
    },

    general: {
      theme: themeKey || 'editorial',
      announcement: extractedDiscount || 'نرحب بطلباتكم واستفساراتكم طوال أيام الأسبوع — توصيل سريع لكافة المناطق',
      brandName: extractedBrand || topicLabel,
      category: topicLabel,
      headline: promptText.length > 5 ? promptText : 'جودة حقيقية وتفاصيل مصممة بعناية لتلبي احتياجك اليومي.',
      subheadline: `نحرص في ${extractedBrand || topicLabel} على تقديم أعلى معايير الإتقان والاعتمادية، مع اهتمام كامل بكل تفصيلة من البداية وحتى وصول الطلب إليك.`,
      primaryCta: 'استعرض المعروضات',
      secondaryCta: 'الباقات والأسعار',
      heroImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85',
      stats: [
        { value: '+1,500', label: 'عميل يثق بنا' },
        { value: '24-48 ساعة', label: 'سرعة التجهيز والتوصيل' },
        { value: '100%', label: 'ضمان الجودة والاستبدال' },
        { value: '4.9 / 5', label: 'تقييم رضا العملاء' },
      ],
      catalogTitle: `قائمة معروضات ${extractedBrand || topicLabel}`,
      catalogSubtitle: 'اختر ما يناسبك من القائمة وأضفه مباشرة إلى نموذج الطلب',
      products: [
        {
          id: 'gen_1',
          name: `${topicLabel} — الإصدار الأساسي`,
          category: 'الأكثر طلباً',
          price: baseNumericPrice,
          oldPrice: Math.round(baseNumericPrice * 1.2),
          desc: 'مصمم بعناية فائقة ليقدم أفضل أداء وجودة ممكنة للاستخدام اليومي المستمر.',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
          tag: 'متوفر الآن',
        },
        {
          id: 'gen_2',
          name: `${topicLabel} — الإصدار المتقدم`,
          category: 'مميز',
          price: Math.round(baseNumericPrice * 1.45),
          oldPrice: Math.round(baseNumericPrice * 1.7),
          desc: 'يجمع بين الخامات المختارة والتفاصيل الإضافية التي تمنحك تجربة متكاملة.',
          image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
          tag: 'جودة عالية',
        },
        {
          id: 'gen_3',
          name: `${topicLabel} — المجموعة المتكاملة`,
          category: 'باقة شاملة',
          price: Math.round(baseNumericPrice * 2.1),
          oldPrice: Math.round(baseNumericPrice * 2.5),
          desc: 'الحل الشامل الذي يضم كافة الملحقات والمزايا في باقة واحدة موفرة.',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
          tag: 'أفضل قيمة',
        },
      ],
      features: [
        { num: '01', title: 'خامات ومعايير مختارة', desc: 'ننتقي أفضل المكونات والأساليب لضمان تقديم قيمة حقيقية تدوم طويلاً.' },
        { num: '02', title: 'وضوح والتزام في المواعيد', desc: 'خطوات طلب واضحة ومباشرة مع التزام تام بمواعيد التسليم المحددة.' },
        { num: '03', title: 'تواصل مباشر وسريع', desc: 'نسعد دائماً بالرد على كافة الاستفسارات ومتابعة طلبك خطوة بخطوة.' },
      ],
      processSteps: [
        { step: '01', title: 'تحديد الاختيارات', desc: 'اختر المنتجات أو الباقة المناسبة لك من الصفحة.' },
        { step: '02', title: 'تأكيد البيانات', desc: 'أدخل اسمك وعنوانك في نموذج الطلب بالأسفل.' },
        { step: '03', title: 'التجهيز والتسليم', desc: 'نتواصل معك فوراً لتأكيد الموعد وتوصيل طلبك.' },
      ],
      pricingTiers: [
        {
          id: 'g_tier_1',
          name: 'الباقة الفردية',
          price: extractedPrice || `${baseNumericPrice} ج.م`,
          subtitle: 'مناسبة للتجربة والاستخدام الشخصي',
          features: ['المنتج الأساسي بضمان كامل', 'معاينة عند الاستلام', 'دعم مباشر عبر واتساب'],
          highlighted: false,
        },
        {
          id: 'g_tier_2',
          name: 'الباقة المزدوجة (الأكثر طلباً)',
          price: `${Math.round(baseNumericPrice * 1.8)} ج.م`,
          subtitle: 'توفير 15% مع توصيل مجاني',
          features: ['قطعتان من اختيارك', 'توصيل مجاني لباب المنزل', 'ضمان استبدال واسترجاع لمدة 14 يوماً'],
          highlighted: true,
        },
        {
          id: 'g_tier_3',
          name: 'الباقة الشاملة',
          price: `${Math.round(baseNumericPrice * 2.5)} ج.م`,
          subtitle: 'المجموعة الكاملة بأعلى نسبة توفير',
          features: ['3 قطع شاملة جميع الملحقات', 'أولوية التجهيز والشحن السريع', 'هدية إضافية مرفقة مع الطلب'],
          highlighted: false,
        },
      ],
      price: extractedPrice || `${baseNumericPrice} ج.م`,
      oldPrice: `${Math.round(baseNumericPrice * 1.2)} ج.م`,
      offerTitle: 'الباقة الأساسية',
      offerSubtitle: 'تواصل معنا مباشرة لمعرفة التفاصيل الكاملة والخيارات المتاحة.',
      testimonials: [
        { quote: 'تجربة راقية ومريحة جداً في التعامل، والنتيجة النهائية كانت أفضل مما توقعت.', author: 'محمد العلي', role: 'عميل موثق' },
      ],
      testimonial: {
        quote: 'تجربة راقية ومريحة جداً في التعامل، والنتيجة النهائية كانت أفضل مما توقعت.',
        author: 'محمد العلي',
      },
      faqs: [
        { q: 'كيف تتم عملية الطلب؟', a: 'يمكنك إضافة المنتجات إلى سلة الطلب داخل الصفحة وإرسالها مباشرة عبر واتساب، وسيقوم فريقنا بتأكيد الموعد معك فوراً.' },
        { q: 'ما هي خيارات الدفع المتاحة؟', a: 'يتاح الدفع النقدي عند الاستلام أو عبر التحويل البنكي وإنستاباي.' },
      ],
      currency: 'ج.م',
      deliveryFee: 45,
      promoCode: 'WELCOME10',
      promoDiscountPercent: 10,
      whatsappPhone: '201000000000',
      whatsappMessage: 'مرحباً، أود تأكيد الطلب التالي:',
      sections: { ...DEFAULT_SECTIONS },
    },
  };

  const chosen = templates[niche];
  const nicheDefaultLayouts = {
    perfume: { ...DEFAULT_LAYOUTS, hero: 'editorial', catalog: 'grid', features: 'columns' },
    coffee: { ...DEFAULT_LAYOUTS, hero: 'split', catalog: 'list', features: 'rows' },
    fashion: { ...DEFAULT_LAYOUTS, hero: 'editorial', catalog: 'featured', features: 'columns' },
    interior: { ...DEFAULT_LAYOUTS, hero: 'centered', catalog: 'grid', features: 'rows' },
    studio: { ...DEFAULT_LAYOUTS, hero: 'split', catalog: 'grid', features: 'cards' },
    course: { ...DEFAULT_LAYOUTS, hero: 'centered', catalog: 'list', features: 'cards' },
    general: { ...DEFAULT_LAYOUTS },
  };

  return {
    ...chosen,
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    layouts: nicheDefaultLayouts[niche] || { ...DEFAULT_LAYOUTS },
  };
}

/**
 * Optional Real Gemini AI Generator for completely custom prompts
 */
export async function generateWithGeminiAI(promptText, apiKey, currentTheme = 'editorial') {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemPrompt = `
أنت مصمم وكاتب محتوى صفحات هبوط عربية احترافية وهادئة (Editorial & Natural Arabic Copywriter).
المستخدم يريد إنشاء صفحة هبوط كاملة ومفصلة بناءً على هذا الوصف:
"${promptText}"

قم بتوليد محتوى كامل ومفصل وطبيعي جداً بدون أي إيموجيز، وأرجع النتيجة بصيغة JSON فقط مطابقة تماماً لهذا الهيكل:
{
  "brandName": "اسم العلامة التجارية المقترح أو المذكور",
  "category": "تصنيف المشروع في كلمتين أو ثلاث",
  "announcement": "شريط تنبيه علوي هادئ ومقنع",
  "headline": "عنوان رئيسي جذاب وهادئ يوضح القيمة الحقيقية",
  "subheadline": "وصف تفصيلي من سطرين يوضح جودة المنتج أو الخدمة",
  "primaryCta": "نص الزر الرئيسي",
  "secondaryCta": "نص الزر الثانوي",
  "stats": [
    { "value": "+1,200", "label": "وصف الإحصائية 1" },
    { "value": "100%", "label": "وصف الإحصائية 2" },
    { "value": "24 ساعة", "label": "وصف الإحصائية 3" },
    { "value": "4.9/5", "label": "وصف الإحصائية 4" }
  ],
  "catalogTitle": "عنوان قسم المنتجات أو الخدمات",
  "catalogSubtitle": "وصف فرعي لقسم المنتجات",
  "products": [
    {
      "id": "ai_1",
      "name": "اسم المنتج أو الخدمة الأولى",
      "category": "الفئة",
      "price": 350,
      "oldPrice": 420,
      "desc": "وصف دقيق ومقنع للمنتج الأول",
      "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      "tag": "الأكثر طلباً"
    },
    {
      "id": "ai_2",
      "name": "اسم المنتج أو الخدمة الثانية",
      "category": "الفئة",
      "price": 500,
      "oldPrice": 600,
      "desc": "وصف دقيق ومقنع للمنتج الثاني",
      "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
      "tag": "مميز"
    },
    {
      "id": "ai_3",
      "name": "اسم المنتج أو الخدمة الثالثة",
      "category": "الفئة",
      "price": 750,
      "oldPrice": 900,
      "desc": "وصف دقيق ومقنع للمنتج الثالث",
      "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      "tag": "باقة متكاملة"
    }
  ],
  "features": [
    { "num": "01", "title": "الميزة الأولى", "desc": "شرح الميزة الأولى" },
    { "num": "02", "title": "الميزة الثانية", "desc": "شرح الميزة الثانية" },
    { "num": "03", "title": "الميزة الثالثة", "desc": "شرح الميزة الثالثة" }
  ],
  "processSteps": [
    { "step": "01", "title": "الخطوة الأولى", "desc": "وصف الخطوة" },
    { "step": "02", "title": "الخطوة الثانية", "desc": "وصف الخطوة" },
    { "step": "03", "title": "الخطوة الثالثة", "desc": "وصف الخطوة" }
  ],
  "pricingTiers": [
    {
      "id": "t1",
      "name": "الباقة الأساسية",
      "price": "350 ج.م",
      "subtitle": "وصف مختصر",
      "features": ["ميزة 1", "ميزة 2"],
      "highlighted": false
    },
    {
      "id": "t2",
      "name": "الباقة المتكاملة",
      "price": "650 ج.م",
      "subtitle": "الأكثر طلباً وتوفيراً",
      "features": ["ميزة 1", "ميزة 2", "ميزة 3"],
      "highlighted": true
    },
    {
      "id": "t3",
      "name": "باقة الأعمال / العائلة",
      "price": "950 ج.م",
      "subtitle": "أعلى قيمة",
      "features": ["ميزة 1", "ميزة 2", "ميزة 3"],
      "highlighted": false
    }
  ],
  "faqs": [
    { "q": "السؤال الشائع الأول؟", "a": "الإجابة الواضحة." },
    { "q": "السؤال الشائع الثاني؟", "a": "الإجابة الواضحة." }
  ]
}
`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error('تعذر الاتصال بخدمة التوليد، تأكد من صحة المفتاح.');
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  const baseFallback = generatePageData(promptText, currentTheme);
  return {
    ...baseFallback,
    ...parsed,
    theme: currentTheme,
    sections: { ...DEFAULT_SECTIONS },
  };
}
