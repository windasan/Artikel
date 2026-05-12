// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl  = new URL(request.url)
  const code        = requestUrl.searchParams.get('code')
  const redirectTo  = requestUrl.searchParams.get('redirect') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check profile completeness — jika belum isi NIM, arahkan ke profil
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nim')
          .eq('id', user.id)
          .single()

        if (!profile?.nim) {
          return NextResponse.redirect(
            new URL('/profil/lengkapi?redirect=' + encodeURIComponent(redirectTo), requestUrl.origin)
          )
        }
      }

      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
    }
  }

  // Fallback ke halaman error auth
  return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
}
