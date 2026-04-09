import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Create a single instance of QueryClient to persist between renders
const queryClient = new QueryClient();

export default function QueryWrapper({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
