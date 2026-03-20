
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/site/Header";
import Footer from "../components/site/Footer";

const Layout = () => {
    const location = useLocation();
    const isShopPage = location.pathname.startsWith("/shop");

    return (
        <div className={isShopPage ? "min-h-screen bg-[#fbf9f8] text-[#1b1c1c]" : "min-h-screen bg-[#f6f3ef] text-[#111111]"}>
            {!isShopPage && <Header />}
            <main className={isShopPage ? "min-h-screen" : "min-h-[70vh]"}>
                <Outlet />
            </main>
            {!isShopPage && <Footer />}
        </div>
    );
};

export default Layout;
