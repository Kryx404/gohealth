"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
            setSuccess("Registrasi berhasil! Silakan login.");
            setTimeout(() => router.push("/login"), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                    Username
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border p-2 w-full rounded"
                />
            </div>
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                    Full Name
                </label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="border p-2 w-full rounded"
                />
            </div>
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                    type="email"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border p-2 w-full rounded"
                />
            </div>
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                    Konfirmasi Password
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border p-2 w-full rounded"
                />
            </div>

            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                    Tanggal Lahir
                </label>
                <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    required
                    className="border p-2 w-full rounded"
                />
            </div>
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    className="border p-2 w-full rounded">
                    <option value="">Pilih gender</option>
                    <option value="pria">Pria</option>
                    <option value="wanita">Wanita</option>
                </select>
            </div>
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Alamat</label>
                <input
                    type="text"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    required
                    className="border p-2 w-full rounded"
                />
            </div>
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
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
                            selectedProvinsi ? selectedProvinsi.name : "",
                        );
                    }}
                    required
                    className="border p-2 w-full rounded">
                    <option value="">Pilih provinsi</option>
                    {provinsiList.map((p) => (
                        <option key={p.code} value={p.code}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Kota</label>
                <select
                    value={kota}
                    onChange={(e) => {
                        const selectedCode = e.target.value;
                        const selectedKota = kotaList.find(
                            (k) => k.code === selectedCode,
                        );
                        setKota(selectedCode);
                        setKotaName(selectedKota ? selectedKota.name : "");
                    }}
                    required
                    disabled={!provinsi}
                    className="border p-2 w-full rounded disabled:opacity-50">
                    <option value="">Pilih kota</option>
                    {kotaList.map((k) => (
                        <option key={k.code} value={k.code}>
                            {k.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                    Kecamatan
                </label>
                <select
                    value={kecamatan}
                    onChange={(e) => {
                        const selectedCode = e.target.value;
                        const selectedKecamatan = kecamatanList.find(
                            (k) => k.code === selectedCode,
                        );
                        setKecamatan(selectedCode);
                        setKecamatanName(
                            selectedKecamatan ? selectedKecamatan.name : "",
                        );
                    }}
                    required
                    disabled={!kota}
                    className="border p-2 w-full rounded disabled:opacity-50">
                    <option value="">Pilih kecamatan</option>
                    {kecamatanList.map((k) => (
                        <option key={k.code} value={k.code}>
                            {k.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                    Kelurahan
                </label>
                <select
                    value={kelurahan}
                    onChange={(e) => {
                        const selectedCode = e.target.value;
                        const selectedKelurahan = kelurahanList.find(
                            (k) => k.code === selectedCode,
                        );
                        setKelurahan(selectedCode);
                        setKelurahanName(
                            selectedKelurahan ? selectedKelurahan.name : "",
                        );
                    }}
                    required
                    disabled={!kecamatan}
                    className="border p-2 w-full rounded disabled:opacity-50">
                    <option value="">Pilih kelurahan</option>
                    {kelurahanList.map((k) => (
                        <option key={k.code} value={k.code}>
                            {k.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                    Nomor HP
                </label>
                <input
                    type="text"
                    value={nomerHp}
                    onChange={(e) => setNomerHp(e.target.value)}
                    required
                    className="border p-2 w-full rounded"
                />
            </div>
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                    Paypal ID (opsional)
                </label>
                <input
                    type="text"
                    value={paypalId}
                    onChange={(e) => setPaypalId(e.target.value)}
                    className="border p-2 w-full rounded"
                />
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
            {success && <p className="text-green-600 mt-2">{success}</p>}
            <button
                type="submit"
                disabled={loading}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60">
                {loading ? "Mendaftar..." : "Daftar"}
            </button>
        </form>
    );
}
