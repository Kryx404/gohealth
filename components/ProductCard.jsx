"use client";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductCard = ({ product }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

    // Safely handle rating array (accept array or number for compatibility)
    let ratingArray = [];
    if (Array.isArray(product.rating)) {
        ratingArray = product.rating;
    } else if (typeof product.rating === "number") {
        ratingArray = [{ rating: product.rating }];
    }
    const averageRating =
        ratingArray.length > 0
            ? Math.round(
                  ratingArray.reduce(
                      (acc, item) => acc + (item.rating || 0),
                      0,
                  ) / ratingArray.length,
              )
            : 0;

    // Safely handle images (for Supabase and fallback)
    let imageUrl = "";
    if (Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = product.images[0];
    } else if (product.image) {
        imageUrl = product.image;
    } else {
        imageUrl = "/no-image.png"; // fallback image
    }

    return (
        <Link href={`/product/${product.id}`} className=" group max-xl:mx-auto">
            <div className="bg-[#F5F5F5] h-40  sm:w-60 sm:h-68 rounded-lg flex items-center justify-center">
                <Image
                    width={500}
                    height={500}
                    className="max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300"
                    src={imageUrl}
                    alt={product.name || ""}
                />
            </div>
            <div className="flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60">
                <div>
                    <p>{product.name}</p>
                    <div className="flex">
                        {Array(5)
                            .fill("")
                            .map((_, index) => (
                                <StarIcon
                                    key={index}
                                    size={14}
                                    className="text-transparent mt-0.5"
                                    fill={
                                        averageRating >= index + 1
                                            ? "#00C950"
                                            : "#D1D5DB"
                                    }
                                />
                            ))}
                    </div>
                </div>
                <p>
                    {currency}
                    {product.price}
                </p>
            </div>
        </Link>
    );
};

export default ProductCard;
