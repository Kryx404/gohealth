import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isLoggedIn: false,
};

// Try to load from localStorage on client-side
if (typeof window !== "undefined") {
    const savedUser = localStorage.getItem("gohealth_user");
    if (savedUser) {
        try {
            const parsedUser = JSON.parse(savedUser);
            initialState.user = parsedUser;
            initialState.isLoggedIn = true;
        } catch (e) {
            localStorage.removeItem("gohealth_user");
        }
    }
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload;
            state.isLoggedIn = true;
            // Save to localStorage
            if (typeof window !== "undefined") {
                localStorage.setItem(
                    "gohealth_user",
                    JSON.stringify(action.payload),
                );
            }
        },
        logout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
            // Remove from localStorage
            if (typeof window !== "undefined") {
                localStorage.removeItem("gohealth_user");
            }
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
