"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/lib/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ActivityTracker = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const timeoutRef = useRef(null);

    const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 menit 

    const handleLogout = () => {
        console.log("Auto logout triggered - User inactive for 10 minutes");
        dispatch(logout());
        toast.warning("You have been logged out due to inactivity");
        router.push("/login");
    };

    const resetTimer = () => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            handleLogout();
        }, INACTIVITY_TIMEOUT);

        console.log("Activity detected - Timer reset");
    };

    useEffect(() => {
        // Only track activity if user is logged in
        if (!isLoggedIn) {
            return;
        }

        // Events to track user activity
        const events = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
            "click",
        ];

        // Start the timer
        resetTimer();

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [isLoggedIn]);

    return null; // This component doesn't render anything
};

export default ActivityTracker;
