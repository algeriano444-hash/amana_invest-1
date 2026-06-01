export type ProjectCategory = "عام" | "شركة ناشئة" | "مؤسسة متوسطة" | "عمل حر";
export type VerificationStatus = "Under Review" | "Missing Documents" | "Rejected" | "Verified/Approved";

// === Risk & Security Framework ===
export type GuaranteeType = "Personal" | "Financial" | "Commercial" | "Technical";

export interface PersonalGuarantee {
  type: "legal_pledge" | "personal_guarantor";
  value: string;
  guarantor?: string;
  pledgeDocument?: string;
}

export interface FinancialGuarantee {
  type: "escrow" | "equipment_mortgage";
  value: number;
  institution?: string;
  mortgageDocument?: string;
}

export interface CommercialGuarantee {
  type: "customer_contracts" | "purchase_orders";
  value: number;
  counterparty?: string;
  contractDocument?: string;
}

export interface TechnicalGuarantee {
  type: "ip_ownership" | "source_code_rights";
  value: string;
  registrationDocument?: string;
  licensePath?: string;
}

export type Guarantee =
  | { id: string; type: "Personal"; details: PersonalGuarantee; documentUrl?: string; verificationDate?: string; }
  | { id: string; type: "Financial"; details: FinancialGuarantee; documentUrl?: string; verificationDate?: string; }
  | { id: string; type: "Commercial"; details: CommercialGuarantee; documentUrl?: string; verificationDate?: string; }
  | { id: string; type: "Technical"; details: TechnicalGuarantee; documentUrl?: string; verificationDate?: string; };


export interface ProjectVerification {
  status: VerificationStatus;
  verificationDate?: string;
  verifiedBy?: string;
  notes?: string;
  requiredDocuments: {
    personalIds: boolean;
    businessDocuments: boolean;
    financialStudies: boolean;
  };
}

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  field: string;
  wilaya?: string;
  capital: number;
  shares: number;
  sharePrice: number;
  sold: number;
  status: string;
  description: string;
  /** ISO date — تاريخ بدء العقد. الافتراضي 2026-09-01 (إطلاق المنصة) */
  startDate?: string;
  /** مدة العقد بالأشهر. الافتراضي 12 شهراً */
  durationMonths?: number;
  /** Risk & Security Framework */
  verification?: ProjectVerification;
  guarantees?: Guarantee[];
}

export const DEFAULT_START_DATE = "2026-09-01";
export const DEFAULT_DURATION_MONTHS = 12;

const DURATION_BY_CATEGORY: Record<ProjectCategory, number> = {
  "عام": 18,
  "شركة ناشئة": 24,
  "مؤسسة متوسطة": 36,
  "عمل حر": 12,
};

export function getContractDates(p: Pick<Project, "startDate" | "durationMonths" | "category">) {
  const start = new Date(p.startDate ?? DEFAULT_START_DATE);
  const months = p.durationMonths ?? DURATION_BY_CATEGORY[p.category] ?? DEFAULT_DURATION_MONTHS;
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  return { start, end, months };
}

export const formatArabicDate = (d: Date) =>
  new Intl.DateTimeFormat("ar-DZ", { year: "numeric", month: "long", day: "numeric" }).format(d);

export const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export interface ProjectDocument {
  name: string;
  type: "محاسبي" | "دراسة جدوى" | "قانوني" | "تقني";
  url: string;
  /** مفتاح الوثيقة في جدول project_owner_documents لربطها بالملف الفعلي */
  key?: string;
}

const PLACEHOLDER_DOC = "/documents/placeholder.txt";

export const projectCategoryToOwnerKey = (
  c: ProjectCategory,
): "startup" | "established" => (c === "شركة ناشئة" ? "startup" : "established");

export function getProjectInfo(p: Pick<Project, "name" | "category" | "field" | "capital">) {
  const isStartup = p.category === "شركة ناشئة";
  const baseDocs: ProjectDocument[] = [
    { name: "دراسة الجدوى الاقتصادية الكاملة", type: "دراسة جدوى", url: PLACEHOLDER_DOC, key: "feasibility_study" },
    { name: "خطة التدفقات النقدية المتوقعة", type: "محاسبي", url: PLACEHOLDER_DOC, key: "cash_flow" },
    { name: "الوثائق المحاسبية", type: "محاسبي", url: PLACEHOLDER_DOC, key: "accounting_docs" },
    { name: "السجل التجاري", type: "قانوني", url: PLACEHOLDER_DOC, key: "commercial_register" },
    { name: "الترخيص الرسمي", type: "قانوني", url: PLACEHOLDER_DOC, key: "license" },
    { name: "عقد المساهمة النموذجي", type: "قانوني", url: PLACEHOLDER_DOC },
    ...(isStartup
      ? [{ name: "الخطة التقنية للمشروع", type: "تقني" as const, url: PLACEHOLDER_DOC, key: "technical_plan" }]
      : []),
  ];
  const budgetDoc: ProjectDocument = isStartup
    ? { name: "ميزانية تقديرية للسنوات الخمس القادمة", type: "محاسبي", url: PLACEHOLDER_DOC, key: "budget_5y" }
    : { name: "الميزانية التقديرية لثلاث سنوات", type: "محاسبي", url: PLACEHOLDER_DOC, key: "budget_3y" };
  return {
    study: `دراسة جدوى مبدئية لـ"${p.name}": مشروع في قطاع ${p.field} برأس مال يبلغ ${new Intl.NumberFormat("ar-DZ").format(p.capital)} دج. تستهدف الدراسة تحليل السوق المحلي وحجم الطلب، تقدير التكاليف الثابتة والمتغيرة، نقطة التعادل المتوقعة، وتحديد هامش الربح الصافي المتوقع وفق سيناريوهات متحفظة. ${isStartup ? "نظراً لكون المشروع شركة ناشئة، تم اعتماد ميزانية تقديرية ممتدة على خمس سنوات مع خطة تقنية مفصلة." : ""} تم اعتماد صيغة ${p.category === "عام" ? "ملكية الحصص" : "المشاركة في رأس المال"} مع توزيع عادل للأرباح والخسائر.`,
    documents: [budgetDoc, ...baseDocs],
    highlights: [
      `قطاع: ${p.field}`,
      `صيغة العقد: ${p.category === "عام" ? "ملكية الحصص" : "مشاركة في رأس المال"}`,
      `رأس المال المستهدف: ${new Intl.NumberFormat("ar-DZ").format(p.capital)} دج`,
      "إشراف قانوني ومحاسبي مستقل",
      "توزيع أرباح/خسائر بنسبة المساهمة فقط",
    ],
  };
}

// === متطلبات وثائق صاحب المشروع عند التسجيل ===
export interface OwnerDocRequirement { key: string; label: string; required: boolean; }

// Documents required BEFORE project listing
export const REQUIRED_DOCUMENTS_FOR_LISTING: OwnerDocRequirement[] = [
  { key: "personal_id", label: "هويات شخصية للمالكين", required: true },
  { key: "commercial_register", label: "السجل التجاري", required: true },
  { key: "nif", label: "رقم التعريف الفيسكالي (NIF)", required: true },
  { key: "feasibility_study", label: "دراسة الجدوى الاقتصادية الكاملة", required: true },
  { key: "financial_studies", label: "الدراسات المالية والتقنية", required: true },
];

// Documents AUTOMATICALLY GENERATED upon investment
export const AUTO_GENERATED_DOCUMENTS_ON_INVESTMENT: OwnerDocRequirement[] = [
  { key: "partnership_contract", label: "عقد المشاركة", required: true },
  { key: "share_ownership_certificate", label: "شهادة ملكية الحصص", required: true },
  { key: "investor_registry", label: "سجل المستثمرين", required: true },
];

export const OWNER_DOC_REQUIREMENTS_COMMON: OwnerDocRequirement[] = [
  { key: "commercial_register", label: "السجل التجاري", required: true },
  { key: "license", label: "الترخيص الرسمي", required: true },
  { key: "feasibility_study", label: "دراسة الجدوى الاقتصادية الكاملة", required: true },
  { key: "cash_flow", label: "خطة التدفقات النقدية المتوقعة", required: true },
  { key: "accounting_docs", label: "الوثائق المحاسبية", required: true },
];

export const OWNER_DOC_REQUIREMENTS_BY_CATEGORY: Record<string, OwnerDocRequirement[]> = {
  startup: [
    { key: "budget_5y", label: "ميزانية تقديرية للسنوات الخمس القادمة", required: true },
    { key: "technical_plan", label: "الخطة التقنية للمشروع", required: true },
  ],
  established: [
    { key: "budget_3y", label: "ميزانية تقديرية لثلاث سنوات", required: true },
  ],
};

// === باقات الاستثمار، الاستشارات، والتعليم ===
export interface PackageItem {
  id: string;
  name: string;
  tagline: string;
  price: string;
  features: string[];
  highlight?: boolean;
}

export const INVESTMENT_PACKAGES: PackageItem[] = [
  {
    id: "starter",
    name: "باقة المبتدئ",
    tagline: "ابدأ رحلتك بمبلغ صغير وتعلّم أثناء الاستثمار.",
    price: "من 5,000 دج",
    features: [
      "وصول لمشاريع منخفضة المخاطر",
      "متابعة شهرية لأداء استثماراتك",
      "تنبيهات قانونية ومحاسبية أساسية",
      "دعم عبر البريد",
    ],
  },
  {
    id: "growth",
    name: "باقة النمو",
    tagline: "تنويع المحفظة بين عدة قطاعات استثمارية.",
    price: "من 50,000 دج",
    features: [
      "وصول لجميع المشاريع المفتوحة",
      "تحليلات مالية ربع سنوية للمشاريع",
      "أولوية في الاكتتاب على المشاريع المميزة",
      "جلسة استشارة مالية واحدة سنوياً",
    ],
    highlight: true,
  },
  {
    id: "premium",
    name: "باقة الاستثمار المميّز",
    tagline: "للمستثمرين الجادّين بمحافظ كبيرة.",
    price: "من 500,000 دج",
    features: [
      "إدارة محفظة شخصية مخصصة",
      "تقارير مالية مفصّلة شهرياً",
      "مستشار مالي مخصّص على مدار السنة",
      "وصول حصري لمشاريع ما قبل الاكتتاب",
    ],
  },
];

export const ADVISORY_PACKAGES: PackageItem[] = [
  {
    id: "advice-basic",
    name: "استشارة فردية",
    tagline: "جلسة 60 دقيقة مع مستشار مالي متخصص.",
    price: "3,500 دج / جلسة",
    features: [
      "تحليل وضعك المالي الحالي",
      "توصيات استثمار مخصّصة",
      "تقرير مكتوب بعد الجلسة",
    ],
  },
  {
    id: "advice-quarterly",
    name: "اشتراك ربع سنوي",
    tagline: "متابعة منتظمة كل ثلاثة أشهر.",
    price: "9,000 دج / 3 أشهر",
    features: [
      "ثلاث جلسات استشارة (واحدة شهرياً)",
      "مراجعة المحفظة والتعديل عند الحاجة",
      "دعم عبر الواتساب طوال الفترة",
    ],
    highlight: true,
  },
  {
    id: "advice-corporate",
    name: "استشارة لأصحاب المشاريع",
    tagline: "هيكلة قانونية ومالية لمشروعك قبل طرحه.",
    price: "حسب الحجم",
    features: [
      "هيكلة عقد المشاركة القانوني",
      "إعداد القوائم المالية والميزانيات",
      "تجهيز ملف الاكتتاب في المنصة",
    ],
  },
];

export const EDUCATION_PACKAGES: PackageItem[] = [
  {
    id: "edu-foundations",
    name: "أساسيات الاستثمار والتمويل",
    tagline: "للمبتدئين كلياً — لا حاجة لخبرة مسبقة.",
    price: "مجاناً",
    features: [
      "أساسيات الاستثمار وإدارة المخاطر",
      "أنواع العقود: المشاركة، الملكية بالحصص، وصيغ التمويل",
      "كيف تقرأ مشروعاً قبل الاستثمار فيه",
      "8 دروس فيديو + اختبار قصير",
    ],
  },
  {
    id: "edu-financing",
    name: "آليات التمويل المتقدمة",
    tagline: "تعمّق في صيغ التمويل المختلفة.",
    price: "4,500 دج",
    features: [
      "المشاركة المتناقصة وتطبيقاتها",
      "صيغ المضاربة والإجارة والاستصناع",
      "أدوات التمويل المختلفة والفرق بينها",
      "حالات تطبيقية حقيقية + شهادة إتمام",
    ],
    highlight: true,
  },
  {
    id: "edu-portfolio",
    name: "بناء محفظة استثمارية متوازنة",
    tagline: "كيف توزّع أموالك بأمان وعقلانية.",
    price: "6,000 دج",
    features: [
      "تحليل المخاطر وتنويع القطاعات",
      "قراءة القوائم المالية والمؤشرات الأساسية",
      "بناء خطة استثمار 3–5 سنوات",
      "مرافقة مباشرة من مدرّب معتمد",
    ],
  },
];


export const projects: Project[] = [
  // 6 مشاريع
  {
    id: "general-store",
    name: "متجر إلكتروني متخصص",
    category: "عام",
    field: "تجارة إلكترونية",
    capital: 750000,
    shares: 1000,
    sharePrice: 750,
    sold: 0,
    status: "جاهز للاكتتاب",
    description: "متجر إلكتروني متخصص في بيع منتجات متنوعة عالية الجودة بمختلف فئاتها.",
    verification: {
      status: "Verified/Approved",
      verificationDate: "2026-05-20",
      verifiedBy: "فريق التحقق - Amana Invest",
      requiredDocuments: {
        personalIds: true,
        businessDocuments: true,
        financialStudies: true,
      },
      notes: "تم التحقق من جميع الوثائق بنجاح",
    },
    guarantees: [
      {
        id: "g-gs-1",
        type: "Personal",
        details: {
          type: "legal_pledge",
          value: "تعهد قانوني من المالك",
          guarantor: "محمود سمير",
        },
        verificationDate: "2026-05-18",
      },
      {
        id: "g-gs-2",
        type: "Financial",
        details: {
          type: "escrow",
          value: 300000,
          institution: "البنك الوطني الجزائري",
        },
        verificationDate: "2026-05-19",
      },
      {
        id: "g-gs-3",
        type: "Commercial",
        details: {
          type: "customer_contracts",
          value: 500000,
          counterparty: "شركات توزيع رئيسية",
        },
        verificationDate: "2026-05-17",
      },
    ],
  },
  {
    id: "honey-factory",
    name: "مصنع عسل طبيعي",
    category: "عام",
    field: "صناعات غذائية",
    capital: 4000000,
    shares: 2000,
    sharePrice: 2000,
    sold: 0,
    status: "جاهز للاكتتاب",
    description: "مصنع لإنتاج وتعبئة العسل الطبيعي بأعلى معايير الجودة والنقاء.",
    verification: {
      status: "Verified/Approved",
      verificationDate: "2026-05-22",
      verifiedBy: "فريق التحقق - Amana Invest",
      requiredDocuments: {
        personalIds: true,
        businessDocuments: true,
        financialStudies: true,
      },
      notes: "مشروع موثوق مع ضمانات قوية",
    },
    guarantees: [
      {
        id: "g-hf-1",
        type: "Personal",
        details: {
          type: "personal_guarantor",
          value: "ضامن شخصي معروف",
          guarantor: "فريد العيد",
        },
        verificationDate: "2026-05-21",
      },
      {
        id: "g-hf-2",
        type: "Financial",
        details: {
          type: "equipment_mortgage",
          value: 1200000,
          institution: "بنك التنمية المحلية",
        },
        verificationDate: "2026-05-20",
      },
      {
        id: "g-hf-3",
        type: "Commercial",
        details: {
          type: "purchase_orders",
          value: 2000000,
          counterparty: "متاجر توزيع وطنية",
        },
        verificationDate: "2026-05-19",
      },
      {
        id: "g-hf-4",
        type: "Technical",
        details: {
          type: "ip_ownership",
          value: "براءة اختراع لعملية التعقيم",
        },
        verificationDate: "2026-05-18",
      },
    ],
  },
  { id: "olive-farm", name: "مزرعة زيتون", category: "عام", field: "فلاحة", capital: 6000000, shares: 3000, sharePrice: 2000, sold: 0, status: "جاهز للاكتتاب", description: "مزرعة لإنتاج زيت الزيتون البكر الممتاز والزيتون المُعالج بطرق طبيعية." },
  { id: "elearning-academy", name: "أكاديمية تعليم إلكتروني", category: "عام", field: "تعليم", capital: 750000, shares: 1000, sharePrice: 750, sold: 0, status: "جاهز للاكتتاب", description: "منصة تعليم إلكترونية تقدم دورات في التمويل والمهارات المهنية." },
  { id: "local-services-app", name: "تطبيق خدمات محلية", category: "عام", field: "تكنولوجيا", capital: 1500000, shares: 1000, sharePrice: 1500, sold: 0, status: "جاهز للاكتتاب", description: "تطبيق يربط المستخدمين بمزودي الخدمات المحلية الموثوقة والمعروفة." },
  { id: "cleaning-company", name: "شركة تنظيف وتجهيز", category: "عام", field: "خدمات", capital: 1500000, shares: 1000, sharePrice: 1500, sold: 0, status: "جاهز للاكتتاب", description: "شركة متخصصة في خدمات التنظيف الشامل وتجهيز الفعاليات والمكاتب." },
  // شركات ناشئة
  { id: "delivery-platform", name: "منصة خدمات التوصيل المحلية", category: "شركة ناشئة", field: "خدمات رقمية", wilaya: "Constantine", capital: 1800000, shares: 1200, sharePrice: 1500, sold: 0, status: "جاهز للاكتتاب", description: "تطبيق توصيل بسيط للمنتجات والخدمات داخل ولاية قسنطينة." },
  { id: "micro-elearning", name: "منصة تعليم إلكتروني مصغرة", category: "شركة ناشئة", field: "التعليم الرقمي", wilaya: "Constantine", capital: 1000000, shares: 1000, sharePrice: 1000, sold: 0, status: "جاهز للاكتتاب", description: "منصة لتقديم دورات قصيرة وعملية في تخصصات مطلوبة محلياً." },
  { id: "smart-agri-app", name: "تطبيق الفلاحة الذكية", category: "شركة ناشئة", field: "تطبيق ذكي لمراقبة السقي والإنتاج الزراعي", wilaya: "Adrar", capital: 2500000, shares: 2500, sharePrice: 1000, sold: 0, status: "جاهز للاكتتاب", description: "تطبيق ذكي يعتمد على حساسات وتطبيق هاتف لمراقبة السقي والإنتاج الزراعي للفلاحين في الجنوب الجزائري، يساعد على تقليل استهلاك المياه ورفع الإنتاجية." },
  { id: "home-solar", name: "حلول الطاقة الشمسية المنزلية", category: "شركة ناشئة", field: "تركيب أنظمة الطاقة الشمسية للمنازل والمتاجر", wilaya: "Ouargla", capital: 3000000, shares: 3000, sharePrice: 1000, sold: 0, status: "جاهز للاكتتاب", description: "شركة ناشئة لتركيب وصيانة أنظمة الطاقة الشمسية للمنازل والمحلات التجارية، قطاع نظيف ومتجدد يشهد نمواً سريعاً في الجزائر، مع توزيع الأرباح حسب نسبة المساهمة." },
  { id: "dates-marketing", name: "تسويق التمور الجزائرية رقمياً", category: "شركة ناشئة", field: "تسويق وبيع التمور عبر الإنترنت", wilaya: "Biskra", capital: 1800000, shares: 1800, sharePrice: 1000, sold: 0, status: "جاهز للاكتتاب", description: "منصة رقمية لتسويق وبيع التمور الجزائرية محلياً ودولياً، تستهدف الأسواق العربية والأوروبية بمنتج جزائري مطلوب عالمياً وتكاليف تشغيل منخفضة." },
  { id: "smart-greenhouses", name: "البيوت الزراعية الذكية", category: "شركة ناشئة", field: "بيوت بلاستيكية ذكية بالطاقة الشمسية", wilaya: "El Oued", capital: 3500000, shares: 3500, sharePrice: 1000, sold: 0, status: "جاهز للاكتتاب", description: "إنشاء بيوت بلاستيكية ذكية تعمل بالطاقة الشمسية لإنتاج زراعي حديث في المناطق الصحراوية مع تقليل استهلاك المياه والطاقة، مشروع قابل للتوسع." },
  { id: "solar-maintenance", name: "صيانة الألواح الشمسية", category: "شركة ناشئة", field: "صيانة وتنظيف أنظمة الطاقة الشمسية", wilaya: "Ghardaïa", capital: 1600000, shares: 1600, sharePrice: 1000, sold: 0, status: "جاهز للاكتتاب", description: "شركة متخصصة في صيانة وتنظيف الألواح الشمسية، خدمة مطلوبة مع توسع مشاريع الطاقة الشمسية، تكاليف تشغيل منخفضة ومناسبة للشباب ورواد الأعمال." },
  // متوسطة
  { id: "food-packaging", name: "مصنع تعبئة مواد غذائية", category: "مؤسسة متوسطة", field: "صناعات غذائية", wilaya: "Blida", capital: 3500000, shares: 1750, sharePrice: 2000, sold: 0, status: "جاهز للاكتتاب", description: "مصنع لتعبئة وتغليف المواد الغذائية الجافة والسوائل." },
  { id: "furniture-workshop", name: "ورشة تصنيع الأثاث الحديث", category: "مؤسسة متوسطة", field: "صناعة الأثاث", wilaya: "Sétif", capital: 4000000, shares: 2000, sharePrice: 2000, sold: 0, status: "جاهز للاكتتاب", description: "ورشة لتصنيع الأثاث الحديث للمنازل والمكاتب بتصاميم عصرية." },
  { id: "dairy-cattle", name: "مشروع فلاحي لتربية الأبقار الحلوب", category: "مؤسسة متوسطة", field: "إنتاج الحليب", wilaya: "El Tarf", capital: 4500000, shares: 2250, sharePrice: 2000, sold: 0, status: "جاهز للاكتتاب", description: "مزرعة لتربية الأبقار الحلوب وإنتاج الحليب الطازج وتسويقه." },
  // أعمال حرة
  { id: "modest-tailoring", name: "ورشة خياطة وتصميم ملابس محتشمة", category: "عمل حر", field: "خياطة", wilaya: "Tizi Ouzou", capital: 650000, shares: 650, sharePrice: 1000, sold: 0, status: "جاهز للاكتتاب", description: "ورشة خياطة متخصصة في تصميم وخياطة الملابس المحتشمة الراقية." },
  { id: "traditional-carpentry", name: "نجارة تقليدية (أبواب وأثاث بسيط)", category: "عمل حر", field: "حِرفة تقليدية", wilaya: "Médéa", capital: 800000, shares: 800, sharePrice: 1000, sold: 0, status: "جاهز للاكتتاب", description: "ورشة نجارة لإنتاج الأبواب الخشبية والأثاث التقليدي." },
];

export const formatDZD = (n: number) =>
  new Intl.NumberFormat("ar-DZ").format(n) + " دج";

// === Risk & Security Framework Helper Functions ===

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  "Under Review": "قيد المراجعة",
  "Missing Documents": "وثائق ناقصة",
  "Rejected": "مرفوض",
  "Verified/Approved": "موثق معتمد",
};

export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  "Under Review": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Missing Documents": "bg-orange-100 text-orange-800 border-orange-300",
  "Rejected": "bg-red-100 text-red-800 border-red-300",
  "Verified/Approved": "bg-green-100 text-green-800 border-green-300",
};

export const GUARANTEE_TYPE_LABELS: Record<GuaranteeType, string> = {
  "Personal": "ضمانات شخصية",
  "Financial": "ضمانات مالية",
  "Commercial": "ضمانات تجارية",
  "Technical": "ضمانات تقنية",
};

export const GUARANTEE_ICONS: Record<GuaranteeType, string> = {
  "Personal": "👤",
  "Financial": "💰",
  "Commercial": "📋",
  "Technical": "🔐",
};

export function getVerificationBadgeColor(status: VerificationStatus): string {
  return VERIFICATION_STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
}

export function getVerificationStatusLabel(status: VerificationStatus): string {
  return VERIFICATION_STATUS_LABELS[status] || status;
}

export function getGuaranteeTypeLabel(type: GuaranteeType): string {
  return GUARANTEE_TYPE_LABELS[type] || type;
}

export function createDefaultProjectVerification(): ProjectVerification {
  return {
    status: "Under Review",
    requiredDocuments: {
      personalIds: false,
      businessDocuments: false,
      financialStudies: false,
    },
  };
}

export function isProjectFullyVerified(verification?: ProjectVerification): boolean {
  if (!verification) return false;
  return (
    verification.status === "Verified/Approved" &&
    verification.requiredDocuments.personalIds &&
    verification.requiredDocuments.businessDocuments &&
    verification.requiredDocuments.financialStudies
  );
}

export function getProjectVerificationProgress(verification?: ProjectVerification): number {
  if (!verification) return 0;
  const { requiredDocuments } = verification;
  const completed = Object.values(requiredDocuments).filter(Boolean).length;
  const total = Object.values(requiredDocuments).length;
  
  // Add status progress
  let statusScore = 0;
  switch (verification.status) {
    case "Verified/Approved": statusScore = 100; break;
    case "Under Review": statusScore = 50; break;
    case "Missing Documents": statusScore = 25; break;
    default: statusScore = 0; break;
  }
  
  return Math.round((completed / total * 70) + (statusScore * 0.3));
}

export function getGuaranteesByType(guarantees: Guarantee[] | undefined, type: GuaranteeType): Guarantee[] {
  if (!guarantees) return [];
  return guarantees.filter(g => g.type === type) as Guarantee[];
}

export function getTotalGuaranteeValue(guarantees: Guarantee[] | undefined): number {
  if (!guarantees) return 0;
  return guarantees.reduce((sum, g) => {
    if (g.type === "Financial" || g.type === "Commercial") {
      return sum + (g.details.value || 0);
    }
    return sum;
  }, 0);
}


