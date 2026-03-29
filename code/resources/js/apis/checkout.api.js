import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-instance.api";

async function getCheckoutContext() {
    const res = await axiosInstance.get("/checkout");
    return res?.data?.data ?? null;
}

async function checkout(payload) {
    const res = await axiosInstance.post("/checkout", payload);
    return res?.data?.data ?? null;
}

const useCheckoutContext = (enabled = true) => {
    return useQuery({
        queryKey: ["checkout-context"],
        queryFn: getCheckoutContext,
        enabled,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

const useCheckout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: checkout,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["checkout-context"] });
            queryClient.invalidateQueries({ queryKey: ["cart"] });

            if (variables?.product_id) {
                queryClient.invalidateQueries({
                    queryKey: ["product", String(variables.product_id)],
                });
                queryClient.invalidateQueries({
                    queryKey: ["product", variables.product_id],
                });
            }
        },
    });
};

export { checkout, getCheckoutContext, useCheckout, useCheckoutContext };

export default checkout;
