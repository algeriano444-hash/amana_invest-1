
INSERT INTO storage.buckets (id, name, public) VALUES ('project-documents', 'project-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "owners read own project docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "owners upload own project docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "owners update own project docs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "owners delete own project docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE TABLE public.project_owner_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  doc_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  project_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_owner_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own owner docs"
ON public.project_owner_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "insert own owner docs"
ON public.project_owner_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins view all owner docs"
ON public.project_owner_documents FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
