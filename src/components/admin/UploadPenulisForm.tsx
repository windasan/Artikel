'use client'
// src/components/admin/UploadPenulisForm.tsx
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface FormData { nama_lengkap:string; nim:string; email:string; no_telepon:string; role:string; bio:string }
const EMPTY: FormData = { nama_lengkap:'', nim:'', email:'', no_telepon:'', role:'penulis', bio:'' }

export function UploadPenulisForm({ penulisList }: { penulisList: Profile[] }) {
  const supabase = createClient()
  const router   = useRouter()
  const csvRef   = useRef<HTMLInputElement>(null)

  const [form,     setForm]     = useState<FormData>(EMPTY)
  const [loading,  setLoading]  = useState(false)
  const [tab,      setTab]      = useState<'form'|'csv'|'list'>('form')
  const [search,   setSearch]   = useState('')

  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }))

  // ── Save single penulis ──────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama_lengkap || !form.nim || !form.email) {
      toast.error('Nama, NIM, dan email wajib diisi'); return
    }
    setLoading(true)

    // Cek apakah sudah ada user Supabase dengan email tersebut
    const { data: existing } = await supabase
      .from('profiles').select('id').eq('email', form.email).maybeSingle()

    if (existing) {
      // Update profile yang sudah ada
      const { error } = await supabase.from('profiles').update({
        nama_lengkap: form.nama_lengkap,
        nim:          form.nim,
        no_telepon:   form.no_telepon || null,
        role:         form.role,
        bio:          form.bio || null,
      }).eq('email', form.email)
      if (error) toast.error('Gagal update: ' + error.message)
      else { toast.success('✅ Data penulis diperbarui!'); setForm(EMPTY); router.refresh() }
    } else {
      toast.error('Pengguna dengan email ini belum pernah login. Minta mereka login dulu via Google, lalu update data di sini.', { duration: 6000 })
    }
    setLoading(false)
  }

  // ── CSV bulk import ──────────────────────────────────────
  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const rows = text.split('\n').slice(1).filter(Boolean)
    let ok = 0, fail = 0

    setLoading(true)
    for (const row of rows) {
      const [nama, nim, email, telp, role] = row.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      if (!email) { fail++; continue }
      const { error } = await supabase.from('profiles').update({
        nama_lengkap: nama, nim, no_telepon: telp || null,
        role: role || 'penulis',
      }).eq('email', email)
      if (error) fail++; else ok++
    }
    toast.success(`Import selesai: ${ok} berhasil, ${fail} gagal`)
    setLoading(false)
    router.refresh()
    if (csvRef.current) csvRef.current.value = ''
  }

  const filtered = penulisList.filter(p =>
    p.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
    p.nim?.includes(search) || p.email.includes(search)
  )

  const roleColors: Record<string,string> = {
    penulis:'bg-[var(--sage-lt)] text-[#3D7050]',
    editor:'bg-[var(--sky-lt)] text-[#2A7090]',
    reviewer:'bg-[var(--coral-lt)] text-[#C05030]',
    koordinator:'bg-[var(--gold-lt)] text-[#8A6010]',
    admin:'bg-[rgba(28,43,43,0.1)] text-[var(--ink)]',
  }

  return (
    <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[rgba(28,43,43,0.08)]">
        {([['form','➕ Tambah/Update'],['csv','📋 Import CSV'],['list','👥 Daftar Penulis']] as [string,string][]).map(([key,label]) => (
          <button key={key} onClick={() => setTab(key as 'form'|'csv'|'list')}
            className={`px-5 py-3.5 text-[13px] font-medium border-b-2 transition-colors ${
              tab === key ? 'border-[var(--coral)] text-[var(--ink)] font-semibold' : 'border-transparent text-[var(--ink-lt)] hover:text-[var(--ink)]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ── Form Tab ── */}
        {tab === 'form' && (
          <form onSubmit={handleSave}>
            <p className="text-[13px] text-[var(--ink-lt)] mb-5 leading-relaxed">
              Isi form ini untuk menambah atau memperbarui data penulis. Penulis harus sudah pernah login minimal sekali via Google agar akunnya terdaftar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {[
                { label:'Nama Lengkap *',  key:'nama_lengkap', type:'text',  placeholder:'Sesuai KTM' },
                { label:'NIM *',           key:'nim',          type:'text',  placeholder:'2181XXXXXXX' },
                { label:'Email Gmail *',   key:'email',        type:'email', placeholder:'nama@student.uny.ac.id' },
                { label:'No. Telepon',     key:'no_telepon',   type:'tel',   placeholder:'08xx-xxxx-xxxx' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={form[f.key as keyof FormData]}
                    onChange={e => set(f.key as keyof FormData, e.target.value)}
                    className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[var(--coral)] transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-1.5">Role</label>
                <select value={form.role} onChange={e => set('role', e.target.value)}
                  className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[var(--coral)] cursor-pointer bg-white">
                  {['penulis','editor','reviewer','koordinator'].map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-1.5">Bio Singkat</label>
                <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                  placeholder="Deskripsi singkat penulis (opsional)..."
                  rows={2}
                  className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[var(--coral)] resize-y" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors disabled:opacity-40">
              {loading ? '⏳ Menyimpan...' : '💾 Simpan Data Penulis'}
            </button>
          </form>
        )}

        {/* ── CSV Tab ── */}
        {tab === 'csv' && (
          <div>
            <p className="text-[13px] text-[var(--ink-lt)] mb-4 leading-relaxed">
              Upload file CSV untuk memperbarui data banyak penulis sekaligus. Format kolom:
              <code className="bg-[var(--cream)] px-1.5 py-0.5 rounded text-[12px] ml-1">
                nama_lengkap, nim, email, no_telepon, role
              </code>
            </p>
            <div className="bg-[var(--cream)] rounded-xl p-4 mb-5 font-mono text-[12px] text-[var(--ink-md)]">
              <p className="font-bold text-[var(--ink-lt)] mb-1">Contoh CSV:</p>
              <p>nama_lengkap,nim,email,no_telepon,role</p>
              <p>Rafi Santoso,21812141001,rafi@student.uny.ac.id,08123456789,penulis</p>
              <p>Dian Permata,21812141002,dian@student.uny.ac.id,08234567890,editor</p>
            </div>
            <input ref={csvRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
            <button onClick={() => csvRef.current?.click()} disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors disabled:opacity-40">
              {loading ? '⏳ Mengimport...' : '📋 Pilih File CSV'}
            </button>
          </div>
        )}

        {/* ── List Tab ── */}
        {tab === 'list' && (
          <div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, NIM, atau email..."
              className="w-full border border-[rgba(28,43,43,0.12)] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[var(--coral)] mb-4" />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[rgba(28,43,43,0.025)]">
                    {['#','Nama','NIM','Email','No. HP','Role'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id} className="border-t border-[rgba(28,43,43,0.06)] hover:bg-[rgba(28,43,43,0.015)]">
                      <td className="px-3 py-3 text-[var(--ink-lt)]">{i+1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--coral)] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                            {(p.nama_lengkap ?? 'U').slice(0,2).toUpperCase()}
                          </div>
                          <span className="font-medium text-[var(--ink)]">{p.nama_lengkap ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[var(--ink-lt)]">{p.nim ?? '—'}</td>
                      <td className="px-3 py-3 text-[var(--ink-lt)]">{p.email}</td>
                      <td className="px-3 py-3 text-[var(--ink-lt)]">{p.no_telepon ?? '—'}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${roleColors[p.role] ?? roleColors.penulis}`}>
                          {p.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
