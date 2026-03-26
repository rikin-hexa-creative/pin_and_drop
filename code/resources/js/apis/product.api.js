import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-instance.api";

function normalizeParams(params = {}) {
    return Object.entries(params).reduce((accumulator, [key, value]) => {
        if (value === undefined || value === null || value === "") {
            return accumulator;
        }

        if (Array.isArray(value) && value.length === 0) {
            return accumulator;
        }

        accumulator[key] = value;
        return accumulator;
    }, {});
}

async function getProducts(params) {
    const res = await axiosInstance.get("/products", {
        params: normalizeParams(params),
    });

    return res.data;
}

async function getProductFilters() {
    const res = await axiosInstance.get("/products/filters");
    return res?.data?.data ?? {};
}

async function getProductById(id) {
    const res = await axiosInstance.get(`/products/${id}`);
    return res?.data?.data ?? null;
}

const useProducts = (params = {}) => {
    return useInfiniteQuery({
        queryKey: ["products", params],
        queryFn: ({ pageParam = 1 }) =>
            getProducts({
                ...params,
                page: pageParam,
            }),
        getNextPageParam: (lastPage) => lastPage?.meta?.next_page ?? undefined,
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 5 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};

const useProductFilters = () => {
    return useQuery({
        queryKey: ["product-filters"],
        queryFn: getProductFilters,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 5 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};

const useProductById = (id) => {
    return useQuery({
        queryKey: ["product", id],
        queryFn: () => getProductById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5
        gcTime: 5 * 60 * 1000, // 10
        refetchOnWindowFocus: false,
    });
};


export { useProductById, useProductFilters, useProducts };
