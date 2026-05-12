// src/app/editor/[id]/page.tsx
'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const EditorContainer = dynamic(
  () => import('@/components/editor/EditorContainer').then(m => ({ default: m.EditorContainer })),
  { ssr: false, loading: () => <div className="min-h-screen pt-[60px] flex items-center justify-center text-[var(--ink-lt)] text-sm">Memuat editor...</div> }
)

export default function EditorPage() {
  const params    = useParams()
  const rawId     = String(params.id ?? '')
  const articleId = rawId === 'new' || rawId === '__new__' ? null : rawId

  return <EditorContainer articleId={articleId} />
}