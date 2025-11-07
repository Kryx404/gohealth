import { NextResponse } from "next/server";
import supabaseClient from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json(
                { ok: false, error: "Email and password required" },
                { status: 400 },
            );
        }

        // Query custom users table using admin client
        const { data: user, error } = await supabaseAdmin
            .from("users")
            .select("id, email, role, is_active, password")
            .eq("email", email)
            .single();

        if (error || !user) {
            return NextResponse.json(
                { ok: false, error: "Invalid credentials" },
                { status: 401 },
            );
        }

        if (!user.is_active) {
            return NextResponse.json(
                { ok: false, error: "User inactive" },
                { status: 403 },
            );
        }

        // Simple plaintext comparison for now (insecure for production).
        // Make sure passwords in DB match this plain text or migrate to hashed passwords later.
        if (password !== user.password) {
            return NextResponse.json(
                { ok: false, error: "Invalid credentials" },
                { status: 401 },
            );
        }

        const safeUser = { id: user.id, email: user.email, role: user.role };

        // Simple response: return user info. No JWT or cookies are issued (per request).
        return NextResponse.json({ ok: true, user: safeUser }, { status: 200 });
    } catch (err) {
        console.error("login error", err);
        return NextResponse.json(
            { ok: false, error: "Server error" },
            { status: 500 },
        );
    }
}
