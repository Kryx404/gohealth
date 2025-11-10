"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";

export default function RegisterForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [alamat, setAlamat] = useState("");
    const [nomerHp, setNomerHp] = useState("");
    const [paypalId, setPaypalId] = useState("");
    const [gender, setGender] = useState("");
    const [provinsi, setProvinsi] = useState("");
    const [provinsiName, setProvinsiName] = useState("");
    const [kota, setKota] = useState("");
    const [kotaName, setKotaName] = useState("");
    const [kecamatan, setKecamatan] = useState("");
    const [kecamatanName, setKecamatanName] = useState("");
    const [kelurahan, setKelurahan] = useState("");
    const [kelurahanName, setKelurahanName] = useState("");
    const [provinsiList, setProvinsiList] = useState([]);
    const [kotaList, setKotaList] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [kelurahanList, setKelurahanList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(null); // null, true, or false
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Check password match in real-time
    useEffect(() => {
        if (confirmPassword === "") {
            setPasswordMatch(null); // No indicator when empty
        } else if (password === confirmPassword) {
            setPasswordMatch(true); // Match
        } else {
            setPasswordMatch(false); // Not match
        }
    }, [password, confirmPassword]);

    // Fetch provinsi list from wilayah.id API
    useEffect(() => {
        async function fetchProvinsi() {
            try {
                const res = await fetch("/api/wilayah?type=provinces");
                const data = await res.json();
                if (data && Array.isArray(data.data)) {
                    setProvinsiList(data.data);
                }
            } catch (err) {
                setProvinsiList([]);
            }
        }
        fetchProvinsi();
    }, []);

    // Fetch kota list when provinsi changes
    useEffect(() => {
        async function fetchKota() {
            if (!provinsi) {
                setKotaList([]);
                return;
            }
            try {
                const res = await fetch(
                    `/api/wilayah?type=regencies&code=${provinsi}`,
                );
                const data = await res.json();
                if (data && Array.isArray(data.data)) {
                    setKotaList(data.data);
                } else {
                    setKotaList([]);
                }
            } catch (err) {
                setKotaList([]);
            }
        }
        fetchKota();
        setKota(""); // Reset kota when provinsi changes
        setKotaName(""); // Reset kota name when provinsi changes
        setKecamatan(""); // Reset kecamatan when provinsi changes
        setKecamatanName(""); // Reset kecamatan name when provinsi changes
        setKelurahan(""); // Reset kelurahan when provinsi changes
        setKelurahanName(""); // Reset kelurahan name when provinsi changes
    }, [provinsi]);

    // Fetch kecamatan list when kota changes
    useEffect(() => {
        async function fetchKecamatan() {
            if (!kota) {
                setKecamatanList([]);
                return;
            }
            try {
                const res = await fetch(
                    `/api/wilayah?type=districts&code=${kota}`,
                );
                const data = await res.json();
                if (data && Array.isArray(data.data)) {
                    setKecamatanList(data.data);
                } else {
                    setKecamatanList([]);
                }
            } catch (err) {
                setKecamatanList([]);
            }
        }
        fetchKecamatan();
        setKecamatan(""); // Reset kecamatan when kota changes
        setKecamatanName(""); // Reset kecamatan name when kota changes
        setKelurahan(""); // Reset kelurahan when kota changes
        setKelurahanName(""); // Reset kelurahan name when kota changes
    }, [kota]);

    // Fetch kelurahan list when kecamatan changes
    useEffect(() => {
        async function fetchKelurahan() {
            if (!kecamatan) {
                setKelurahanList([]);
                return;
            }
            try {
                const res = await fetch(
                    `/api/wilayah?type=villages&code=${kecamatan}`,
                );
                const data = await res.json();
                if (data && Array.isArray(data.data)) {
                    setKelurahanList(data.data);
                } else {
                    setKelurahanList([]);
                }
            } catch (err) {
                setKelurahanList([]);
            }
        }
        fetchKelurahan();
        setKelurahan(""); // Reset kelurahan when kecamatan changes
        setKelurahanName(""); // Reset kelurahan name when kecamatan changes
    }, [kecamatan]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (password !== confirmPassword) {
            setError("Password dan konfirmasi password tidak sama");
            return;
        }
        if (!gender) {
            setError("Pilih gender");
            return;
        }
        if (!provinsi) {
            setError("Pilih provinsi");
            return;
        }
        if (!kota) {
            setError("Pilih kota");
            return;
        }
        if (!kecamatan) {
            setError("Pilih kecamatan");
            return;
        }
        if (!kelurahan) {
            setError("Pilih kelurahan");
            return;
        }
        if (!username) {
            setError("Username wajib diisi");
            return;
        }
        if (!tanggalLahir) {
            setError("Tanggal lahir wajib diisi");
            return;
        }
        if (!alamat) {
            setError("Alamat wajib diisi");
            return;
        }
        if (!nomerHp) {
            setError("Nomor HP wajib diisi");
            return;
        }
        setLoading(true);

        // Konfirmasi registrasi dengan SweetAlert
        const result = await Swal.fire({
            title: "Konfirmasi Pendaftaran",
            text: "Pastikan semua data yang Anda masukkan sudah benar. Lanjutkan pendaftaran?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, Daftar",
            cancelButtonText: "Periksa Lagi",
        });

        if (!result.isConfirmed) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    username,
                    tanggal_lahir: tanggalLahir,
                    gender,
                    alamat,
                    provinsi: provinsiName,
                    kota: kotaName,
                    kecamatan: kecamatanName,
                    kelurahan: kelurahanName,
                    nomer_hp: nomerHp,
                    paypal_id: paypalId,
                }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error || "Register failed");

            await Swal.fire({
                title: "Registrasi Berhasil!",
                text: "Akun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.",
                icon: "success",
                confirmButtonText: "OK",
            });

            router.push("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br py-8">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-blue-100 rounded-full p-3 mb-2">
                        <FaUserPlus size={36} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-blue-700">
                        Buat Akun Baru
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Isi data diri lengkap untuk mendaftar.
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Username"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Nama lengkap"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="you@email.com"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                                    {showPassword ? (
                                        <FaEyeSlash size={18} />
                                    ) : (
                                        <FaEye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                    className={`border p-2 w-full rounded focus:outline-none focus:ring-2 pr-20 ${
                                        passwordMatch === null
                                            ? "border-blue-200 focus:ring-blue-400"
                                            : passwordMatch
                                            ? "border-green-300 focus:ring-green-400 bg-green-50"
                                            : "border-red-300 focus:ring-red-400 bg-red-50"
                                    }`}
                                    placeholder="Ulangi password"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {passwordMatch !== null && (
                                        <div>
                                            {passwordMatch ? (
                                                <svg
                                                    className="w-5 h-5 text-green-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-5 h-5 text-red-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        className="text-slate-500 hover:text-slate-700">
                                        {showConfirmPassword ? (
                                            <FaEyeSlash size={18} />
                                        ) : (
                                            <FaEye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {passwordMatch === false && (
                                <p className="text-red-600 text-xs mt-1">
                                    ✗ Password tidak sama
                                </p>
                            )}
                            {passwordMatch === true && (
                                <p className="text-green-600 text-xs mt-1">
                                    ✓ Password sama
                                </p>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Tanggal Lahir
                            </label>
                            <input
                                type="date"
                                value={tanggalLahir}
                                onChange={(e) =>
                                    setTanggalLahir(e.target.value)
                                }
                                required
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Gender
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                required
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
                                <option value="">Pilih gender</option>
                                <option value="pria">Pria</option>
                                <option value="wanita">Wanita</option>
                            </select>
                        </div>
                        <div className="mb-3 lg:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Alamat
                            </label>
                            <input
                                type="text"
                                value={alamat}
                                onChange={(e) => setAlamat(e.target.value)}
                                required
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Alamat lengkap"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Provinsi
                            </label>
                            <select
                                value={provinsi}
                                onChange={(e) => {
                                    const selectedCode = e.target.value;
                                    const selectedProvinsi = provinsiList.find(
                                        (p) => p.code === selectedCode,
                                    );
                                    setProvinsi(selectedCode);
                                    setProvinsiName(
                                        selectedProvinsi
                                            ? selectedProvinsi.name
                                            : "",
                                    );
                                }}
                                required
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
                                <option value="">Pilih provinsi</option>
                                {provinsiList.map((p) => (
                                    <option key={p.code} value={p.code}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Kota
                            </label>
                            <select
                                value={kota}
                                onChange={(e) => {
                                    const selectedCode = e.target.value;
                                    const selectedKota = kotaList.find(
                                        (k) => k.code === selectedCode,
                                    );
                                    setKota(selectedCode);
                                    setKotaName(
                                        selectedKota ? selectedKota.name : "",
                                    );
                                }}
                                required
                                disabled={!provinsi}
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50">
                                <option value="">Pilih kota</option>
                                {kotaList.map((k) => (
                                    <option key={k.code} value={k.code}>
                                        {k.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Kecamatan
                            </label>
                            <select
                                value={kecamatan}
                                onChange={(e) => {
                                    const selectedCode = e.target.value;
                                    const selectedKecamatan =
                                        kecamatanList.find(
                                            (k) => k.code === selectedCode,
                                        );
                                    setKecamatan(selectedCode);
                                    setKecamatanName(
                                        selectedKecamatan
                                            ? selectedKecamatan.name
                                            : "",
                                    );
                                }}
                                required
                                disabled={!kota}
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50">
                                <option value="">Pilih kecamatan</option>
                                {kecamatanList.map((k) => (
                                    <option key={k.code} value={k.code}>
                                        {k.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Kelurahan
                            </label>
                            <select
                                value={kelurahan}
                                onChange={(e) => {
                                    const selectedCode = e.target.value;
                                    const selectedKelurahan =
                                        kelurahanList.find(
                                            (k) => k.code === selectedCode,
                                        );
                                    setKelurahan(selectedCode);
                                    setKelurahanName(
                                        selectedKelurahan
                                            ? selectedKelurahan.name
                                            : "",
                                    );
                                }}
                                required
                                disabled={!kecamatan}
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50">
                                <option value="">Pilih kelurahan</option>
                                {kelurahanList.map((k) => (
                                    <option key={k.code} value={k.code}>
                                        {k.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Nomor HP
                            </label>
                            <input
                                type="text"
                                value={nomerHp}
                                onChange={(e) => setNomerHp(e.target.value)}
                                required
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="08xxxxxxxxxx"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 text-blue-700">
                                Paypal ID (opsional)
                            </label>
                            <input
                                type="text"
                                value={paypalId}
                                onChange={(e) => setPaypalId(e.target.value)}
                                className="border border-blue-200 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Paypal ID"
                            />
                        </div>
                    </div>
                    {error && (
                        <p className="text-red-600 mt-2 text-sm">{error}</p>
                    )}
                    {success && (
                        <p className="text-green-600 mt-2 text-sm">{success}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 rounded-lg shadow disabled:opacity-60">
                        {loading ? "Mendaftar..." : "Daftar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
