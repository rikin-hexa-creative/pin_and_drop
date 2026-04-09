import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-instance.api";
import Cookies from "js-cookie";

const getAuthHeaders = () => {
    const token = Cookies.get("user_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Keys
const keys = {
    collections: ["user_collections"],
    collection: (id) => ["user_collections", id],
};

// API calls
const fetchUserCollections = async () => {
    const { data } = await axiosInstance.get("/user/collections", {
        headers: getAuthHeaders(),
    });
    return data;
};

const fetchCollection = async (id) => {
    const { data } = await axiosInstance.get(`/user/collections/${id}`, {
        headers: getAuthHeaders(),
    });
    return data;
};

const createCollection = async (payload) => {
    const { data } = await axiosInstance.post("/user/collections", payload, {
        headers: getAuthHeaders(),
    });
    return data;
};

const deleteCollection = async (id) => {
    const { data } = await axiosInstance.delete(`/user/collections/${id}`, {
        headers: getAuthHeaders(),
    });
    return data;
};

const pinProduct = async ({ collectionId, productId }) => {
    const { data } = await axiosInstance.post(
        `/user/collections/${collectionId}/pin`,
        { product_id: productId },
        { headers: getAuthHeaders() }
    );
    return data;
};

const unpinProduct = async ({ collectionId, productId }) => {
    const { data } = await axiosInstance.post(
        `/user/collections/${collectionId}/unpin`,
        { product_id: productId },
        { headers: getAuthHeaders() }
    );
    return data;
};

// Hooks
export const useGetUserCollections = (options = {}) => {
    return useQuery({
        queryKey: keys.collections,
        queryFn: fetchUserCollections,
        ...options,
    });
};

export const useGetCollection = (id, options = {}) => {
    return useQuery({
        queryKey: keys.collection(id),
        queryFn: () => fetchCollection(id),
        ...options,
    });
};

export const useCreateCollection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCollection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.collections });
        },
    });
};

export const useDeleteCollection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCollection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.collections });
        },
    });
};

export const usePinProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: pinProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.collections });
        },
    });
};

export const useUnpinProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: unpinProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.collections });
        },
    });
};
