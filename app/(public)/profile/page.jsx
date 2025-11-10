"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    UserCircle2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
} from "lucide-react";
import supabase from "@/lib/supabaseClient";

export default function ProfilePage() {
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Redirect jika belum login
        if (!user) {
            router.push("/login");
            return;
        }

        // Fetch full user data dari database
        const fetchUserData = async () => {
            try {
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;
                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">Failed to load profile</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center gap-6">
                        <div className="bg-blue-100 rounded-full p-6">
                            <UserCircle2 size={80} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-800">
                                {userData.full_name || "User"}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Shield
                                    size={18}
                                    className={
                                        userData.role === "admin"
                                            ? "text-purple-600"
                                            : "text-green-600"
                                    }
                                />
                                <span
                                    className={`text-sm font-semibold uppercase ${
                                        userData.role === "admin"
                                            ? "text-purple-600"
                                            : "text-green-600"
                                    }`}>
                                    {userData.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">
                            Contact Information
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail
                                    size={20}
                                    className="text-blue-600 mt-1"
                                />
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Email
                                    </p>
                                    <p className="text-slate-800 font-medium">
                                        {userData.email || "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone
                                    size={20}
                                    className="text-green-600 mt-1"
                                />
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Phone
                                    </p>
                                    <p className="text-slate-800 font-medium">
                                        {userData.nomer_hp || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">
                            Account Details
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar
                                    size={20}
                                    className="text-purple-600 mt-1"
                                />
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Member Since
                                    </p>
                                    <p className="text-slate-800 font-medium">
                                        {userData.created_at
                                            ? new Date(
                                                  userData.created_at,
                                              ).toLocaleDateString("id-ID", {
                                                  day: "numeric",
                                                  month: "long",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              })
                                            : "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <UserCircle2
                                    size={20}
                                    className="text-orange-600 mt-1"
                                />
                                <div>
                                    <p className="text-sm text-slate-500">
                                        User ID
                                    </p>
                                    <p className="text-slate-800 font-mono text-sm">
                                        {userData.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <MapPin size={22} className="text-red-600" />
                            Address Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Street Address
                                </p>
                                <p className="text-slate-800 font-medium">
                                    {userData.alamat || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Kelurahan
                                </p>
                                <p className="text-slate-800 font-medium">
                                    {userData.kelurahan || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Kecamatan
                                </p>
                                <p className="text-slate-800 font-medium">
                                    {userData.kecamatan || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Kota</p>
                                <p className="text-slate-800 font-medium">
                                    {userData.kota || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Provinsi
                                </p>
                                <p className="text-slate-800 font-medium">
                                    {userData.provinsi || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => router.push("/profile/edit")}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md">
                        Edit Profile
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-lg transition">
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
