'use client'
// src/components/editor/EditorContainer.tsx
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TiptapEditor } from './TiptapEditor'
import { EditorSidebar } from './EditorSidebar'
import { EditorTopbar } from './EditorTopbar'
import type { Kategori, Kelompok, Profile } from '@/types/database'
import type { AuthorType } from '@/types/database'
import toast from 'react-hot-toast'
import type { Route } from 'next'

interface EditorState {
  judul:           string
  subjudul:        string
  abstrak:         string
  konten:          string
  konten_json:     Record<string, unknown> | null
  kata_kunci:      string[]
  kategori_id:     string
  kelompok_id:     string
  author_type:     AuthorType
  volume:          string
  nomor_edisi:     string
  penulis_ids:     string[]
  foto_sampul_url: string | null
  pdf_url:         string | null
}

const EMPTY_STATE: EditorState = {
  judul: '', subjudul: '', abstrak: '', konten: '', konten_json: null,
  kata_kunci: [], kategori_id: '', kelompok_id: '',
  author_type: 'individual',
  volume: 'Vol.1, No.1', nomor_edisi: '1', penulis_ids: [],
  foto_sampul_url: null, pdf_url: null,
}

const AUTOSAVE_MS = 3000

export function EditorContainer({ articleId: initialId }: { articleId: string | null }) {
  const router   = useRouter()
  const supabase = createClient()

  const [state,        setState]      = useState<EditorState>(EMPTY_STATE)
  const [articleId,    setArticleId]  = useState<string | null>(initialId)
  const [saveStatus,   setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const [wordCount,    setWordCount]  = useState(0)
  const [loading,      setLoading]    = useState(true)
  const [myProfile,    setMyProfile]  = useState<Profile | null>(null)
  const [kategoriList, setKategori]   = useState<Kategori[]>([])
  const [kelompokList, setKelompok]   = useState<Kelompok[]>([])
  const [allPenulis,   setAllPenulis] = useState<Profile[]>([])

  // ── Load support data ─────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=' + (initialId ? `/editor/${initialId}` : '/editor/new') as Route)
        return
      }

      const [profileRes, katRes, kgRes, penulisRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('kategori').select('*').order('nama'),
        supabase.from('kelompok').select('*').order('nomor'),
        supabase.from('profiles').select('*').eq('is_active', true).order('nama_lengkap'),
      ])

      setMyProfile(profileRes.data as Profile)
      setKategori(katRes.data ?? [])
      setKelompok(kgRes.data ?? [])
      setAllPenulis(penulisRes.data ?? [])

      if (!initialId && profileRes.data) {
        setState(s => ({ ...s, penulis_ids: [profileRes.data!.id] }))
      }

      if (initialId) {
        const { data: art } = await supabase
          .from('artikel')
          .select('*, artikel_penulis(profile_id)')
          .eq('id', initialId)
          .single()

        if (art) {
          setState({
            judul:           art.judul          ?? '',
            subjudul:        art.subjudul        ?? '',
            abstrak:         art.abstrak         ?? '',
            konten:          art.konten          ?? '',
            konten_json:     art.konten_json,
            kata_kunci:      art.kata_kunci      ?? [],
            kategori_id:     art.kategori_id     ?? '',
            kelompok_id:     art.kelompok_id     ?? '',
            author_type:     (art as any).author_type ?? 'individual',
            volume:          art.volume          ?? '',
            nomor_edisi:     art.nomor_edisi     ?? '',
            foto_sampul_url: art.foto_sampul_url,
            pdf_url:         art.pdf_url,
            penulis_ids:     art.artikel_penulis?.map((ap: { profile_id: string }) => ap.profile_id) ?? [],
          })
        }
      }

      setLoading(false)
    }
    init()
  }, [initialId, supabase, router])

  // ── Auto-populate group members when author_type = group ──────
  useEffect(() => {
    if (state.author_type !== 'group' || !state.kelompok_id) return
    supabase
      .from('kelompok_anggota')
      .select('profile_id')
      .eq('kelompok_id', state.kelompok_id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setState(prev => ({ ...prev, penulis_ids: data.map(m => m.profile_id) }))
        }
      })
  }, [state.author_type, state.kelompok_id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Autosave ──────────────────────────────────────────────────
  const autosave = useCallback(async (s: EditorState) => {
    if (!s.judul.trim()) return
    setSaveStatus('saving')

    const slug = s.judul
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const payload = {
        judul:       s.judul,
        subjudul:    s.subjudul  || null,
        abstrak:     s.abstrak   || null,
        konten:      s.konten,
        konten_json: s.konten_json,
        kata_kunci:  s.kata_kunci,
        kategori_id: s.kategori_id || null,
        kelompok_id: s.kelompok_id || null,
        author_type: s.author_type,
        volume:      s.volume      || null,
        nomor_edisi: s.nomor_edisi || null,
      }

      if (!articleId) {
        const { data, error } = await supabase
          .from('artikel')
          .insert({ ...payload, slug: `${slug}-${Date.now()}`, status: 'draft', created_by: user.id })
          .select()
          .single()

        if (error) throw error
        if (data) {
          setArticleId(data.id)
          if (s.penulis_ids.length > 0) {
            await supabase.from('artikel_penulis').insert(
              s.penulis_ids.map((pid, i) => ({ artikel_id: data.id, profile_id: pid, urutan: i + 1 }))
            )
          }
          window.history.replaceState(null, '', `/editor/${data.id}`)
        }
      } else {
        await supabase.from('artikel').update(payload).eq('id', articleId)
        await supabase.from('artikel_penulis').delete().eq('artikel_id', articleId)
        if (s.penulis_ids.length > 0) {
          await supabase.from('artikel_penulis').insert(
            s.penulis_ids.map((pid, i) => ({ artikel_id: articleId, profile_id: pid, urutan: i + 1 }))
          )
        }
      }

      setSaveStatus('saved')
    } catch (err) {
      console.error('Autosave error:', err)
      setSaveStatus('error')
    }
  }, [articleId, supabase])

  // Debounced autosave
  useEffect(() => {
    if (!state.judul) return
    setSaveStatus('unsaved')
    const t = setTimeout(() => autosave(state), AUTOSAVE_MS)
    return () => clearTimeout(t)
  }, [state, autosave])

  // ── Submit for review ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!state.judul.trim())        { toast.error('Judul artikel wajib diisi'); return }
    if (!state.abstrak.trim())      { toast.error('Abstrak wajib diisi'); return }
    if (!state.kategori_id)         { toast.error('Pilih kategori artikel'); return }
    if (!state.penulis_ids.length)  { toast.error('Minimal satu penulis'); return }

    await autosave(state)
    if (!articleId) { toast.error('Terjadi kesalahan, coba lagi'); return }

    const tid = toast.loading('Mengirim ke Tim Redaksi...')
    const { error } = await supabase
      .from('artikel')
      .update({ status: 'pending_redaksi' })
      .eq('id', articleId)

    if (error) {
      toast.error('Gagal: ' + error.message, { id: tid })
    } else {
      toast.success('Artikel dikirim ke Tim Redaksi!', { id: tid, duration: 5000 })
      router.push('/editor/drafts')
    }
  }

  const update = (field: keyof EditorState, value: unknown) =>
    setState(prev => ({ ...prev, [field]: value }))

  if (loading) {
    return (
      <div className="min-h-screen pt-[60px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--ink-lt)]">
          <div className="w-6 h-6 border-2 border-[var(--coral)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px]">Memuat editor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[60px] flex h-screen overflow-hidden bg-[var(--paper)]">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-[rgba(28,43,43,0.08)]">
        <EditorTopbar
          saveStatus={saveStatus}
          onSubmit={handleSubmit}
          onSaveDraft={() => autosave(state)}
          articleId={articleId}
          userRole={myProfile?.role ?? null}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto px-8 py-6">
            <textarea
              value={state.judul}
              onChange={e => {
                update('judul', e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
              placeholder="Judul Artikel Jurnal..."
              className="w-full border-none outline-none bg-transparent font-display font-bold text-[var(--ink)] tracking-tight leading-[1.15] resize-none overflow-hidden mb-2"
              style={{ fontSize: 'clamp(24px, 3vw, 38px)' }}
              rows={1}
            />
            <input
              type="text"
              value={state.subjudul}
              onChange={e => update('subjudul', e.target.value)}
              placeholder="Subjudul atau tagline opsional..."
              className="w-full border-none outline-none bg-transparent text-[15px] text-[var(--ink-lt)] mb-6 font-body"
            />
            <TiptapEditor
              content={state.konten_json ?? state.konten}
              onChange={(html, json) => {
                update('konten', html)
                update('konten_json', json)
                const words = html.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean)
                setWordCount(words.length)
              }}
            />
            <div className="mt-4 pt-4 border-t border-[rgba(28,43,43,0.07)] text-[12px] text-[var(--ink-lt)] flex gap-4">
              <span>✍️ {wordCount} kata</span>
              <span>⏱ ~{Math.ceil(wordCount / 200) || 1} menit baca</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <EditorSidebar
        state={state}
        updateState={update}
        kategoriList={kategoriList}
        kelompokList={kelompokList}
        allPenulis={allPenulis}
        articleId={articleId}
        supabase={supabase}
        onSubmit={handleSubmit}
        saveStatus={saveStatus}
      />
    </div>
  )
}