"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border p-2 w-full rounded"
                />
            </div>

            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border p-2 w-full rounded"
                />
            </div>

            {error && <p className="text-red-600 mt-2">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60">
                {loading ? "Masuk..." : "Masuk"}
            </button>
        </form>
    );
}
