import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignInPage from "../panel/auth/SignInPage";
import SignUpPage from "../panel/auth/SignUpPage";
import Layout from "../panel/guest/layout/Layout";
import CartPage from "../panel/guest/pages/CartPage";
import CheckoutPage from "../panel/guest/pages/CheckoutPage";
import HomePage from "../panel/guest/pages/HomePage";
import PinPage from "../panel/guest/pages/PinPage";
import PinDetailPage from "../panel/guest/pages/PinDetailPage";
import ProductPage from "../panel/guest/pages/ProductPage";
import ShopPage from "../panel/guest/pages/ShopPage";
import UserProfilePage from "../panel/user/UserProfilePage";

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
            ],
        },
    ]);
    return <RouterProvider router={router} />;
};

export default MyRouter;
