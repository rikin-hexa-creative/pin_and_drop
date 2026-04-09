import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-instance.api";

async function getUserOrders() {
    const res = await axiosInstance.get("/users/orders");
    return res?.data?.data ?? [];
}

const useUserOrders = (enabled = true) => {
    return useQuery({
        queryKey: ["user-orders"],
        queryFn: getUserOrders,
        enabled,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export { getUserOrders, useUserOrders };
