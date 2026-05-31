import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getProjectOwnerDocuments = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({ category: z.enum(["startup", "established"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("project_owner_documents")
      .select("doc_type, file_path, created_at")
      .eq("project_category", data.category)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("owner docs query failed:", error);
      return { docs: {} as Record<string, string> };
    }

    // Latest file per doc_type
    const latestByType = new Map<string, string>();
    for (const r of rows ?? []) {
      if (!latestByType.has(r.doc_type)) latestByType.set(r.doc_type, r.file_path);
    }

    const docs: Record<string, string> = {};
    for (const [docType, path] of latestByType) {
      const { data: signed, error: signErr } = await supabaseAdmin.storage
        .from("project-documents")
        .createSignedUrl(path, 60 * 60);
      if (!signErr && signed?.signedUrl) docs[docType] = signed.signedUrl;
    }

    return { docs };
  });
