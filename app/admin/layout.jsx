import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "GoHealth. - Admin",
    description: "GoHealth. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
