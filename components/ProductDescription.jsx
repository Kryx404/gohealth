"use client";
import { ArrowRight, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { dummyRatingsData } from "@/assets/assets";

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState("Description");

    return (
        <div className="my-18 text-sm text-slate-600">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {["Description", "Reviews"].map((tab, index) => (
                    <button
                        className={`${
                            tab === selectedTab
                                ? "border-b-[1.5px] font-semibold"
                                : "text-slate-400"
                        } px-3 py-2 font-medium`}
                        key={index}
                        onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl">{product.description}</p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    {dummyRatingsData.map((item, index) => {
                        const user = item.user || {};
                        const userImage = user.image || "/no-image.png";
                        const userName = user.name || "Anonymous";
                        const review = item.review || "";
                        const createdAt = item.createdAt
                            ? new Date(item.createdAt).toDateString()
                            : "";
                        return (
                            <div key={index} className="flex gap-5 mb-10">
                                <Image
                                    src={userImage}
                                    alt=""
                                    className="size-10 rounded-full"
                                    width={100}
                                    height={100}
                                />
                                <div>
                                    <div className="flex items-center">
                                        {Array(5)
                                            .fill("")
                                            .map((_, idx) => (
                                                <StarIcon
                                                    key={idx}
                                                    size={18}
                                                    className="text-transparent mt-0.5"
                                                    fill={
                                                        item.rating >= idx + 1
                                                            ? "#00C950"
                                                            : "#D1D5DB"
                                                    }
                                                />
                                            ))}
                                    </div>
                                    <p className="text-sm max-w-lg my-4">
                                        {review}
                                    </p>
                                    <p className="font-medium text-slate-800">
                                        {userName}
                                    </p>
                                    <p className="mt-3 font-light">
                                        {createdAt}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Store Page */}
            {/* <div className="flex gap-3 mt-14">
                <Image src={product.store.logo} alt="" className="size-11 rounded-full ring ring-slate-400" width={100} height={100} />
                <div>
                    <p className="font-medium text-slate-600">Product by {product.store.name}</p>
                    <Link href={`/shop/${product.store.username}`} className="flex items-center gap-1.5 text-green-500"> view store <ArrowRight size={14} /></Link>
                </div>
            </div> */}
        </div>
    );
};

export default ProductDescription;
