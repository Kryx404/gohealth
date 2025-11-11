"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import supabase from "@/lib/supabaseClient";
import { assets } from "@/assets/assets";
import Image from "next/image";

export default function AdminEditProduct() {
    const router = useRouter();
    const { productId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        stock: "",
        rating: 0,
        category: "",
    });

    useEffect(() => {
        fetchProduct();
        fetchCategories();
    }, [productId]);

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from("categories")
            .select("id, name");
        if (!error && data) {
            setCategories(data);
        }
    };

    const fetchProduct = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select(
                `
                *,
                product_images(id, url, order),
                product_categories(
                    category_id,
                    categories(id, name)
                )
            `,
            )
            .eq("id", productId)
            .single();

        if (!error && data) {
            // Get category name from the correct structure
            const categoryName =
                data.product_categories?.[0]?.categories?.name || "";

            console.log("Product data:", data);
            console.log("Category name:", categoryName);

            setFormData({
                title: data.title || "",
                description: data.description || "",
                price: data.price || "",
                stock: data.stock || "",
                rating: data.rating || 0,
                category: categoryName,
            });

            // Load existing images
            const existingImages =
                data.product_images?.map((img) => ({
                    id: img.id,
                    preview: img.url,
                    isFile: false,
                    isExisting: true,
                })) || [];
            setImages(existingImages);
        }
        setLoading(false);
    };

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
            isExisting: false,
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
                isExisting: false,
            },
        ]);
        setImageUrl("");
    };

    const removeImage = async (index) => {
        const image = images[index];

        // If it's an existing image in DB, delete it
        if (image.isExisting && image.id) {
            const { error } = await supabase
                .from("product_images")
                .delete()
                .eq("id", image.id);

            if (error) {
                toast.error("Failed to delete image");
                return;
            }
        }

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

        setSaving(true);

        try {
            // 1. Update product
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            const { error: productError } = await supabase
                .from("products")
                .update({
                    title: formData.title,
                    slug: slug,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock) || 0,
                    rating: parseFloat(formData.rating) || 0,
                })
                .eq("id", productId);

            if (productError) throw productError;

            // 2. Add new images
            const newImages = images.filter((img) => !img.isExisting);
            if (newImages.length > 0) {
                const imageInsertPromises = newImages.map(
                    async (img, index) => {
                        return supabase.from("product_images").insert({
                            product_id: productId,
                            url: img.preview,
                            alt: formData.title,
                            order: images.length + index,
                        });
                    },
                );

                await Promise.all(imageInsertPromises);
            }

            // 3. Update category
            if (formData.category) {
                // Delete old category associations
                await supabase
                    .from("product_categories")
                    .delete()
                    .eq("product_id", productId);

                // Check if category exists
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
                    product_id: productId,
                    category_id: categoryId,
                });
            }

            toast.success("Product updated successfully!");

            setTimeout(() => {
                router.push("/admin/manage-products");
            }, 1500);
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Failed to update product: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-slate-500">Loading product...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl text-slate-500 mb-6">
                Edit <span className="text-slate-800 font-medium">Product</span>
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
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
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
                        disabled={saving}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? "Updating Product..." : "Update Product"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/admin/manage-products")}
                        className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 active:scale-95 transition">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
