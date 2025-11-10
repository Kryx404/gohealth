"use client";

import { useRouter } from "next/navigation";
import { Rocket, ArrowLeft } from "lucide-react";

export default function ComingSoon({
    title = "Coming Soon",
    subtitle = "New Feature",
    description = "We're working hard to bring you this feature. Stay tuned for updates!",
    progress = 0,
    showProgress = false,
}) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center">
                {/* Icon */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-full p-8 shadow-2xl animate-bounce">
                        <Rocket size={80} className="text-purple-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl font-bold text-slate-800 mb-4">
                    {title}
                </h1>

                {/* Subtitle */}
                <p className="text-xl text-slate-600 mb-8">{subtitle}</p>

                {/* Description */}
                <p className="text-slate-500 mb-12 max-w-lg mx-auto">
                    {description}
                </p>

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition shadow-lg">
                    <ArrowLeft size={20} />
                    Go Back
                </button>

                {/* Progress Indicator (Optional) */}
                {showProgress && (
                    <div className="mt-12">
                        <p className="text-sm text-slate-400 mb-2">
                            Development Progress
                        </p>
                        <div className="w-full max-w-md mx-auto bg-slate-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full animate-pulse transition-all duration-500"
                                style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                            {progress}% Complete
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
