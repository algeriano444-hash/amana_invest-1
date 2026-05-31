import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Briefcase, Upload, FileCheck2 } from "lucide-react";
import {
  OWNER_DOC_REQUIREMENTS_COMMON,
  OWNER_DOC_REQUIREMENTS_BY_CATEGORY,
  type OwnerDocRequirement,
} from "@/lib/projects";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "إنشاء حساب — Amana" }, { name: "description", content: "أنشئ حساب مستثمر أو صاحب مشروع على Amana Invest." }] }),
  component: SignupPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "الاسم قصير جداً").max(100),
  email: z.string().trim().email("بريد غير صالح").max(255),
  phone: z.string().trim().min(8, "رقم هاتف غير صالح").max(20),
  wilaya: z.string().trim().min(2).max(60),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل").max(72),
});

type ProjectCategoryKey = "startup" | "established";

function SignupPage() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<"investor" | "project_owner">("investor");
  const [projectCategory, setProjectCategory] = useState<ProjectCategoryKey>("established");
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", wilaya: "", password: "" });
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(false);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const requiredDocs: OwnerDocRequirement[] = [
    ...OWNER_DOC_REQUIREMENTS_COMMON,
    ...(OWNER_DOC_REQUIREMENTS_BY_CATEGORY[projectCategory] ?? []),
  ];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    if (accountType === "project_owner") {
      const missing = requiredDocs.filter((d) => d.required && !files[d.key]);
      if (missing.length) return toast.error(`الوثائق المطلوبة ناقصة: ${missing.map((m) => m.label).join("، ")}`);
    }

    setLoading(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          wilaya: parsed.data.wilaya,
          account_type: accountType,
        },
      },
    });
    if (error) { setLoading(false); return toast.error(error.message); }

    if (accountType === "project_owner" && signUpData.user) {
      const userId = signUpData.user.id;
      let uploadFailed = false;
      for (const req of requiredDocs) {
        const file = files[req.key];
        if (!file) continue;
        const path = `${userId}/${req.key}-${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("project-documents").upload(path, file);
        if (upErr) { uploadFailed = true; toast.error(`فشل رفع ${req.label}: ${upErr.message}`); continue; }
        await supabase.from("project_owner_documents").insert({
          user_id: userId, doc_type: req.key, file_path: path, project_category: projectCategory,
        });
      }
      if (uploadFailed) toast.warning("تم إنشاء الحساب لكن بعض الوثائق لم تُرفع. يمكنك إعادة الرفع لاحقاً من لوحتك.");
    }

    setLoading(false);
    toast.success("تم إنشاء حسابك! تحقق من بريدك لتفعيل الحساب.");
    navigate({ to: "/login" });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-elegant">
          <h1 className="font-display text-3xl font-bold">إنشاء حساب</h1>
          <p className="mt-1 text-sm text-muted-foreground">انضم إلى منصة الاستثمار الموثوقة.</p>

          <div className="mt-6">
            <Label className="mb-2 block">نوع الحساب</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: "investor" as const, label: "مستثمر", desc: "أبحث عن مشاريع للاستثمار", icon: User },
                { v: "project_owner" as const, label: "صاحب مشروع", desc: "أملك مشروعاً وأحتاج تمويلاً", icon: Briefcase },
              ].map((opt) => (
                <button key={opt.v} type="button" onClick={() => setAccountType(opt.v)}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-right transition ${
                    accountType === opt.v ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40"
                  }`}>
                  <opt.icon className={`h-5 w-5 ${accountType === opt.v ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <div className="font-bold text-foreground">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <div className="sm:col-span-2">
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <Input id="full_name" value={form.full_name} onChange={upd("full_name")} />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" dir="ltr" value={form.email} onChange={upd("email")} />
            </div>
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" dir="ltr" value={form.phone} onChange={upd("phone")} />
            </div>
            <div>
              <Label htmlFor="wilaya">الولاية</Label>
              <Input id="wilaya" value={form.wilaya} onChange={upd("wilaya")} />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" dir="ltr" value={form.password} onChange={upd("password")} />
            </div>

            {accountType === "project_owner" && (
              <div className="sm:col-span-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-bold">وثائق المشروع المطلوبة</h2>
                </div>
                <p className="text-xs leading-loose text-muted-foreground">
                  لقبول مشروعك في المنصة، يجب رفع جميع الوثائق التالية. تُحفظ بشكل خاص وآمن ولا يطّلع عليها سوى فريق التحقق.
                </p>

                <div className="mt-4">
                  <Label className="mb-2 block">نوع المشروع</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { v: "established" as const, label: "مشروع قائم / مؤسسة" },
                      { v: "startup" as const, label: "شركة ناشئة" },
                    ]).map((c) => (
                      <button key={c.v} type="button" onClick={() => setProjectCategory(c.v)}
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          projectCategory === c.v ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"
                        }`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {requiredDocs.map((d) => (
                    <div key={d.key} className="rounded-lg border border-border bg-background p-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`f-${d.key}`} className="text-sm">
                          {d.label} {d.required && <span className="text-destructive">*</span>}
                        </Label>
                        {files[d.key] && <span className="text-[10px] text-primary">✓ {files[d.key]?.name.slice(0, 28)}</span>}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <Input id={`f-${d.key}`} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                          onChange={(e) => setFiles({ ...files, [d.key]: e.target.files?.[0] ?? null })}
                          className="cursor-pointer" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="bg-gradient-hero shadow-soft sm:col-span-2" disabled={loading}>
              {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            لديك حساب؟ <Link to="/login" className="font-semibold text-primary hover:underline">سجّل الدخول</Link>
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
