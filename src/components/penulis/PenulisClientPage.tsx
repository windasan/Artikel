'use client'

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
  admin:         'bg-gray-100 text-[#655348]',
  design_layout: 'bg-blue-50 text-blue-700',
  redaksi:       'bg-orange-50 text-orange-700',
  publikasi:     'bg-yellow-50 text-yellow-700',
  it:            'bg-green-50 text-green-700',
}

export function PenulisClientPage({ penulisList, kelompokList: initialKelompok, currentUserRole }: Props) {
  const supabase = createClient()
  const router   = useRouter()

  const [tab,         setTab]         = useState<'penulis' | 'kelompok'>('penulis')
  const [search,      setSearch]      = useState('')
  const [roleFilter,  setRoleFilter]  = useState('')
  const [kelompokList, setKelompokList] = useState(initialKelompok)

  const [isAddingKelompok,  setIsAddingKelompok]  = useState(false)
  const [newKelompokForm,   setNewKelompokForm]    = useState({ nomor: '', nama: '', deskripsi: '' })
  const [addingMemberTo,    setAddingMemberTo]     = useState<string | null>(null)
  const [loading,           setLoading]            = useState(false)

  const canManage = currentUserRole === 'admin' || currentUserRole === 'it'

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

  const handleDeleteKelompok = async (id: string, nama: string) => {
    if (!confirm(`Hapus kelompok "${nama}"? Semua anggota akan dikeluarkan.`)) return
    const { error } = await supabase.from('kelompok').delete().eq('id', id)
    if (error) toast.error('Gagal: ' + error.message)
    else { toast.success('Kelompok dihapus'); router.refresh() }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#D9D9D9] mt-2">
        {([['penulis', '👤 Daftar Penulis'], ['kelompok', '👥 Daftar Kelompok']] as [string, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as 'penulis' | 'kelompok')}
            className={`px-6 py-3.5 text-[14px] font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-[#655348] text-[#655348] font-black uppercase tracking-wider'
                : 'border-transparent text-[#655348]/60 hover:text-[#655348] uppercase tracking-wider'
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
              className="border border-[#D9D9D9] rounded-xl px-4 py-2 text-[13px] outline-none focus:border-[#a67c52] focus:ring-1 focus:ring-[#a67c52] max-w-[260px] w-full" />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="border border-[#D9D9D9] rounded-xl px-3.5 py-2 text-[13px] bg-white outline-none cursor-pointer focus:border-[#a67c52] focus:ring-1 focus:ring-[#a67c52]">
              <option value="">Semua Role</option>
              {Object.entries(ROLE_LABELS).map(([r, label]) => (
                <option key={r} value={r}>{label}</option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#655348]/5 border-b border-[#D9D9D9]">
                  {['#', 'Penulis', 'NIM', 'Email', 'No. HP', 'Role', 'Aksi'].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wider text-[#655348]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPenulis.map((p, i) => (
                  <tr key={p.id} className="border-t border-[#D9D9D9]/50 hover:bg-[#655348]/5 transition-colors">
                    <td className="px-4 py-3.5 text-[13px] font-bold text-[#655348]/60">{i + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.foto_url ? (
                          <Image src={p.foto_url} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover shadow-sm" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#655348] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 shadow-sm">
                            {(p.nama_lengkap ?? 'U').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-[13px] font-black text-[#655348]">{p.nama_lengkap ?? '—'}</p>
                          <p className="text-[11px] font-bold text-[#655348]/60">{p.nim}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#655348]/80">{p.nim ?? '—'}</td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#655348]/80">{p.email}</td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#655348]/80">{p.no_telepon ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${ROLE_STYLE[p.role] ?? ROLE_STYLE.design_layout}`}>
                        {ROLE_LABELS[p.role] ?? p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/penulis/${p.id}` as Route}
                        className="text-[12px] font-bold text-[#a67c52] hover:text-[#655348] hover:underline">
                        Lihat →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPenulis.length === 0 && (
              <div className="text-center py-12 text-[#655348]/60 text-[14px] font-bold">Tidak ada penulis ditemukan</div>
            )}
          </div>
        </div>
      )}

      {/* ── KELOMPOK TAB ── */}
      {tab === 'kelompok' && (
        <div className="py-6">
          <div className="flex justify-between items-center mb-5">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#655348]/60">
              {kelompokList.length} kelompok · {assignedProfileIds.size} dari {penulisList.length} anggota
            </p>
            {canManage && (
              <button onClick={() => setIsAddingKelompok(!isAddingKelompok)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#655348] text-white text-[12px] font-black uppercase tracking-wider rounded-xl hover:bg-[#8B7355] shadow-md transition-colors">
                <Plus size={14} /> Tambah Kelompok
              </button>
            )}
          </div>

          {canManage && isAddingKelompok && (
            <div className="bg-white border-2 border-[#a67c52] rounded-xl p-6 mb-5 shadow-sm">
              <h3 className="font-black text-[15px] text-[#655348] mb-4">✏️ Buat Kelompok Baru</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input type="number" placeholder="No. Kelompok" value={newKelompokForm.nomor}
                  onChange={e => setNewKelompokForm(p => ({ ...p, nomor: e.target.value }))}
                  className="border border-[#D9D9D9] rounded-lg px-3.5 py-2.5 text-[13px] font-medium outline-none focus:border-[#a67c52] focus:ring-1 focus:ring-[#a67c52]" />
                <input type="text" placeholder="Nama Kelompok *" value={newKelompokForm.nama}
                  onChange={e => setNewKelompokForm(p => ({ ...p, nama: e.target.value }))}
                  className="sm:col-span-2 border border-[#D9D9D9] rounded-lg px-3.5 py-2.5 text-[13px] font-medium outline-none focus:border-[#a67c52] focus:ring-1 focus:ring-[#a67c52]" />
              </div>
              <input type="text" placeholder="Deskripsi (opsional)" value={newKelompokForm.deskripsi}
                onChange={e => setNewKelompokForm(p => ({ ...p, deskripsi: e.target.value }))}
                className="w-full border border-[#D9D9D9] rounded-lg px-3.5 py-2.5 text-[13px] font-medium outline-none focus:border-[#a67c52] focus:ring-1 focus:ring-[#a67c52] mb-4" />
              <div className="flex gap-2">
                <button onClick={handleCreateKelompok} disabled={loading}
                  className="px-5 py-2.5 bg-[#655348] text-white text-[12px] font-black uppercase tracking-wider rounded-lg hover:bg-[#8B7355] transition-colors disabled:opacity-40">
                  {loading ? '⏳ Menyimpan...' : '💾 Simpan'}
                </button>
                <button onClick={() => setIsAddingKelompok(false)}
                  className="px-5 py-2.5 bg-gray-100 text-[#655348] text-[12px] font-black uppercase tracking-wider rounded-lg hover:bg-gray-200 transition-colors">
                  Batal
                </button>
              </div>
            </div>
          )}

          {kelompokList.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#D9D9D9] rounded-2xl shadow-sm">
              <div className="text-5xl mb-4 opacity-50">👥</div>
              <p className="text-[15px] font-black text-[#655348] mb-2">Belum ada kelompok</p>
              <p className="text-[13px] text-[#655348]/60 font-medium">
                {canManage ? 'Klik "Tambah Kelompok" untuk membuat kelompok riset' : 'Hubungi Tim IT untuk membuat kelompok riset'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {kelompokList.map(k => {
                const anggota     = (k as any).kelompok_anggota ?? []
                const artikels    = ((k as any).artikel ?? []).filter((a: any) => a.status === 'published')
                const isAddingHere = addingMemberTo === k.id
                const available   = penulisList.filter(p => !assignedProfileIds.has(p.id))

                return (
                  <div key={k.id} className="bg-white border border-[#D9D9D9] rounded-2xl p-6 hover:border-[#a67c52] hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#655348] flex items-center justify-center font-display text-[22px] font-black text-white shadow-inner">
                          {String(k.nomor ?? '?').padStart(2, '0')}
                        </div>
                        <div>
                          <h3 className="font-black text-[16px] text-[#655348]">{k.nama}</h3>
                          {k.deskripsi && <p className="text-[12px] text-[#655348]/70 mt-0.5 line-clamp-1">{k.deskripsi}</p>}
                          <p className="text-[11px] font-bold uppercase tracking-widest text-[#a67c52] mt-1.5">
                            {anggota.length} anggota
                            {artikels.length > 0 && ` · ${artikels.length} artikel terbit`}
                          </p>
                        </div>
                      </div>
                      {canManage && (
                        <button onClick={() => handleDeleteKelompok(k.id, k.nama)}
                          title="Hapus kelompok"
                          className="w-8 h-8 flex items-center justify-center rounded-xl text-[#655348]/40 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {anggota.length === 0 ? (
                        <p className="text-[12px] text-[#655348]/50 italic py-2">Belum ada anggota.</p>
                      ) : (
                        anggota.map((a: any) => {
                          const prf = a.profiles
                          if (!prf) return null
                          return (
                            <div key={a.profile_id}
                              className="flex items-center gap-3 px-3 py-2 bg-[#655348]/5 border border-[#655348]/10 rounded-xl">
                              <div className="w-8 h-8 rounded-full bg-[#655348] flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                                {(prf.nama_lengkap ?? 'U').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-[#655348] truncate">{prf.nama_lengkap}</p>
                                <p className="text-[10px] font-bold text-[#655348]/60 uppercase tracking-wider">{prf.nim}</p>
                              </div>
                              {canManage && (
                                <button onClick={() => handleRemoveMember(k.id, a.profile_id)}
                                  className="text-[#655348]/40 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0">
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>

                    {canManage && (
                      <div className="mt-auto pt-2 border-t border-[#D9D9D9]/50">
                        {isAddingHere ? (
                          <div className="border border-[#D9D9D9] rounded-xl overflow-hidden mt-2">
                            <div className="px-4 py-2.5 bg-[#655348]/5 flex items-center justify-between border-b border-[#D9D9D9]">
                              <span className="text-[11px] font-black uppercase tracking-widest text-[#655348]">Pilih Anggota</span>
                              <button onClick={() => setAddingMemberTo(null)}>
                                <X size={14} className="text-[#655348]/60 hover:text-[#655348]" />
                              </button>
                            </div>
                            {available.length === 0 ? (
                              <p className="text-[12px] font-bold text-[#655348]/50 text-center py-5">
                                Semua anggota sudah masuk kelompok riset.
                              </p>
                            ) : (
                              <div className="max-h-44 overflow-y-auto custom-scrollbar">
                                {available.map(p => (
                                  <button key={p.id}
                                    onClick={() => handleAddMember(k.id, p.id)}
                                    disabled={loading}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#a67c52]/10 transition-colors text-left border-b border-[#D9D9D9]/30 last:border-0">
                                    <div className="w-7 h-7 rounded-full bg-[#a67c52] flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                                      {(p.nama_lengkap ?? 'U').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-[12px] font-bold text-[#655348]">{p.nama_lengkap}</p>
                                      <p className="text-[10px] font-bold text-[#655348]/60 uppercase tracking-wider">{p.nim}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => setAddingMemberTo(k.id)}
                            className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 rounded-xl border border-[#D9D9D9] text-[12px] font-black uppercase tracking-wider text-[#655348]/70 hover:text-[#a67c52] hover:border-[#a67c52] hover:bg-[#a67c52]/5 transition-all">
                            <Plus size={14} /> Tambah Anggota
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}