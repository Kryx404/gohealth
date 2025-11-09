import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";

const CategoriesMarquee = () => {
    const [categories, setCategories] = useState([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get("category");



    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("name");
            if (!error && data) {
                setCategories(data.map((cat) => cat.name));
            }
        };
        fetchCategories();
    }, []);

    return (
        <>
            <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group sm:my-20">
                <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
                <div className="flex min-w-[200%] animate-[marqueeScroll_10s_linear_infinite] sm:animate-[marqueeScroll_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-4">
                    {[
                        ...categories,
                        ...categories,
                        ...categories,
                        ...categories,
                    ].map((company, index) => (
                        <button
                            key={index}
                            className={`px-5 py-2 bg-slate-100 rounded-lg text-slate-500 text-xs sm:text-sm hover:bg-slate-600 hover:text-white active:scale-95 transition-all duration-300 whitespace-nowrap truncate overflow-hidden max-w-[120px]${
                                selectedCategory === company
                                    ? " bg-green-200 text-green-700"
                                    : ""
                            }`}
                            title={company}
                            onClick={() =>
                                router.push(
                                    `/`,
                                )
                            }>
                            {company}
                        </button>
                    ))}
                </div>
                <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
            </div>
            {selectedCategory && <CategoryProducts />}
        </>
    );
};

export default CategoriesMarquee;
