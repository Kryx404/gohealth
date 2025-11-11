"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import supabase from "@/lib/supabaseClient";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function AdminManageProducts() {
    const router = useRouter();
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select(
                `
                *,
                product_images(url)
            `,
            )
            .order("created_at", { ascending: false });

        if (!error && data) {
            setProducts(data);
        }
        setLoading(false);
    };

    const toggleActive = async (productId, currentStatus) => {
        const { error } = await supabase
            .from("products")
            .update({ is_active: !currentStatus })
            .eq("id", productId);

        if (error) {
            toast.error("Failed to update product status");
        } else {
            toast.success("Product status updated!");
            fetchProducts();
        }
    };

    const deleteProduct = async (productId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            // First delete related images
            const { error: imgError } = await supabase
                .from("product_images")
                .delete()
                .eq("product_id", productId);

            // Then delete product categories
            const { error: catError } = await supabase
                .from("product_categories")
                .delete()
                .eq("product_id", productId);

            // Finally delete the product
            const { error: prodError } = await supabase
                .from("products")
                .delete()
                .eq("id", productId);

            if (prodError || imgError || catError) {
                toast.error("Failed to delete product");
            } else {
                toast.success("Product deleted successfully!");
                fetchProducts();
            }
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Filter products based on search query
    const filteredProducts = products.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-slate-500">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl text-slate-500">
                    Manage{" "}
                    <span className="text-slate-800 font-medium">Products</span>
                </h1>

                {/* Search Input */}
                <div className="flex gap-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                    />
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center text-slate-400 py-20">
                    {searchQuery
                        ? `No products found matching "${searchQuery}"`
                        : "No products found. Add your first product!"}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left ring ring-slate-200 rounded overflow-hidden text-sm">
                        <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Image</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Stock</th>
                                <th className="px-4 py-3">Rating</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredProducts.map((product) => (
                                <tr
                                    key={product.id}
                                    className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Image
                                            src={
                                                product.product_images?.[0]
                                                    ?.url || "/no-image.png"
                                            }
                                            alt={product.title}
                                            width={50}
                                            height={50}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    </td>
                                    <td className="px-4 py-3 max-w-xs truncate">
                                        {product.title}
                                    </td>
                                    <td className="px-4 py-3">
                                        {currency}
                                        {product.price}
                                    </td>
                                    <td className="px-4 py-3">
                                        {product.stock || 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        ⭐ {product.rating || 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() =>
                                                toggleActive(
                                                    product.id,
                                                    product.is_active,
                                                )
                                            }
                                            className={`px-3 py-1 rounded text-xs font-medium ${
                                                product.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}>
                                            {product.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/admin/edit-product/${product.id}`,
                                                    )
                                                }
                                                className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 active:scale-95 transition">
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    deleteProduct(product.id)
                                                }
                                                className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 active:scale-95 transition">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
