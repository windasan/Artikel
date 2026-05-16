'use client'

import Image from 'next/image';
import Link from 'next/link';import type { Route } from 'next'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { 
  PenLine, LogIn, LogOut, User, ChevronDown, 
  Menu, X, LayoutDashboard, Compass, BookOpen, Users, Info,
  ClipboardCheck, Globe, Cpu
} from 'lucide-react'
import { HeroSearch } from '@/components/home/HeroSearch'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
w

  // Warna Cokelat Utama
  const brownTheme = '#655348'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) setProfile(null)
      else loadUser()
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setMenuOpen(false)
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/' as Route, label: 'Beranda', icon: <Compass size={16} /> },
    { href: '/artikel' as Route, label: 'Artikel', icon: <BookOpen size={16} /> },
    { href: '/penulis' as Route, label: 'Profil', icon: <Users size={16} /> },
    { href: '/tentang' as Route, label: 'Tentang', icon: <Info size={16} /> },
  ]

  const userRole = profile?.role || ''

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 font-sans ${ 
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-[#655348]/10 shadow-[0_4px_30px_rgba(101,83,72,0.05)] py-3'
          : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 flex items-center justify-between gap-2">
          
          <Link href="/" className="flex items-center gap-2 md:gap-3 group z-50 shrink-0">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-inner transition-all duration-300 group-hover:scale-105 ${scrolled ? 'bg-[#655348] text-white' : 'bg-white text-[#655348]'}`}>
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className={`text-lg md:text-xl font-black tracking-tighter uppercase transition-colors duration-300 ${scrolled ? 'text-[#655348]' : 'text-white'}`}>
              Pariwisata <span className={scrolled ? 'text-[#655348]/70' : 'text-white/70'}>A UNY 23</span>
            </span>
          </Link>
          
          {/* Wrapper pencarian diperbaiki agar fleksibel di mobile */}
          <div className="flex-1 flex justify-end lg:justify-center pr-2 lg:pr-0">
            <HeroSearch />
          </div>

          <div className="hidden lg:flex items-center gap-8 shrink-0">
            <div className={`flex items-center gap-8 px-8 py-2.5 rounded-full transition-all duration-300 ${scrolled ? 'bg-[#655348]/5' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`relative text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 group transition-colors ${
                      scrolled 
                        ? (isActive ? 'text-[#a67c52]' : 'text-[#655348]/70 hover:text-[#655348]') 
                        : (isActive ? 'text-white' : 'text-white/70 hover:text-white')
                    }`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity -ml-6 group-hover:ml-0 absolute">{link.icon}</span>
                    <span className="group-hover:translate-x-6 transition-transform duration-300 inline-block">{link.label}</span>
                    {isActive && (
                      <span className={`absolute -bottom-2 left-0 w-full h-[2px] rounded-full ${scrolled ? 'bg-[#a67c52]' : 'bg-white'}`} />
                    )}
                  </Link>
                )
              })}
            </div>

            {!loading && (
              <div className="relative" ref={dropdownRef}>
                {profile ? (
                  <div>
                    <button 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border transition-all duration-300 hover:shadow-md ${
                        scrolled 
                          ? 'bg-white border-[#655348]/10 text-[#655348] hover:bg-orange-50/50' 
                          : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#655348] flex items-center justify-center text-white font-bold text-sm uppercase">
                        {profile.nama_lengkap?.charAt(0) || 'U'}
                      </div>
                      <span className="text-[13px] font-bold max-w-[100px] truncate">{profile.nama_lengkap || 'Pengguna'}</span>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgba(101,83,72,0.15)] border border-[#655348]/10 overflow-hidden transition-all duration-300 origin-top-right ${
                      dropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                    }`}>
                      <div className="p-4 border-b border-[#655348]/5 bg-orange-50/30">
                        <p className="text-[11px] font-bold text-[#655348]/70 uppercase tracking-widest mb-1">Masuk sebagai</p>
                        <p className="text-sm font-black text-[#655348] truncate">{profile.email}</p>
                        <p className="text-[10px] font-bold text-orange-700 mt-1 uppercase bg-orange-100 inline-block px-2 py-0.5 rounded-md">
                          {userRole.replace('_', ' ')}
                        </p>
                      </div>
                      
                      <div className="p-2 space-y-1">
                        {userRole === 'admin' && (
                          <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#655348] hover:bg-orange-50/50 transition-colors">
                            <LayoutDashboard size={16} className="text-[#655348]/70" /> Dashboard Admin
                          </Link>
                        )}
                        {userRole === 'redaksi' && (
                          <Link href="/redaksi" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#655348] hover:bg-orange-50/50 transition-colors">
                            <ClipboardCheck size={16} className="text-[#655348]/70" /> Dashboard Redaksi
                          </Link>
                        )}
                        {userRole === 'publikasi' && (
                          <Link href="/publikasi" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#655348] hover:bg-orange-50/50 transition-colors">
                            <Globe size={16} className="text-[#655348]/70" /> Dashboard Publikasi
                          </Link>
                        )}
                        {userRole === 'it' && (
                          <Link href="/it" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#655348] hover:bg-orange-50/50 transition-colors">
                            <Cpu size={16} className="text-[#655348]/70" /> Dashboard IT
                          </Link>
                        )}

                        <div className="h-px bg-[#655348]/5 my-1" />

                        <Link href="/profil" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-[#655348]/80 hover:text-[#655348] hover:bg-orange-50/50 transition-colors">
                          <User size={16} /> Profil Saya
                        </Link>
                        
                        {(userRole === 'design_layout' || userRole === 'admin') && (
                          <Link href="/editor/new" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 mt-1 rounded-xl text-[13px] font-bold bg-[#655348] text-white hover:bg-[#8B7355] transition-colors">
                            <PenLine size={16} /> Tulis Artikel Baru
                          </Link>
                        )}
                      </div>
                      
                      <div className="p-2 border-t border-[#655348]/5">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut size={16} /> Keluar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href="/login" 
                    className={`flex items-center gap-2 px-8 py-3 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      scrolled 
                        ? 'bg-[#655348] text-white hover:bg-[#8B7355]' 
                        : 'bg-white text-[#655348] hover:bg-orange-50/90'
                    }`}>
                    <LogIn size={16} />
                    Masuk
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Tombol Hamburger diatur shrink-0 agar tidak tertekan search bar */}
          <button 
            className={`lg:hidden p-2 md:p-3 shrink-0 rounded-full transition-colors z-50 ${
              menuOpen 
                ? 'bg-transparent text-[#655348]' 
                : (scrolled ? 'bg-orange-50/50 text-[#655348]' : 'bg-white/10 text-white backdrop-blur-md')
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Menu Mobile dengan Background Overlay Cokelat */}
      <div className={`fixed inset-0 bg-[#655348]/60 backdrop-blur-sm z-[90] lg:hidden transition-all duration-500 ${
       menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Overflow-y-auto ditambahkan agar list tidak terpotong di layar sempit */}
        <div className={`absolute top-0 right-0 w-[85%] sm:w-[350px] h-full bg-white shadow-2xl flex flex-col p-6 overflow-y-auto pb-8 transition-transform duration-500 delay-100 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          
          {/* Flex-1 agar menempati ruang tersisa yang mendorong bagian profil ke bawah */}
          <div className="mt-20 flex-1">
            <p className="text-[11px] font-black text-[#655348]/60 uppercase tracking-[4px] mb-6">Menu Navigasi</p>
            <div className="flex flex-col gap-2">
              {navLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-[16px] font-bold transition-all ${
                    pathname === link.href ? 'bg-[#655348]/10 text-[#655348]' : 'text-[#655348]/80 hover:bg-[#655348]/5 hover:text-[#655348]'
                  }`}
                >
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-[#655348]/10 text-[#a67c52]">
                    {link.icon}
                  </div>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Bagian Bawah Profil (Tidak lagi terpotong karena ada scroll) */}
          <div className="border-t border-[#655348]/10 pt-6 mt-6">
            {!loading && (
              profile ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4 mb-4 bg-[#655348]/5 p-3 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-[#655348] flex items-center justify-center text-white font-bold text-lg uppercase">
                      {profile.nama_lengkap?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#655348]">{profile.nama_lengkap || 'Pengguna'}</p>
                      <p className="text-xs text-[#655348]/70 truncate w-[150px]">{profile.email}</p>
                    </div>
                  </div>
                  
                  {userRole === 'admin' && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#655348]/5 text-sm font-bold text-[#655348]">
                      <LayoutDashboard size={16} className="text-[#a67c52]" /> Dashboard Admin
                    </Link>
                  )}
                  {userRole === 'redaksi' && (
                    <Link href="/redaksi" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#655348]/5 text-sm font-bold text-[#655348]">
                      <ClipboardCheck size={16} className="text-[#a67c52]" /> Dashboard Redaksi
                    </Link>
                  )}
                  {userRole === 'publikasi' && (
                    <Link href="/publikasi" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#655348]/5 text-sm font-bold text-[#655348]">
                      <Globe size={16} className="text-[#a67c52]" /> Dashboard Publikasi
                    </Link>
                  )}
                  {userRole === 'it' && (
                    <Link href="/it" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#655348]/5 text-sm font-bold text-[#655348]">
                      <Cpu size={16} className="text-[#a67c52]" /> Dashboard IT
                    </Link>
                  )}

                  <Link href="/profil" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#655348]/5 text-sm font-bold text-[#655348]">
                    <User size={16} className="text-[#a67c52]" /> Profil Saya
                  </Link>
                  
                  {(userRole === 'design_layout' || userRole === 'admin') && (
                    <Link href="/editor/new" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#655348] text-sm font-bold text-white shadow-md">
                      <PenLine size={16} /> Tulis Artikel
                    </Link>
                  )}

                  <button onClick={handleLogout} className="flex items-center justify-center gap-3 px-4 py-3 mt-2 rounded-xl border border-red-200 text-sm font-bold text-red-500 bg-red-50">
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#655348] text-white text-sm font-bold shadow-lg"
                >
                  <LogIn size={18} /> Masuk ke Akun
                </Link>
              )
            )}
          </div>

        </div>
      </div>
    </>
  )
}