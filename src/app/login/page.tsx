'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Loader2, User } from 'lucide-react'

// Komponen Icon Google SVG resmi
const GoogleIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
  </svg>
);

// 1. Ekstrak isi halaman ke komponen baru
function LoginContent() {
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  const searchParams = useSearchParams()
  const message = searchParams.get('error')

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })

    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] px-6">
      <div className="w-full max-w-md p-12 bg-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[3.5rem] border border-gray-100 flex flex-col items-center">
        
        {/* Icon Header */}
        <div className="w-20 h-20 bg-[#655348] text-white rounded-[1.5rem] flex items-center justify-center mb-10 shadow-lg">
          <User size={40} strokeWidth={2.5} />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-[#1A1A1A] uppercase tracking-tighter mb-3 leading-none">
            Selamat <br /> Datang
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">
            Portal Log-In Internal
          </p>
        </div>

        {/* Pesan Error */}
        {(error || message) && (
          <div className="w-full mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[13px] rounded-r-2xl font-medium">
            {error || message}
          </div>
        )}

        {/* Tombol SSO */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          type="button"
          className="w-full flex items-center justify-center gap-4 bg-[#655348] text-white p-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-[#4a3d35] transition-all shadow-xl active:scale-95 disabled:opacity-70"
        >
          {googleLoading ? (
            <Loader2 className="animate-spin" size={22} />
          ) : (
            <div className="bg-white p-1 rounded-full flex items-center justify-center">
              <GoogleIcon size={20} />
            </div>
          )}
          <span className="text-[14px]">Masuk dengan SSO</span>
        </button>

        {/* Footer Link */}
        <div className="mt-12 w-full pt-8 border-t border-gray-50 text-center">
          <a 
            href="#" 
            className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-[#655348] transition-colors"
          >
            Hubungi Pengelola
          </a>
        </div>

        {/* Brand Identity */}
        <div className="mt-8 text-center">
          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.4em] leading-relaxed">
            Departemen Pariwisata <br /> FISIPOL UNY
          </p>
        </div>
      </div>
    </div>
  )
}

// 2. Export default component yang membungkus konten dengan Suspense
export default function LoginPage() {
  return (
    // Fallback akan muncul sekilas saat halaman dimuat jika koneksi lambat
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="animate-spin text-[#655348]" size={32} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}