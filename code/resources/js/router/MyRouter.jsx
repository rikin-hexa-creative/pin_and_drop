import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import SignInPage from "../panel/auth/SignInPage";
import SignUpPage from "../panel/auth/SignUpPage";
import Layout from "../panel/guest/layout/Layout";
import CartPage from "../panel/guest/pages/CartPage";
import CheckoutPage from "../panel/guest/pages/CheckoutPage";
import HomePage from "../panel/guest/pages/HomePage";
import OrderedPage from "../panel/guest/pages/OrderedPage";
import PinDetailPage from "../panel/guest/pages/PinDetailPage";
import PinPage from "../panel/guest/pages/PinPage";
import ProductPage from "../panel/guest/pages/ProductPage";
import ShopPage from "../panel/guest/pages/ShopPage";
import AddForSalePage from "../panel/user/AddForSalePage";
import ForSalePage from "../panel/user/ForSalePage";
import UserProfilePage from "../panel/user/UserProfilePage";
import VendorProfilePage from "../panel/vendor/VendorProfilePage";

const MyRouter = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    path: "/",
                    element: <HomePage />,
                },
                {
                    path: "/my-feed",
                    element: <ShopPage />,
                },
                {
                    path: "/shop",
                    element: <ShopPage />,
                },
                {
                    path: "/product/:id",
                    element: <ProductPage />,
                },
                {
                    path: "/cart",
                    element: <CartPage />,
                },
                {
                    path: "/pin",
                    element: <PinPage />,
                },
                {
                    path: "/pin/:id",
                    element: <PinDetailPage />,
                },
                {
                    path: "/ordered",
                    element: <OrderedPage />,
                },
                {
                    path: "/checkout",
                    element: <CheckoutPage />,
                },
                {
                    path: "/sign-in",
                    element: <SignInPage />,
                },
                {
                    path: "/sign-up",
                    element: <SignUpPage />,
                },
                {
                    path: "/user-profile",
                    element: <UserProfilePage />,
                },
                {
                    path: "/vendor/:id",
                    element: <VendorProfilePage />,
                },
                {
                    path: "/vendors/:id",
                    element: <VendorProfilePage />,
                },
                {
                    path: "/sell/for-sale",
                    element: <ForSalePage />,
                },
                {
                    path: "/sell/sold",
                    element: <ForSalePage />,
                },
                {
                    path: "/sell",
                    element: <Navigate to="/sell/for-sale" replace />,
                },
                {
                    path: "/sell/add",
                    element: <AddForSalePage />,
                },
            ],
        },
    ]);
    return <RouterProvider router={router} />;
};

export default MyRouter;
