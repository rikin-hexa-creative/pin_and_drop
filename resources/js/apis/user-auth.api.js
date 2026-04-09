import axiosInstance from "./axios-instance.api";

export const signUp = async (data) => {
    try {
        const response = await axiosInstance.post("/auth/sign-up", data);
        return response.data;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    }
};

export const signIn = async (data) => {
    try {
        const response = await axiosInstance.post("/auth/sign-in", data);
        return response.data;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};
