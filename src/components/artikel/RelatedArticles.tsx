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
    // Mengubah grid menjadi flex-col agar berjejer menurun ke bawah
    <div className="flex flex-col gap-4">
      {related.map(a => (
        <ArtikelCard key={a.id} artikel={a} />
      ))}
    </div>
  )
}