import { NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            userId,
            total,
            paymentMethod,
            address,
            isCouponUsed,
            coupon,
            orderItems,
        } = body;

        console.log("Received order request:", body);

        // Validasi required fields
        if (
            !userId ||
            !total ||
            !paymentMethod ||
            !address ||
            !orderItems ||
            orderItems.length === 0
        ) {
            return NextResponse.json(
                {
                    error: "Missing required fields",
                    received: {
                        userId,
                        total,
                        paymentMethod,
                        address: !!address,
                        orderItemsCount: orderItems?.length,
                    },
                },
                { status: 400 },
            );
        }

        // Berdasarkan schema database, struktur seharusnya:
        // 1. Insert ke tabel 'pembelian' dulu (order header)
        // 2. Lalu insert ke 'pembelian_items' dengan foreign key pembelian_id

        // Step 1: Insert order header ke tabel pembelian
        const { data: pembelianData, error: pembelianError } = await supabase
            .from("pembelian")
            .insert({
                user_id: userId,
                total: total,
                status: "ORDER_RECEIVED", // Status awal ketika order dibuat
                metode_pembayaran: paymentMethod,
                // Tambahkan field lain jika ada
            })
            .select()
            .single();

        if (pembelianError) {
            console.error("Error creating pembelian:", pembelianError);
            return NextResponse.json(
                {
                    error: "Failed to create order",
                    details: pembelianError.message,
                    code: pembelianError.code,
                    hint: pembelianError.hint,
                },
                { status: 500 },
            );
        }

        console.log("Successfully created pembelian:", pembelianData);

        // Step 2: Insert order items dengan foreign key pembelian_id
        const orderItemsToInsert = orderItems.map((item) => ({
            pembelian_id: pembelianData.id, // Foreign key ke tabel pembelian
            produk_id: item.productId,
            nama_produk: item.name,
            kuantitas: item.quantity,
            harga_unit: parseFloat(item.price),
            subtotal: parseFloat(item.price * item.quantity),
        }));

        console.log("Inserting order items:", orderItemsToInsert);

        const { data: insertedItems, error: orderError } = await supabase
            .from("pembelian_items")
            .insert(orderItemsToInsert)
            .select();

        if (orderError) {
            console.error("Error creating order:", orderError);
            return NextResponse.json(
                {
                    error: "Failed to create order",
                    details: orderError.message,
                    code: orderError.code,
                    hint: orderError.hint,
                },
                { status: 500 },
            );
        }

        console.log("Successfully inserted items:", insertedItems);

        // Update user address if provided
        if (address) {
            const { error: addressError } = await supabase
                .from("users")
                .update({
                    alamat: address.alamat,
                    kota: address.kota,
                    provinsi: address.provinsi,
                    kelurahan: address.kelurahan,
                    kecamatan: address.kecamatan,
                    nomer_hp: address.nomer_hp,
                    full_name: address.name,
                })
                .eq("id", userId);

            if (addressError) {
                console.error("Error updating address:", addressError);
                // Don't fail the order if address update fails
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: "Order placed successfully",
                pembelian: pembelianData,
                orders: insertedItems,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error in place order API:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error.message,
                stack: error.stack,
            },
            { status: 500 },
        );
    }
}

// GET untuk fetch orders berdasarkan userId
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 },
            );
        }

        // Fetch dari tabel pembelian dengan join ke pembelian_items
        const { data, error } = await supabase
            .from("pembelian")
            .select(`
                id,
                user_id,
                total,
                status,
                metode_pembayaran,
                created_at,
                updated_at,
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
                        short_description,
                        description,
                        price,
                        cost_price,
                        stock,
                        product_images (url)
                    )
                )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
            return NextResponse.json(
                { error: "Failed to fetch orders", details: error.message },
                { status: 500 },
            );
        }

        return NextResponse.json({ orders: data }, { status: 200 });
    } catch (error) {
        console.error("Error in fetch orders API:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 },
        );
    }
}

// PATCH untuk update status order (untuk admin)
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { orderId, status } = body;

        // Validasi required fields
        if (!orderId || !status) {
            return NextResponse.json(
                { error: "orderId and status are required" },
                { status: 400 },
            );
        }

        // Validasi status yang diperbolehkan
        const allowedStatuses = [
            "ORDER_RECEIVED",
            "PROCESSING", 
            "SHIPPED", 
            "DELIVERED",
            "CANCELLED"
        ];
        
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Invalid status. Allowed statuses: " + allowedStatuses.join(", ") },
                { status: 400 },
            );
        }

        // Update status order
        const { data, error } = await supabase
            .from("pembelian")
            .update({ status: status })
            .eq("id", orderId)
            .select()
            .single();

        if (error) {
            console.error("Error updating order status:", error);
            return NextResponse.json(
                { error: "Failed to update order status", details: error.message },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Order status updated successfully",
                order: data,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error in update order status API:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 },
        );
    }
}
