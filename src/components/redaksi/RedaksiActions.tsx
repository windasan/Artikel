'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Eye, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export function RedaksiActions({ articleId }: { articleId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  const handleUpdate = async (newStatus: 'pending_publikasi' | 'rejected') => {
    const actionType = newStatus === 'pending_publikasi' ? 'approve' : 'reject'
    setLoading(actionType)

    const { error } = await supabase.from('artikel').update({ status: newStatus }).eq('id', articleId)
    if (error) toast.error('Gagal: ' + error.message)
    else {
      toast.success(newStatus === 'pending_publikasi' ? 'Diteruskan ke Publikasi' : 'Dikembalikan')
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
      <Link href={`/editor/${articleId}`} className="px-5 py-2.5 rounded-xl border-2 border-[#D9D9D9] text-[#655348] hover:border-[#655348] transition-all flex items-center gap-2 text-[13px] font-bold">
        <Eye size={16} /> Review
      </Link>
      <button disabled={loading !== null} onClick={() => handleUpdate('rejected')} className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-[#655348] hover:bg-[#D9D9D9]/50 transition-all flex items-center gap-2">
        {loading === 'reject' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />} Tolak
      </button>
      <button disabled={loading !== null} onClick={() => handleUpdate('pending_publikasi')} className="px-6 py-2.5 rounded-xl text-[13px] font-bold bg-[#655348] text-[#FFFFFF] hover:bg-[#655348]/80 shadow-md transition-all flex items-center gap-2">
        {loading === 'approve' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Setujui
      </button>
    </div>
  )
}