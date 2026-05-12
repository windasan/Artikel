// src/app/editor/new/page.tsx
// Renders the editor for creating a NEW article
'use client'

import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues with Tiptap
const EditorContainer = dynamic(
  () => import('@/components/editor/EditorContainer').then(m => ({ default: m.EditorContainer })),
  { ssr: false, loading: () => <div className="min-h-screen pt-[60px] flex items-center justify-center text-[var(--ink-lt)] text-sm">Memuat editor...</div> }
)

export default function EditorNewPage() {
  return <EditorContainer articleId={null} />
}
