import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../apis/axios-instance.api";

const HomePage = () => {
    const [subscriberEmail, setSubscriberEmail] = useState("");
    const [subscriberStatus, setSubscriberStatus] = useState("idle"); // idle, submitting, success, error
    const [subscriberMessage, setSubscriberMessage] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchInput.trim())}`);
            setIsSearchOpen(false);
        }
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setSubscriberStatus("submitting");
        setSubscriberMessage("");

        try {
            const response = await axiosInstance.post("/subscribers", {
                email: subscriberEmail,
            });
            if (response.status === 201) {
                setSubscriberStatus("success");
                setSubscriberEmail("");
                setSubscriberMessage("Thank you for subscribing!");
            }
        } catch (error) {
            setSubscriberStatus("error");
            setSubscriberMessage(
                error.response?.data?.message || "Something went wrong.",
            );
        }
    };

    return (
        <div className="bg-[#fcfcfc] pb-0">
            <section className="relative flex min-h-[600px] items-center justify-center sm:min-h-[85vh]">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=2000"
                        alt="Hero Background"
                        className="h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-[56px] md:leading-[1.1]">
                        Discover. Offer. Wear.
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-base text-white/90 sm:text-lg">
                        Curated fashion marketplace where style meets
                        sustainability. Find luxury pieces, vintage treasures,
                        and contemporary designs.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            to="/shop"
                            className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-[8px] bg-black px-6 text-[13px] font-semibold text-white transition hover:bg-black/80 sm:h-[50px] sm:min-w-[180px] sm:text-[14px]"
                        >
                            Explore Collection
                        </Link>
                        <Link
                            to="/sell/for-sale"
                            className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-[8px] border border-white bg-transparent px-6 text-[13px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:h-[50px] sm:min-w-[180px] sm:text-[14px]"
                        >
                            Start Selling
                        </Link>
                    </div>
                </div>

                {/* Scroll Down Arrow */}
                <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
                    <button
                        type="button"
                        aria-label="Scroll down"
                        className="text-white/70 transition hover:text-white"
                        onClick={() =>
                            window.scrollTo({
                                top: window.innerHeight * 0.85,
                                behavior: "smooth",
                            })
                        }
                    >
                        <svg
                            className="h-6 w-6 animate-bounce"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                </div>
            </section>

            <section className="px-4 py-16 sm:py-24">
                <div className="mx-auto max-w-5xl">
                    {/* Search Bar */}
                    <div className="mx-auto mb-20 max-w-3xl">
                        <form
                            className="relative"
                            onSubmit={handleSearchSubmit}
                        >
                            <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-black/40">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </span>
                            <input
                                type="search"
                                placeholder="Search for fashion, brands, or styles..."
                                className="h-14 w-full rounded-[12px] border border-black/10 bg-white pl-14 pr-4 text-[15px] text-black placeholder:text-black/50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition shadow-sm"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </form>
                    </div>

                    {/* Section Header */}
                    <div className="mb-12 text-center">
                        <h2 className="mb-3 text-3xl font-bold tracking-tight text-black sm:text-4xl">
                            Shop by Category
                        </h2>
                        <p className="text-[15px] text-black/60">
                            Discover new arrivals or explore curated vintage
                            collections
                        </p>
                    </div>

                    {/* Category Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Link
                            to="/shop?category=tops-men"
                            className="group relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-[#f5f5f5]"
                        >
                            <img
                                src="/images/category/mens.webp"
                                alt="Shop Category"
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

                            {/* Text Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
                                <h3 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
                                    Men's Fashion Tops
                                </h3>
                                <p className="mb-8 max-w-sm text-[15px] leading-relaxed text-white/90">
                                    Shop Men’s Fashion Tops
                                </p>
                                <div className="inline-flex h-12 items-center justify-center rounded-full bg-[#1a1a1a]/30 px-6 backdrop-blur-md border border-white/5 text-[14px] font-medium text-white transition hover:bg-[#1a1a1a]">
                                    Explore Collection
                                    <svg
                                        className="ml-2 h-4 w-4 text-[#cba265]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/shop?category=tops-women"
                            className="group relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-[#f5f5f5]"
                        >
                            <img
                                src="/images/category/women.webp"
                                alt="Shop Category"
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

                            {/* Text Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
                                <h3 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
                                    Women’s Fashion Tops
                                </h3>
                                <p className="mb-8 max-w-sm text-[15px] leading-relaxed text-white/90">
                                    Contemporary pieces from emerging and
                                    established designers
                                </p>
                                <div className="inline-flex h-12 items-center justify-center rounded-full bg-[#1a1a1a]/30 px-6 backdrop-blur-md border border-white/5 text-[14px] font-medium text-white transition hover:bg-[#1a1a1a]">
                                    Explore Collection
                                    <svg
                                        className="ml-2 h-4 w-4 text-[#cba265]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="px-4 py-20 bg-white">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center">
                        <h2 className="text-4xl font-semibold text-black sm:text-5xl mb-4">
                            How It Works
                        </h2>
                        <p className="text-base text-black/60 mb-16">
                            Start your seller journey in four simple steps
                        </p>
                    </div>

                    {/* Steps Timeline */}
                    <div className="mb-16">
                        <div className="relative">
                            {/* Connecting lines */}
                            <div
                                className="hidden sm:block absolute top-12 left-0 right-0 h-0.5 bg-amber-200"
                                style={{
                                    left: "calc(12.5% + 32px)",
                                    right: "calc(12.5% - 32px)",
                                }}
                            />

                            {/* Steps */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    {
                                        number: "01",
                                        title: "Sign Up",
                                        description:
                                            "Create your seller account in minutes",
                                    },
                                    {
                                        number: "02",
                                        title: "Set Up Shop",
                                        description:
                                            "Customize your storefront and add products",
                                    },
                                    {
                                        number: "03",
                                        title: "Start Selling",
                                        description:
                                            "List items and connect with buyers instantly",
                                    },
                                    {
                                        number: "04",
                                        title: "Get Paid",
                                        description:
                                            "Receive payments directly to your account",
                                    },
                                ].map((step, index) => (
                                    <div key={index} className="text-center">
                                        {/* Step number circle */}
                                        <div className="mb-6 flex justify-center z-10 relative">
                                            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-300 bg-white">
                                                <span className="text-2xl font-semibold text-amber-600">
                                                    {step.number}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-black">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-black/60">
                                            {step.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="flex flex-col items-center gap-6 mt-8">
                        <Link
                            to="/sign-up"
                            className="rounded-full bg-black px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5"
                        >
                            Sign Up
                        </Link>
                        <p className="text-xs text-black/60">
                            No setup fees • Get started in minutes • Cancel
                            anytime
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-4 py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-600 mb-4">
                            For Sellers
                        </p>
                        <h2 className="text-4xl font-semibold text-black sm:text-5xl mb-6">
                            Become a Vendor
                        </h2>
                        <p className="max-w-2xl mx-auto text-base text-black/70 mb-16">
                            Turn your passion for fashion into profit. Join our
                            curated marketplace and start selling to
                            style-conscious buyers who appreciate quality and
                            authenticity.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "🏪",
                                title: "Your Own Storefront",
                                description:
                                    "Create a beautiful branded shop page to showcase your collection",
                            },
                            {
                                icon: "💵",
                                title: "Low Commission",
                                description:
                                    "Keep more of what you earn with our competitive seller fees",
                            },
                            {
                                icon: "👥",
                                title: "Ready Audience",
                                description:
                                    "Reach thousands of fashion-forward buyers actively searching",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="text-center bg-white rounded-3xl p-8 border border-black/5 shadow-sm"
                            >
                                <div className="mb-4 flex justify-center">
                                    <div className="text-4xl">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-black mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-black/70">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 flex justify-center">
                        <Link
                            to="/become-vendor"
                            className="rounded-full bg-black px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5"
                        >
                            Start Selling Today
                        </Link>
                    </div>
                </div>
            </section>

            {/* <section className="px-4 py-20 bg-white">
                <div className="mx-auto max-w-6xl">
                    <div className="relative overflow-hidden rounded-[24px] bg-[#0a0a0a] p-8 sm:p-12 lg:p-16">
                        <div className="pointer-events-none absolute -right-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#cba265]/10 blur-[100px]" />

                        <div className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                                        Join 5,000+ Successful Sellers
                                    </h2>
                                    <p className="max-w-xl text-base text-white/70 leading-relaxed">
                                        Our sellers have earned over $10M
                                        selling curated fashion on Pin & Wear.
                                        Whether you're clearing your closet or
                                        running a boutique, we've got you
                                        covered.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        {
                                            title: "Verified Buyers Only",
                                            description:
                                                "Sell with confidence to authenticated, serious buyers",
                                        },
                                        {
                                            title: "Dedicated Support",
                                            description:
                                                "Expert seller support team ready to help you succeed",
                                        },
                                        {
                                            title: "Marketing Included",
                                            description:
                                                "Your items featured in our newsletters and social media",
                                        },
                                    ].map((feature, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#cba265]">
                                                <svg
                                                    className="h-3 w-3 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-white">
                                                    {feature.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-white/60">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 pt-2">
                                    <Link
                                        to="/become-vendor"
                                        className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                                    >
                                        Start Selling
                                    </Link>
                                    <Link
                                        to="/seller-guide"
                                        className="rounded-lg border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                    >
                                        View Seller Guide
                                    </Link>
                                </div>
                            </div>

                            <div className="rounded-[20px] border border-white/5 bg-[#1a1a1a] p-8 shadow-2xl">
                                <h3 className="mb-8 text-sm font-semibold text-white">
                                    Quick Stats
                                </h3>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-10">
                                    <div>
                                        <p className="text-3xl font-bold text-[#e5e5e5]">
                                            5K+
                                        </p>
                                        <p className="mt-2 text-xs font-medium text-white/50">
                                            Active Sellers
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-[#e2b464]">
                                            $10M+
                                        </p>
                                        <p className="mt-2 text-xs font-medium text-white/50">
                                            Total Earnings
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-[#e5e5e5]">
                                            50K+
                                        </p>
                                        <p className="mt-2 text-xs font-medium text-white/50">
                                            Active Buyers
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-[#e2b464]">
                                            4.9
                                            <span className="ml-1 text-xl">
                                                ★
                                            </span>
                                        </p>
                                        <p className="mt-2 text-xs font-medium text-white/50">
                                            Seller Rating
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}

            <section className="px-4 py-24">
                <div className="mx-auto max-w-5xl text-center">
                    <h2 className="text-3xl font-semibold text-black sm:text-4xl mb-4">
                        Why Pin & Wear?
                    </h2>
                    <p className="text-[15px] text-black/60 mb-20">
                        A trusted platform built for fashion enthusiasts
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        {[
                            {
                                title: "Verified Sellers",
                                description:
                                    "All sellers are authenticated and curated for quality",
                                icon: (
                                    <svg
                                        className="h-[22px] w-[22px] text-[#cba265]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                ),
                            },
                            {
                                title: "Secure Payments",
                                description:
                                    "Bank-level encryption and buyer protection",
                                icon: (
                                    <svg
                                        className="h-[22px] w-[22px] text-[#cba265]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                        />
                                    </svg>
                                ),
                            },
                            {
                                title: "Trusted Community",
                                description:
                                    "Join thousands of fashion enthusiasts",
                                icon: (
                                    <svg
                                        className="h-[22px] w-[22px] text-[#cba265]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                ),
                            },
                            {
                                title: "Fast Shipping",
                                description:
                                    "Track your order from seller to doorstep",
                                icon: (
                                    <svg
                                        className="h-[22px] w-[22px] text-[#cba265]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                    </svg>
                                ),
                            },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center"
                            >
                                <div className="mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#fcf8f2] shadow-sm">
                                    {feature.icon}
                                </div>
                                <h3 className="mb-2.5 text-sm font-semibold text-black">
                                    {feature.title}
                                </h3>
                                <p className="max-w-[200px] text-[13px] leading-relaxed text-black/50">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-20 bg-white">
                <div className="mx-auto max-w-5xl">
                    <div className="relative overflow-hidden rounded-[24px] bg-[#0f0f0f] px-6 py-16 sm:px-12 sm:py-20 lg:px-16 text-center">
                        {/* Subtle background glow */}
                        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 -translate-y-1/3 translate-x-1/3 rounded-full bg-[#cba265]/10 blur-[100px]" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#cba265]/10 border border-[#cba265]/20">
                                <svg
                                    className="h-6 w-6 text-[#cba265]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                    />
                                </svg>
                            </div>

                            <h2 className="mb-4 text-3xl font-semibold text-white sm:text-4xl">
                                Stay in Style
                            </h2>
                            <p className="mb-10 max-w-2xl text-[15px] leading-relaxed text-white/70">
                                Get early access to new arrivals, exclusive
                                collections, and style inspiration delivered to
                                your inbox.
                            </p>

                            {subscriberStatus === "success" ? (
                                <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/20 px-6 py-4 text-green-400">
                                    <p className="flex items-center justify-center text-sm font-medium">
                                        <svg
                                            className="mr-2 h-5 w-5"
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
                                        {subscriberMessage}
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full max-w-lg">
                                    <form
                                        className="mb-3 flex w-full flex-col gap-3 sm:flex-row"
                                        onSubmit={handleSubscribe}
                                    >
                                        <input
                                            type="email"
                                            value={subscriberEmail}
                                            onChange={(e) =>
                                                setSubscriberEmail(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter your email"
                                            className="h-[50px] flex-1 rounded-xl border border-white/10 bg-white/5 px-5 text-sm text-white placeholder-white/40 outline-none focus:border-[#cba265] focus:ring-1 focus:ring-[#cba265] transition"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={
                                                subscriberStatus ===
                                                "submitting"
                                            }
                                            className="flex h-[50px] items-center justify-center rounded-xl bg-[#cba265] px-8 text-sm font-semibold text-white transition hover:bg-[#b89154] disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {subscriberStatus === "submitting"
                                                ? "Subscribing..."
                                                : "Subscribe"}
                                            {subscriberStatus !==
                                                "submitting" && (
                                                <svg
                                                    className="ml-2 h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </form>
                                    {subscriberStatus === "error" && (
                                        <p className="mb-3 text-sm text-red-400 text-left pl-2">
                                            {subscriberMessage}
                                        </p>
                                    )}
                                </div>
                            )}

                            <p className="text-[12px] text-white/40">
                                Join 50,000+ fashion enthusiasts. Unsubscribe
                                anytime.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
