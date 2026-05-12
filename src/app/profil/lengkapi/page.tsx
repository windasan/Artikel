'use client'
// src/app/profil/lengkapi/page.tsx
// Shown after first Google login — user must fill NIM before using the app

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Route } from 'next'
import toast from 'react-hot-toast'

function LengkapiForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()
  const redirectTo   = searchParams.get('redirect') ?? '/'

  const [form,    setForm]    = useState({ nama_lengkap: '', nim: '', no_telepon: '' })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('profiles').select('nama_lengkap, nim, no_telepon').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.nim) { router.push(redirectTo as Route); return } // Already complete
          setForm(f => ({
            ...f,
            nama_lengkap: data?.nama_lengkap ?? '',
            nim:          data?.nim          ?? '',
            no_telepon:   data?.no_telepon   ?? '',
          }))
          setLoading(false)
        })
    })
  }, [supabase, router, redirectTo as Route])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nim.trim())          { toast.error('NIM wajib diisi'); return }
    if (!form.nama_lengkap.trim()) { toast.error('Nama lengkap wajib diisi'); return }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').update({
      nama_lengkap: form.nama_lengkap,
      nim:          form.nim,
      no_telepon:   form.no_telepon || null,
    }).eq('id', user.id)

    if (error) {
      toast.error('Gagal menyimpan: ' + error.message)
      setSaving(false)
    } else {
      toast.success('✅ Profil berhasil dilengkapi!')
      router.push(redirectTo as Route) 
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--ink-lt)] text-sm">
        Memuat...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse 60% 60% at 30% 30%, rgba(240,128,96,0.10), transparent), var(--paper)' }}>
      <div className="w-full max-w-[400px]">
        <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-3xl p-10 shadow-lg">
          <div className="text-3xl mb-4 text-center">📝</div>
          <h1 className="font-display text-[26px] font-bold text-[var(--ink)] mb-2 tracking-tight text-center">
            Lengkapi Profil
          </h1>
          <p className="text-[13px] text-[var(--ink-lt)] text-center mb-7 leading-relaxed">
            Sebelum menggunakan portal, lengkapi data diri Anda terlebih dahulu.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            {[
              { label: 'Nama Lengkap *', key: 'nama_lengkap', type: 'text',  placeholder: 'Sesuai KTM' },
              { label: 'NIM *',          key: 'nim',          type: 'text',  placeholder: '2181XXXXXXX' },
              { label: 'No. Telepon',    key: 'no_telepon',   type: 'tel',   placeholder: '08xx-xxxx-xxxx' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-1.5">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[var(--coral)] transition-colors"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[var(--ink)] text-white text-[14px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors disabled:opacity-40 mt-2"
            >
              {saving ? 'Menyimpan...' : 'Simpan & Lanjutkan →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LengkapiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <LengkapiForm />
    </Suspense>
  )
}
