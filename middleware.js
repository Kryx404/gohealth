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

    // Proteksi route /login - user yang sudah login tidak bisa akses
    if (pathname === "/login" && user) {
        // Redirect sesuai role
        if (user.role === "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
        } else {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // Proteksi route /admin - hanya untuk admin
    if (pathname.startsWith("/admin")) {
        if (!user || user.role !== "admin") {
            // Redirect ke login jika tidak ada user atau bukan admin
            return NextResponse.redirect(new URL("/login", request.url));
        }
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
        // Redirect admin ke dashboard admin
        return NextResponse.redirect(new URL("/admin", request.url));
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
