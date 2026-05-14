'use client'
// src/components/editor/EditorTopbar.tsx
import Link from 'next/link'
import { ArrowLeft, Eye, Save, Send } from 'lucide-react'
import type { Route } from 'next'
import type { Role } from '@/types/database'

interface Props {
  saveStatus:   'saved' | 'saving' | 'unsaved' | 'error'
  onSubmit:     () => void
  onSaveDraft:  () => void
  articleId:    string | null
  userRole:     Role | null
}

const SUBMIT_LABEL: Partial<Record<Role, string>> = {
  design_layout: 'Kirim ke Tim Redaksi',
  redaksi:       'Kirim ke Tim Publikasi',
  publikasi:     'Terbitkan Artikel',
  admin:         'Submit untuk Review',
}

export function EditorTopbar({ saveStatus, onSubmit, onSaveDraft, articleId, userRole }: Props) {
  const dotColor = {
    saved:   'bg-green-400',
    saving:  'bg-yellow-400 animate-pulse',
    unsaved: 'bg-gray-300',
    error:   'bg-red-400',
  }[saveStatus]

  const dotLabel = {
    saved:   'Tersimpan',
    saving:  'Menyimpan...',
    unsaved: 'Belum tersimpan',
    error:   'Gagal simpan',
  }[saveStatus]

  const submitLabel = userRole ? (SUBMIT_LABEL[userRole] ?? 'Submit untuk Review') : 'Submit untuk Review'

  return (
    <div className="h-[52px] border-b border-[rgba(28,43,43,0.08)] flex items-center px-6 gap-4 bg-white flex-shrink-0">
      <Link href="/editor/drafts"
        className="flex items-center gap-1.5 text-[13px] text-[var(--ink-lt)] hover:text-[var(--ink)] transition-colors">
        <ArrowLeft size={14} /> Kembali
      </Link>

      <div className="flex items-center gap-1.5 text-[13px] text-[var(--ink-lt)] ml-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {dotLabel}
      </div>

      <div className="ml-auto flex gap-2">
        {articleId && (
          <Link href={`/artikel/preview/${articleId}` as Route} target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] text-[var(--ink-lt)] hover:text-[var(--ink)] hover:bg-[rgba(28,43,43,0.06)] rounded-lg transition-colors">
            <Eye size={14} /> Preview
          </Link>
        )}
        <button onClick={onSaveDraft}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] border border-[rgba(28,43,43,0.14)] text-[var(--ink-md)] rounded-lg hover:border-[var(--ink-lt)] transition-colors">
          <Save size={14} /> Simpan Draft
        </button>
        <button onClick={onSubmit}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] bg-[var(--ink)] text-white font-semibold rounded-lg hover:bg-[var(--coral)] transition-colors">
          <Send size={14} /> {submitLabel}
        </button>
      </div>
    </div>
  )
}