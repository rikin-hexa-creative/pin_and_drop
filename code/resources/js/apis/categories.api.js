import axiosInstance from "./axios-instance.api";
import { useQuery } from "@tanstack/react-query";

async function getCategories() {
    const res = await axiosInstance.get("/categories");
    return res?.data?.data ?? [];
}

const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 5 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};

export { useCategories };
