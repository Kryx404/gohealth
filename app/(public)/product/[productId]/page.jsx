"use client";
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import supabase from "@/lib/supabaseClient";

export default function Product() {
    const { productId } = useParams();
    const [product, setProduct] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select(
                    `*, product_images(*), product_categories(category_id), categories:product_categories(category_id)(id, name)`,
                )
                .eq("id", productId)
                .single();
            if (!error && data) {
                // Map to ProductDetails structure, use rating from DB
                const mapped = {
                    id: data.id,
                    name: data.title,
                    price: data.price,
                    images:
                        data.product_images?.length > 0
                            ? data.product_images.map((img) => img.url)
                            : [],
                    rating: [
                        {
                            rating:
                                typeof data.rating === "number"
                                    ? data.rating
                                    : 0,
                        },
                    ],
                    description: data.description,
                    category:
                        data.categories?.length > 0
                            ? data.categories[0].name
                            : "",
                };
                setProduct(mapped);
            } else {
                setProduct(undefined);
            }
            setLoading(false);
        };
        if (productId) fetchProduct();
        scrollTo(0, 0);
    }, [productId]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                Loading product...
            </div>
        );
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {/* Product Details */}
                {product && <ProductDetails product={product} />}

                {/* Description & Reviews */}
                {product && <ProductDescription product={product} />}
            </div>
        </div>
    );
}
