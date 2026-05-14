import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Hash, BookOpen } from 'lucide-react'

export default async function PenulisDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!profile) redirect('/penulis')

  return (
    <div className="min-h-screen pt-[140px] pb-24 bg-white">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-32 h-32 bg-[#D9D9D9] rounded-full flex items-center justify-center text-[#655348] text-[48px] font-black mb-6 border-4 border-white shadow-xl">
            {profile.nama_lengkap?.charAt(0)}
          </div>
          <h1 className="text-[42px] font-black text-[#655348] tracking-tighter leading-none mb-4">{profile.nama_lengkap}</h1>
          <span className="px-4 py-1.5 bg-[#655348] text-white rounded-full text-[12px] font-bold uppercase tracking-[2px]">
            {profile.role}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 bg-[#D9D9D9]/20 rounded-[32px] border border-[#D9D9D9]">
            <p className="text-[11px] font-black uppercase text-[#655348]/40 mb-4 tracking-widest">Kontak & Identitas</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#655348]">
                <Mail size={18} /> <span className="font-bold text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[#655348]">
                <Hash size={18} /> <span className="font-bold text-sm">{profile.nim || 'NIM Tidak Terdaftar'}</span>
              </div>
            </div>
          </div>
          <div className="p-8 bg-[#D9D9D9]/20 rounded-[32px] border border-[#D9D9D9]">
            <p className="text-[11px] font-black uppercase text-[#655348]/40 mb-4 tracking-widest">Biografi</p>
            <p className="text-sm text-[#655348]/70 leading-relaxed font-medium">
              {profile.bio || "Penulis belum menambahkan biografi singkat."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}