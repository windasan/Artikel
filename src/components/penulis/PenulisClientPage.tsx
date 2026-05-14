'use client'
// src/components/penulis/PenulisClientPage.tsx
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Kelompok } from '@/types/database'
import { ROLE_LABELS } from '@/types/database'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import toast from 'react-hot-toast'
import { Plus, X } from 'lucide-react'

interface Props {
  penulisList: Profile[]
  kelompokList: Kelompok[]
  currentUserRole: string | null
}

const ROLE_STYLE: Record<string, string> = {
  admin:         'bg-[rgba(28,43,43,0.08)] text-[var(--ink)]',
  design_layout: 'bg-[var(--sky-lt)] text-[#2A7090]',
  redaksi:       'bg-[var(--coral-lt)] text-[#C05030]',
  publikasi:     'bg-[var(--gold-lt)] text-[#8A6010]',
  it:            'bg-[var(--sage-lt)] text-[#3D7050]',
}

export function PenulisClientPage({ penulisList, kelompokList: initialKelompok, currentUserRole }: Props) {
  const supabase = createClient()
  const router   = useRouter()

  const [tab,         setTab]         = useState<'penulis' | 'kelompok'>('penulis')
  const [search,      setSearch]      = useState('')
  const [roleFilter,  setRoleFilter]  = useState('')
  const [kelompokList, setKelompokList] = useState(initialKelompok)

  // Kelompok management
  const [isAddingKelompok,  setIsAddingKelompok]  = useState(false)
  const [newKelompokForm,   setNewKelompokForm]    = useState({ nomor: '', nama: '', deskripsi: '' })
  const [addingMemberTo,    setAddingMemberTo]     = useState<string | null>(null)
  const [loading,           setLoading]            = useState(false)

  const canManage = currentUserRole === 'admin' || currentUserRole === 'it'

  // All profile_ids already in any group
  const assignedProfileIds = new Set(
    kelompokList.flatMap(k =>
      ((k as any).kelompok_anggota ?? []).map((a: any) => a.profile_id)
    )
  )

  const filteredPenulis = penulisList.filter(p => {
    const matchSearch = !search ||
      p.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
      p.nim?.includes(search) ||
      p.email.includes(search)
    const matchRole = !roleFilter || p.role === roleFilter
    return matchSearch && matchRole
  })

  // ── Create kelompok ─────────────────────────────────────────
  const handleCreateKelompok = async () => {
    if (!newKelompokForm.nama.trim()) { toast.error('Nama kelompok wajib diisi'); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('kelompok')
      .insert({
        nomor:     newKelompokForm.nomor ? parseInt(newKelompokForm.nomor) : null,
        nama:      newKelompokForm.nama,
        deskripsi: newKelompokForm.deskripsi || null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Gagal membuat kelompok: ' + error.message)
    } else {
      toast.success('Kelompok berhasil dibuat!')
      setKelompokList(prev => [...prev, { ...data, kelompok_anggota: [] } as any].sort((a: any, b: any) => (a.nomor ?? 99) - (b.nomor ?? 99)))
      setNewKelompokForm({ nomor: '', nama: '', deskripsi: '' })
      setIsAddingKelompok(false)
    }
    setLoading(false)
  }

  // ── Add member ──────────────────────────────────────────────
  const handleAddMember = async (kelompokId: string, profileId: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('kelompok_anggota')
      .insert({ kelompok_id: kelompokId, profile_id: profileId })

    if (error) {
      if (error.code === '23505') toast.error('Anggota sudah terdaftar di kelompok lain')
      else toast.error('Gagal menambah: ' + error.message)
    } else {
      toast.success('Anggota ditambahkan!')
      router.refresh()
    }
    setLoading(false)
    setAddingMemberTo(null)
  }

  // ── Remove member ───────────────────────────────────────────
  const handleRemoveMember = async (kelompokId: string, profileId: string) => {
    if (!confirm('Keluarkan anggota dari kelompok ini?')) return
    const { error } = await supabase
      .from('kelompok_anggota')
      .delete()
      .eq('kelompok_id', kelompokId)
      .eq('profile_id', profileId)
    if (error) toast.error('Gagal: ' + error.message)
    else { toast.success('Anggota dikeluarkan'); router.refresh() }
  }

  // ── Delete kelompok ─────────────────────────────────────────
  const handleDeleteKelompok = async (id: string, nama: string) => {
    if (!confirm(`Hapus kelompok "${nama}"? Semua anggota akan dikeluarkan.`)) return
    const { error } = await supabase.from('kelompok').delete().eq('id', id)
    if (error) toast.error('Gagal: ' + error.message)
    else { toast.success('Kelompok dihapus'); router.refresh() }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-[rgba(28,43,43,0.08)] mt-2">
        {([['penulis', '👤 Daftar Penulis'], ['kelompok', '👥 Daftar Kelompok']] as [string, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as 'penulis' | 'kelompok')}
            className={`px-6 py-3.5 text-[14px] font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-[var(--coral)] text-[var(--ink)] font-semibold'
                : 'border-transparent text-[var(--ink-lt)] hover:text-[var(--ink)]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── PENULIS TAB ── */}
      {tab === 'penulis' && (
        <div className="py-6">
          <div className="flex gap-3 mb-5 flex-wrap">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, NIM, atau email..."
              className="border border-[rgba(28,43,43,0.12)] rounded-xl px-4 py-2 text-[13px] outline-none focus:border-[var(--coral)] max-w-[260px] w-full" />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="border border-[rgba(28,43,43,0.12)] rounded-xl px-3.5 py-2 text-[13px] bg-white outline-none cursor-pointer focus:border-[var(--coral)]">
              <option value="">Semua Role</option>
              {Object.entries(ROLE_LABELS).map(([r, label]) => (
                <option key={r} value={r}>{label}</option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[rgba(28,43,43,0.025)]">
                  {['#', 'Penulis', 'NIM', 'Email', 'No. HP', 'Role', 'Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPenulis.map((p, i) => (
                  <tr key={p.id} className="border-t border-[rgba(28,43,43,0.06)] hover:bg-[rgba(28,43,43,0.015)]">
                    <td className="px-4 py-3.5 text-[13px] text-[var(--ink-lt)]">{i + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.foto_url ? (
                          <Image src={p.foto_url} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[var(--coral)] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0">
                            {(p.nama_lengkap ?? 'U').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-[13px] font-semibold text-[var(--ink)]">{p.nama_lengkap ?? '—'}</p>
                          <p className="text-[11px] text-[var(--ink-lt)]">{p.nim}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-[var(--ink-lt)]">{p.nim ?? '—'}</td>
                    <td className="px-4 py-3.5 text-[13px] text-[var(--ink-lt)]">{p.email}</td>
                    <td className="px-4 py-3.5 text-[13px] text-[var(--ink-lt)]">{p.no_telepon ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ROLE_STYLE[p.role] ?? ROLE_STYLE.design_layout}`}>
                        {ROLE_LABELS[p.role] ?? p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/penulis/${p.id}` as Route}
                        className="text-[12px] font-semibold text-[var(--coral)] hover:underline">
                        Lihat →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPenulis.length === 0 && (
              <div className="text-center py-12 text-[var(--ink-lt)] text-[14px]">Tidak ada penulis ditemukan</div>
            )}
          </div>
        </div>
      )}

      {/* ── KELOMPOK TAB ── */}
      {tab === 'kelompok' && (
        <div className="py-6">
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-5">
            <p className="text-[13px] text-[var(--ink-lt)]">
              {kelompokList.length} kelompok · {assignedProfileIds.size} dari {penulisList.length} anggota terdaftar
            </p>
            {canManage && (
              <button onClick={() => setIsAddingKelompok(!isAddingKelompok)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors">
                <Plus size={14} /> Tambah Kelompok
              </button>
            )}
          </div>

          {/* Form tambah kelompok */}
          {canManage && isAddingKelompok && (
            <div className="bg-white border-2 border-[var(--coral)] rounded-xl p-5 mb-5">
              <h3 className="font-semibold text-[15px] text-[var(--ink)] mb-4">✏️ Buat Kelompok Baru</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input type="number" placeholder="No. Kelompok" value={newKelompokForm.nomor}
                  onChange={e => setNewKelompokForm(p => ({ ...p, nomor: e.target.value }))}
                  className="border border-[rgba(28,43,43,0.12)] rounded-lg px-3.5 py-2 text-[13px] outline-none focus:border-[var(--coral)]" />
                <input type="text" placeholder="Nama Kelompok *" value={newKelompokForm.nama}
                  onChange={e => setNewKelompokForm(p => ({ ...p, nama: e.target.value }))}
                  className="sm:col-span-2 border border-[rgba(28,43,43,0.12)] rounded-lg px-3.5 py-2 text-[13px] outline-none focus:border-[var(--coral)]" />
              </div>
              <input type="text" placeholder="Deskripsi (opsional)" value={newKelompokForm.deskripsi}
                onChange={e => setNewKelompokForm(p => ({ ...p, deskripsi: e.target.value }))}
                className="w-full border border-[rgba(28,43,43,0.12)] rounded-lg px-3.5 py-2 text-[13px] outline-none focus:border-[var(--coral)] mb-4" />
              <div className="flex gap-2">
                <button onClick={handleCreateKelompok} disabled={loading}
                  className="px-5 py-2 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-lg hover:bg-[var(--coral)] transition-colors disabled:opacity-40">
                  {loading ? '⏳ Menyimpan...' : '💾 Simpan Kelompok'}
                </button>
                <button onClick={() => setIsAddingKelompok(false)}
                  className="px-5 py-2 border border-[rgba(28,43,43,0.12)] text-[var(--ink-lt)] text-[13px] rounded-lg hover:border-[var(--ink-lt)] transition-colors">
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {kelompokList.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[rgba(28,43,43,0.10)] rounded-xl">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-[15px] font-semibold text-[var(--ink)] mb-2">Belum ada kelompok</p>
              <p className="text-[13px] text-[var(--ink-lt)]">
                {canManage ? 'Klik "Tambah Kelompok" untuk membuat kelompok riset' : 'Hubungi Tim IT untuk membuat kelompok riset'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {kelompokList.map(k => {
                const anggota     = (k as any).kelompok_anggota ?? []
                const artikels    = ((k as any).artikel ?? []).filter((a: any) => a.status === 'published')
                const isAddingHere = addingMemberTo === k.id
                // Penulis yang belum masuk kelompok manapun
                const available   = penulisList.filter(p => !assignedProfileIds.has(p.id))

                return (
                  <div key={k.id} className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-5 hover:border-[rgba(28,43,43,0.18)] transition-all">
                    {/* Header kelompok */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--cream)] flex items-center justify-center font-display text-[20px] font-bold text-[var(--ink)]">
                          {String(k.nomor ?? '?').padStart(2, '0')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[15px] text-[var(--ink)]">{k.nama}</h3>
                          {k.deskripsi && <p className="text-[11px] text-[var(--ink-lt)] mt-0.5">{k.deskripsi}</p>}
                          <p className="text-[11px] text-[var(--ink-lt)] mt-0.5">
                            {anggota.length} anggota
                            {artikels.length > 0 && ` · ${artikels.length} artikel terbit`}
                          </p>
                        </div>
                      </div>
                      {canManage && (
                        <button onClick={() => handleDeleteKelompok(k.id, k.nama)}
                          title="Hapus kelompok"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--ink-lt)] hover:bg-red-50 hover:text-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Artikel terbaru */}
                    {artikels.length > 0 && (
                      <p className="text-[12px] text-[var(--ink-lt)] mb-3 line-clamp-1 italic">
                        📄 {artikels[0].judul}
                      </p>
                    )}

                    {/* Daftar anggota */}
                    <div className="space-y-1.5 mb-3">
                      {anggota.length === 0 ? (
                        <p className="text-[12px] text-[var(--ink-lt)] italic py-1">Belum ada anggota</p>
                      ) : (
                        anggota.map((a: any) => {
                          const prf = a.profiles
                          if (!prf) return null
                          return (
                            <div key={a.profile_id}
                              className="flex items-center gap-2.5 px-2.5 py-1.5 bg-[var(--cream)] rounded-lg">
                              <div className="w-6 h-6 rounded-full bg-[var(--coral)] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                                {(prf.nama_lengkap ?? 'U').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-[var(--ink)] truncate">{prf.nama_lengkap}</p>
                                <p className="text-[10px] text-[var(--ink-lt)]">{prf.nim}</p>
                              </div>
                              {canManage && (
                                <button onClick={() => handleRemoveMember(k.id, a.profile_id)}
                                  className="text-[var(--ink-lt)] hover:text-red-500 transition-colors flex-shrink-0">
                                  <X size={10} />
                                </button>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Tambah anggota */}
                    {canManage && (
                      <div>
                        {isAddingHere ? (
                          <div className="border border-[rgba(28,43,43,0.12)] rounded-lg overflow-hidden">
                            <div className="px-3 py-2 bg-[rgba(28,43,43,0.03)] flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)]">Pilih Anggota</span>
                              <button onClick={() => setAddingMemberTo(null)}>
                                <X size={12} className="text-[var(--ink-lt)]" />
                              </button>
                            </div>
                            {available.length === 0 ? (
                              <p className="text-[12px] text-[var(--ink-lt)] text-center py-4">
                                Semua anggota sudah masuk kelompok
                              </p>
                            ) : (
                              <div className="max-h-44 overflow-y-auto">
                                {available.map(p => (
                                  <button key={p.id}
                                    onClick={() => handleAddMember(k.id, p.id)}
                                    disabled={loading}
                                    className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-[var(--cream)] transition-colors text-left border-t border-[rgba(28,43,43,0.06)] first:border-0">
                                    <div className="w-6 h-6 rounded-full bg-[var(--sage)] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                                      {(p.nama_lengkap ?? 'U').slice(0, 2).toUpperCase()}
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
                        ) : (
                          <button onClick={() => setAddingMemberTo(k.id)}
                            className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--coral)] hover:text-[var(--ink)] transition-colors mt-1">
                            <Plus size={12} /> Tambah Anggota
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {!canManage && kelompokList.length > 0 && (
            <p className="text-[12px] text-[var(--ink-lt)] text-center mt-6">
              Hanya Tim IT atau Admin yang dapat mengelola kelompok
            </p>
          )}
        </div>
      )}
    </div>
  )
}