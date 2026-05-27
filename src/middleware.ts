import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Routes that require login
  const protectedRoutes = ['/editor', '/profil', '/admin', '/redaksi', '/publikasi', '/it']

  if (protectedRoutes.some(r => pathname.startsWith(r)) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Role based access
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'penulis'

    // Pengecekan akses Tulis Artikel / Editor
    if (pathname.startsWith('/editor')) {
        const isEditorRole = ['admin', 'design_layout', 'redaksi', 'publikasi'].includes(role);
        const isWriterRole = ['admin', 'design_layout'].includes(role);
        
        if (pathname === '/editor/new' && !isWriterRole) {
            return NextResponse.redirect(new URL('/profil', request.url))
        } else if (!isEditorRole) {
            return NextResponse.redirect(new URL('/profil', request.url))
        }
    }

    // Pengecekan Dashboard Spesifik
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/profil', request.url))
    }
    if (pathname.startsWith('/redaksi') && !['admin', 'redaksi'].includes(role)) {
      return NextResponse.redirect(new URL('/profil', request.url))
    }
    if (pathname.startsWith('/publikasi') && !['admin', 'publikasi'].includes(role)) {
      return NextResponse.redirect(new URL('/profil', request.url))
    }
    if (pathname.startsWith('/it') && !['admin', 'it'].includes(role)) {
      return NextResponse.redirect(new URL('/profil', request.url))
    }
  }

  // Jika sudah login tapi mencoba ke /login, arahkan ke /profil
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/profil', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}