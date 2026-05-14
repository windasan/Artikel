// src/components/admin/AdminStats.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Clock, CheckCircle2, Users } from 'lucide-react'

export function AdminStats() {
  const supabase = createClient()
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, authors: 0 })

  useEffect(() => {
    async function fetchStats() {
      const [art, auth] = await Promise.all([
        supabase.from('artikel').select('status'),
        supabase.from('profiles').select('id')
      ])

      const data = art.data || []
      setStats({
        total: data.length,
        pending: data.filter(a => a.status === 'pending_redaksi' || a.status === 'pending_publikasi').length,
        published: data.filter(a => a.status === 'published').length,
        authors: auth.data?.length || 0
      })
    }
    fetchStats()
  }, [supabase])

  const cards = [
    { label: 'Total Artikel', val: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Menunggu Review', val: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Sudah Terbit', val: stats.published, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Penulis', val: stats.authors, icon: Users, color: 'text-[#655348]', bg: 'bg-[#655348]/5' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c, i) => (
        <div key={i} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all">
          <div className={`w-12 h-12 ${c.bg} ${c.color} rounded-2xl flex items-center justify-center mb-6`}>
            <c.icon size={24} />
          </div>
          <div className="text-4xl font-black text-gray-900 tracking-tighter mb-1">
            {c.val}
          </div>
          <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  )
}