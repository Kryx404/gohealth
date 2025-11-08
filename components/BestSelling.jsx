"use client";
import { useEffect, useState } from "react";
import Title from "./Title";
import ProductCard from "./ProductCard";
import supabaseClient from "@/lib/supabaseClient";

const BestSelling = () => {
    const displayQuantity = 8;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            // Ambil produk dengan rating terbanyak (misal: is_active true, urutkan rating)
            const { data, error } = await supabaseClient
                .from("products")
                .select(
                    `
                    *,
                    product_images!inner(url)
                `,
                )
                .eq("is_active", true)
                .order("rating", { ascending: false }) // pastikan ada kolom rating, jika tidak, ganti dengan kolom lain
                .limit(displayQuantity);
            if (!error && data) {
                // Map gambar utama
                const mapped = data.map((p) => ({
                    ...p,
                    image:
                        Array.isArray(p.product_images) &&
                        p.product_images.length > 0
                            ? p.product_images[0].url
                            : null,
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
                title="Best Selling"
                description={`Showing ${
                    products.length < displayQuantity
                        ? products.length
                        : displayQuantity
                } of ${products.length} products`}
                href="/shop"
            />
            <div className="mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
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

export default BestSelling;
