import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

async function getUserSales(params = {}) {
    const res = await axiosInstance.get("/user/sales", {
        params: normalizeParams(params),
    });

    return res?.data ?? { data: [], meta: {} };
}

async function createUserSale(payload) {
    const res = await axiosInstance.post("/user/sales", payload);
    return res?.data?.data ?? null;
}

const useUserSales = (params = {}, enabled = true) => {
    return useQuery({
        queryKey: ["user-sales", params],
        queryFn: () => getUserSales(params),
        enabled,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

const useCreateUserSale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUserSale,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-sales"] });
        },
    });
};

export { createUserSale, getUserSales, useCreateUserSale, useUserSales };
