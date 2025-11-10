"use client";
import Loading from "@/components/Loading";
import OrdersAreaChart from "@/components/OrdersAreaChart";
import {
    CircleDollarSignIcon,
    ShoppingBasketIcon,
    TagsIcon,
    PackageCheckIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function AdminDashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        totalOrders: 0,
        deliveredOrders: 0,
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
        {
            title: "Total Orders",
            value: dashboardData.totalOrders,
            icon: TagsIcon,
        },
        {
            title: "Delivered Orders",
            value: dashboardData.deliveredOrders,
            icon: PackageCheckIcon,
        },
    ];

    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            // Get total products count
            const { count: productsCount } = await supabase
                .from("products")
                .select("*", { count: "exact", head: true });

            // Get all orders with DELIVERED status for revenue calculation
            const { data: deliveredOrders } = await supabase
                .from("pembelian")
                .select("total")
                .eq("status", "DELIVERED");

            // Calculate total revenue from delivered orders only
            const revenue =
                deliveredOrders?.reduce((acc, order) => {
                    return acc + (order.total || 0);
                }, 0) || 0;

            // Format revenue to Rupiah
            const formattedRevenue = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(revenue);

            // Get count of DELIVERED orders
            const { count: deliveredOrdersCount } = await supabase
                .from("pembelian")
                .select("*", { count: "exact", head: true })
                .eq("status", "DELIVERED");

            // Get count of ALL orders (any status)
            const { count: totalOrdersCount } = await supabase
                .from("pembelian")
                .select("*", { count: "exact", head: true });

            // Get all orders for chart
            const { data: allOrders } = await supabase
                .from("pembelian")
                .select("*")
                .order("created_at", { ascending: true });

            setDashboardData({
                products: productsCount || 0,
                revenue: formattedRevenue,
                totalOrders: totalOrdersCount || 0,
                deliveredOrders: deliveredOrdersCount || 0,
                allOrders: allOrders || [],
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
            <div className="flex flex-wrap gap-4 my-10 mt-4">
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
