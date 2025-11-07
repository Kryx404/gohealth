"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/features/auth/authSlice";
import Swal from "sweetalert2";

const AdminNavbar = () => {
    const router = useRouter();
    const dispatch = useDispatch();

   const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Konfirmasi Logout',
            text: 'Apakah Anda yakin ingin keluar dari admin panel?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Logout',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            dispatch(logout());
            document.cookie = 'gohealth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            router.push("/");
            Swal.fire({
                title: 'Logout Berhasil',
                text: 'Anda telah keluar dari admin panel',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link
                href="/"
                className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">go</span>health
                <span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Admin
                </p>
            </Link>
            <div className="flex items-center gap-3">
                <p>Hi, Admin</p>
                <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 transition text-white rounded-full">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminNavbar;
