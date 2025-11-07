import { NextResponse } from 'next/server'

export function middleware(request) {
  // Hanya proteksi route /admin dan subroute-nya
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Cek localStorage tidak bisa di server, jadi cek cookie atau header
    // Di sini kita cek cookie "gohealth_user" (diset oleh Redux slice di localStorage, jadi perlu sinkronisasi ke cookie jika ingin full SSR)
    // Untuk demo, kita asumsikan user info dikirim via cookie (atau bisa pakai session/token di production)
    const userCookie = request.cookies.get('gohealth_user')?.value
    let user = null
    try {
      if (userCookie) user = JSON.parse(decodeURIComponent(userCookie))
    } catch {}
    if (!user || user.role !== 'admin') {
      // Redirect ke login jika tidak ada user atau bukan admin
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
