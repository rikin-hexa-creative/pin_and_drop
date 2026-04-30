import axios from "axios";
import { useState } from "react";

const BecomeVendorPage = () => {
    const [formData, setFormData] = useState({
        business_name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [status, setStatus] = useState("idle"); // idle, submitting, success, error
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMessage("");

        try {
            const response = await axios.post("/api/vendor-contacts", formData);
            if (response.status === 201) {
                setStatus("success");
                setFormData({
                    business_name: "",
                    email: "",
                    phone: "",
                    message: "",
                });
            }
        } catch (error) {
            setStatus("error");
            setErrorMessage(
                error.response?.data?.message ||
                    "Something went wrong. Please try again.",
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="bg-black py-8 px-8 sm:px-12 text-center text-white">
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Become a Vendor
                        </h1>
                        <p className="mt-4 text-lg text-indigo-100">
                            Join our platform to reach thousands of customers.
                            Fill out the form below to apply.
                        </p>
                    </div>

                    <div className="px-8 py-10 sm:px-12">
                        {status === "success" ? (
                            <div className="text-center py-10">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                    <svg
                                        className="h-10 w-10 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Application Submitted!
                                </h3>
                                <p className="text-gray-600">
                                    Thank you for your interest. Our team will
                                    review your application and contact you
                                    soon.
                                </p>
                                <button
                                    onClick={() => setStatus("idle")}
                                    className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                >
                                    Submit Another Application
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {status === "error" && (
                                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-5 w-5 text-red-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">
                                                    {errorMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="business_name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Business Name{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="business_name"
                                            id="business_name"
                                            required
                                            value={formData.business_name}
                                            onChange={handleChange}
                                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                            placeholder="Your Business Name"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Email Address{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Phone Number
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="phone"
                                                id="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="message"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Additional Message / Details
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows="4"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                            placeholder="Tell us a bit about what you sell..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={status === "submitting"}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                                    >
                                        {status === "submitting" ? (
                                            <span className="flex items-center">
                                                <svg
                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Submitting...
                                            </span>
                                        ) : (
                                            "Submit Application"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BecomeVendorPage;
