"use client";
import Loading from "@/components/Loading";
import OrdersAreaChart from "@/components/OrdersAreaChart";
import {
    CircleDollarSignIcon,
    ShoppingBasketIcon,
    TagsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function AdminDashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        allOrders: [],
    });

    const dashboardCardsData = [
        {
            title: "Total Products",
            value: dashboardData.products,
            icon: ShoppingBasketIcon,
        },
        {
            title: "Total Revenue",
            value: dashboardData.revenue,
            icon: CircleDollarSignIcon,
        },
        { title: "Total Orders", value: dashboardData.orders, icon: TagsIcon },
    ];

    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            // Get total products count
            const { count: productsCount } = await supabase
                .from("products")
                .select("*", { count: "exact", head: true });

            // Get total active products (assuming you want to count them)
            const { data: products } = await supabase
                .from("products")
                .select("price, stock");

            // Calculate total revenue (sum of all product prices * stock)
            const revenue =
                products?.reduce((acc, product) => {
                    return acc + product.price * (product.stock || 0);
                }, 0) || 0;

            // Format revenue to Rupiah
            const formattedRevenue = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(revenue);

            // Get orders if you have orders table (placeholder for now)
            const ordersCount = 0; // You can fetch from orders table if exists

            // Get all orders for chart (placeholder - adjust based on your orders table)
            const allOrders = []; // You can fetch from orders table if exists

            setDashboardData({
                products: productsCount || 0,
                revenue: formattedRevenue,
                orders: ordersCount,
                allOrders: allOrders,
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">
                Admin{" "}
                <span className="text-slate-800 font-medium">Dashboard</span>
            </h1>

            {/* Cards */}
            <div className="flex flex-wrap gap-20 my-10 mt-4">
                {dashboardCardsData.map((card, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                        <div className="flex flex-col gap-3 text-xs">
                            <p>{card.title}</p>
                            <b className="text-2xl font-medium text-slate-700">
                                {card.value}
                            </b>
                        </div>
                        <card.icon
                            size={50}
                            className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full"
                        />
                    </div>
                ))}
            </div>

            {/* Area Chart */}
            <OrdersAreaChart allOrders={dashboardData.allOrders} />
        </div>
    );
}
