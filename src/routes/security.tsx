import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { ProjectDocumentRequirements } from "@/components/ProjectDocumentRequirements";
import { ProjectGuaranteesDisplay } from "@/components/ProjectGuaranteesDisplay";
import { ProjectVerificationBadge } from "@/components/ProjectVerificationBadge";
import { Shield, FileCheck, Lock, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { 
  VERIFICATION_STATUS_LABELS,
  GUARANTEE_TYPE_LABELS,
  createDefaultProjectVerification,
  Guarantee,
} from "@/lib/projects";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "إطار الأمان والتحقق — Amana Invest" },
      { name: "description", content: "تعرّف على نظام التحقق من المشاريع والضمانات الأمنية والوثائق المطلوبة." },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  const exampleVerification = createDefaultProjectVerification();
  exampleVerification.status = "Verified/Approved";
  exampleVerification.verificationDate = "2026-05-20";
  exampleVerification.verifiedBy = "فريق التحقق - Amana Invest";
  exampleVerification.requiredDocuments = {
    personalIds: true,
    businessDocuments: true,
    financialStudies: true,
  };
  exampleVerification.notes = "تم التحقق من جميع الوثائق والمتطلبات بنجاح.";

  const exampleGuarantees: Guarantee[] = [
    {
      id: "g1",
      type: "Personal",
      details: {
        type: "legal_pledge",
        value: "تعهد قانوني من مالك المشروع",
        guarantor: "أحمد محمد علي",
        pledgeDocument: "/documents/legal-pledge.pdf",
      },
      documentUrl: "/documents/legal-pledge.pdf",
      verificationDate: "2026-05-15",
    },
    {
      id: "g2",
      type: "Financial",
      details: {
        type: "escrow",
        value: 500000,
        institution: "البنك الوطني الجزائري",
        mortgageDocument: "/documents/escrow-agreement.pdf",
      },
      documentUrl: "/documents/escrow-agreement.pdf",
      verificationDate: "2026-05-18",
    },
    {
      id: "g3",
      type: "Commercial",
      details: {
        type: "customer_contracts",
        value: 1200000,
        counterparty: "شركات توزيع معروفة",
        contractDocument: "/documents/customer-contracts.pdf",
      },
      documentUrl: "/documents/customer-contracts.pdf",
      verificationDate: "2026-05-17",
    },
    {
      id: "g4",
      type: "Technical",
      details: {
        type: "ip_ownership",
        value: "براءة اختراع للنظام المالي",
        registrationDocument: "/documents/ip-patent.pdf",
      },
      documentUrl: "/documents/ip-patent.pdf",
      verificationDate: "2026-05-16",
    },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-card">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <div className="text-sm font-semibold text-primary">الأمان والشفافية</div>
          </div>
          <h1 className="font-display text-4xl font-bold md:text-5xl">إطار الأمان والتحقق</h1>
          <p className="mt-4 max-w-3xl leading-loose text-muted-foreground">
            نحن نضمن حماية استثماراتك من خلال نظام تحقق شامل، ضمانات متعددة المستويات، ووثائق موثقة لكل مشروع.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        {/* Verification Status Overview */}
        <div className="mb-16">
          <h2 className="mb-6 font-display text-2xl font-bold">أنواع حالات التحقق</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                status: "Under Review" as const,
                icon: Clock,
                description: "المشروع قيد المراجعة الدقيقة",
              },
              {
                status: "Missing Documents" as const,
                icon: AlertCircle,
                description: "يحتاج إلى وثائق إضافية",
              },
              {
                status: "Rejected" as const,
                icon: XCircle,
                description: "لم يستوفِ متطلبات الأمان",
              },
              {
                status: "Verified/Approved" as const,
                icon: CheckCircle,
                description: "معتمد وجاهز للاستثمار",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.status} className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{VERIFICATION_STATUS_LABELS[item.status]}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Guarantee Types */}
        <div className="mb-16">
          <h2 className="mb-6 font-display text-2xl font-bold">أنواع الضمانات</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                type: "Personal" as const,
                emoji: "👤",
                description: "تعهدات قانونية وضامنون شخصيون",
              },
              {
                type: "Financial" as const,
                emoji: "💰",
                description: "حسابات ضمان ورهون معدات",
              },
              {
                type: "Commercial" as const,
                emoji: "📋",
                description: "عقود العملاء وأوامر الشراء",
              },
              {
                type: "Technical" as const,
                emoji: "🔐",
                description: "الملكية الفكرية وحقوق الكود",
              },
            ].map((item) => (
              <Card key={item.type} className="p-4">
                <div className="mb-3 text-3xl">{item.emoji}</div>
                <h3 className="font-semibold">{GUARANTEE_TYPE_LABELS[item.type]}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Example Project */}
        <div className="mb-16">
          <h2 className="mb-6 font-display text-2xl font-bold">مثال على مشروع موثق</h2>
          <Card className="overflow-hidden border border-border">
            <div className="border-b border-border bg-gradient-card p-6">
              <h3 className="font-display text-xl font-bold">مشروع مصنع العسل الطبيعي</h3>
              <p className="mt-1 text-sm text-muted-foreground">مصنع إنتاج وتعبئة العسل الطبيعي</p>
            </div>

            <div className="space-y-6 p-6">
              {/* Verification Status */}
              <div>
                <h4 className="mb-3 font-semibold">حالة التحقق</h4>
                <ProjectVerificationBadge verification={exampleVerification} showProgress={true} />
              </div>

              {/* Guarantees */}
              <div>
                <ProjectGuaranteesDisplay guarantees={exampleGuarantees} />
              </div>
            </div>
          </Card>
        </div>

        {/* Document Requirements */}
        <div className="mb-16">
          <h2 className="mb-6 font-display text-2xl font-bold">متطلبات الوثائق</h2>
          <ProjectDocumentRequirements showRequired={true} showAutoGenerated={true} />
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="mb-6 font-display text-2xl font-bold">كيف يعمل نظام التحقق</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                step: 1,
                title: "التقديم والمراجعة الأولية",
                description:
                  "يقدم صاحب المشروع جميع الوثائق المطلوبة. يتم فحص الوثائق بشكل أولي للتأكد من اكتمالها.",
              },
              {
                step: 2,
                title: "التحقق الدقيق",
                description:
                  "يقوم فريق متخصص بالتحقق من صحة جميع الوثائق والضمانات المقدمة.",
              },
              {
                step: 3,
                title: "الموافقة والإدراج",
                description:
                  "عند اكتمال التحقق بنجاح، يتم إدراج المشروع على المنصة وتفعيل الاكتتاب.",
              },
            ].map((item) => (
              <Card key={item.step} className="p-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-display font-bold text-primary">{item.step}</span>
                </div>
                <h4 className="mb-2 font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <Card className="border-l-4 border-primary bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="font-display font-bold">لماذا نثق في منصة Amana؟</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>جميع المشاريع تمر بعملية تحقق شاملة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>ضمانات متعددة المستويات لحماية الاستثمارات</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>وثائق موثقة وعقود إلكترونية شفافة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>فريق متخصص في التحقق والمراجعة المستمرة</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}
