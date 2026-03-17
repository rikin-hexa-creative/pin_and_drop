import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './bootstrap';
import MyRouter from "./router/MyRouter";


createRoot(document.getElementById("app")).render(
    <StrictMode>
        <MyRouter />
    </StrictMode>,
);
