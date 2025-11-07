import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
    try {
        const {
            email,
            password,
            full_name,
            username,
            tanggal_lahir,
            gender,
            alamat,
            provinsi,
            kota,
            kecamatan,
            kelurahan,
            nomer_hp,
            paypal_id,
        } = await request.json();

        // Debug: log semua field untuk cek mana yang kosong
        console.log("Register data received:", {
            email: email || "EMPTY",
            password: password ? "PROVIDED" : "EMPTY",
            full_name: full_name || "EMPTY",
            username: username || "EMPTY",
            tanggal_lahir: tanggal_lahir || "EMPTY",
            gender: gender || "EMPTY",
            alamat: alamat || "EMPTY",
            provinsi: provinsi || "EMPTY",
            kota: kota || "EMPTY",
            kecamatan: kecamatan || "EMPTY",
            kelurahan: kelurahan || "EMPTY",
            nomer_hp: nomer_hp || "EMPTY",
            paypal_id: paypal_id || "EMPTY",
        });

        if (
            !email ||
            !password ||
            !full_name ||
            !username ||
            !tanggal_lahir ||
            !gender ||
            !alamat ||
            !provinsi ||
            !kota ||
            !kecamatan ||
            !kelurahan ||
            !nomer_hp
        ) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Semua field wajib diisi kecuali paypal_id",
                },
                { status: 400 },
            );
        }
        // Cek apakah email sudah terdaftar
        const { data: existing } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", email)
            .single();
        if (existing) {
            return NextResponse.json(
                { ok: false, error: "Email already registered" },
                { status: 409 },
            );
        }
        // Insert user baru
        const { data, error } = await supabaseAdmin
            .from("users")
            .insert([
                {
                    username,
                    email,
                    password, // masih plaintext
                    full_name,
                    tanggal_lahir,
                    gender,
                    alamat,
                    provinsi,
                    kota,
                    kecamatan,
                    kelurahan,
                    nomer_hp,
                    paypal_id: paypal_id || null,
                    role: "user",
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ])
            .select(
                "id, email, full_name, role, gender, provinsi, kota, kecamatan, kelurahan, username, tanggal_lahir, alamat, nomer_hp, paypal_id",
            )
            .single();
        if (error) {
            return NextResponse.json(
                { ok: false, error: error.message },
                { status: 500 },
            );
        }
        return NextResponse.json({ ok: true, user: data }, { status: 201 });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: "Server error" },
            { status: 500 },
        );
    }
}
