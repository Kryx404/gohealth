"use client";
import PageTitle from "@/components/PageTitle";
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import { orderDummyData } from "@/assets/assets";
import { useSelector } from "react-redux";
import Loading from "@/components/Loading";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.auth.user);

    // Format number to Rupiah
    const formatRupiah = (number) => {
        return (
            "Rp " +
            new Intl.NumberFormat("id-ID", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(number)
        );
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case "ORDER_RECEIVED":
                return "bg-blue-100 text-blue-700";
            case "PROCESSING":
                return "bg-yellow-100 text-yellow-700";
            case "SHIPPED":
                return "bg-purple-100 text-purple-700";
            case "DELIVERED":
                return "bg-green-100 text-green-700";
            case "CANCELLED":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.id) {
                setOrders([]);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/orders?userId=${user.id}`);
                const result = await response.json();

                if (response.ok) {
                    setOrders(result.orders || []);
                } else {
                    console.error("Failed to fetch orders:", result.error);
                    setOrders([]);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-[70vh] mx-6">
            {orders.length > 0 ? (
                <div className="my-20 max-w-7xl mx-auto">
                    <PageTitle
                        heading="My Orders"
                        text={`Showing total ${orders.length} orders`}
                        linkText={"Go to home"}
                    />

                    <div className="max-w-5xl space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="border border-slate-200 rounded-lg p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Order ID: {order.id}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString("id-ID", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-slate-800">
                                            {formatRupiah(order.total || 0)}
                                        </p>
                                        <span
                                            className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                                                order.status,
                                            )}`}>
                                            {order.status?.replace(/_/g, " ") ||
                                                "ORDER PLACED"}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-3">
                                    {order.pembelian_items?.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-4 border-t pt-3">
                                            <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                                                <img
                                                    className="h-14 w-auto"
                                                    src={
                                                        item.products
                                                            ?.product_images?.[0]
                                                            ?.url ||
                                                        "/placeholder.png"
                                                    }
                                                    alt={item.nama_produk}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">
                                                    {item.nama_produk}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    Quantity: {item.kuantitas}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    Price:{" "}
                                                    {formatRupiah(
                                                        item.harga_unit,
                                                    )}
                                                </p>
                                                <p className="text-sm font-medium text-slate-700">
                                                    Subtotal:{" "}
                                                    {formatRupiah(
                                                        item.subtotal,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment Method */}
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-slate-600">
                                        <span className="font-medium">
                                            Payment Method:
                                        </span>{" "}
                                        {order.metode_pembayaran || "COD"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">
                        You have no orders
                    </h1>
                </div>
            )}
        </div>
    );
}
