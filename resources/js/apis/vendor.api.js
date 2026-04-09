import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-instance.api";

function normalizeParams(params = {}) {
    return Object.entries(params).reduce((accumulator, [key, value]) => {
        if (value === undefined || value === null || value === "") {
            return accumulator;
        }

        accumulator[key] = value;
        return accumulator;
    }, {});
}

async function getVendors(params = {}) {
    const res = await axiosInstance.get("/vendors", {
        params: normalizeParams(params),
    });

    return res?.data?.data ?? [];
}

async function getVendorProfile(identifier) {
    const res = await axiosInstance.get(`/vendors/${identifier}`);
    return res?.data?.data ?? null;
}

const useVendors = (params = {}) => {
    return useQuery({
        queryKey: ["vendors", params],
        queryFn: () => getVendors(params),
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

const useVendorProfile = (identifier) => {
    return useQuery({
        queryKey: ["vendor-profile", identifier],
        queryFn: () => getVendorProfile(identifier),
        enabled: !!identifier,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
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

export { getVendorProfile, getVendors, useVendorMenu, useVendorProfile, useVendors };
