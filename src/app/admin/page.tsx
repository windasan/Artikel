// src/app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminStats } from '@/components/admin/AdminStats'
import { AdminTabs } from '@/components/admin/AdminTabs'
import { Settings } from 'lucide-react'
import type { ArtikelLengkap, Profile } from '@/types/database'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'it' && profile?.role !== 'redaksi' && profile?.role !== 'publikasi') {
    redirect('/')
  }

  // MENGAMBIL SEMUA DATA YANG DIBUTUHKAN OLEH TABEL
  const [pendingRedaksi, pendingPublikasi, allArtikel, penulisList] = await Promise.all([
    supabase.from('artikel_lengkap').select('*').eq('status', 'pending_redaksi').order('created_at', { ascending: false }),
    supabase.from('artikel_lengkap').select('*').eq('status', 'pending_publikasi').order('created_at', { ascending: false }),
    supabase.from('artikel_lengkap').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('profiles').select('*').eq('is_active', true).order('nama_lengkap')
  ])

  return (
    <main className="min-h-screen bg-[#FDFBF7] pt-32 pb-24 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#655348]/5 border border-[#655348]/10 text-[10px] font-black tracking-widest uppercase mb-4 text-[#655348]">
            <Settings size={12} /> Control Panel
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">
            Admin <span className="text-[#655348]">Dashboard</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Kelola alur kerja redaksi dan pengaturan anggota tim.</p>
        </div>

        <AdminStats />
        
        {/* MENGIRIM DATA KE ADMINTABS */}
        <AdminTabs 
          pendingRedaksi={(pendingRedaksi.data ?? []) as ArtikelLengkap[]}
          pendingPublikasi={(pendingPublikasi.data ?? []) as ArtikelLengkap[]}
          allArtikel={(allArtikel.data ?? []) as ArtikelLengkap[]}
          penulisList={(penulisList.data ?? []) as Profile[]}
        />

      </div>
    </main>
  )
}