'use client'
// src/components/layout/Navbar.tsx

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { PenLine, LogIn, LogOut, Settings, User, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import type { Route } from 'next'

export function Navbar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()

  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [scrolled,     setScrolled]     = useState(false)

  useEffect(() => {
    // Scroll detection
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // Load user session
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    loadUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setProfile(null)
      } else {
        loadUser()
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/',        label: 'Beranda' },
    { href: '/artikel', label: 'Artikel' },
    { href: '/penulis', label: 'Penulis' },
    { href: '/tentang', label: 'Tentang' },
  ]

  const isAdmin = profile?.role && ['admin', 'koordinator', 'editor'].includes(profile.role)

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-[60px] transition-all duration-300 ${
      scrolled
        ? 'bg-[rgba(253,250,246,0.92)] backdrop-blur-xl border-b border-[rgba(28,43,43,0.10)] shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="max-w-[1200px] mx-auto h-full flex items-center px-6 gap-0">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 mr-auto">
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[var(--coral)] to-[var(--gold)] flex items-center justify-center text-white text-sm">
            🏝️
          </div>
          <span className="font-display text-base font-bold tracking-tight text-[var(--ink)]">
            Ruang Jelajah Pariwisata
          </span>
        </Link>

        {/* Links */}
        <div className="flex gap-0.5 mr-4">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href as Route}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                pathname === link.href
                  ? 'text-[var(--ink)] bg-[rgba(28,43,43,0.07)] font-semibold'
                  : 'text-[var(--ink-lt)] hover:text-[var(--ink)] hover:bg-[rgba(28,43,43,0.05)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                pathname.startsWith('/admin')
                  ? 'text-[var(--coral)] bg-[var(--coral-lt)] font-semibold'
                  : 'text-[var(--ink-lt)] hover:text-[var(--ink)] hover:bg-[rgba(28,43,43,0.05)]'
              }`}
            >
              ⚙️ Admin
            </Link>
          )}
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {profile ? (
                <>
                  {/* Write button */}
                  <Link
                    href="/editor/new"
                    className="flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-[13px] font-semibold bg-[var(--ink)] text-white hover:bg-[var(--coral)] transition-colors"
                  >
                    <PenLine size={13} />
                    Tulis Artikel
                  </Link>

                  {/* User menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(28,43,43,0.06)] transition-colors"
                    >
                      {profile.foto_url ? (
                        <Image
                          src={profile.foto_url}
                          alt={profile.nama_lengkap ?? ''}
                          width={28} height={28}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[var(--coral)] flex items-center justify-center text-white text-[11px] font-bold">
                          {(profile.nama_lengkap ?? 'U').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-[13px] font-medium text-[var(--ink)] max-w-[100px] truncate">
                        {profile.nama_lengkap?.split(' ')[0] ?? 'Pengguna'}
                      </span>
                      <ChevronDown size={13} className="text-[var(--ink-lt)]" />
                    </button>

                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 bg-white border border-[rgba(28,43,43,0.1)] rounded-xl shadow-lg overflow-hidden py-1">
                          <div className="px-4 py-3 border-b border-[rgba(28,43,43,0.07)]">
                            <p className="text-[13px] font-semibold text-[var(--ink)] truncate">{profile.nama_lengkap}</p>
                            <p className="text-[11px] text-[var(--ink-lt)] truncate">{profile.email}</p>
                          </div>
                          <Link href="/profil" onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--ink-md)] hover:bg-[rgba(28,43,43,0.04)] transition-colors">
                            <User size={14} /> Profil Saya
                          </Link>
                          <Link href="/editor/drafts" onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--ink-md)] hover:bg-[rgba(28,43,43,0.04)] transition-colors">
                            <PenLine size={14} /> Draft Artikel
                          </Link>
                          {isAdmin && (
                            <Link href="/admin" onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--ink-md)] hover:bg-[rgba(28,43,43,0.04)] transition-colors">
                              <Settings size={14} /> Panel Admin
                            </Link>
                          )}
                          <div className="border-t border-[rgba(28,43,43,0.07)] mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--coral)] w-full text-left hover:bg-[var(--coral-lt)] transition-colors"
                            >
                              <LogOut size={14} /> Keluar
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-[13px] font-semibold bg-[var(--ink)] text-white hover:bg-[var(--coral)] transition-colors"
                >
                  <LogIn size={13} />
                  Masuk
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
