import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      const email = data.user.email
      
      // VALIDASI DOMAIN UNY
      // Hanya izinkan @student.uny.ac.id atau @staff.uny.ac.id
      const isUnyEmail = email?.endsWith('@student.uny.ac.id') || 
                         email?.endsWith('@uny.ac.id')

      if (!isUnyEmail) {
        // Jika bukan email UNY, paksa logout dan arahkan kembali ke login dengan pesan error
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/login?error=Akses ditolak. Silakan gunakan akun email resmi UNY (@student.uny.ac.id atau @staff.uny.ac.id).`
        )
      }

      // Jika valid, teruskan ke halaman yang dituju
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Jika terjadi error pada code exchange
  return NextResponse.redirect(`${origin}/login?error=Terjadi kesalahan saat autentikasi.`)
}