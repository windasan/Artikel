'use client'
// src/components/artikel/RelatedArticles.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ArtikelLengkap } from '@/types/database'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  kategoriId: string | null
  currentId:  string
}

export function RelatedArticles({ kategoriId, currentId }: Props) {
  const supabase = createClient()
  const [related, setRelated] = useState<ArtikelLengkap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!kategoriId) { setLoading(false); return }

    supabase
      .from('artikel_lengkap')
      .select('*')
      .eq('status', 'published')
      .eq('kategori_id', kategoriId)
      .neq('id', currentId)
      .limit(4) // Menampilkan 4 artikel terkait
      .then(({ data }) => {
        setRelated((data ?? []) as ArtikelLengkap[])
        setLoading(false)
      })
  }, [kategoriId, currentId, supabase])

  if (loading || related.length === 0) return (
    <p className="text-xs text-gray-400 italic">Belum ada artikel terkait.</p>
  )

  return (
    <div className="flex flex-col gap-5">
      {related.map(a => (
        <Link href={`/artikel/${a.slug}`} key={a.id} className="group flex gap-4 items-center">
          {/* Mini Thumbnail */}
          <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-gray-100">
            <Image 
              src={a.foto_sampul_url || '/Images/Alt.jpg'} // <-- Memastikan huruf A besar
              alt={a.judul} 
              fill 
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          
          {/* Teks Mini Card */}
          <div className="flex flex-col justify-center flex-1">
            <h5 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-[#655348] transition-colors leading-snug mb-1.5">
              {a.judul}
            </h5>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
              {new Date(a.published_at!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}