"use client";
import React, { useEffect, useState } from "react";
import Title from "./Title";
import ProductCard from "./ProductCard";
import supabaseClient from "@/lib/supabaseClient";

const LatestProducts = () => {
    const displayQuantity = 4;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            // Ambil produk terbaru, join dengan gambar utama
            const { data, error } = await supabaseClient
                .from("products")
                .select(
                    `
                    *,
                    product_images!inner(url)
                `,
                )
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(displayQuantity);
            if (!error && data) {
                // Map gambar utama dan gunakan rating dari DB
                const mapped = data.map((p) => ({
                    ...p,
                    image:
                        Array.isArray(p.product_images) &&
                        p.product_images.length > 0
                            ? p.product_images[0].url
                            : null,
                    rating: [
                        { rating: typeof p.rating === "number" ? p.rating : 0 },
                    ],
                }));
                setProducts(mapped);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    return (
        <div className="px-6 my-30 max-w-6xl mx-auto">
            <Title
                title="Latest Products"
                description={`Showing ${products.length} of latest products`}
                href="/shop"
            />
            <div className="mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    products.map((product, index) => (
                        <ProductCard
                            key={product.id || index}
                            product={product}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default LatestProducts;
