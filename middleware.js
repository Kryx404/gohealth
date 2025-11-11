import { NextResponse } from "next/server";

export function middleware(request) {
    const userCookie = request.cookies.get("gohealth_user")?.value;
    let user = null;

    try {
        if (userCookie) {
            user = JSON.parse(decodeURIComponent(userCookie));
        }
    } catch (error) {
        console.error("Error parsing user cookie:", error);
    }

    const pathname = request.nextUrl.pathname;
    const searchParams = request.nextUrl.searchParams;

    // Proteksi route /login - user yang sudah login tidak bisa akses
    // TAPI: skip jika ada toast parameter (artinya user baru di-redirect dengan pesan error)
    if (pathname === "/login" && user && !searchParams.has("toast")) {
        const redirectUrl = new URL(
            user.role === "admin" ? "/admin" : "/",
            request.url,
        );
        redirectUrl.searchParams.set("toast", "already_logged_in");
        return NextResponse.redirect(redirectUrl);
    }

    // Proteksi route /admin - hanya untuk admin
    if (pathname.startsWith("/admin")) {
        if (!user) {
            // User belum login, redirect ke login
            const redirectUrl = new URL("/login", request.url);
            return NextResponse.redirect(redirectUrl);
        }

        if (user.role !== "admin") {
            // User biasa coba akses admin, redirect dengan toast
            const redirectUrl = new URL("/", request.url);
            redirectUrl.searchParams.set("toast", "admin_only");
            return NextResponse.redirect(redirectUrl);
        }
    }

    // Proteksi route /cart dan /orders - hanya untuk user yang sudah login
    const protectedUserRoutes = ["/cart", "/orders"];
    const isProtectedUserRoute = protectedUserRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/"),
    );

    if (isProtectedUserRoute && !user) {
        // User belum login, redirect ke login
        const redirectUrl = new URL("/login", request.url);
        return NextResponse.redirect(redirectUrl);
    }

    // Proteksi route public - admin tidak bisa akses (kecuali logout)
    const publicRoutes = [
        "/",
        "/shop",
        "/product",
        "/cart",
        "/orders",
        "/pricing",
    ];
    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/"),
    );

    if (isPublicRoute && user && user.role === "admin") {
        const redirectUrl = new URL("/admin", request.url);
        redirectUrl.searchParams.set("toast", "admin_no_public");
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/login",
        "/",
        "/shop/:path*",
        "/product/:path*",
        "/cart/:path*",
        "/orders/:path*",
        "/pricing/:path*",
    ],
};
