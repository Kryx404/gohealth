import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "GoSans. - Admin",
    description: "GoSans. - Admin",
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
