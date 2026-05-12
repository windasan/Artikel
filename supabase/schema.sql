-- ============================================================
-- JURNAL PARIWISATA UNY — Supabase Schema
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- untuk full-text search

-- ============================================================
-- 1. PROFILES (extends auth.users dari Supabase Auth)
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  nama_lengkap  TEXT,
  nim           TEXT UNIQUE,
  no_telepon    TEXT,
  foto_url      TEXT,
  bio           TEXT,
  role          TEXT DEFAULT 'penulis' CHECK (role IN ('penulis','editor','reviewer','koordinator','admin')),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can update all profiles"
  ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama_lengkap, foto_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. KELOMPOK RISET
-- ============================================================
CREATE TABLE public.kelompok (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nomor          INTEGER UNIQUE,
  nama           TEXT NOT NULL,
  deskripsi      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.kelompok ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kelompok viewable by all" ON public.kelompok FOR SELECT USING (true);
CREATE POLICY "Admin manage kelompok" ON public.kelompok FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','koordinator'))
);

-- ============================================================
-- 3. KELOMPOK ANGGOTA (many-to-many: profiles ↔ kelompok)
-- ============================================================
CREATE TABLE public.kelompok_anggota (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kelompok_id  UUID REFERENCES public.kelompok(id) ON DELETE CASCADE,
  profile_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE (kelompok_id, profile_id)
);

ALTER TABLE public.kelompok_anggota ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kelompok anggota viewable by all" ON public.kelompok_anggota FOR SELECT USING (true);
CREATE POLICY "Admin manage anggota" ON public.kelompok_anggota FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','koordinator'))
);

-- ============================================================
-- 4. KATEGORI ARTIKEL
-- ============================================================
CREATE TABLE public.kategori (
  id       UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama     TEXT UNIQUE NOT NULL,
  slug     TEXT UNIQUE NOT NULL,
  warna    TEXT DEFAULT '#F08060',
  icon     TEXT DEFAULT '📄'
);

ALTER TABLE public.kategori ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kategori viewable by all" ON public.kategori FOR SELECT USING (true);
CREATE POLICY "Admin manage kategori" ON public.kategori FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','koordinator'))
);

-- Seed kategori
INSERT INTO public.kategori (nama, slug, warna, icon) VALUES
  ('Wisata Alam',          'wisata-alam',          '#F08060', '🌋'),
  ('Wisata Budaya',        'wisata-budaya',         '#7BA68A', '🎭'),
  ('Wisata Kuliner',       'wisata-kuliner',        '#D4A853', '🍜'),
  ('Manajemen Pariwisata', 'manajemen-pariwisata',  '#6DAEC4', '📊'),
  ('Ekowisata',            'ekowisata',             '#7BA68A', '🌿'),
  ('Destinasi Digital',    'destinasi-digital',     '#9B7BC4', '💻');

-- ============================================================
-- 5. ARTIKEL JURNAL
-- ============================================================
CREATE TABLE public.artikel (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  judul           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  subjudul        TEXT,
  abstrak         TEXT,
  konten          TEXT,         -- HTML dari editor
  konten_json     JSONB,        -- Tiptap JSON state
  kata_kunci      TEXT[],
  kategori_id     UUID REFERENCES public.kategori(id),
  kelompok_id     UUID REFERENCES public.kelompok(id),
  volume          TEXT,
  nomor_edisi     TEXT,
  halaman_mulai   INTEGER,
  halaman_selesai INTEGER,
  foto_sampul_url TEXT,
  pdf_url         TEXT,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','pending','published','rejected')),
  catatan_review  TEXT,
  view_count      INTEGER DEFAULT 0,
  created_by      UUID REFERENCES public.profiles(id),
  reviewed_by     UUID REFERENCES public.profiles(id),
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  -- Full-text search
  search_vector   TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('indonesian',
      COALESCE(judul,'') || ' ' ||
      COALESCE(subjudul,'') || ' ' ||
      COALESCE(abstrak,'') || ' ' ||
      COALESCE(array_to_string(kata_kunci,' '),'')
    )
  ) STORED
);

CREATE INDEX artikel_search_idx ON public.artikel USING GIN (search_vector);
CREATE INDEX artikel_status_idx ON public.artikel (status);
CREATE INDEX artikel_kategori_idx ON public.artikel (kategori_id);
CREATE INDEX artikel_created_at_idx ON public.artikel (created_at DESC);

ALTER TABLE public.artikel ENABLE ROW LEVEL SECURITY;

-- Semua orang bisa baca artikel published
CREATE POLICY "Published articles are public"
  ON public.artikel FOR SELECT
  USING (status = 'published' OR auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor','reviewer','koordinator'))
  );

-- Penulis bisa create
CREATE POLICY "Authenticated users can create articles"
  ON public.artikel FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Penulis bisa update artikel sendiri (selagi draft/rejected)
CREATE POLICY "Authors can update own draft articles"
  ON public.artikel FOR UPDATE
  USING (
    auth.uid() = created_by AND status IN ('draft', 'rejected')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor','koordinator'))
  );

-- Admin bisa delete
CREATE POLICY "Admin can delete articles"
  ON public.artikel FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','koordinator')));

-- ============================================================
-- 6. ARTIKEL PENULIS (many-to-many: artikel ↔ profiles)
-- ============================================================
CREATE TABLE public.artikel_penulis (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artikel_id  UUID REFERENCES public.artikel(id) ON DELETE CASCADE,
  profile_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  urutan      INTEGER DEFAULT 1,
  UNIQUE (artikel_id, profile_id)
);

ALTER TABLE public.artikel_penulis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artikel penulis viewable by all" ON public.artikel_penulis FOR SELECT USING (true);
CREATE POLICY "Authors manage their artikel penulis" ON public.artikel_penulis FOR ALL USING (
  EXISTS (SELECT 1 FROM public.artikel WHERE id = artikel_id AND created_by = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','koordinator'))
);

-- ============================================================
-- 7. AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_artikel_updated_at
  BEFORE UPDATE ON public.artikel
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_profile_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 8. STORAGE BUCKETS
-- ============================================================
-- Jalankan di Storage tab Supabase:
-- Bucket: "artikel-pdf"    → public: false
-- Bucket: "artikel-covers" → public: true
-- Bucket: "avatars"        → public: true

-- ============================================================
-- 9. VIEW: ARTIKEL LENGKAP (denormalized)
-- ============================================================
CREATE OR REPLACE VIEW public.artikel_lengkap AS
SELECT
  a.*,
  k.nama        AS kategori_nama,
  k.slug        AS kategori_slug,
  k.warna       AS kategori_warna,
  k.icon        AS kategori_icon,
  kg.nama       AS kelompok_nama,
  kg.nomor      AS kelompok_nomor,
  -- Penulis sebagai JSON array
  (
    SELECT json_agg(json_build_object(
      'id',          p.id,
      'nama',        p.nama_lengkap,
      'nim',         p.nim,
      'foto_url',    p.foto_url,
      'urutan',      ap.urutan
    ) ORDER BY ap.urutan)
    FROM public.artikel_penulis ap
    JOIN public.profiles p ON p.id = ap.profile_id
    WHERE ap.artikel_id = a.id
  ) AS penulis_list
FROM public.artikel a
LEFT JOIN public.kategori k  ON k.id  = a.kategori_id
LEFT JOIN public.kelompok kg ON kg.id = a.kelompok_id;

-- ============================================================
-- 10. FUNCTION: increment view count
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_view(artikel_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.artikel SET view_count = view_count + 1 WHERE id = artikel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 11. SEED DATA CONTOH
-- ============================================================
-- (Jalankan setelah insert user pertama di auth.users)
-- INSERT INTO public.kelompok (nomor, nama) VALUES
--   (1, 'Kelompok Merapi'),
--   (2, 'Kelompok Kraton'),
--   (3, 'Kelompok Sleman');
