"use client";

import React, { useState } from "react";
import Title from "./Title";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const Question = () => {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.auth.user);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!question.trim()) {
            toast.error("Please enter your question or concern");
            return;
        }

        if (!user) {
            toast.error("Please login to submit a question");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/send-question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customerName: user.full_name || user.name || "Customer",
                    customerEmail: user.email,
                    question: question,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(
                    "Your question has been sent! We'll get back to you soon.",
                );
                setQuestion(""); // Clear input
            } else {
                toast.error(result.error || "Failed to send question");
            }
        } catch (error) {
            console.error("Error sending question:", error);
            toast.error("Failed to send question. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center mx-4 my-36">
            <Title
                title="Have a Health Question or Concern?"
                description="Our team is ready to listen — send us your inquiry or feedback anytime."
                visibleButton={false}
            />
            <form
                onSubmit={handleSubmit}
                className="flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200">
                <input
                    className="flex-1 pl-5 outline-none bg-transparent"
                    type="text"
                    placeholder="Type your question or health concern"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="font-medium bg-green-500 text-white px-7 py-3 rounded-full hover:scale-103 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? "Sending..." : "Submit"}
                </button>
            </form>
        </div>
    );
};

export default Question;
