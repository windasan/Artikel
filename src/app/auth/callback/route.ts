// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // PERBAIKAN: Arahkan ke /profil secara default agar UI ter-refresh dan tidak terkena cache halaman statis Beranda
  const next = searchParams.get('redirect') ?? '/profil'

  if (code) {
    // Tambahkan await untuk antisipasi perubahan API cookies di Next.js versi terbaru
    const supabase = await createClient()
    
    // Menukar kode dengan sesi login (session)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      const email = data.user.email
      
      // VALIDASI DOMAIN UNY (Mencegah akun luar masuk)
      const isUnyEmail = email?.endsWith('@student.uny.ac.id') || email?.endsWith('@staff.uny.ac.id')

      if (!isUnyEmail) {
        // Hapus sesi jika bukan email UNY
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=Akses_ditolak._Gunakan_email_resmi_UNY.`)
      }

      // Pastikan URL redirect menggunakan origin dari request 
      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('Auth Callback Error:', error)
    }
  }

  // Jika gagal, kembalikan user ke halaman login dengan pesan error
  return NextResponse.redirect(`${origin}/login?error=Terjadi_kesalahan_saat_login`)
}