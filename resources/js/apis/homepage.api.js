import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-instance.api";

async function getHomepageCategories() {
    const res = await axiosInstance.get("/homepage/menu/categories");
    return res?.data ?? null;
}

export const useHomepageCategories = (enabled = true) => {
    return useQuery({
        queryKey: ["homepage-categories"],
        queryFn: getHomepageCategories,
        enabled,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};
