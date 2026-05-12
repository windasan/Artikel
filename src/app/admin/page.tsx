// src/app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminStats } from '@/components/admin/AdminStats'
import { PendingTable } from '@/components/admin/PendingTable'
import { AllArticlesTable } from '@/components/admin/AllArticlesTable'
import { UploadPenulisForm } from '@/components/admin/UploadPenulisForm'
import type { ArtikelLengkap, Profile } from '@/types/database'

async function getAdminData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile || !['admin','koordinator','editor'].includes(profile.role)) {
    redirect('/?error=unauthorized')
  }

  const [pending, all, penulisList, stats] = await Promise.all([
    supabase.from('artikel_lengkap').select('*').eq('status','pending').order('created_at', { ascending: false }),
    supabase.from('artikel_lengkap').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('profiles').select('*').eq('is_active', true).order('nama_lengkap'),
    Promise.all([
      supabase.from('artikel').select('id',{count:'exact',head:true}).eq('status','published'),
      supabase.from('artikel').select('id',{count:'exact',head:true}).eq('status','pending'),
      supabase.from('profiles').select('id',{count:'exact',head:true}),
      supabase.from('artikel').select('view_count'),
    ])
  ])

  const totalViews = (stats[3].data ?? []).reduce((s: number, a: { view_count: number }) => s + (a.view_count ?? 0), 0)

  return {
    profile: profile as Profile,
    pendingArtikel: (pending.data ?? []) as ArtikelLengkap[],
    allArtikel: (all.data ?? []) as ArtikelLengkap[],
    penulisList: (penulisList.data ?? []) as Profile[],
    stats: {
      published: stats[0].count ?? 0,
      pending:   stats[1].count ?? 0,
      penulis:   stats[2].count ?? 0,
      views:     totalViews,
    },
  }
}

export default async function AdminPage() {
  const { profile, pendingArtikel, allArtikel, penulisList, stats } = await getAdminData()

  return (
    <div className="pt-[60px] min-h-screen bg-[var(--paper)]">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-[32px] font-bold text-[var(--ink)] tracking-tight">
              Panel Admin
            </h1>
            <p className="text-[14px] text-[var(--ink-lt)] mt-1">
              Selamat datang, <span className="font-semibold text-[var(--ink)]">{profile.nama_lengkap}</span>
              {' '}· <span className="capitalize text-[var(--coral)]">{profile.role}</span>
            </p>
          </div>
          <a href="/editor/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors">
            ✏️ Tulis Artikel Baru
          </a>
        </div>

        {/* KPI Stats */}
        <AdminStats stats={stats} />

        {/* Pending review */}
        {pendingArtikel.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-[22px] font-bold text-[var(--ink)]">
                ⏳ Menunggu Persetujuan
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--coral)] text-white text-[12px] font-bold">
                {pendingArtikel.length}
              </span>
            </div>
            <PendingTable articles={pendingArtikel} />
          </div>
        )}

        {/* All Articles */}
        <div className="mb-8">
          <h2 className="font-display text-[22px] font-bold text-[var(--ink)] mb-4">
            📄 Semua Artikel
          </h2>
          <AllArticlesTable articles={allArtikel} />
        </div>

        {/* Upload Penulis */}
        <div className="mb-8">
          <h2 className="font-display text-[22px] font-bold text-[var(--ink)] mb-4">
            👤 Kelola Penulis
          </h2>
          <UploadPenulisForm penulisList={penulisList} />
        </div>
      </div>
    </div>
  )
}
