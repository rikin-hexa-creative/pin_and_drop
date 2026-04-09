import axiosInstance from "./axios-instance.api";
import { useQuery } from "@tanstack/react-query";

export async function getUserProfile() {
    try {
        const res = await axiosInstance.get("/users/profile");
        const data = res?.data?.data ?? res?.data ?? null;
        return data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
}

export const useGetUserProfile = (enabled = true) => {
    return useQuery({
        queryKey: ["getUserProfile"],
        queryFn: getUserProfile,
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 5 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};
