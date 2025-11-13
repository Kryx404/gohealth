"use client";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function OrdersAreaChart({ allOrders }) {
    // Get last 7 days including today
    const getLast7Days = () => {
        const days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push({
                date: date.toISOString().split("T")[0], // YYYY-MM-DD
                displayDate: date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }), // Nov 14
                orders: 0,
            });
        }

        return days;
    };

    // Initialize with last 7 days (all with 0 orders)
    const last7Days = getLast7Days();

    // Count orders for each day
    allOrders.forEach((order) => {
        if (!order.created_at) return;

        const orderDate = new Date(order.created_at)
            .toISOString()
            .split("T")[0];

        // Find matching day in last7Days
        const dayIndex = last7Days.findIndex((day) => day.date === orderDate);
        if (dayIndex !== -1) {
            last7Days[dayIndex].orders += 1;
        }
    });

    return (
        <div className="w-full max-w-4xl h-[300px] text-xs">
            <h3 className="text-lg font-medium text-slate-800 mb-4 pt-2 text-right">
                {" "}
                <span className="text-slate-500">Orders /</span> Day (Last 7
                Days)
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7Days}>
                    <defs>
                        <linearGradient
                            id="colorOrders"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1">
                            <stop
                                offset="5%"
                                stopColor="#16a34a"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="#16a34a"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="displayDate"
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                        allowDecimals={false}
                        label={{
                            value: "Orders",
                            angle: -90,
                            position: "insideLeft",
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                        formatter={(value) => [`${value} orders`, "Total"]}
                        labelStyle={{ color: "#475569", fontWeight: "bold" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="orders"
                        stroke="#16a34a"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorOrders)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
