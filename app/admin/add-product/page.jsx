"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import supabase from "@/lib/supabaseClient";
import { assets } from "@/assets/assets";
import Image from "next/image";

export default function AdminAddProduct() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        stock: "",
        rating: 0,
        category: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            isFile: true,
        }));
        setImages((prev) => [...prev, ...newImages]);
    };

    const handleAddImageUrl = () => {
        if (!imageUrl.trim()) {
            toast.error("Please enter a valid image URL");
            return;
        }

        setImages((prev) => [
            ...prev,
            {
                preview: imageUrl,
                isFile: false,
            },
        ]);
        setImageUrl("");
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.price || images.length === 0) {
            toast.error(
                "Please fill all required fields and add at least one image",
            );
            return;
        }

        setLoading(true);

        try {
            // 1. Insert product
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            const { data: productData, error: productError } = await supabase
                .from("products")
                .insert({
                    title: formData.title,
                    slug: slug,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock) || 0,
                    rating: parseFloat(formData.rating) || 0,
                    is_active: true,
                })
                .select()
                .single();

            if (productError) throw productError;

            // 2. Upload images and insert into product_images
            const imageUploadPromises = images.map(async (img, index) => {
                // For demo, we'll use the preview URL directly
                // In production, you should upload to storage first
                const imageUrl = img.preview;

                return supabase.from("product_images").insert({
                    product_id: productData.id,
                    url: imageUrl,
                    alt: formData.title,
                    order: index,
                });
            });

            await Promise.all(imageUploadPromises);

            // 3. Insert category if provided
            if (formData.category) {
                // First, check if category exists
                const { data: categoryData } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("name", formData.category)
                    .single();

                let categoryId = categoryData?.id;

                // If category doesn't exist, create it
                if (!categoryId) {
                    const { data: newCategory, error: catError } =
                        await supabase
                            .from("categories")
                            .insert({
                                name: formData.category,
                                slug: formData.category
                                    .toLowerCase()
                                    .replace(/\s+/g, "-"),
                            })
                            .select()
                            .single();

                    if (catError) throw catError;
                    categoryId = newCategory.id;
                }

                // Link product to category
                await supabase.from("product_categories").insert({
                    product_id: productData.id,
                    category_id: categoryId,
                });
            }

            toast.success("Product added successfully!");

            // Reset form
            setFormData({
                title: "",
                description: "",
                price: "",
                stock: "",
                rating: 0,
                category: "",
            });
            setImages([]);

            setTimeout(() => {
                router.push("/admin");
            }, 1500);
        } catch (error) {
            console.error("Error adding product:", error);
            toast.error("Failed to add product: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl text-slate-500 mb-6">
                Add <span className="text-slate-800 font-medium">Product</span>
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Product Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter product name"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter product description"
                    />
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Price *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Stock
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Rating and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Rating (0-5)
                        </label>
                        <input
                            type="number"
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                            step="0.1"
                            min="0"
                            max="5"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0.0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Category
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., Electronics"
                        />
                    </div>
                </div>

                {/* Images */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Product Images *
                    </label>

                    {/* Image URL Input */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Enter image URL"
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:scale-95 transition">
                            Add URL
                        </button>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        {images.map((img, index) => (
                            <div key={index} className="relative">
                                <Image
                                    src={img.preview}
                                    alt={`Preview ${index + 1}`}
                                    width={100}
                                    height={100}
                                    className="w-24 h-24 object-cover rounded-lg border-2 border-slate-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                                    ×
                                </button>
                            </div>
                        ))}

                        <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500 transition">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <div className="text-center">
                                <Image
                                    src={assets.upload_area}
                                    alt="Upload"
                                    width={40}
                                    height={40}
                                    className="mx-auto"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Add Image
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? "Adding Product..." : "Add Product"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/admin")}
                        className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 active:scale-95 transition">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
