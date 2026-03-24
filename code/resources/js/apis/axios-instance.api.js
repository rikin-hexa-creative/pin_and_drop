import axios from "axios";
import Cookies from "js-cookie";

// Use environment variable if available (better for production)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;
const API_URL = BASE_URL + "/api";
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000, // Prevent hanging requests
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get("user_token");

        // Let browser set multipart boundaries automatically for FormData.
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle unauthorized globally, but skip for login requests
        // so the Login page can show "Invalid credentials" without reloading.
        const requestUrl = error.config?.url || "";
        if (error.response?.status === 401 && !requestUrl.includes("/sign-in")) {
            Cookies.remove("user_token");
            window.location.href = "/sign-in"; // Redirect to sign in
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
