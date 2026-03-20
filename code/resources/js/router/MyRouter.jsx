import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../Layouts/Layout";
import HomePage from "../pages/HomePage";
import ShopPage from "../pages/ShopPage";

function Home() {
    return <h1>Home Page</h1>;
}

function About() {
    return <h1>About Page</h1>;
}

function Dashboard() {
    return <h1>Dashboard</h1>;
}

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
                    path: "/shop",
                    element: <ShopPage />,
                },
            ],
        },
    ]);
    return <RouterProvider router={router} />;
};

export default MyRouter;
