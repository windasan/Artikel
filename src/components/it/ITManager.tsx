'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Users, Shield, Plus, Trash2, Loader2, Save, UserPlus, X, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile } from '@/types/database'

export function ITManager({ initialKelompok, initialUsers }: { initialKelompok: any[], initialUsers: Profile[] }) {
  const supabase = createClient()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<'kelompok' | 'users'>('kelompok')
  const [loading, setLoading] = useState(false)

  // State untuk Kelompok Baru
  const [newKelompok, setNewKelompok] = useState({ nomor: '', nama: '', deskripsi: '' })

  // State untuk Manajemen Anggota
  const [managingGroup, setManagingGroup] = useState<any | null>(null)
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  const [memberLoading, setMemberLoading] = useState(false)
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('')

  // ==========================================
  // FUNGSI MANAJEMEN KELOMPOK
  // ==========================================
  const handleAddKelompok = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKelompok.nama || !newKelompok.nomor) return toast.error('Nomor dan Nama wajib diisi')
    
    setLoading(true)
    const { error } = await supabase.from('kelompok').insert({
      nomor: parseInt(newKelompok.nomor),
      nama: newKelompok.nama,
      deskripsi: newKelompok.deskripsi
    })

    if (error) {
      toast.error('Gagal menambah kelompok: ' + error.message)
    } else {
      toast.success('Kelompok berhasil ditambahkan!')
      setNewKelompok({ nomor: '', nama: '', deskripsi: '' })
      router.refresh()
    }
    setLoading(false)
  }

  const handleDeleteKelompok = async (id: string, nama: string) => {
    if (!confirm(`Yakin ingin menghapus kelompok "${nama}"? Semua anggota akan terlepas.`)) return
    
    const tid = toast.loading('Menghapus...')
    const { error } = await supabase.from('kelompok').delete().eq('id', id)
    
    if (error) toast.error('Gagal: ' + error.message, { id: tid })
    else { 
      toast.success('Kelompok dihapus!', { id: tid })
      if (managingGroup?.id === id) setManagingGroup(null)
      router.refresh() 
    }
  }

  // ==========================================
  // FUNGSI MANAJEMEN ANGGOTA KELOMPOK
  // ==========================================
  const openMemberManager = async (klp: any) => {
    setManagingGroup(klp)
    setMemberLoading(true)
    
    // Ambil anggota kelompok saat ini
    const { data, error } = await supabase
      .from('kelompok_anggota')
      .select('profile_id, profiles(nama_lengkap, nim, email)')
      .eq('kelompok_id', klp.id)
      
    if (!error && data) {
      setGroupMembers(data)
    }
    setMemberLoading(false)
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserToAdd || !managingGroup) return

    setLoading(true)
    const { error } = await supabase.from('kelompok_anggota').insert({
      kelompok_id: managingGroup.id,
      profile_id: selectedUserToAdd
    })

    if (error) {
      toast.error('Gagal menambah anggota: ' + error.message)
    } else {
      toast.success('Anggota berhasil ditambahkan')
      setSelectedUserToAdd('')
      openMemberManager(managingGroup) // Refresh list anggota
    }
    setLoading(false)
  }

  const handleRemoveMember = async (profileId: string, nama: string) => {
    if (!confirm(`Keluarkan ${nama} dari kelompok ini?`)) return

    const { error } = await supabase.from('kelompok_anggota')
      .delete()
      .match({ kelompok_id: managingGroup.id, profile_id: profileId })

    if (error) toast.error('Gagal: ' + error.message)
    else {
      toast.success('Anggota dikeluarkan')
      openMemberManager(managingGroup) // Refresh list anggota
    }
  }

  // ==========================================
  // FUNGSI MANAJEMEN ROLE
  // ==========================================
  const handleUpdateRole = async (userId: string, newRole: string) => {
    const tid = toast.loading('Mengubah role...')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      toast.success('Role berhasil diubah!', { id: tid })
      router.refresh() // Memuat ulang data dari server untuk update UI
    } catch (error: any) {
      console.error('Error updating role:', error)
      toast.error('Gagal ubah role: ' + error.message, { id: tid })
    }
  }

  // Filter users yang belum masuk ke kelompok ini untuk opsi dropdown
  const existingMemberIds = groupMembers.map(m => m.profile_id)
  const availableUsers = initialUsers.filter(u => !existingMemberIds.includes(u.id))

  return (
    <div className="bg-[#FFFFFF] border border-[#D9D9D9] rounded-3xl shadow-sm overflow-hidden">
      
      {/* TABS HEADER */}
      <div className="flex border-b border-[#D9D9D9] bg-[#D9D9D9]/10">
        <button onClick={() => setActiveTab('kelompok')} className={`flex-1 flex items-center justify-center gap-2 py-5 text-[14px] font-black uppercase tracking-widest transition-all ${activeTab === 'kelompok' ? 'bg-[#FFFFFF] text-[#655348] border-b-4 border-[#655348]' : 'text-[#655348]/50 hover:text-[#655348] hover:bg-[#D9D9D9]/20'}`}>
          <Users size={18} /> Kelompok & Anggota
        </button>
        <button onClick={() => setActiveTab('users')} className={`flex-1 flex items-center justify-center gap-2 py-5 text-[14px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-[#FFFFFF] text-[#655348] border-b-4 border-[#655348]' : 'text-[#655348]/50 hover:text-[#655348] hover:bg-[#D9D9D9]/20'}`}>
          <Shield size={18} /> Hak Akses (Role)
        </button>
      </div>

      {/* TAB CONTENT: KELOMPOK */}
      {activeTab === 'kelompok' && (
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* KIRI: List Kelompok */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-[16px] text-[#655348] mb-4">Daftar Kelompok Riset</h3>
            
            {initialKelompok.length === 0 && (
              <div className="p-6 border-2 border-dashed border-[#D9D9D9] rounded-2xl text-center text-[#655348]/60 text-sm font-medium">
                Belum ada kelompok yang dibuat.
              </div>
            )}

            {initialKelompok.map(klp => (
              <div key={klp.id} className={`p-5 border rounded-2xl transition-all ${managingGroup?.id === klp.id ? 'border-[#655348] bg-[#655348]/5' : 'border-[#D9D9D9] hover:border-[#655348]/50'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black bg-[#655348] text-[#FFFFFF] px-2 py-0.5 rounded-full tracking-wider">KLP {klp.nomor}</span>
                      <h4 className="font-bold text-[16px] text-[#655348]">{klp.nama}</h4>
                    </div>
                    <p className="text-[13px] text-[#655348]/70 mt-2 line-clamp-2">{klp.deskripsi || 'Tidak ada deskripsi'}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={() => openMemberManager(klp)}
                      className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D9D9D9] rounded-lg text-[12px] font-bold text-[#655348] hover:bg-[#655348] hover:text-[#FFFFFF] transition-colors"
                    >
                      Kelola Anggota
                    </button>
                    <button 
                      onClick={() => handleDeleteKelompok(klp.id, klp.nama)}
                      className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* KANAN: Form Tambah Kelompok ATAU Panel Kelola Anggota */}
          <div className="relative">
            {!managingGroup ? (
              /* FORM BUAT KELOMPOK BARU */
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D9D9D9] sticky top-24 shadow-sm">
                <h3 className="font-bold text-[15px] text-[#655348] mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-[#a67c52]"/> Buat Kelompok Baru
                </h3>
                <form onSubmit={handleAddKelompok} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#655348]/70 uppercase tracking-wider">Nomor Kelompok</label>
                    <input type="number" required value={newKelompok.nomor} onChange={e => setNewKelompok({...newKelompok, nomor: e.target.value})} className="w-full mt-1 p-2.5 rounded-xl border border-[#D9D9D9] text-sm focus:ring-2 focus:ring-[#655348]/50 outline-none" placeholder="Misal: 1" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#655348]/70 uppercase tracking-wider">Nama Kelompok</label>
                    <input type="text" required value={newKelompok.nama} onChange={e => setNewKelompok({...newKelompok, nama: e.target.value})} className="w-full mt-1 p-2.5 rounded-xl border border-[#D9D9D9] text-sm focus:ring-2 focus:ring-[#655348]/50 outline-none" placeholder="Nama..." />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#655348]/70 uppercase tracking-wider">Deskripsi Singkat</label>
                    <textarea value={newKelompok.deskripsi} onChange={e => setNewKelompok({...newKelompok, deskripsi: e.target.value})} className="w-full mt-1 p-2.5 rounded-xl border border-[#D9D9D9] text-sm focus:ring-2 focus:ring-[#655348]/50 outline-none resize-none h-20" placeholder="Opsional..."></textarea>
                  </div>
                  <button disabled={loading} type="submit" className="w-full py-2.5 bg-[#655348] text-[#FFFFFF] rounded-xl text-[13px] font-bold hover:bg-[#8B7355] transition-colors flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Kelompok
                  </button>
                </form>
              </div>
            ) : (
              /* PANEL MANAJEMEN ANGGOTA */
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border-2 border-[#655348] shadow-sm sticky top-24">
                <div className="flex items-start justify-between border-b border-[#D9D9D9] pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#a67c52] uppercase tracking-widest">Mengelola Anggota</span>
                    <h3 className="font-bold text-[16px] text-[#655348] leading-tight mt-1">{managingGroup.nama}</h3>
                  </div>
                  <button onClick={() => setManagingGroup(null)} className="p-1.5 text-[#655348]/60 hover:text-[#655348] hover:bg-[#655348]/5 rounded-lg transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {memberLoading ? (
                  <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-[#655348]" /></div>
                ) : (
                  <>
                    {/* Daftar Anggota */}
                    <div className="space-y-3 mb-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {groupMembers.length === 0 ? (
                        <p className="text-[12px] text-[#655348]/60 italic text-center py-4 border border-dashed border-[#D9D9D9] rounded-xl">Belum ada anggota.</p>
                      ) : (
                        groupMembers.map(m => (
                          <div key={m.profile_id} className="flex items-center justify-between p-2.5 bg-[#655348]/5 border border-[#D9D9D9]/50 rounded-xl">
                            <div>
                              <p className="text-[13px] font-bold text-[#655348] leading-none">{m.profiles?.nama_lengkap || 'Tanpa Nama'}</p>
                              <p className="text-[11px] text-[#655348]/70 mt-1">{m.profiles?.nim || m.profiles?.email}</p>
                            </div>
                            <button 
                              onClick={() => handleRemoveMember(m.profile_id, m.profiles?.nama_lengkap)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Keluarkan"
                            >
                              <UserMinus size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Form Tambah Anggota */}
                    <form onSubmit={handleAddMember} className="border-t border-[#D9D9D9] pt-4 mt-auto">
                      <label className="text-[11px] font-bold text-[#655348]/70 uppercase tracking-wider mb-2 block">Tambah Anggota Baru</label>
                      <div className="flex flex-col gap-2">
                        <select 
                          required
                          value={selectedUserToAdd}
                          onChange={(e) => setSelectedUserToAdd(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-[#D9D9D9] text-[13px] bg-[#FFFFFF] text-[#655348] focus:ring-2 focus:ring-[#655348]/50 outline-none"
                        >
                          <option value="">-- Pilih Mahasiswa / User --</option>
                          {availableUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.nama_lengkap || u.email} {u.nim ? `(${u.nim})` : ''}</option>
                          ))}
                        </select>
                        <button disabled={loading || !selectedUserToAdd} type="submit" className="w-full py-2.5 bg-[#655348] text-[#FFFFFF] rounded-xl text-[13px] font-bold hover:bg-[#8B7355] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                          {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Masukkan ke Kelompok
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: USERS (Role Management) */}
      {activeTab === 'users' && (
        <div className="p-8">
          <div className="overflow-hidden border border-[#D9D9D9] rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse bg-[#FFFFFF]">
              <thead>
                <tr className="bg-[#D9D9D9]/20 border-b border-[#D9D9D9]">
                  <th className="py-4 px-6 text-[12px] font-black text-[#655348] uppercase tracking-widest">Informasi Pengguna</th>
                  <th className="py-4 px-6 text-[12px] font-black text-[#655348] uppercase tracking-widest w-[300px]">Atur Jabatan Sistem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D9D9]">
                {initialUsers.map(usr => (
                  <tr key={usr.id} className="hover:bg-[#D9D9D9]/10 transition-colors">
                    <td className="py-5 px-6">
                      <p className="font-bold text-[15px] text-[#655348] mb-1">{usr.nama_lengkap || 'Pengguna Baru'}</p>
                      <div className="flex gap-3 text-[13px] text-[#655348]/60 font-medium">
                        <span>{usr.email}</span>
                        {usr.nim && <><span className="text-[#D9D9D9]">•</span><span>NIM: {usr.nim}</span></>}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="relative">
                        <select 
                          defaultValue={usr.role}
                          onChange={(e) => handleUpdateRole(usr.id, e.target.value)}
                          className="w-full appearance-none p-3 pl-4 pr-10 rounded-xl border-2 border-[#D9D9D9] text-[13px] font-bold text-[#655348] bg-[#FFFFFF] cursor-pointer hover:border-[#655348]/50 focus:border-[#655348] focus:outline-none transition-all"
                        >
                          <option value="penulis">Penulis (Default)</option>
                          <option value="design_layout">Design & Layout</option>
                          <option value="redaksi">Tim Redaksi</option>
                          <option value="publikasi">Tim Publikasi</option>
                          <option value="it">Tim IT</option>
                          <option value="admin">Administrator</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#655348]">
                          <Shield size={14} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}