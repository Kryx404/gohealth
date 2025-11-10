"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

const ToastHandler = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        // Small delay to ensure toast container is mounted
        const timer = setTimeout(() => {
            const toastParam = searchParams.get("toast");

            if (toastParam) {
                console.log("Toast param detected:", toastParam);
                console.log("Current pathname:", pathname);

                // Show toast based on param
                switch (toastParam) {
                    case "admin_only":
                        toast.error("Access denied. Admin only!");
                        console.log("Showing admin_only toast");
                        break;
                    case "admin_no_public":
                        toast.warning("Admins cannot access public routes");
                        console.log("Showing admin_no_public toast");
                        break;
                    case "already_logged_in":
                        toast.info("You are already logged in");
                        console.log("Showing already_logged_in toast");
                        break;
                    default:
                        console.log("Unknown toast param:", toastParam);
                        break;
                }

                // Remove the toast param from URL without reloading
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete("toast");
                router.replace(newUrl.pathname + newUrl.search, {
                    scroll: false,
                });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [pathname, searchParams, router]);

    return null;
};

export default ToastHandler;
