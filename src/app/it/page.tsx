import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ITManager } from '@/components/it/ITManager'

export default async function ITDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/it')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'it' && profile?.role !== 'admin') redirect('/')

  // Ambil semua data master
  const [kelompokRes, usersRes] = await Promise.all([
    supabase.from('kelompok').select('*').order('nomor', { ascending: true }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
  ])

  return (
    <div className="min-h-screen pt-[100px] pb-20  bg-gradient-to-t from-[#FDFBF7] via-transparent to-black/60">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="mb-8">
          <h1 className="font-display text-[32px] font-bold text-[var(--ink)] tracking-tight">IT & System Admin</h1>
          <p className="text-[14px] text-[var(--ink-lt)] mt-1">Manajemen infrastruktur data, kelompok riset, dan hak akses pengguna.</p>
        </div>
        
        {/* Panggil komponen interaktif Client */}
        <ITManager 
          initialKelompok={kelompokRes.data || []} 
          initialUsers={usersRes.data || []} 
        />
      </div>
    </div>
  )
}