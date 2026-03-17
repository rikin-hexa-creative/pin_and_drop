import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
            element: <Home />,
        },
    ]);
    return <RouterProvider router={router} />;
};

export default MyRouter;
