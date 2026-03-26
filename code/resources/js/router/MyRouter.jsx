import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignInPage from "../panel/auth/SignInPage";
import SignUpPage from "../panel/auth/SignUpPage";
import Layout from "../panel/guest/layout/Layout";
import HomePage from "../panel/guest/pages/HomePage";
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
