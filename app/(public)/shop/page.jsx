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
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            // Fetch products with images and categories
            const { data: productsData, error: productsError } = await supabase
                .from("products")
                .select(
                    `*, product_images(*), product_categories(*, categories:category_id(*))`,
                )
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (productsError) {
                setProducts([]);
                setLoading(false);
                return;
            }

            // Map to ProductCard structure, use rating from DB
            const mapped = productsData.map((product) => {
                // Ambil nama kategori dari relasi product_categories.categories
                let categoriesArr = [];
                if (
                    Array.isArray(product.product_categories) &&
                    product.product_categories.length > 0
                ) {
                    categoriesArr = product.product_categories
                        .map((pc) => pc.categories?.name)
                        .filter(Boolean);
                }
                return {
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
                    categories: categoriesArr,
                };
            });
            // Debug log
            // console.log("mapped products:", mapped);
            setProducts(mapped);
            setLoading(false);
        }
        async function fetchCategories() {
            const { data, error } = await supabase
                .from("categories")
                .select("name");
            if (!error && data) {
                setCategories(data.map((cat) => cat.name));
            }
        }
        fetchProducts();
        fetchCategories();
    }, []);

    let filteredProducts = products;
    if (search) {
        filteredProducts = filteredProducts.filter((product) =>
            product.name?.toLowerCase().includes(search.toLowerCase()),
        );
    }
    if (selectedCategory) {
        filteredProducts = filteredProducts.filter(
            (product) =>
                Array.isArray(product.categories) &&
                product.categories.includes(selectedCategory),
        );
    }

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                Loading products...
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <h1
                    onClick={() => router.push("/shop")}
                    className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer">
                    {search && <MoveLeftIcon size={20} />} All{" "}
                    <span className="text-slate-700 font-medium">Products</span>
                </h1>
                {/* Filter by Category as Button Group */}
                <div className="mb-6 flex flex-wrap gap-2 items-center">
                    <button
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                            selectedCategory === ""
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-green-100"
                        }`}
                        onClick={() => setSelectedCategory("")}>
                        All Categories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                                selectedCategory === cat
                                    ? "bg-green-500 text-white border-green-500"
                                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-green-100"
                            }`}
                            onClick={() => setSelectedCategory(cat)}>
                            {cat}
                        </button>
                    ))}
                </div>
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
