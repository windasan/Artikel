// src/app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminStats } from '@/components/admin/AdminStats'
import { WorkflowTable } from '@/components/admin/WorkflowTable'
import { AllArticlesTable } from '@/components/admin/AllArticlesTable'
import { UploadPenulisForm } from '@/components/admin/UploadPenulisForm'
import type { ArtikelLengkap, Profile } from '@/types/database'
import { ROLE_LABELS } from '@/types/database'

async function getAdminData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // All roles can access dashboard; redirect truly unauthorized
  if (!profile) redirect('/?error=unauthorized')

  const role = profile.role as string

  const [pendingRedaksi, pendingPublikasi, allArtikel, penulisList, stats] = await Promise.all([
    // Pending redaksi review
    supabase.from('artikel_lengkap').select('*')
      .eq('status', 'pending_redaksi')
      .order('created_at', { ascending: false }),

    // Pending publikasi
    supabase.from('artikel_lengkap').select('*')
      .eq('status', 'pending_publikasi')
      .order('created_at', { ascending: false }),

    // All articles (admin/redaksi/publikasi)
    ['admin', 'redaksi', 'publikasi'].includes(role)
      ? supabase.from('artikel_lengkap').select('*')
          .order('created_at', { ascending: false }).limit(30)
      : Promise.resolve({ data: [] }),

    // Penulis list (admin/it)
    ['admin', 'it'].includes(role)
      ? supabase.from('profiles').select('*').eq('is_active', true).order('nama_lengkap')
      : Promise.resolve({ data: [] }),

    // Stats
    Promise.all([
      supabase.from('artikel').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('artikel').select('id', { count: 'exact', head: true }).eq('status', 'pending_redaksi'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('artikel').select('view_count'),
    ]),
  ])

  const totalViews = (stats[3].data ?? []).reduce(
    (s: number, a: { view_count: number }) => s + (a.view_count ?? 0), 0
  )

  return {
    profile:           profile as Profile,
    role,
    pendingRedaksi:    (pendingRedaksi.data   ?? []) as ArtikelLengkap[],
    pendingPublikasi:  (pendingPublikasi.data  ?? []) as ArtikelLengkap[],
    allArtikel:        (allArtikel.data        ?? []) as ArtikelLengkap[],
    penulisList:       (penulisList.data       ?? []) as Profile[],
    stats: {
      published: stats[0].count ?? 0,
      pending:   (pendingRedaksi.data?.length ?? 0) + (pendingPublikasi.data?.length ?? 0),
      penulis:   stats[2].count ?? 0,
      views:     totalViews,
    },
  }
}

export default async function AdminPage() {
  const { profile, role, pendingRedaksi, pendingPublikasi, allArtikel, penulisList, stats } = await getAdminData()

  const roleLabel = ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role

  return (
    <div className="pt-[60px] min-h-screen bg-[var(--paper)]">
      <div className="max-w-[1200px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-[32px] font-bold text-[var(--ink)] tracking-tight">
              Dashboard
            </h1>
            <p className="text-[14px] text-[var(--ink-lt)] mt-1">
              Selamat datang, <span className="font-semibold text-[var(--ink)]">{profile.nama_lengkap}</span>
              {' '}·{' '}
              <span className="capitalize text-[var(--coral)] font-semibold">{roleLabel}</span>
            </p>
          </div>
          {['admin', 'design_layout'].includes(role) && (
            <a href="/editor/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors">
              ✏️ Upload Artikel Baru
            </a>
          )}
        </div>

        {/* Stats — visible to admin, redaksi, publikasi */}
        {['admin', 'redaksi', 'publikasi'].includes(role) && (
          <AdminStats stats={stats} />
        )}

        {/* ─── REDAKSI SECTION ─── */}
        {(role === 'redaksi' || role === 'admin') && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-[22px] font-bold text-[var(--ink)]">
                ✏️ Antrian Redaksi
              </h2>
              {pendingRedaksi.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[12px] font-bold">
                  {pendingRedaksi.length}
                </span>
              )}
            </div>
            {pendingRedaksi.length === 0 ? (
              <div className="text-center py-10 bg-white border border-[rgba(28,43,43,0.10)] rounded-xl text-[var(--ink-lt)]">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-[14px]">Tidak ada artikel yang perlu direview saat ini</p>
              </div>
            ) : (
              <WorkflowTable
                articles={pendingRedaksi}
                stage="redaksi"
              />
            )}
          </div>
        )}

        {/* ─── PUBLIKASI SECTION ─── */}
        {(role === 'publikasi' || role === 'admin') && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-[22px] font-bold text-[var(--ink)]">
                🚀 Antrian Publikasi
              </h2>
              {pendingPublikasi.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--coral)] text-white text-[12px] font-bold">
                  {pendingPublikasi.length}
                </span>
              )}
            </div>
            {pendingPublikasi.length === 0 ? (
              <div className="text-center py-10 bg-white border border-[rgba(28,43,43,0.10)] rounded-xl text-[var(--ink-lt)]">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-[14px]">Tidak ada artikel yang menunggu publikasi</p>
              </div>
            ) : (
              <WorkflowTable
                articles={pendingPublikasi}
                stage="publikasi"
              />
            )}
          </div>
        )}

        {/* ─── DESIGN LAYOUT: artikel sendiri ─── */}
        {role === 'design_layout' && (
          <div className="mb-8">
            <h2 className="font-display text-[22px] font-bold text-[var(--ink)] mb-4">
              📄 Artikel Saya
            </h2>
            <p className="text-[13px] text-[var(--ink-lt)] mb-4">
              Lihat status artikel yang telah Anda upload di halaman{' '}
              <a href="/editor/drafts" className="text-[var(--coral)] font-semibold hover:underline">
                Draft Artikel →
              </a>
            </p>
          </div>
        )}

        {/* ─── ALL ARTICLES (admin only) ─── */}
        {role === 'admin' && (
          <div className="mb-8">
            <h2 className="font-display text-[22px] font-bold text-[var(--ink)] mb-4">
              📋 Semua Artikel
            </h2>
            <AllArticlesTable articles={allArtikel} />
          </div>
        )}

        {/* ─── KELOLA PENULIS (admin + it) ─── */}
        {['admin', 'it'].includes(role) && (
          <div className="mb-8">
            <h2 className="font-display text-[22px] font-bold text-[var(--ink)] mb-4">
              👤 Kelola Data Anggota
            </h2>
            <UploadPenulisForm penulisList={penulisList} />
          </div>
        )}

      </div>
    </div>
  )
}