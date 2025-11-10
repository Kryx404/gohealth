import { Outfit } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StoreProvider from "@/app/StoreProvider";
import ToastHandler from "@/components/ToastHandler";
import { Suspense } from "react";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "GoHealth. - Shop smarter",
    description: "GoHealth. - Shop smarter",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <StoreProvider>
                    <Suspense fallback={null}>
                        <ToastHandler />
                    </Suspense>
                    <ToastContainer position="top-right" autoClose={8000} />
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}
