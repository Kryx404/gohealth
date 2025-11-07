"use client";
import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/lib/features/auth/authSlice";

export default function LoginForm() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error || "Login failed");

            // Simpan user ke Redux store
            dispatch(loginSuccess(data.user));

            // Set cookie agar middleware bisa baca role
            document.cookie = `gohealth_user=${encodeURIComponent(
                JSON.stringify(data.user),
            )}; path=/;`;

            // Redirect sesuai role
            if (data.user.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-blue-100 rounded-full p-3 mb-2">
                        <FaUserCircle size={38} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-blue-700">
                        Masuk ke Akun Anda
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Selamat datang kembali! Silakan login untuk melanjutkan.
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-blue-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="you@email.com"
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1 text-blue-700">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && (
                        <p className="text-red-600 mt-3 text-sm">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 rounded-lg shadow disabled:opacity-60">
                        {loading ? "Masuk..." : "Masuk"}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <span className="text-sm text-slate-600">
                        Belum punya akun?
                    </span>
                    <Link
                        href="/register"
                        className="ml-2 text-blue-600 hover:underline text-sm font-semibold">
                        Daftar
                    </Link>
                </div>
            </div>
        </div>
    );
}
