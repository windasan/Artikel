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
    unsaved: 'bg-white/40',
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
    // Topbar cokelat — menyatu dengan strip navbar di atasnya
    <div className="h-[52px] border-b border-white/10 flex items-center px-6 gap-4 bg-[#655348] flex-shrink-0">
      
      {/* Kembali */}
      <Link
        href="/editor/drafts"
        className="flex items-center gap-1.5 text-[13px] text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} /> Kembali
      </Link>

      {/* Status autosave */}
      <div className="flex items-center gap-1.5 text-[13px] text-white/60 ml-2">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
        {dotLabel}
      </div>

      {/* Aksi kanan */}
      <div className="ml-auto flex gap-2">

        {/* Preview — hanya muncul jika artikel sudah punya id */}
        {articleId && (
          <Link
            href={`/artikel/preview/${articleId}` as Route}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Eye size={14} /> Preview
          </Link>
        )}

        {/* Simpan Draft */}
        <button
          onClick={onSaveDraft}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] border border-white/20 text-white/80 rounded-lg hover:border-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Save size={14} /> Simpan Draft
        </button>

        {/* Submit utama */}
        <button
          onClick={onSubmit}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] bg-white text-[#655348] font-bold rounded-lg hover:bg-[#D9D9D9] transition-colors shadow-sm"
        >
          <Send size={14} /> {submitLabel}
        </button>
      </div>
    </div>
  )
}