import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Next.js 16: Renamed from 'middleware' to 'proxy'
export async function proxy(request: NextRequest) {
  // Skip proxy for iframe loading and static assets to prevent blocking
  const path = request.nextUrl.pathname;
  
  // Handle CORS for /lovable routes (iframe embedding)
  if (path.startsWith('/lovable')) {
    const origin = request.headers.get('origin');
    
    // List of allowed origins for CORS
    const allowedOrigins = [
      'https://lovable.dev',
      'https://app.lovable.dev',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Check if origin is allowed or matches wildcard lovable.dev
    const isAllowed = origin && (
      allowedOrigins.includes(origin) ||
      origin.match(/^https:\/\/[a-z0-9-]+\.lovable\.dev$/)
    );
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    // Continue with regular processing but add CORS headers
    const response = NextResponse.next();
    
    if (isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    return response;
  }
  
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

