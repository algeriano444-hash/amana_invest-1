
CREATE TYPE public.account_type AS ENUM ('investor', 'project_owner');
CREATE TYPE public.app_role AS ENUM ('admin', 'investor', 'project_owner');
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.investment_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE public.contract_type AS ENUM ('musharaka', 'shares_ownership');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  wilaya TEXT,
  account_type public.account_type NOT NULL DEFAULT 'investor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  id_card_number TEXT,
  id_card_url TEXT,
  selfie_url TEXT,
  project_doc_url TEXT,
  status public.verification_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  shares INTEGER NOT NULL CHECK (shares > 0),
  share_price NUMERIC(14,2) NOT NULL,
  total_amount NUMERIC(14,2) NOT NULL,
  status public.investment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE,
  contract_type public.contract_type NOT NULL,
  project_name TEXT NOT NULL,
  content TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_account_type public.account_type;
  v_role public.app_role;
BEGIN
  v_account_type := COALESCE((NEW.raw_user_meta_data->>'account_type')::public.account_type, 'investor');
  v_role := CASE WHEN v_account_type = 'project_owner' THEN 'project_owner'::public.app_role ELSE 'investor'::public.app_role END;

  INSERT INTO public.profiles (id, full_name, email, phone, wilaya, account_type)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email,
    NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'wilaya', v_account_type);

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role);

  INSERT INTO public.notifications (user_id, title, body)
  VALUES (NEW.id, 'مرحباً بك في Amana Invest', 'تم إنشاء حسابك بنجاح. أكمل توثيق هويتك للاستفادة الكاملة من المنصة.');

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admins view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "view own verification" ON public.identity_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own verification" ON public.identity_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own verification" ON public.identity_verifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "admins manage verifications" ON public.identity_verifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "view own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins view all investments" ON public.investments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "view own contracts" ON public.contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own contracts" ON public.contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins view all contracts" ON public.contracts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
