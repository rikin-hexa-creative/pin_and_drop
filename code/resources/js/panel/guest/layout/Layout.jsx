import { Outlet, useLocation } from "react-router-dom";
import Footer from "../../../components/site/Footer";
import Header from "../../../components/site/Header";

const Layout = () => {
    const location = useLocation();
    const isImmersivePage =
        location.pathname.startsWith("/shop") ||
        location.pathname.startsWith("/my-feed") ||
        location.pathname.startsWith("/product/");

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
