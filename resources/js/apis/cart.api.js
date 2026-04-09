import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-instance.api";

async function getCart() {
    const res = await axiosInstance.get("/cart");
    return res?.data?.data ?? null;
}

async function addCartItem(payload) {
    const res = await axiosInstance.post("/cart/items", payload);
    return res?.data?.data ?? null;
}

async function updateCartItem({ itemId, quantity }) {
    const res = await axiosInstance.patch(`/cart/items/${itemId}`, {
        quantity,
    });
    return res?.data?.data ?? null;
}

async function removeCartItem(itemId) {
    const res = await axiosInstance.delete(`/cart/items/${itemId}`);
    return res?.data?.data ?? null;
}

const useCartQuery = (enabled = true) => {
    return useQuery({
        queryKey: ["cart"],
        queryFn: getCart,
        enabled,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

const useAddCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addCartItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};

const useUpdateCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCartItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};

const useRemoveCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeCartItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};

export {
    addCartItem,
    getCart,
    removeCartItem,
    updateCartItem,
    useAddCartItem,
    useCartQuery,
    useRemoveCartItem,
    useUpdateCartItem,
};
