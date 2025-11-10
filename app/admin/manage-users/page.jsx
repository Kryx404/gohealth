"use client";

import { useState, useEffect } from "react";
import { Search, UserX, UserCheck, Edit, Trash2 } from "lucide-react";
import supabase from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function ManageUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === "admin" ? "user" : "admin";

        const result = await Swal.fire({
            title: "Change User Role?",
            text: `Change role from ${currentRole} to ${newRole}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Change",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            const { error } = await supabase
                .from("users")
                .update({ role: newRole })
                .eq("id", userId);

            if (error) throw error;

            toast.success(`User role changed to ${newRole}`);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Failed to update role");
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        const result = await Swal.fire({
            title: "Delete User?",
            text: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            const { error } = await supabase
                .from("users")
                .delete()
                .eq("id", userId);

            if (error) throw error;

            toast.success("User deleted successfully");
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    Manage Users
                </h1>
                <p className="text-slate-600">
                    Total {users.length} registered users
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Search by name, email, or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-8 text-center text-slate-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">
                                                    {user.full_name || "-"}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    @{user.username || "-"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {user.nomer_hp || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    user.role === "admin"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-green-100 text-green-800"
                                                }`}>
                                                {user.role || "user"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleToggleRole(
                                                            user.id,
                                                            user.role || "user",
                                                        )
                                                    }
                                                    className={`p-2 rounded-lg transition ${
                                                        user.role === "admin"
                                                            ? "text-orange-600 hover:bg-orange-50"
                                                            : "text-blue-600 hover:bg-blue-50"
                                                    }`}
                                                    title={`Change to ${
                                                        user.role === "admin"
                                                            ? "User"
                                                            : "Admin"
                                                    }`}>
                                                    {user.role === "admin" ? (
                                                        <UserX size={18} />
                                                    ) : (
                                                        <UserCheck size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.id,
                                                            user.full_name ||
                                                                user.email,
                                                        )
                                                    }
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete User">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
