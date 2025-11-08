"use client";
import { Suspense, useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { MoveLeftIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";

function ShopContent() {
    const searchParams = useSearchParams();
    const search = searchParams.get("search");
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            // Fetch products with images and categories
            const { data: productsData, error: productsError } = await supabase
                .from("products")
                .select(
                    `*, product_images(*), product_categories(category_id), categories:product_categories(category_id)(id, name)`,
                )
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (productsError) {
                setProducts([]);
                setLoading(false);
                return;
            }

            // Map to ProductCard structure, use rating from DB
            const mapped = productsData.map((product) => ({
                id: product.id,
                name: product.title,
                price: product.price,
                images:
                    product.product_images?.length > 0
                        ? product.product_images.map((img) => img.url)
                        : [],
                rating: [
                    {
                        rating:
                            typeof product.rating === "number"
                                ? product.rating
                                : 0,
                    },
                ],
                description: product.description,
                category:
                    product.categories?.length > 0
                        ? product.categories[0].name
                        : "",
            }));
            setProducts(mapped);
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const filteredProducts = search
        ? products.filter((product) =>
              product.name?.toLowerCase().includes(search.toLowerCase()),
          )
        : products;

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                Loading products...
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className=" max-w-7xl mx-auto">
                <h1
                    onClick={() => router.push("/shop")}
                    className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer">
                    {" "}
                    {search && <MoveLeftIcon size={20} />} All{" "}
                    <span className="text-slate-700 font-medium">Products</span>
                </h1>
                <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Shop() {
    return (
        <Suspense fallback={<div>Loading shop...</div>}>
            <ShopContent />
        </Suspense>
    );
}
