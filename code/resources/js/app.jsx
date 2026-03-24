import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./bootstrap";
import QueryWrapper from "./context/QueryWrapper";
import { UserProvider } from "./context/UserContext";
import MyRouter from "./router/MyRouter";

createRoot(document.getElementById("app")).render(
    <StrictMode>
        <QueryWrapper>
            <UserProvider>
                <MyRouter />
            </UserProvider>
        </QueryWrapper>
    </StrictMode>
);
