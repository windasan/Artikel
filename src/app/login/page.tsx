'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Lock, Mail, Loader2, ArrowLeft, LogIn } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  // Handler Login Email & Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Berhasil masuk!')
      router.push('/')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Gagal masuk. Periksa kembali email dan password Anda.')
    } finally {
      setLoading(false)
    }
  }

  // Handler Login dengan Google
  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Akan diarahkan ke route callback untuk memproses sesi
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast.error('Gagal masuk dengan Google: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#655348]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#a67c52]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#655348] rounded-3xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-300">
            <LogIn size={32} className="text-white" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-black text-[#655348] tracking-tight">
          Selamat Datang
        </h2>
        <p className="mt-2 text-center text-[14px] text-[#655348]/60 font-medium">
          Masuk dengan akun portal artikel Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-10 px-6 shadow-[0_8px_40px_rgba(101,83,72,0.08)] sm:rounded-[2rem] sm:px-10 border border-[#D9D9D9]/50">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Input Email */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-black text-[#655348] uppercase tracking-widest mb-2 ml-1">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#655348]/40" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-12 pr-4 py-3.5 border-2 border-[#D9D9D9]/50 rounded-2xl text-[#655348] placeholder-[#655348]/30 focus:outline-none focus:ring-0 focus:border-[#655348] transition-colors sm:text-sm font-bold bg-[#F9F8F6] focus:bg-white"
                  placeholder="anda@email.com"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-black text-[#655348] uppercase tracking-widest mb-2 ml-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#655348]/40" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-12 pr-4 py-3.5 border-2 border-[#D9D9D9]/50 rounded-2xl text-[#655348] placeholder-[#655348]/30 focus:outline-none focus:ring-0 focus:border-[#655348] transition-colors sm:text-sm font-bold bg-[#F9F8F6] focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-md text-[14px] font-black uppercase tracking-wider text-white bg-[#655348] hover:bg-[#8B7355] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#655348] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Memproses...
                  </>
                ) : (
                  'Masuk Sekarang'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#D9D9D9]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-[#655348]/40 font-bold uppercase tracking-widest text-[10px]">
                Atau masuk dengan
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border-2 border-[#D9D9D9]/50 rounded-2xl text-[14px] font-bold text-[#655348] bg-white hover:bg-[#F9F8F6] focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#D9D9D9]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>

          {/* Footer Card */}
          <div className="mt-8 pt-6 border-t border-[#D9D9D9]/50">
            <Link 
              href="/"
              className="group flex items-center justify-center gap-2 text-[13px] font-bold text-[#655348]/60 hover:text-[#655348] transition-colors"
            >
              <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
        
        {/* Footer Text */}
        <p className="text-center text-[12px] text-[#655348]/40 mt-8 font-bold tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Pariwisata A UNY 23.
        </p>
      </div>
    </div>
  )
}