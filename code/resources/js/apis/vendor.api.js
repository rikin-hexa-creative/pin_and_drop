import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-instance.api";

async function getVendors(params) {
    try {
        const res = await axiosInstance.get("/vendors", { params });
        return res.data;
    } catch (error) {
        throw error;
    }
}

const useVendors = (params) => {
    return useQuery({
        queryKey: ["vendors", params],
        queryFn: () => getVendors(params),
        enabled: !!params,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 5 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};

const useVendorMenu = () => {
    return useQuery({
        queryKey: ["vendorMenu"],
        queryFn: async () => {
            const res = await axiosInstance.get("/menus/vendors");
            return res.data;
        },
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export { useVendors, useVendorMenu };
