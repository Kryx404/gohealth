import { PlusIcon, SquarePenIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import AddressModal from "./AddressModal";
import { useSelector, useDispatch } from "react-redux";
import supabase from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { clearCart } from "@/lib/features/cart/cartSlice";
import { generateInvoicePDF } from "@/lib/generateInvoice";

const OrderSummary = ({ totalPrice, items }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

    const router = useRouter();
    const dispatch = useDispatch();

    // const addressList = useSelector((state) => state.address.list);
    const user = useSelector((state) => state.auth.user);
    const [addressList, setAddressList] = useState([]);

    // Fetch alamat dari tabel users kolom alamat
    React.useEffect(() => {
        const fetchAddress = async () => {
            if (!user?.id) return;
            const { data, error } = await supabase
                .from("users")
                .select(
                    "alamat, kota, provinsi, kelurahan, kecamatan, nomer_hp, full_name",
                )
                .eq("id", user.id)
                .single();
            if (!error && data) {
                // Buat array address, meski 1, agar konsisten
                setAddressList([
                    {
                        name: data.full_name,
                        alamat: data.alamat,
                        kota: data.kota,
                        provinsi: data.provinsi,
                        kelurahan: data.kelurahan,
                        kecamatan: data.kecamatan,
                        nomer_hp: data.nomer_hp,
                    },
                ]);
            }
        };
        fetchAddress();
    }, [user]);

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState("");
    const [coupon, setCoupon] = useState("");

    const handleCouponCode = async (event) => {
        event.preventDefault();
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Validasi user sudah login
        if (!user || !user.id) {
            toast.error("Please login to place order");
            throw new Error("Please login to place order");
        }

        // Validasi address sudah dipilih
        if (!selectedAddress) {
            toast.error("Please select delivery address");
            throw new Error("Please select delivery address");
        }

        // Validasi items tidak kosong
        if (!items || items.length === 0) {
            toast.error("Your cart is empty");
            throw new Error("Your cart is empty");
        }

        // Prepare order data
        const orderData = {
            userId: user.id,
            total: coupon
                ? totalPrice - (coupon.discount / 100) * totalPrice
                : totalPrice,
            paymentMethod: paymentMethod,
            address: selectedAddress,
            isCouponUsed: !!coupon,
            coupon: coupon || null,
            orderItems: items.map((item) => ({
                productId: item.id,
                name: item.title || item.name, // Gunakan title dari products table
                quantity: item.quantity,
                price: item.price,
            })),
        };

        console.log("Sending order data:", orderData);

        // Call API to create order
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        const result = await response.json();

        console.log("API Response:", result);
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (!response.ok) {
            const errorMessage =
                result.details || result.error || "Failed to place order";
            console.error("Order failed:", errorMessage);
            throw new Error(errorMessage);
        }

        // Generate Invoice PDF
        try {
            const invoiceData = {
                orderId:
                    result.pembelian?.id ||
                    result.orders?.[0]?.pembelian_id ||
                    "N/A",
                customerName: user.full_name || user.name || "Customer",
                customerEmail: user.email || "",
                customerPhone: selectedAddress.nomer_hp || "",
                paymentMethod: paymentMethod,
                status: "ORDER_RECEIVED",
                address: selectedAddress,
                items: items.map((item) => ({
                    name: item.title || item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                subtotal: totalPrice,
                discount: coupon ? (coupon.discount / 100) * totalPrice : 0,
                total: coupon
                    ? totalPrice - (coupon.discount / 100) * totalPrice
                    : totalPrice,
            };

            generateInvoicePDF(invoiceData);
            toast.success("Invoice PDF generated successfully!");
        } catch (pdfError) {
            console.error("Error generating PDF:", pdfError);
            // Jangan fail order kalau PDF gagal
            toast.warning("Order placed but invoice generation failed");
        }

        // Clear cart setelah order berhasil
        console.log("Clearing cart...");
        dispatch(clearCart());
        console.log("Cart cleared successfully");

        // Redirect ke halaman orders setelah delay kecil
        setTimeout(() => {
            console.log("Redirecting to orders page...");
            router.push("/orders");
        }, 1500);

        return result;
    };

    return (
        <div className="w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7">
            <h2 className="text-xl font-medium text-slate-600">
                Payment Summary
            </h2>
            <p className="text-slate-400 text-xs my-4">Payment Method</p>
            <div className="flex gap-2 items-center">
                <input
                    type="radio"
                    id="COD"
                    onChange={() => setPaymentMethod("COD")}
                    checked={paymentMethod === "COD"}
                    className="accent-gray-500"
                />
                <label htmlFor="COD" className="cursor-pointer">
                    COD
                </label>
            </div>
            <div className="flex gap-2 items-center mt-1">
                <input
                    type="radio"
                    id="TRANSFER"
                    name="payment"
                    onChange={() => setPaymentMethod("TRANSFER")}
                    checked={paymentMethod === "TRANSFER"}
                    className="accent-gray-500"
                />
                <label htmlFor="TRANSFER" className="cursor-pointer">
                    Transfer
                </label>
            </div>
            <div className="my-4 py-4 border-y border-slate-200 text-slate-400">
                <p>Address</p>
                {selectedAddress ? (
                    <div className="flex gap-2 items-center">
                        <p>
                            {selectedAddress.name}, {selectedAddress.city},{" "}
                            {selectedAddress.state}, {selectedAddress.zip}
                        </p>
                        <SquarePenIcon
                            onClick={() => setSelectedAddress(null)}
                            className="cursor-pointer"
                            size={18}
                        />
                    </div>
                ) : (
                    <div>
                        {addressList.length > 0 && (
                            <select
                                className="border border-slate-400 p-2 w-full my-3 outline-none rounded"
                                onChange={(e) =>
                                    setSelectedAddress(
                                        addressList[e.target.value],
                                    )
                                }>
                                <option value="">Select Address</option>
                                {addressList.map((address, index) => (
                                    <option key={index} value={index}>
                                        {address.alamat}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button
                            className="flex items-center gap-1 text-slate-600 mt-1"
                            onClick={() => setShowAddressModal(true)}>
                            Add Address <PlusIcon size={18} />
                        </button>
                    </div>
                )}
            </div>
            <div className="pb-4 border-b border-slate-200">
                <div className="flex justify-between">
                    <div className="flex flex-col gap-1 text-slate-400">
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className="flex flex-col gap-1 font-medium text-right">
                        <p>
                            {currency}
                            {totalPrice.toLocaleString()}
                        </p>
                        <p>Free</p>
                        {coupon && (
                            <p>{`-${currency}${(
                                (coupon.discount / 100) *
                                totalPrice
                            ).toFixed(2)}`}</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex justify-between py-4">
                <p>Total:</p>
                <p className="font-medium text-right">
                    {currency}
                    {coupon
                        ? (
                              totalPrice -
                              (coupon.discount / 100) * totalPrice
                          ).toFixed(2)
                        : totalPrice.toLocaleString()}
                </p>
            </div>
            <button
                onClick={(e) => {
                    toast.promise(handlePlaceOrder(e), {
                        loading: "Placing order...",
                        success: "Order placed successfully!",
                        error: (err) => err.message || "Failed to place order",
                    });
                }}
                className="w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all">
                Place Order
            </button>

            {showAddressModal && (
                <AddressModal setShowAddressModal={setShowAddressModal} />
            )}
        </div>
    );
};

export default OrderSummary;
