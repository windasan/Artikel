'use client'
// src/components/editor/EditorSidebar.tsx

import { useState, useRef } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Kategori, Kelompok, Profile } from '@/types/database'
import { X, Plus, Upload, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface EditorState {
  judul: string; subjudul: string; abstrak: string; konten: string
  konten_json: Record<string, unknown> | null; kata_kunci: string[]
  kategori_id: string; kelompok_id: string; volume: string
  nomor_edisi: string; penulis_ids: string[]
  foto_sampul_url: string | null; pdf_url: string | null
}

interface Props {
  state: EditorState
  updateState: (field: keyof EditorState, value: unknown) => void
  kategoriList: Kategori[]
  kelompokList: Kelompok[]
  allPenulis: Profile[]
  articleId: string | null
  supabase: SupabaseClient
  onSubmit: () => void
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error'
}

function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[rgba(28,43,43,0.07)] pb-5 mb-0">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] group-hover:text-[var(--ink)] transition-colors">
          {title}
        </span>
        {open ? <ChevronUp size={13} className="text-[var(--ink-lt)]" /> : <ChevronDown size={13} className="text-[var(--ink-lt)]" />}
      </button>
      {open && children}
    </div>
  )
}

function InputField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-semibold text-[var(--ink-lt)] mb-1.5">{label}</label>}
      <input {...props}
        className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-lg px-3 py-2 text-[13px] text-[var(--ink)] bg-white outline-none focus:border-[var(--coral)] transition-colors font-body"
      />
    </div>
  )
}

export function EditorSidebar({
  state, updateState, kategoriList, kelompokList,
  allPenulis, articleId, supabase, onSubmit, saveStatus,
}: Props) {
  const [kwInput,      setKwInput]      = useState('')
  const [uploading,    setUploading]    = useState<'cover' | 'pdf' | null>(null)
  const [showPenulisPicker, setShowPenulisPicker] = useState(false)
  const coverRef = useRef<HTMLInputElement>(null)
  const pdfRef   = useRef<HTMLInputElement>(null)

  // ── Kata kunci ────────────────────────────────────────
  const addKataKunci = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && kwInput.trim()) {
      e.preventDefault()
      const kw = kwInput.trim().replace(/,$/, '')
      if (!state.kata_kunci.includes(kw) && state.kata_kunci.length < 8) {
        updateState('kata_kunci', [...state.kata_kunci, kw])
      }
      setKwInput('')
    }
    if (e.key === 'Backspace' && !kwInput && state.kata_kunci.length > 0) {
      updateState('kata_kunci', state.kata_kunci.slice(0, -1))
    }
  }
  const removeKw = (kw: string) => updateState('kata_kunci', state.kata_kunci.filter(k => k !== kw))

  // ── File upload ───────────────────────────────────────
  const uploadFile = async (file: File, type: 'cover' | 'pdf') => {
    if (!articleId) {
      toast.error('Simpan draf terlebih dahulu sebelum upload file')
      return
    }
    setUploading(type)
    const bucket = type === 'cover' ? 'artikel-covers' : 'artikel-pdf'
    const ext    = file.name.split('.').pop()
    const path   = `${articleId}/${type}-${Date.now()}.${ext}`

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) {
      toast.error(`Gagal upload: ${error.message}`)
    } else {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
      updateState(type === 'cover' ? 'foto_sampul_url' : 'pdf_url', urlData.publicUrl)
      toast.success(`${type === 'cover' ? 'Gambar sampul' : 'PDF'} berhasil diupload`)
    }
    setUploading(null)
  }

  // ── Penulis ───────────────────────────────────────────
  const selectedPenulis = allPenulis.filter(p => state.penulis_ids.includes(p.id))
  const availablePenulis = allPenulis.filter(p => !state.penulis_ids.includes(p.id))

  const statusLabels = {
    saved:   { text: 'Tersimpan', color: 'bg-green-400' },
    saving:  { text: 'Menyimpan...', color: 'bg-yellow-400 animate-pulse' },
    unsaved: { text: 'Belum tersimpan', color: 'bg-gray-400' },
    error:   { text: 'Gagal simpan', color: 'bg-red-400' },
  }

  return (
    <div className="w-[300px] flex-shrink-0 bg-white border-l border-[rgba(28,43,43,0.10)] overflow-y-auto h-full">
      <div className="p-5 space-y-5">

        {/* ── Publish ── */}
        <Section title="Publikasi">
          <div className="bg-[var(--cream)] rounded-xl p-4 mb-3">
            <div className="space-y-2 mb-4 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[var(--ink-lt)]">Status</span>
                <span className="font-semibold text-amber-600">📝 Draft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-lt)]">Autosave</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusLabels[saveStatus].color}`} />
                  {statusLabels[saveStatus].text}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-lt)]">ID Artikel</span>
                <span className="font-mono text-[11px] text-[var(--ink-lt)]">{articleId?.slice(0,8) ?? '—'}</span>
              </div>
            </div>
            <button type="button" onClick={onSubmit}
              className="w-full bg-[var(--ink)] text-white rounded-xl py-2.5 text-[14px] font-bold hover:bg-[var(--coral)] transition-colors mb-2">
              Submit untuk Review →
            </button>
            <p className="text-[11px] text-[var(--ink-lt)] text-center leading-relaxed">
              Artikel akan diperiksa admin sebelum ditampilkan ke publik
            </p>
          </div>
        </Section>

        {/* ── Penulis ── */}
        <Section title="Penulis Artikel">
          <div className="space-y-2 mb-2">
            {selectedPenulis.map(p => (
              <div key={p.id} className="flex items-center gap-2.5 p-2 bg-[var(--cream)] rounded-lg border border-[rgba(28,43,43,0.07)]">
                <div className="w-7 h-7 rounded-full bg-[var(--coral)] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {(p.nama_lengkap ?? 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[var(--ink)] truncate">{p.nama_lengkap}</p>
                  <p className="text-[10px] text-[var(--ink-lt)]">{p.nim}</p>
                </div>
                <button type="button" onClick={() => updateState('penulis_ids', state.penulis_ids.filter(id => id !== p.id))}
                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[rgba(28,43,43,0.1)] transition-colors">
                  <X size={10} className="text-[var(--ink-lt)]" />
                </button>
              </div>
            ))}
          </div>

          {state.penulis_ids.length < 2 && (
            <div className="relative">
              <button type="button" onClick={() => setShowPenulisPicker(!showPenulisPicker)}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--coral)] hover:text-[var(--ink)] transition-colors">
                <Plus size={13} /> Tambah Penulis
              </button>
              {showPenulisPicker && availablePenulis.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[rgba(28,43,43,0.12)] rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                  {availablePenulis.map(p => (
                    <button key={p.id} type="button"
                      onClick={() => {
                        updateState('penulis_ids', [...state.penulis_ids, p.id])
                        setShowPenulisPicker(false)
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-[var(--cream)] transition-colors text-left">
                      <div className="w-6 h-6 rounded-full bg-[var(--sage)] flex items-center justify-center text-[9px] font-bold text-white">
                        {(p.nama_lengkap ?? 'U').slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-[var(--ink)]">{p.nama_lengkap}</p>
                        <p className="text-[10px] text-[var(--ink-lt)]">{p.nim}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Section>

        {/* ── Kategori & Kelompok ── */}
        <Section title="Klasifikasi">
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-[var(--ink-lt)] mb-1.5">Kategori *</label>
            <select value={state.kategori_id} onChange={e => updateState('kategori_id', e.target.value)}
              className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-lg px-3 py-2 text-[13px] text-[var(--ink)] bg-white outline-none focus:border-[var(--coral)] cursor-pointer font-body">
              <option value="">Pilih kategori...</option>
              {kategoriList.map(k => (
                <option key={k.id} value={k.id}>{k.icon} {k.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--ink-lt)] mb-1.5">Kelompok Riset</label>
            <select value={state.kelompok_id} onChange={e => updateState('kelompok_id', e.target.value)}
              className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-lg px-3 py-2 text-[13px] text-[var(--ink)] bg-white outline-none focus:border-[var(--coral)] cursor-pointer font-body">
              <option value="">Pilih kelompok...</option>
              {kelompokList.map(k => (
                <option key={k.id} value={k.id}>Kelompok {k.nomor}: {k.nama}</option>
              ))}
            </select>
          </div>
        </Section>

        {/* ── Abstrak ── */}
        <Section title="Abstrak *">
          <textarea
            value={state.abstrak}
            onChange={e => updateState('abstrak', e.target.value)}
            placeholder="Ringkasan artikel (150–250 kata)..."
            rows={5}
            className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-lg px-3 py-2 text-[13px] text-[var(--ink)] bg-white outline-none focus:border-[var(--coral)] resize-y font-body leading-relaxed"
          />
          <p className="text-[11px] text-[var(--ink-lt)] mt-1">
            {state.abstrak.split(/\s+/).filter(Boolean).length} kata
          </p>
        </Section>

        {/* ── Kata Kunci ── */}
        <Section title="Kata Kunci">
          <div className="flex flex-wrap gap-1.5 p-2.5 border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-lg min-h-[44px] cursor-text focus-within:border-[var(--coral)] transition-colors">
            {state.kata_kunci.map(kw => (
              <span key={kw} className="flex items-center gap-1 px-2.5 py-0.5 bg-[var(--coral-lt)] rounded-full text-[11px] font-semibold text-[var(--coral-dark)]">
                {kw}
                <button type="button" onClick={() => removeKw(kw)}>
                  <X size={9} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={kwInput}
              onChange={e => setKwInput(e.target.value)}
              onKeyDown={addKataKunci}
              placeholder={state.kata_kunci.length === 0 ? 'Ketik dan tekan Enter...' : ''}
              className="flex-1 min-w-[80px] border-none outline-none text-[12px] bg-transparent font-body"
            />
          </div>
          <p className="text-[11px] text-[var(--ink-lt)] mt-1">{state.kata_kunci.length}/8 kata kunci</p>
        </Section>

        {/* ── Upload Cover ── */}
        <Section title="Gambar Sampul">
          <input ref={coverRef} type="file" accept="image/*" className="hidden"
            onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0], 'cover') }} />
          {state.foto_sampul_url ? (
            <div className="relative rounded-xl overflow-hidden mb-2">
              <Image src={state.foto_sampul_url} alt="Cover" width={280} height={150} className="w-full h-28 object-cover" />
              <button type="button"
                onClick={() => updateState('foto_sampul_url', null)}
                className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow">
                <X size={12} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => coverRef.current?.click()}
              className="w-full border-2 border-dashed border-[rgba(28,43,43,0.15)] rounded-xl p-6 text-center hover:border-[var(--coral)] hover:bg-[var(--coral-lt)] transition-colors">
              <div className="text-2xl mb-1.5">{uploading === 'cover' ? '⏳' : '🖼'}</div>
              <p className="text-[12px] text-[var(--ink-lt)]">{uploading === 'cover' ? 'Mengupload...' : 'Klik untuk upload gambar'}</p>
              <p className="text-[10px] text-[var(--ink-lt)] mt-0.5">PNG/JPG · Min 800×500px</p>
            </button>
          )}
        </Section>

        {/* ── Upload PDF ── */}
        <Section title="File PDF Artikel">
          <input ref={pdfRef} type="file" accept=".pdf" className="hidden"
            onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0], 'pdf') }} />
          {state.pdf_url ? (
            <div className="flex items-center gap-3 p-3 bg-[var(--cream)] rounded-xl border border-[rgba(28,43,43,0.08)]">
              <div className="text-xl">📄</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[var(--ink)] truncate">PDF tersimpan</p>
                <p className="text-[10px] text-[var(--ink-lt)]">Klik untuk ganti</p>
              </div>
              <button type="button" onClick={() => pdfRef.current?.click()}
                className="text-[11px] text-[var(--coral)] font-semibold">Ganti</button>
            </div>
          ) : (
            <button type="button" onClick={() => pdfRef.current?.click()}
              className="w-full border-2 border-dashed border-[rgba(28,43,43,0.15)] rounded-xl p-6 text-center hover:border-[var(--coral)] hover:bg-[var(--coral-lt)] transition-colors">
              <div className="text-2xl mb-1.5">{uploading === 'pdf' ? '⏳' : '📄'}</div>
              <p className="text-[12px] text-[var(--ink-lt)]">{uploading === 'pdf' ? 'Mengupload...' : 'Klik untuk upload PDF'}</p>
              <p className="text-[10px] text-[var(--ink-lt)] mt-0.5">Format PDF · Maks 10MB</p>
            </button>
          )}
        </Section>

        {/* ── Volume & Edisi ── */}
        <Section title="Volume & Edisi" defaultOpen={false}>
          <InputField label="Volume" value={state.volume} onChange={e => updateState('volume', e.target.value)} placeholder="Contoh: Vol.1" />
          <InputField label="Nomor Edisi" value={state.nomor_edisi} onChange={e => updateState('nomor_edisi', e.target.value)} placeholder="Contoh: No.1" />
        </Section>

      </div>
    </div>
  )
}
