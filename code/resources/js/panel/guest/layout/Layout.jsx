import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../../../components/site/Footer";
import Header from "../../../components/site/Header";

const Layout = () => {
    const location = useLocation();
    const isImmersivePage =
        location.pathname.startsWith("/cart") ||
        location.pathname.startsWith("/shop") ||
        location.pathname.startsWith("/my-feed") ||
        location.pathname.startsWith("/checkout") ||
        location.pathname.startsWith("/product/") ||
        location.pathname === "/sell" ||
        location.pathname.startsWith("/sell/product/");

    useEffect(() => {
        if (location.hash) {
            document
                .getElementById(location.hash.replace("#", ""))
                ?.scrollIntoView({ behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [location]);

    return (
        <div
            className={
                isImmersivePage
                    ? "min-h-screen bg-[#fbf9f8] text-[#1b1c1c]"
                    : "min-h-screen bg-[#f6f3ef] text-[#111111]"
            }
        >
            <Header />
            <main className="min-h-screen">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
