import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا — Amana Invest" },
      { name: "description", content: "تواصل مع فريق Amana Invest لأي استشارة استثمارية." },
      { property: "og:title", content: "تواصل معنا — Amana" },
      { property: "og:description", content: "نحن هنا لمساعدتك على بدء استثمارك." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto max-w-3xl px-4 py-20">
        <div className="text-center">
          <div className="text-sm font-semibold text-primary">تواصل معنا</div>
          <h1 className="mt-2 font-display text-4xl font-bold">نحن هنا لخدمتك</h1>
          <p className="mt-3 text-muted-foreground">أرسل لنا استفسارك وسيتواصل معك فريقنا في أقرب وقت.</p>
        </div>

        <form className="mt-10 space-y-4 rounded-2xl border border-border bg-gradient-card p-8 shadow-soft" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">الاسم الكامل</label>
              <Input placeholder="اسمك" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">البريد الإلكتروني</label>
              <Input type="email" placeholder="email@example.com" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">الموضوع</label>
            <Input placeholder="موضوع الرسالة" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">رسالتك</label>
            <Textarea rows={6} placeholder="اكتب رسالتك هنا..." />
          </div>
          <Button className="w-full bg-gradient-hero shadow-soft" size="lg">إرسال</Button>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}
