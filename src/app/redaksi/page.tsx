import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FileText, Clock, AlertCircle } from 'lucide-react'
import { RedaksiActions } from '@/components/redaksi/RedaksiActions'

export default async function RedaksiDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/redaksi')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'redaksi' && profile?.role !== 'admin') redirect('/')

  const { data: pendingArticles } = await supabase
    .from('artikel')
    .select(`id, judul, created_at, profiles!artikel_created_by_fkey(nama_lengkap)`)
    .eq('status', 'pending_redaksi')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen pt-[100px] pb-20  bg-gradient-to-t from-[#FDFBF7] via-transparent to-black/60">
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-10 border-b border-[#D9D9D9] pb-6">
          <div className="flex items-center gap-3 mb-2">
            {/* <div className="px-3 py-1 bg-[#D9D9D9]/40 rounded-full text-[#655348] text-[11px] font-black uppercase tracking-widest">Ruang Kerja</div> */}
          </div>
          <h1 className="font-display text-[36px] font-black text-[#655348] tracking-tight">Tim Redaksi</h1>
          <p className="text-[15px] text-[#655348]/60 mt-2 font-medium">Moderasi, sunting, dan evaluasi kelayakan naskah masuk.</p>
        </div>

        {/* Antrean Naskah */}
        <div className="bg-[#FFFFFF] border border-[#D9D9D9] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
          <div className="px-8 py-5 border-b border-[#D9D9D9] bg-[#D9D9D9]/10 flex justify-between items-center">
            <h2 className="font-bold text-[16px] text-[#655348] flex items-center gap-2">
              <FileText size={18} /> Antrean Evaluasi
            </h2>
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#655348]">
              <Clock size={16} /> {pendingArticles?.length || 0} Naskah
            </div>
          </div>
          
          <div className="divide-y divide-[#D9D9D9]/50">
            {pendingArticles && pendingArticles.length > 0 ? (
              pendingArticles.map((art: any) => (
                <div key={art.id} className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#D9D9D9]/10 transition-all duration-300">
                  <div className="flex-1">
                    <h3 className="font-bold text-[20px] text-[#655348] mb-2 leading-snug">{art.judul}</h3>
                    <p className="text-[13px] text-[#655348]/70 font-medium flex items-center gap-2">
                      <span className="font-bold text-[#655348]">{art.profiles?.nama_lengkap}</span>
                      <span className="w-1 h-1 rounded-full bg-[#D9D9D9]"></span>
                      {new Date(art.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <RedaksiActions articleId={art.id} />
                </div>
              ))
            ) : (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#D9D9D9]/30 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={24} className="text-[#655348]/50" />
                </div>
                <p className="text-[15px] text-[#655348]/60 font-medium">Semua naskah telah dievaluasi. Pekerjaan selesai!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}