import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { 
  Shield, FileText, Users, Globe, 
  ArrowRight, Activity, Zap, Layers 
} from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  // Fetching data global untuk statistik
  const [articles, users, groups] = await Promise.all([
    supabase.from('artikel').select('status'),
    supabase.from('profiles').select('role'),
    supabase.from('kelompok').select('id', { count: 'exact' })
  ])

  const stats = {
    totalArticles: articles.data?.length || 0,
    pendingReview: articles.data?.filter(a => a.status === 'pending_redaksi').length || 0,
    readyPublish: articles.data?.filter(a => a.status === 'pending_publikasi').length || 0,
    totalUsers: users.data?.length || 0,
    totalGroups: groups.count || 0
  }

  return (
    <div className="min-h-screen pt-[100px] pb-20  bg-gradient-to-t from-[#655348] via-transparent to-[#655438]/40">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#D9D9D9] pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#655348] rounded-lg flex items-center justify-center text-white">
                <Zap size={16} />
              </div>
              <span className="text-[12px] font-black uppercase tracking-[3px] text-[#655348]/40">System Overview</span>
            </div>
            <h1 className="font-display text-[42px] font-black text-[#655348] tracking-tighter leading-none">Pusat Kendali Admin</h1>
            <p className="text-[16px] text-[#655348]/60 mt-3 font-medium max-w-xl">
              Akses menyeluruh ke seluruh modul sistem: Redaksi, Publikasi, dan Manajemen IT dalam satu tampilan terpadu.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-6 py-4 bg-[#D9D9D9]/40 rounded-3xl border border-[#D9D9D9] text-center">
              <p className="text-[20px] font-black text-[#655348]">{stats.totalArticles}</p>
              <p className="text-[10px] font-bold uppercase text-[#655348]/50">Total Artikel</p>
            </div>
            <div className="px-6 py-4 bg-[#D9D9D9]/40 rounded-3xl border border-[#D9D9D9] text-center">
              <p className="text-[20px] font-black text-[#655348]">{stats.totalUsers}</p>
              <p className="text-[10px] font-bold uppercase text-[#655348]/50">Pengguna</p>
            </div>
          </div>
        </div>

        {/* Akses Modul Cepat (Role Modules) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Modul Redaksi */}
          <Link href="/redaksi" className="group bg-[#FFFFFF] border border-[#D9D9D9] rounded-[32px] p-8 hover:border-[#655348] transition-all duration-500 shadow-sm hover:shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <FileText size={120} />
            </div>
            <div className="w-12 h-12 bg-[#D9D9D9]/40 rounded-2xl flex items-center justify-center text-[#655348] mb-6">
              <FileText size={24} />
            </div>
            <h3 className="text-[24px] font-black text-[#655348] mb-2">Ruang Redaksi</h3>
            <p className="text-[14px] text-[#655348]/60 mb-6 font-medium">Kelola moderasi naskah dan evaluasi kualitas konten.</p>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#655348] bg-[#D9D9D9]/30 px-3 py-1 rounded-full">
                {stats.pendingReview} Menunggu
              </span>
              <ArrowRight size={20} className="text-[#655348] transform group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Modul Publikasi */}
          <Link href="/publikasi" className="group bg-[#FFFFFF] border border-[#D9D9D9] rounded-[32px] p-8 hover:border-[#655348] transition-all duration-500 shadow-sm hover:shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Globe size={120} />
            </div>
            <div className="w-12 h-12 bg-[#D9D9D9]/40 rounded-2xl flex items-center justify-center text-[#655348] mb-6">
              <Globe size={24} />
            </div>
            <h3 className="text-[24px] font-black text-[#655348] mb-2">Ruang Publikasi</h3>
            <p className="text-[14px] text-[#655348]/60 mb-6 font-medium">Finalisasi SEO, metadata, dan penerbitan artikel ke publik.</p>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#655348] bg-[#D9D9D9]/30 px-3 py-1 rounded-full">
                {stats.readyPublish} Siap Terbit
              </span>
              <ArrowRight size={20} className="text-[#655348] transform group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Modul IT & System */}
          <Link href="/it" className="group bg-[#655348] border border-[#655348] rounded-[32px] p-8 transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Layers size={120} />
            </div>
            <div className="w-12 h-12 bg-[#FFFFFF]/10 rounded-2xl flex items-center justify-center text-white mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-[24px] font-black text-white mb-2">Ruang IT</h3>
            <p className="text-[14px] text-white/60 mb-6 font-medium">Manajemen user, kelompok riset, dan konfigurasi hak akses.</p>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                {stats.totalGroups} Kelompok
              </span>
              <ArrowRight size={20} className="text-white transform group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Recent Activity / Log (Opsional) */}
        <div className="mt-12 bg-[#FFFFFF] border border-[#D9D9D9] rounded-[32px] p-8">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={20} className="text-[#655348]" />
            <h2 className="font-bold text-[18px] text-[#655348]">Aktivitas Sistem Terakhir</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-[#D9D9D9]/30 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-[14px] text-[#655348] font-medium">Status server optimal dan database terhubung.</p>
              </div>
              <span className="text-[12px] text-[#655348]/40 font-bold uppercase">Online</span>
            </div>
            {/* Tambahkan log aktivitas dinamis di sini jika diperlukan */}
          </div>
        </div>

      </div>
    </div>
  )
}