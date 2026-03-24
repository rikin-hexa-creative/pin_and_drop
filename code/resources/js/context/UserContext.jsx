import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useGetUserProfile } from "../apis/user.api";

// UserContext.js
export const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const hasToken = Boolean(Cookies.get("user_token"));
    const { data, isLoading, error, refetch } = useGetUserProfile(hasToken);

    useEffect(() => {
        if (!hasToken) {
            setUser(null);
            return;
        }

        if (data) {
            setUser(data);
        }
    }, [data, hasToken]);

    useEffect(() => {
        if (error?.response?.status === 401) {
            Cookies.remove("user_token");
            setUser(null);
        }
    }, [error]);

    const value = useMemo(
        () => ({
            user,
            setUser,
            isUserLoading: isLoading,
            refetchUser: refetch,
        }),
        [user, isLoading, refetch]
    );
    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
}

// In App.jsx or main.jsx — wrap once at the top

// In any component that needs it
export const useUser = () => {
    return useContext(UserContext);
};
