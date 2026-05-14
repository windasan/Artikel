// src/app/penulis/page.tsx
import { createClient } from '@/lib/supabase/server'
import { PenulisClientPage } from '@/components/penulis/PenulisClientPage'
import type { Profile, Kelompok } from '@/types/database'

export default async function PenulisPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [penulisRes, kelompokRes, profileRes] = await Promise.all([
    supabase.from('profiles')
      .select('*, kelompok_anggota(kelompok_id, kelompok(nama,nomor))')
      .eq('is_active', true)
      .order('nama_lengkap'),
    supabase.from('kelompok')
      .select('*, kelompok_anggota(profile_id, profiles(id,nama_lengkap,nim,foto_url,role)), artikel(id,judul,slug,status)')
      .order('nomor'),
    user
      ? supabase.from('profiles').select('role').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  const currentUserRole = (profileRes as any)?.data?.role ?? null

  return (
    <>
      <div className="pt-[90px] pb-10 px-6 bg-gradient-to-b from-[var(--cream)] to-[var(--paper)] border-b border-[rgba(28,43,43,0.08)]">
        <div className="max-w-[1100px] mx-auto">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--coral)] block mb-2">Komunitas</span>
          <h1 className="font-display text-[44px] font-bold text-[var(--ink)] tracking-tight mb-2">Penulis & Kelompok</h1>
          <p className="text-[15px] text-[var(--ink-lt)]">Mahasiswa Pariwisata Kelas A UNY beserta kelompok riset</p>
        </div>
      </div>
      <PenulisClientPage
        penulisList={(penulisRes.data ?? []) as Profile[]}
        kelompokList={(kelompokRes.data ?? []) as Kelompok[]}
        currentUserRole={currentUserRole}
      />
    </>
  )
}