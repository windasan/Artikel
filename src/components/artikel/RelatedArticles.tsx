'use client'
// src/components/artikel/RelatedArticles.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ArtikelLengkap } from '@/types/database'
import { ArtikelCard } from './ArtikelCard'

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
      .limit(3)
      .then(({ data }) => {
        setRelated((data ?? []) as ArtikelLengkap[])
        setLoading(false)
      })
  }, [kategoriId, currentId, supabase])

  if (loading || related.length === 0) return null

  return (
    <section className="max-w-[1080px] mx-auto px-6 py-12 border-t border-[rgba(28,43,43,0.08)]">
      <h2 className="font-display text-[24px] font-bold text-[var(--ink)] mb-6 tracking-tight">
        Artikel Terkait
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map(a => (
          <ArtikelCard key={a.id} artikel={a} />
        ))}
      </div>
    </section>
  )
}
