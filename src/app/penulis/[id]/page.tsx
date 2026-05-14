// src/app/penulis/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArtikelCard } from '@/components/artikel/ArtikelCard'
import type { ArtikelLengkap } from '@/types/database'
import { ROLE_LABELS } from '@/types/database'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('nama_lengkap,bio').eq('id', params.id).single()
  if (!data) return { title: 'Penulis Tidak Ditemukan' }
  return {
    title: data.nama_lengkap ?? 'Profil Penulis',
    description: data.bio ?? undefined,
  }
}

export default async function PenulisDetailPage({ params }: Props) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, kelompok_anggota(kelompok_id, kelompok(nama, nomor))')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (!profile) notFound()

  // Ambil artikel dari tabel artikel_penulis
  const { data: penulisArtikel } = await supabase
    .from('artikel_penulis')
    .select('artikel_id')
    .eq('profile_id', params.id)

  const artikelIds = (penulisArtikel ?? []).map(p => p.artikel_id)

  let artikel: ArtikelLengkap[] = []
  if (artikelIds.length > 0) {
    const { data } = await supabase
      .from('artikel_lengkap')
      .select('*')
      .in('id', artikelIds)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    artikel = (data ?? []) as ArtikelLengkap[]
  }

  const kelompok = (profile as any).kelompok_anggota?.[0]?.kelompok
  const roleLabel = ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS] ?? profile.role

  return (
    <div className="pt-[80px] bg-[var(--paper)] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-[var(--cream)] to-[var(--paper)] border-b border-[rgba(28,43,43,0.08)] py-12 px-6">
        <div className="max-w-[900px] mx-auto">
          <Link href="/penulis"
            className="text-[12px] text-[var(--ink-lt)] hover:text-[var(--coral)] transition-colors mb-6 inline-block">
            ← Kembali ke Daftar Penulis
          </Link>
          <div className="flex gap-6 items-start flex-wrap">
            {profile.foto_url ? (
              <Image src={profile.foto_url} alt={profile.nama_lengkap ?? ''}
                width={96} height={96}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg flex-shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[var(--coral)] flex items-center justify-center text-[32px] font-bold text-white ring-4 ring-white shadow-lg flex-shrink-0">
                {(profile.nama_lengkap ?? 'U').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-[36px] font-bold text-[var(--ink)] tracking-tight mb-1">
                {profile.nama_lengkap ?? 'Penulis'}
              </h1>
              <p className="text-[14px] text-[var(--ink-lt)] mb-3">
                {profile.nim && <span>{profile.nim} · </span>}
                {profile.email}
              </p>
              <div className="flex gap-2 flex-wrap mb-3">
                <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[var(--coral-lt)] text-[#C05030]">
                  {roleLabel}
                </span>
                {kelompok && (
                  <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[var(--sage-lt)] text-[#3D7050]">
                    Kelompok {kelompok.nomor}: {kelompok.nama}
                  </span>
                )}
                {profile.no_telepon && (
                  <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[rgba(28,43,43,0.07)] text-[var(--ink-md)]">
                    📞 {profile.no_telepon}
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="text-[14px] text-[var(--ink-lt)] leading-[1.75] max-w-[600px]">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-[rgba(28,43,43,0.07)] bg-white">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex gap-8">
          <div className="text-center">
            <div className="font-display text-[28px] font-bold text-[var(--ink)]">{artikel.length}</div>
            <div className="text-[11px] text-[var(--ink-lt)]">Artikel Terbit</div>
          </div>
          <div className="text-center">
            <div className="font-display text-[28px] font-bold text-[var(--ink)]">
              {artikel.reduce((s, a) => s + a.view_count, 0)}
            </div>
            <div className="text-[11px] text-[var(--ink-lt)]">Total Views</div>
          </div>
          {kelompok && (
            <div className="text-center">
              <div className="font-display text-[28px] font-bold text-[var(--ink)]">{kelompok.nomor}</div>
              <div className="text-[11px] text-[var(--ink-lt)]">No. Kelompok</div>
            </div>
          )}
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-[900px] mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-display text-[24px] font-bold text-[var(--ink)] tracking-tight">
            Artikel Diterbitkan
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--coral-lt)] text-[var(--coral)] text-[12px] font-bold">
            {artikel.length}
          </span>
        </div>
        {artikel.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artikel.map(a => <ArtikelCard key={a.id} artikel={a} />)}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-[rgba(28,43,43,0.10)] rounded-xl text-[var(--ink-lt)]">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-[14px] font-medium text-[var(--ink)] mb-1">Belum ada artikel</p>
            <p className="text-[13px]">Artikel yang diterbitkan oleh penulis ini akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
  )
}