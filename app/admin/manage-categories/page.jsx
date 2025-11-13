"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import supabase from "@/lib/supabaseClient";
import Swal from "sweetalert2";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";

export default function AdminManageCategories() {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
    });

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setCategories(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "name" && { slug: generateSlug(value) }),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            if (editMode && currentCategory) {
                // Update existing category
                const { error } = await supabase
                    .from("categories")
                    .update({
                        name: formData.name,
                        slug: formData.slug,
                        description: formData.description,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", currentCategory.id);

                if (error) throw error;
                toast.success("Category updated successfully!");
            } else {
                // Create new category
                const { error } = await supabase.from("categories").insert({
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description,
                });

                if (error) throw error;
                toast.success("Category created successfully!");
            }

            // Reset form and close modal
            setFormData({ name: "", slug: "", description: "" });
            setShowModal(false);
            setEditMode(false);
            setCurrentCategory(null);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error(error.message || "Failed to save category");
        }
    };

    const handleEdit = (category) => {
        setCurrentCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || "",
        });
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (categoryId, categoryName) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Delete category "${categoryName}"? This will affect all products in this category!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                // First, delete all product_categories relations
                const { error: relError } = await supabase
                    .from("product_categories")
                    .delete()
                    .eq("category_id", categoryId);

                if (relError) throw relError;

                // Then delete the category
                const { error: catError } = await supabase
                    .from("categories")
                    .delete()
                    .eq("id", categoryId);

                if (catError) throw catError;

                toast.success("Category deleted successfully!");
                fetchCategories();
            } catch (error) {
                console.error("Error deleting category:", error);
                toast.error("Failed to delete category");
            }
        }
    };

    const handleAddNew = () => {
        setFormData({ name: "", slug: "", description: "" });
        setEditMode(false);
        setCurrentCategory(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentCategory(null);
        setFormData({ name: "", slug: "", description: "" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-slate-500">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl text-slate-500">
                    Manage{" "}
                    <span className="text-slate-800 font-medium">
                        Categories
                    </span>
                </h1>

                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 active:scale-95 transition">
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            {/* Categories Grid */}
            {categories.length === 0 ? (
                <div className="text-center text-slate-400 py-20">
                    No categories found. Add your first category!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <Tag
                                            size={20}
                                            className="text-green-600"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">
                                            {category.name}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {category.slug}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {category.description && (
                                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                    {category.description}
                                </p>
                            )}

                            <div className="flex gap-2 pt-3 border-t border-slate-100">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 active:scale-95 transition">
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={() =>
                                        handleDelete(category.id, category.name)
                                    }
                                    className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 active:scale-95 transition">
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Add/Edit Category */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">
                            {editMode ? "Edit Category" : "Add New Category"}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Category Name{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="e.g., Vitamins"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Slug
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-50"
                                        placeholder="auto-generated"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Auto-generated from name, or customize
                                        it
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Brief description of the category"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 active:scale-95 transition">
                                    {editMode ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
