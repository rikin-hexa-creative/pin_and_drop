import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./bootstrap";
import QueryWrapper from "./context/QueryWrapper";
import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartWrapper";
import MyRouter from "./router/MyRouter";

createRoot(document.getElementById("app")).render(
    <StrictMode>
        <QueryWrapper>
            <UserProvider>
                <CartProvider>
                    <MyRouter />
                </CartProvider>
            </UserProvider>
        </QueryWrapper>
    </StrictMode>
);
