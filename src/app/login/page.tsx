'use client'
// src/app/login/page.tsx

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Route } from 'next'
import toast from 'react-hot-toast'
import Link from 'next/link'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()
  const redirectTo   = searchParams.get('redirect') ?? '/'

  const [loading, setLoading] = useState(false)
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [mode,    setMode]    = useState<'login' | 'email'>('login')

  // ── Google OAuth ──────────────────────────────────
  const handleGoogle = async () => {
  setLoading(true)
  
  // Mengambil domain yang sedang digunakan secara otomatis
  const originUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_SITE_URL

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${originUrl}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,        
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        // Tetap gunakan pembatasan domain UNY untuk keamanan
        hd: 'student.uny.ac.id', 
      },
    },
  })

  if (error) {
    toast.error('Gagal masuk: ' + error.message)
    setLoading(false)
  }
}

  // ── Email/Password ────────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !pass) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })

    if (error) {
      toast.error('Email atau password salah')
      setLoading(false)
    } else {
      toast.success('Selamat datang!')
      router.push(redirectTo as Route)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'radial-gradient(ellipse 60% 60% at 20% 20%, rgba(240,128,96,0.10), transparent), radial-gradient(ellipse 50% 50% at 80% 80%, rgba(109,174,196,0.10), transparent), var(--paper)'
      }}
    >
      <div className="w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-3xl p-10 shadow-lg text-center">
          <div className="text-4xl mb-4">🏝️</div>
          <h1 className="font-display text-[28px] font-bold text-[var(--ink)] mb-2 tracking-tight">
            Selamat Datang
          </h1>
          <p className="text-sm text-[var(--ink-lt)] mb-8 leading-relaxed">
            Masuk ke portal Jurnal Pariwisata UNY untuk menulis dan mempublikasikan artikel.
            Khusus mahasiswa Pariwisata Kelas&nbsp;A&nbsp;UNY.
          </p>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white border-[1.5px] border-[rgba(28,43,43,0.15)] text-[14px] font-semibold text-[var(--ink)] hover:border-[var(--coral)] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {/* Google SVG Logo */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Memproses...' : 'Masuk dengan Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[rgba(28,43,43,0.08)]" />
            <span className="text-[12px] text-[var(--ink-lt)]">atau</span>
            <div className="flex-1 h-px bg-[rgba(28,43,43,0.08)]" />
          </div>

          {/* Email login */}
          {mode === 'login' ? (
            <button
              onClick={() => setMode('email')}
              className="w-full py-2.5 text-[13px] text-[var(--ink-lt)] hover:text-[var(--ink)] transition-colors"
            >
              Masuk dengan email & password
            </button>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-1.5">
                  Email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="nama@student.uny.ac.id"
                  className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-xl px-3.5 py-2.5 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--coral)] bg-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-1.5">
                  Password
                </label>
                <input
                  type="password" value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-[1.5px] border-[rgba(28,43,43,0.12)] rounded-xl px-3.5 py-2.5 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--coral)] bg-white transition-colors"
                  required
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors disabled:opacity-50 mt-1">
                {loading ? 'Memproses...' : 'Masuk →'}
              </button>
              <button type="button" onClick={() => setMode('login')}
                className="w-full py-2 text-[12px] text-[var(--ink-lt)] hover:text-[var(--ink)] transition-colors">
                ← Kembali
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[12px] text-[var(--ink-lt)] mt-5 leading-relaxed">
          Belum punya akun?{' '}
          <Link href="/tentang" className="text-[var(--coral)] font-semibold hover:underline">
            Hubungi koordinator kelas
          </Link>{' '}
          untuk mendapatkan akses.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  )
}
