"use client";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { toast } from "react-toastify";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Format number to Rupiah without "Rp" and without trailing zeros
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

    const fetchAllOrders = async () => {
        try {
            // Untuk admin, fetch semua orders (tanpa filter userId)
            const response = await fetch("/api/orders/all");
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

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch("/api/orders", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: orderId,
                    status: newStatus,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Order status updated successfully!");
                // Update local state
                setOrders(
                    orders.map((order) =>
                        order.id === orderId
                            ? { ...order, status: newStatus }
                            : order,
                    ),
                );
            } else {
                toast.error(result.error || "Failed to update order status");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
        }
    };

    const openModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    if (loading) return <Loading />;

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">
                Manage{" "}
                <span className="text-slate-800 font-medium">Orders</span>
            </h1>

            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div className="overflow-x-auto max-w-7xl rounded-md shadow border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                            <tr>
                                {[
                                    "Order ID",
                                    "Customer",
                                    "Total",
                                    "Payment",
                                    "Status",
                                    "Date",
                                    "Action",
                                ].map((heading, i) => (
                                    <th key={i} className="px-4 py-3">
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 py-3 font-mono text-xs text-green-600">
                                        {order.id.slice(0, 8)}...
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.users?.full_name ||
                                            order.user_id}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800">
                                        {formatRupiah(order.total)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.metode_pembayaran}
                                    </td>
                                    <td
                                        className="px-4 py-3"
                                        onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={order.status}
                                            onChange={(e) =>
                                                updateOrderStatus(
                                                    order.id,
                                                    e.target.value,
                                                )
                                            }
                                            className={`rounded-md text-sm font-medium px-3 py-1.5 border-0 focus:ring-2 focus:ring-offset-1 ${getStatusColor(
                                                order.status,
                                            )}`}>
                                            <option value="ORDER_RECEIVED">
                                                ORDER RECEIVED
                                            </option>
                                            <option value="PROCESSING">
                                                PROCESSING
                                            </option>
                                            <option value="SHIPPED">
                                                SHIPPED
                                            </option>
                                            <option value="DELIVERED">
                                                DELIVERED
                                            </option>
                                            <option value="CANCELLED">
                                                CANCELLED
                                            </option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleDateString("id-ID")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => openModal(order)}
                                            className="text-blue-600 hover:text-blue-800 font-medium">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Detail Order */}
            {isModalOpen && selectedOrder && (
                <div
                    onClick={closeModal}
                    className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 text-sm backdrop-blur-xs z-50">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
                            Order Details
                        </h2>

                        {/* Order Info */}
                        <div className="mb-4 p-4 bg-slate-50 rounded">
                            <p>
                                <span className="font-medium">Order ID:</span>{" "}
                                {selectedOrder.id}
                            </p>
                            <p>
                                <span className="font-medium">Date:</span>{" "}
                                {new Date(
                                    selectedOrder.created_at,
                                ).toLocaleString("id-ID")}
                            </p>
                            <p>
                                <span className="font-medium">Status:</span>
                                <span
                                    className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        selectedOrder.status,
                                    )}`}>
                                    {selectedOrder.status?.replace(/_/g, " ")}
                                </span>
                            </p>
                        </div>

                        {/* Customer Details */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2 text-slate-800">
                                Customer Details
                            </h3>
                            <p>
                                <span className="text-slate-600">Name:</span>{" "}
                                {selectedOrder.users?.full_name || "N/A"}
                            </p>
                            <p>
                                <span className="text-slate-600">Email:</span>{" "}
                                {selectedOrder.users?.email || "N/A"}
                            </p>
                            <p>
                                <span className="text-slate-600">Phone:</span>{" "}
                                {selectedOrder.users?.nomer_hp || "N/A"}
                            </p>
                        </div>

                        {/* Products */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2 text-slate-800">
                                Products
                            </h3>
                            <div className="space-y-2">
                                {selectedOrder.pembelian_items?.map(
                                    (item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-4 border border-slate-100 shadow-sm rounded p-3">
                                            <img
                                                src={
                                                    item.products
                                                        ?.product_images?.[0]
                                                        ?.url ||
                                                    "/placeholder.png"
                                                }
                                                alt={item.nama_produk}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="text-slate-800 font-medium">
                                                    {item.nama_produk}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    Qty: {item.kuantitas} ×{" "}
                                                    {formatRupiah(
                                                        item.harga_unit,
                                                    )}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    Subtotal:{" "}
                                                    {formatRupiah(
                                                        item.subtotal,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        {/* Payment & Total */}
                        <div className="mb-4 p-4 bg-slate-50 rounded">
                            <p>
                                <span className="font-medium">
                                    Payment Method:
                                </span>{" "}
                                {selectedOrder.metode_pembayaran}
                            </p>
                            <p className="text-lg mt-2">
                                <span className="font-medium">Total:</span>{" "}
                                <span className="text-green-600 font-bold">
                                    {formatRupiah(selectedOrder.total)}
                                </span>
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
