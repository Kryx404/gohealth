import { NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";

// GET semua orders untuk admin
export async function GET(request) {
    try {
        // Fetch semua orders dengan join ke users dan pembelian_items
        const { data, error } = await supabase
            .from("pembelian")
            .select(
                `
                id,
                user_id,
                total,
                status,
                metode_pembayaran,
                created_at,
                updated_at,
                users (
                    id,
                    full_name,
                    email,
                    nomer_hp
                ),
                pembelian_items (
                    id,
                    pembelian_id,
                    produk_id,
                    nama_produk,
                    kuantitas,
                    harga_unit,
                    subtotal,
                    created_at,
                    products (
                        id,
                        title,
                        slug,
                        price,
                        product_images (url)
                    )
                )
            `,
            )
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching all orders:", error);
            return NextResponse.json(
                { error: "Failed to fetch orders", details: error.message },
                { status: 500 },
            );
        }

        return NextResponse.json({ orders: data }, { status: 200 });
    } catch (error) {
        console.error("Error in fetch all orders API:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 },
        );
    }
}
