import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface PurchaseEntry {
  id: string;
  shares: number;
  total_amount: number;
  status: string;
  created_at: string;
  buyer: string;
}

export interface ProjectStats {
  project_id: string;
  totalInvestors: number;
  totalShares: number;
  totalAmount: number;
  recent: PurchaseEntry[];
}

function maskName(email: string | null | undefined, name: string | null | undefined) {
  const src = (name?.trim() || email?.split("@")[0] || "مستثمر").trim();
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return `${parts[0]} ${parts[1][0]}.`;
  const s = parts[0];
  return s.length <= 2 ? s : `${s.slice(0, 2)}***`;
}

export const getProjectPurchases = createServerFn({ method: "GET" })
  .inputValidator((d: { projectId: string }) => d)
  .handler(async ({ data }): Promise<ProjectStats> => {
    const { data: rows } = await supabaseAdmin
      .from("investments")
      .select("id, user_id, shares, total_amount, status, created_at")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: false });

    const list = rows ?? [];
    const ids = Array.from(new Set(list.map((r) => r.user_id)));
    const profileMap: Record<string, { name?: string; email?: string }> = {};
    if (ids.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      (profs ?? []).forEach((p) => (profileMap[p.id] = { name: p.full_name, email: p.email }));
    }

    return {
      project_id: data.projectId,
      totalInvestors: ids.length,
      totalShares: list.reduce((s, r) => s + (r.shares ?? 0), 0),
      totalAmount: list.reduce((s, r) => s + Number(r.total_amount ?? 0), 0),
      recent: list.slice(0, 10).map((r) => ({
        id: r.id,
        shares: r.shares,
        total_amount: Number(r.total_amount),
        status: r.status,
        created_at: r.created_at,
        buyer: maskName(profileMap[r.user_id]?.email, profileMap[r.user_id]?.name),
      })),
    };
  });

export interface RankedProject {
  project_id: string;
  totalInvestors: number;
  totalShares: number;
  totalAmount: number;
}

export const getTopProjects = createServerFn({ method: "GET" }).handler(
  async (): Promise<RankedProject[]> => {
    const { data } = await supabaseAdmin
      .from("investments")
      .select("project_id, user_id, shares, total_amount");
    const map = new Map<string, { investors: Set<string>; shares: number; amount: number }>();
    (data ?? []).forEach((r) => {
      const e = map.get(r.project_id) ?? { investors: new Set(), shares: 0, amount: 0 };
      e.investors.add(r.user_id);
      e.shares += r.shares ?? 0;
      e.amount += Number(r.total_amount ?? 0);
      map.set(r.project_id, e);
    });
    return Array.from(map.entries()).map(([project_id, v]) => ({
      project_id,
      totalInvestors: v.investors.size,
      totalShares: v.shares,
      totalAmount: v.amount,
    }));
  },
);
