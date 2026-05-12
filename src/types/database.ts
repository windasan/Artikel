// src/types/database.ts
// Generated types untuk Supabase tables

export type Role = 'penulis' | 'editor' | 'reviewer' | 'koordinator' | 'admin'
export type ArticleStatus = 'draft' | 'pending' | 'published' | 'rejected'

export interface Profile {
  id: string
  email: string
  nama_lengkap: string | null
  nim: string | null
  no_telepon: string | null
  foto_url: string | null
  bio: string | null
  role: Role
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Kelompok {
  id: string
  nomor: number | null
  nama: string
  deskripsi: string | null
  created_at: string
  anggota?: Profile[]
}

export interface Kategori {
  id: string
  nama: string
  slug: string
  warna: string
  icon: string
}

export interface Artikel {
  id: string
  judul: string
  slug: string
  subjudul: string | null
  abstrak: string | null
  konten: string | null
  konten_json: Record<string, unknown> | null
  kata_kunci: string[]
  kategori_id: string | null
  kelompok_id: string | null
  volume: string | null
  nomor_edisi: string | null
  halaman_mulai: number | null
  halaman_selesai: number | null
  foto_sampul_url: string | null
  pdf_url: string | null
  status: ArticleStatus
  catatan_review: string | null
  view_count: number
  created_by: string | null
  reviewed_by: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

// Denormalized view untuk artikel lengkap
export interface ArtikelLengkap extends Artikel {
  kategori_nama: string | null
  kategori_slug: string | null
  kategori_warna: string | null
  kategori_icon: string | null
  kelompok_nama: string | null
  kelompok_nomor: number | null
  penulis_list: Array<{
    id: string
    nama: string | null
    nim: string | null
    foto_url: string | null
    urutan: number
  }> | null
}

// Filter params untuk daftar artikel
export interface ArtikelFilter {
  search?: string
  kategori?: string       // slug
  tahun?: number
  penulis?: string        // profile id
  kelompok?: string       // kelompok id
  status?: ArticleStatus
  orderBy?: 'newest' | 'oldest' | 'az' | 'za' | 'views'
  page?: number
  perPage?: number
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  totalPages: number
  page: number
}
