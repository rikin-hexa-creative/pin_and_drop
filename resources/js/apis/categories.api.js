import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-instance.api";

async function getCategories() {
    const res = await axiosInstance.get("/categories");
    return res?.data?.data ?? [];
}

const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};

const useCategoryMenu = () => {
    return useQuery({
        queryKey: ["categoryMenu"],
        queryFn: async () => {
            const res = await axiosInstance.get("/menus/categories");
            return res.data;
        },
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export { useCategories, useCategoryMenu };
