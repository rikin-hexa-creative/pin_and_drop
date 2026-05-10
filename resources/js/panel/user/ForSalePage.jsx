import Cookies from "js-cookie";
import { useDeferredValue, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserSales, useDeleteUserSale } from "../../apis/sale.api";
import { formatCurrency } from "../../utils/currency";

const saleBadgeClasses = {
    sold: "bg-[#111111] text-white",
    not_sold: "bg-[#e7f6ec] text-[#14532d]",
};

const listingStatusClasses = {
    active: "bg-[#fff1d6] text-[#8a5300]",
    inactive: "bg-[#ece8e2] text-[#5f564f]",
};

const filterButtonClassName = (active) =>
    `rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] transition ${
        active
            ? "border-black bg-black text-white"
            : "border-black/12 bg-white text-black hover:border-black hover:bg-black hover:text-white"
    }`;

const ForSalePage = () => {
    const location = useLocation();
    const hasToken = Boolean(Cookies.get("user_token"));
    const redirectTo = `${location.pathname}${location.search}`;
    const isSoldRoute = location.pathname === "/sell/sold";
    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const deferredSearch = useDeferredValue(searchInput.trim());
    const deleteMutation = useDeleteUserSale();
    const { data: response, isLoading, isError } = useUserSales(
        {
            search: deferredSearch,
            sale_status: isSoldRoute ? "sold" : "not_sold",
            status: statusFilter,
        },
        hasToken
    );

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            setDeletingId(id);
            deleteMutation.mutate(id, {
                onSettled: () => setDeletingId(null),
            });
        }
    };

    const listings = response?.data ?? [];
    const summary = response?.meta?.summary ?? {};
    const pageTitle = isSoldRoute ? "Past Sells" : "For Sale";
    const pageDescription = isSoldRoute
        ? "Review what you have already sold, search archived listings, and track the product condition and final pricing you posted."
        : "Manage the pieces still in your archive, search across listings, and add new items before they go live in your personal selling feed.";

    if (!hasToken) {
        return (
            <div className="min-h-screen bg-[#f6f1eb] px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-[32px] border border-black/8 bg-white p-10 text-center shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
                    <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                        Seller Dashboard
                    </p>
                    <h1 className="mt-4 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        Sign in to manage your listings.
                    </h1>
                    <p className="mt-4 text-sm leading-6 text-black/60">
                        Your sale inventory, sold archive, and create-listing
                        tools are available once you sign in.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            to="/sign-in"
                            state={{ redirectTo }}
                            className="rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/shop"
                            className="rounded-full border border-black/12 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                        >
                            Back To Shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f6f1eb] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl animate-pulse space-y-6">
                    <div className="h-16 w-72 bg-black/5" />
                    <div className="h-16 rounded-[24px] bg-white" />
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[460px] rounded-[28px] bg-white"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-[#f6f1eb] px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-[32px] border border-[#f1d5d5] bg-[#fff7f7] p-10 text-center">
                    <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-[#b91c1c]">
                        Seller Dashboard
                    </p>
                    <h1 className="mt-4 font-['Inter'] text-3xl font-black uppercase tracking-tight text-black">
                        Unable to load your listings.
                    </h1>
                    <p className="mt-4 text-sm leading-6 text-black/60">
                        Refresh the page and try again. If the problem
                        persists, the listing API likely rejected the request.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fffdf8_0%,#f4ede5_55%,#efe6de_100%)]">
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <section className="overflow-hidden rounded-[32px] border border-black/8 bg-[#111111] text-white shadow-[0_28px_90px_rgba(0,0,0,0.15)]">
                    <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.65fr] lg:px-10">
                        <div>
                            <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-white/55">
                                Seller Dashboard
                            </p>
                            <h1 className="mt-4 max-w-3xl font-['Inter'] text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
                                {pageTitle}
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68">
                                {pageDescription}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                                    Total Listings
                                </p>
                                <p className="mt-3 font-['Inter'] text-4xl font-black tracking-tight text-white">
                                    {summary.all ?? 0}
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                                    For Sale
                                </p>
                                <p className="mt-3 font-['Inter'] text-4xl font-black tracking-tight text-white">
                                    {summary.not_sold ?? 0}
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                                    Sold
                                </p>
                                <p className="mt-3 font-['Inter'] text-4xl font-black tracking-tight text-white">
                                    {summary.sold ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 rounded-[32px] border border-black/8 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/sell/for-sale"
                                className={filterButtonClassName(!isSoldRoute)}
                            >
                                For Sale ({summary.not_sold ?? 0})
                            </Link>
                            <Link
                                to="/sell/sold"
                                className={filterButtonClassName(isSoldRoute)}
                            >
                                Sold ({summary.sold ?? 0})
                            </Link>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <label className="relative min-w-[260px]">
                                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-black/35">
                                    <span className="material-symbols-outlined text-[18px]">
                                        search
                                    </span>
                                </span>
                                <input
                                    type="search"
                                    value={searchInput}
                                    onChange={(event) =>
                                        setSearchInput(event.target.value)
                                    }
                                    placeholder="Search by product, condition, or description"
                                    className="h-12 w-full rounded-full border border-black/10 bg-[#f7f3ee] pl-11 pr-4 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
                                />
                            </label>
                            <Link
                                to="/sell/add"
                                className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-black/90"
                            >
                                Add Listing
                            </Link>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setStatusFilter("")}
                            className={filterButtonClassName(statusFilter === "")}
                        >
                            All Statuses
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter("active")}
                            className={filterButtonClassName(
                                statusFilter === "active"
                            )}
                        >
                            Active ({summary.active ?? 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter("inactive")}
                            className={filterButtonClassName(
                                statusFilter === "inactive"
                            )}
                        >
                            Inactive ({summary.inactive ?? 0})
                        </button>
                    </div>
                </section>

                {!listings.length ? (
                    <section className="mt-8 rounded-[32px] border border-dashed border-black/10 bg-white px-6 py-16 text-center shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
                        <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                            {isSoldRoute ? "Sold Archive" : "For Sale"}
                        </p>
                        <h2 className="mt-4 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                            No listings found.
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/60">
                            {searchInput
                                ? "Your current search and status filters did not match any listing."
                                : "Start by adding a product to your selling archive. Each item can include multiple images, pricing, condition, and visibility state."}
                        </p>
                        <Link
                            to="/sell/add"
                            className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-black/90"
                        >
                            Add Your First Listing
                        </Link>
                    </section>
                ) : (
                    <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {listings.map((listing) => (
                            <article
                                key={listing.id}
                                className="overflow-hidden rounded-[30px] border border-black/8 bg-white shadow-[0_18px_55px_rgba(0,0,0,0.06)]"
                            >
                                <div className="aspect-[4/5] overflow-hidden bg-[linear-gradient(135deg,#f4ece4,#fbf7f2)]">
                                    {listing.image ? (
                                        <img
                                            src={listing.image}
                                            alt={listing.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center px-10 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-black/35">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-5 p-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                                saleBadgeClasses[
                                                    listing.sale_status
                                                ] ?? "bg-black/5 text-black/65"
                                            }`}
                                        >
                                            {listing.sale_status === "sold"
                                                ? "Sold"
                                                : "Not Sold"}
                                        </span>
                                        <span
                                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                                listingStatusClasses[
                                                    listing.status
                                                ] ?? "bg-black/5 text-black/65"
                                            }`}
                                        >
                                            {listing.status}
                                        </span>
                                        <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/60">
                                            {listing.condition}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/42">
                                            Created{" "}
                                            {listing.created_date_formatted ??
                                                listing.posted_at_formatted}
                                        </p>
                                        <h2 className="mt-3 font-['Inter'] text-2xl font-black uppercase leading-none tracking-tight text-black">
                                            {listing.name}
                                        </h2>
                                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/63">
                                            {listing.description}
                                        </p>
                                    </div>

                                    <div className="flex items-end justify-between gap-4 border-t border-black/8 pt-5">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="font-['Inter'] text-2xl font-black tracking-tight text-black">
                                                    {formatCurrency(
                                                        listing.actual_price
                                                    )}
                                                </span>
                                                {listing.compare_at_price ? (
                                                    <span className="text-sm font-semibold text-black/35 line-through">
                                                        {formatCurrency(
                                                            listing.compare_at_price
                                                        )}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
                                                {listing.images_count} image
                                                {listing.images_count === 1
                                                    ? ""
                                                    : "s"}{" "}
                                                uploaded
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end justify-between text-right text-[10px] font-bold uppercase tracking-[0.22em]">
                                            <div className="text-black/40">
                                                <p>Posted</p>
                                                <p className="mt-1 text-black/70">
                                                    {listing.posted_at_formatted}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(listing.id)}
                                                disabled={deletingId === listing.id}
                                                className="mt-3 text-[#b91c1c] transition hover:text-[#7f1d1d] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {deletingId === listing.id ? "Deleting..." : "Delete Listing"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
};

export default ForSalePage;
