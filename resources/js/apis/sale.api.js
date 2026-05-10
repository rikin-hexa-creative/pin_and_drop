import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
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

async function getUserSales(params = {}) {
    const res = await axiosInstance.get("/user/sales", {
        params: normalizeParams(params),
    });

    return res?.data ?? { data: [], meta: {} };
}

async function getSellProducts(params = {}) {
    const res = await axiosInstance.get("/sell", {
        params: normalizeParams(params),
    });

    return res?.data ?? { data: [], meta: {} };
}

async function getSellProductById(id) {
    const res = await axiosInstance.get(`/sell/${id}`);
    return res?.data?.data ?? null;
}

async function createUserSale(payload) {
    const res = await axiosInstance.post("/user/sales", payload);
    return res?.data?.data ?? null;
}

async function deleteUserSale(id) {
    const res = await axiosInstance.delete(`/user/sales/${id}`);
    return res?.data ?? null;
}

const useSellProducts = (params = {}) => {
    return useInfiniteQuery({
        queryKey: ["sell-products", params],
        queryFn: ({ pageParam = 1 }) =>
            getSellProducts({
                ...params,
                page: pageParam,
            }),
        getNextPageParam: (lastPage) => lastPage?.meta?.next_page ?? undefined,
        initialPageParam: 1,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

const useSellProductById = (id) => {
    return useQuery({
        queryKey: ["sell-product", id],
        queryFn: () => getSellProductById(id),
        enabled: !!id,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

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

const useDeleteUserSale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUserSale,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-sales"] });
        },
    });
};

export {
    createUserSale,
    deleteUserSale,
    getSellProductById,
    getSellProducts,
    getUserSales,
    useCreateUserSale,
    useDeleteUserSale,
    useSellProductById,
    useSellProducts,
    useUserSales,
};
