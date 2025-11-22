import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Next.js 16: Renamed from 'middleware' to 'proxy'
export async function proxy(request: NextRequest) {
  // Skip proxy for iframe loading and static assets to prevent blocking
  const path = request.nextUrl.pathname;
  
  // Allow these paths to load without auth checks (critical for iframe embedding)
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path === '/' || // Allow root to load in iframe
    path === '/workspace' || // Allow workspace pages
    path.includes('.') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Refresh session if needed
  if (user) {
    await supabase.auth.getSession()
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/data (data files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|_next/data|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

