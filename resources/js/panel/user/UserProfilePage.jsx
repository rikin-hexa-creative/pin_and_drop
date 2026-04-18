import Cookies from "js-cookie";
import {
    ChevronDown,
    Lock,
    Mail,
    Search,
    Settings,
    Share2,
    Star,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const resolveAvatarUrl = (avatarPath) => {
    if (!avatarPath) {
        return null;
    }

    if (
        avatarPath.startsWith("http://") ||
        avatarPath.startsWith("https://")
    ) {
        return avatarPath;
    }

    if (avatarPath.startsWith("/storage/")) {
        return avatarPath;
    }

    return `/storage/${avatarPath.replace(/^\/+/, "")}`;
};

const getUserInitials = (value) => {
    const normalizedValue = (value ?? "").trim();

    if (!normalizedValue) {
        return "U";
    }

    return normalizedValue
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
};

const getJoinYear = (createdAt) => {
    if (!createdAt) {
        return null;
    }

    const createdAtDate = new Date(createdAt);

    if (Number.isNaN(createdAtDate.getTime())) {
        return null;
    }

    return createdAtDate.getUTCFullYear();
};

const UserProfilePage = () => {
    const location = useLocation();
    const { user, isUserLoading } = useUser();
    const hasToken = Boolean(Cookies.get("user_token"));
    const redirectTo = `${location.pathname}${location.search}`;

    const displayName =
        user?.full_name || user?.email?.split("@")[0] || "Member";
    const avatarUrl = resolveAvatarUrl(user?.avatar);
    const memberSince = getJoinYear(user?.created_at);
    const transactionsCount = Number(
        user?.transactions_count ?? user?.orders_count ?? 0
    );
    const reviewsCount = Number(user?.reviews_count ?? 0);
    const reviewsAverage = Number(user?.reviews_average ?? 0).toFixed(1);
    const followingCount = Number(user?.following_count ?? 0);
    const followersCount = Number(user?.followers_count ?? 0);
    const listingsCount = Number(
        user?.listings_count ?? user?.sales_count ?? 0
    );

    const handleShareProfile = async () => {
        if (!navigator?.clipboard) {
            return;
        }

        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            // Ignore clipboard failures.
        }
    };

    if (!hasToken) {
        return (
            <div className="min-h-screen bg-white px-6 py-20 text-gray-900">
                <div className="mx-auto max-w-3xl rounded-[32px] border border-black/8 bg-white p-10 text-center shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                        Member Profile
                    </p>
                    <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-black">
                        Sign in to view your profile.
                    </h1>
                    <p className="mt-4 text-sm leading-6 text-black/60">
                        Your profile details, listings, saved activity, and
                        account history are available once you sign in.
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
                            to="/my-feed"
                            className="rounded-full border border-black/12 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                        >
                            Back To Feed
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isUserLoading && !user) {
        return (
            <div className="min-h-screen bg-white px-6 py-20 text-gray-900">
                <div className="mx-auto max-w-7xl animate-pulse space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="h-28 w-28 rounded-full bg-gray-100" />
                        <div className="space-y-3">
                            <div className="h-8 w-56 bg-gray-100" />
                            <div className="h-4 w-72 bg-gray-100" />
                            <div className="h-4 w-48 bg-gray-100" />
                        </div>
                    </div>
                    <div className="h-24 rounded-2xl bg-gray-50" />
                    <div className="h-96 rounded-3xl bg-gray-50" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-white px-6 py-20 text-gray-900">
                <div className="mx-auto max-w-3xl rounded-[32px] border border-black/8 bg-white p-10 text-center shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                        Member Profile
                    </p>
                    <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-black">
                        Profile data is unavailable right now.
                    </h1>
                    <p className="mt-4 text-sm leading-6 text-black/60">
                        Refresh the page or sign in again to reload your member
                        details.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-black text-2xl font-bold text-white shadow-sm md:h-28 md:w-28 md:text-3xl">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={displayName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    getUserInitials(displayName)
                                )}
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                {displayName}
                            </h1>
                            <div className="mt-1 flex flex-col gap-1 text-sm text-gray-500">
                                <p className="font-medium text-gray-900">
                                    {transactionsCount} Transactions
                                </p>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                    <span>
                                        Joined {memberSince ?? "Recently"}
                                    </span>
                                    {user.email ? (
                                        <span className="flex items-center gap-1">
                                            <Mail size={14} />
                                            {user.email}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 md:flex-none">
                            <Settings size={18} />
                            Account
                        </button>
                        <button
                            type="button"
                            onClick={handleShareProfile}
                            className="rounded-md border border-gray-300 p-2.5 transition-colors hover:bg-gray-50"
                        >
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="mb-8 flex gap-8 border-b border-gray-100 pb-8">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-lg font-bold">
                            <Star size={18} className="fill-current" />
                            <span>{reviewsAverage}</span>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            {reviewsCount ? `${reviewsCount} Reviews` : "No Reviews"}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="cursor-pointer text-lg font-bold text-gray-900 hover:underline">
                            {followingCount}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Following
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="cursor-pointer text-lg font-bold text-gray-900 hover:underline">
                            {followersCount}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Followers
                        </span>
                    </div>
                </div>

                <div className="no-scrollbar mb-8 flex items-center gap-8 overflow-x-auto border-b border-gray-200">
                    {[
                        "Selling",
                        "Favorites",
                        "Saved",
                        "Purchases",
                        "Reviews",
                    ].map((tab, idx) => (
                        <button
                            key={tab}
                            className={`relative whitespace-nowrap pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                                idx === 0
                                    ? "text-black"
                                    : "text-gray-400 hover:text-black"
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                {(tab === "Saved" || tab === "Purchases") && (
                                    <Lock size={14} />
                                )}
                                {tab}
                            </span>
                            {idx === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-12 lg:flex-row">
                    <aside className="hidden w-64 shrink-0 lg:block">
                        <div className="mb-6 rounded-lg bg-gray-50 p-5">
                            <h3 className="mb-2 text-sm font-bold">My Sizes</h3>
                            <p className="mb-4 text-xs leading-relaxed text-gray-500">
                                Filter out listings that are not in your size.
                            </p>
                            <button className="w-full rounded border border-gray-300 bg-white py-2 text-xs font-bold transition-shadow hover:shadow-sm">
                                Add My Sizes
                            </button>
                        </div>

                        {[
                            "Department",
                            "Seller Location",
                            "Category",
                            "Size",
                            "Designer",
                            "Price",
                        ].map((filter) => (
                            <div
                                key={filter}
                                className="group flex cursor-pointer items-center justify-between border-b border-gray-100 py-4"
                            >
                                <span className="text-sm font-bold text-gray-800 group-hover:text-black">
                                    {filter}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className="text-gray-400"
                                />
                            </div>
                        ))}
                    </aside>

                    <main className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-500">
                                {listingsCount} Listings
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">
                                    Sort:
                                </span>
                                <select className="cursor-pointer border-none bg-transparent text-sm font-bold focus:ring-0">
                                    <option>Most Relevant</option>
                                    <option>Newest</option>
                                    <option>Price: Low to High</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 px-4 py-20 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                                <Search className="text-gray-300" size={32} />
                            </div>
                            <h2 className="mb-2 text-xl font-bold">
                                {listingsCount ? "Listings are coming soon" : "No listings yet"}
                            </h2>
                            <p className="mb-8 max-w-xs text-gray-500">
                                {listingsCount
                                    ? "Your profile is using live member data. Listing inventory can be wired in next once the profile feed endpoint is available."
                                    : "When you start selling, your items will appear here for the community to see."}
                            </p>
                            <Link
                                to="/sell/add"
                                className="rounded-full bg-black px-8 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition-transform hover:bg-gray-800 active:scale-95"
                            >
                                + Start a new Listing
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
