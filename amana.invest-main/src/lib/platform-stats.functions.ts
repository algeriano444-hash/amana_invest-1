import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface PlatformStats {
  activeInvestors: number;
  totalAmount: number;
  perProject: Record<string, { amount: number; investors: number }>;
}

export const getPlatformStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<PlatformStats> => {
    const [{ data: invs }, { count: investorsCount }] = await Promise.all([
      supabaseAdmin.from("investments").select("project_id, user_id, total_amount"),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("account_type", "investor"),
    ]);

    const perProject: Record<string, { amount: number; investors: Set<string> }> = {};
    let totalAmount = 0;
    (invs ?? []).forEach((r) => {
      const e = perProject[r.project_id] ?? { amount: 0, investors: new Set<string>() };
      e.amount += Number(r.total_amount ?? 0);
      e.investors.add(r.user_id);
      perProject[r.project_id] = e;
      totalAmount += Number(r.total_amount ?? 0);
    });

    return {
      activeInvestors: investorsCount ?? 0,
      totalAmount,
      perProject: Object.fromEntries(
        Object.entries(perProject).map(([k, v]) => [k, { amount: v.amount, investors: v.investors.size }]),
      ),
    };
  },
);
