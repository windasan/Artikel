'use client'
// src/app/profil/page.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ProfilPage() {
  const supabase  = createClient()
  const router    = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form,    setForm]    = useState({ nama_lengkap:'', nim:'', no_telepon:'', bio:'' })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?redirect=/profil'); return }
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          setProfile(data)
          if (data) setForm({ nama_lengkap: data.nama_lengkap??'', nim: data.nim??'', no_telepon: data.no_telepon??'', bio: data.bio??'' })
          setLoading(false)
        })
    })
  }, [supabase, router])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update(form).eq('id', profile.id)
    if (error) toast.error('Gagal menyimpan: ' + error.message)
    else toast.success('✅ Profil diperbarui!')
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen pt-[80px] flex items-center justify-center text-[var(--ink-lt)]">Memuat...</div>

  return (
    <div className="min-h-screen pt-[80px] bg-[var(--paper)]">
      <div className="max-w-[640px] mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[var(--coral)] flex items-center justify-center text-[22px] font-bold text-white">
            {(profile?.nama_lengkap ?? 'U').slice(0,2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-[28px] font-bold text-[var(--ink)] tracking-tight">{profile?.nama_lengkap ?? 'Pengguna'}</h1>
            <p className="text-[13px] text-[var(--ink-lt)]">{profile?.email} · <span className="capitalize text-[var(--coral)] font-medium">{profile?.role}</span></p>
          </div>
        </div>

        <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-6">
          <h2 className="font-semibold text-[16px] text-[var(--ink)] mb-5">Edit Profil</h2>
          <form onSubmit={save} className="space-y-4">
            {[
              { label:'Nama Lengkap', key:'nama_lengkap', type:'text',  placeholder:'Nama sesuai KTM' },
              { label:'NIM',          key:'nim',          type:'text',  placeholder:'2181XXXXXXX' },
              { label:'No. Telepon',  key:'no_telepon',   type:'tel',   placeholder:'08xx-xxxx-xxxx' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-1.5">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[var(--coral)] transition-colors" />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-1.5">Bio Singkat</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={3} placeholder="Ceritakan sedikit tentang diri Anda..."
                className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[var(--coral)] resize-y" />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors disabled:opacity-40">
                {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
