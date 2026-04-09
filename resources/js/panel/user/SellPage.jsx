import {
    startTransition,
    useDeferredValue,
    useEffect,
    useRef,
    useState,
} from "react";
import { Link } from "react-router-dom";
import { useSellProducts } from "../../apis/sale.api";
import { formatCurrency } from "../../utils/currency";

const sortOptions = [
    { value: "latest", label: "Added: Newest" },
    { value: "oldest", label: "Added: Oldest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
];

const toggleSelection = (values, value) =>
    values.includes(value)
        ? values.filter((currentValue) => currentValue !== value)
        : [...values, value];

const parsePriceValue = (value) => {
    if (value === "") {
        return undefined;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const SellPage = () => {
    const [searchInput, setSearchInput] = useState("");
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [sort, setSort] = useState("latest");
    const [minPriceInput, setMinPriceInput] = useState("");
    const [maxPriceInput, setMaxPriceInput] = useState("");
    const loadMoreRef = useRef(null);
    const deferredSearch = useDeferredValue(searchInput.trim());
    const deferredMinPrice = useDeferredValue(minPriceInput);
    const deferredMaxPrice = useDeferredValue(maxPriceInput);
    const minPrice = parsePriceValue(deferredMinPrice);
    const maxPrice = parsePriceValue(deferredMaxPrice);
    const params = {
        search: deferredSearch || undefined,
        condition: selectedConditions,
        sort,
        min_price: minPrice,
        max_price: maxPrice,
        per_page: 12,
    };
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        isLoading,
    } = useSellProducts(params);

    useEffect(() => {
        const target = loadMoreRef.current;

        if (!target || !hasNextPage) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0]?.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            { rootMargin: "280px 0px" }
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const pages = data?.pages ?? [];
    const listings = pages.flatMap((page) => page?.data ?? []);
    const meta = pages[0]?.meta ?? {};
    const filters = meta.filters ?? {};
    const conditions = filters.conditions ?? [];
    const priceRange = filters.price_range ?? { min: 0, max: 0 };
    const total = meta.total ?? 0;
    const activeFilterCount =
        selectedConditions.length +
        (deferredSearch ? 1 : 0) +
        (minPrice !== undefined || maxPrice !== undefined ? 1 : 0);

    const onToggleCondition = (value) =>
        startTransition(() =>
            setSelectedConditions((currentValues) =>
                toggleSelection(currentValues, value)
            )
        );

    const clearAllFilters = () =>
        startTransition(() => {
            setSearchInput("");
            setSelectedConditions([]);
            setSort("latest");
            setMinPriceInput("");
            setMaxPriceInput("");
        });

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fbf7f1_0%,#f1e8de_100%)] text-[#1b1c1c] selection:bg-black selection:text-white">
            <main className="mx-auto max-w-[1600px] px-4 pb-20 pt-10 sm:px-8">
                <section className="overflow-hidden rounded-[36px] border border-black/8 bg-[#111111] text-white shadow-[0_30px_95px_rgba(0,0,0,0.16)]">
                    <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                            <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">
                                Public Sell Feed
                            </p>
                            <h1 className="mt-4 max-w-3xl font-['Inter'] text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Active User Listings
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
                                Browse active archive pieces listed by users,
                                filter by condition and price, and keep
                                scrolling through the feed without page jumps.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    to="/sell/add"
                                    className="inline-flex rounded-full bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:bg-white/90"
                                >
                                    List Your Piece
                                </Link>
                                <Link
                                    to="/sell/for-sale"
                                    className="inline-flex rounded-full border border-white/12 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black"
                                >
                                    Manage My Listings
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                                    Live Listings
                                </p>
                                <p className="mt-3 font-['Inter'] text-4xl font-black tracking-tight text-white">
                                    {total}
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                                    Condition Filters
                                </p>
                                <p className="mt-3 font-['Inter'] text-4xl font-black tracking-tight text-white">
                                    {conditions.length}
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                                    Price Window
                                </p>
                                <p className="mt-3 font-['Inter'] text-xl font-black tracking-tight text-white">
                                    {formatCurrency(priceRange.min)} -{" "}
                                    {formatCurrency(priceRange.max)}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-10 flex gap-12">
                    <aside className="sticky top-24 hidden w-72 self-start lg:block">
                        <div className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                            <div className="mb-6">
                                <h2 className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-[0.28em] text-black">
                                    Filter
                                </h2>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-black/40">
                                    Active sell inventory
                                </p>
                            </div>

                            <div className="space-y-8">
                                <section className="space-y-4">
                                    <div>
                                        <h3 className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-[0.28em] text-black">
                                            Condition
                                        </h3>
                                        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-black/40">
                                            Active user-sale listings
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {conditions.length ? (
                                            conditions.map((condition) => (
                                                <button
                                                    key={condition.value}
                                                    type="button"
                                                    onClick={() =>
                                                        onToggleCondition(
                                                            condition.value
                                                        )
                                                    }
                                                    className={`flex w-full items-center justify-between gap-3 border px-3 py-2 text-left transition ${
                                                        selectedConditions.includes(
                                                            condition.value
                                                        )
                                                            ? "border-black bg-black text-white"
                                                            : "border-black/10 bg-white text-black hover:border-black/40"
                                                    }`}
                                                >
                                                    <span className="truncate font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-[0.18em]">
                                                        {condition.label}
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                                                        {
                                                            condition.listings_count
                                                        }
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-xs text-black/45">
                                                No condition filters available.
                                            </p>
                                        )}
                                    </div>
                                </section>

                                <section className="space-y-4 border-t border-black/10 pt-5">
                                    <div>
                                        <h3 className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-[0.28em] text-black">
                                            Price
                                        </h3>
                                        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-black/40">
                                            Filter active sell inventory
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="space-y-2">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                                                Min
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={minPriceInput}
                                                onChange={(event) =>
                                                    setMinPriceInput(
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full border border-black/10 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                                            />
                                        </label>
                                        <label className="space-y-2">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                                                Max
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={maxPriceInput}
                                                onChange={(event) =>
                                                    setMaxPriceInput(
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full border border-black/10 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">
                                        Available: {formatCurrency(priceRange.min)}{" "}
                                        to {formatCurrency(priceRange.max)}
                                    </p>
                                </section>

                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.22em] text-[#bc0000] transition-opacity hover:opacity-80"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </aside>

                    <section className="min-w-0 flex-1">
                        <div className="mb-8 rounded-[28px] border border-black/8 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.04)] lg:hidden">
                            <details>
                                <summary className="cursor-pointer list-none font-['Space_Grotesk'] text-xs font-bold uppercase tracking-[0.28em] text-black">
                                    Filters
                                    {activeFilterCount
                                        ? ` (${activeFilterCount})`
                                        : ""}
                                </summary>
                                <div className="mt-6 space-y-6">
                                    <div className="space-y-2">
                                        {conditions.map((condition) => (
                                            <button
                                                key={condition.value}
                                                type="button"
                                                onClick={() =>
                                                    onToggleCondition(
                                                        condition.value
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between gap-3 border px-3 py-2 text-left transition ${
                                                    selectedConditions.includes(
                                                        condition.value
                                                    )
                                                        ? "border-black bg-black text-white"
                                                        : "border-black/10 bg-white text-black hover:border-black/40"
                                                }`}
                                            >
                                                <span className="truncate font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-[0.18em]">
                                                    {condition.label}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                                                    {condition.listings_count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            min="0"
                                            value={minPriceInput}
                                            onChange={(event) =>
                                                setMinPriceInput(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Min"
                                            className="w-full border border-black/10 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            value={maxPriceInput}
                                            onChange={(event) =>
                                                setMaxPriceInput(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Max"
                                            className="w-full border border-black/10 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </details>
                        </div>

                        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <div className="w-full md:max-w-xl">
                                <label className="mb-1 block font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-widest">
                                    Search Sell Feed
                                </label>
                                <div className="relative">
                                    <input
                                        value={searchInput}
                                        onChange={(event) =>
                                            setSearchInput(event.target.value)
                                        }
                                        className="w-full border-b border-black/20 bg-transparent px-0 py-2 pr-8 text-sm uppercase tracking-tighter placeholder:text-black/20 focus:border-black focus:outline-none focus:ring-0 font-['Inter']"
                                        placeholder="Search by product or condition"
                                        type="search"
                                    />
                                    <span className="material-symbols-outlined absolute bottom-2 right-0 text-black/40">
                                        search
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative">
                                    <select
                                        value={sort}
                                        onChange={(event) =>
                                            startTransition(() =>
                                                setSort(event.target.value)
                                            )
                                        }
                                        className="cursor-pointer appearance-none border-none bg-transparent pr-8 font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-0"
                                    >
                                        {sortOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-xs">
                                        expand_more
                                    </span>
                                </div>
                                <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                                    {isLoading
                                        ? "Loading feed"
                                        : `Viewing ${listings.length} of ${total} listings`}
                                </p>
                            </div>
                        </div>

                        {error ? (
                            <div className="mb-8 border border-[#bc0000]/20 bg-[#fff4f2] px-4 py-3 text-sm text-[#8a1d16]">
                                Something went wrong while loading the sell
                                feed. Try refreshing the page.
                            </div>
                        ) : null}

                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {Array.from({ length: 9 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="animate-pulse rounded-[28px] border border-black/8 bg-white p-4"
                                    >
                                        <div className="aspect-[4/5] bg-black/5" />
                                        <div className="mt-4 space-y-3">
                                            <div className="h-3 w-24 bg-black/8" />
                                            <div className="h-6 w-3/4 bg-black/8" />
                                            <div className="h-4 w-1/2 bg-black/8" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : listings.length ? (
                            <>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {listings.map((listing) => (
                                        <Link
                                            key={listing.id}
                                            to={`/sell/product/${listing.id}`}
                                            className="group overflow-hidden rounded-[30px] border border-black/8 bg-white shadow-[0_18px_55px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(0,0,0,0.1)]"
                                        >
                                            <div className="aspect-[4/5] overflow-hidden bg-[linear-gradient(135deg,#f4ece4,#fbf7f2)]">
                                                {listing.image ? (
                                                    <img
                                                        src={listing.image}
                                                        alt={listing.name}
                                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center px-8 text-center font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-[0.22em] text-black/35">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-4 p-5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-black px-3 py-1 font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                                                        {listing.condition}
                                                    </span>
                                                    <span className="rounded-full bg-black/5 px-3 py-1 font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.18em] text-black/60">
                                                        Added{" "}
                                                        {listing.created_date_formatted}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                                        {listing.seller?.name ??
                                                            "User Listing"}
                                                    </p>
                                                    <h2 className="mt-3 font-['Inter'] text-2xl font-black uppercase leading-none tracking-tight text-black">
                                                        {listing.name}
                                                    </h2>
                                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/63">
                                                        {listing.description}
                                                    </p>
                                                </div>
                                                <div className="flex items-end justify-between gap-4 border-t border-black/8 pt-4">
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
                                                        <p className="mt-2 font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
                                                            {listing.images_count}{" "}
                                                            image
                                                            {listing.images_count ===
                                                            1
                                                                ? ""
                                                                : "s"}
                                                        </p>
                                                    </div>
                                                    <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                                        View Detail
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                <div
                                    ref={loadMoreRef}
                                    className="mt-16 flex flex-col items-center gap-5"
                                >
                                    {hasNextPage ? (
                                        <button
                                            type="button"
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            className="bg-black px-12 py-4 font-['Inter'] text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/40"
                                        >
                                            {isFetchingNextPage
                                                ? "Loading More Listings"
                                                : "Load More Listings"}
                                        </button>
                                    ) : (
                                        <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                                            All active listings loaded
                                        </p>
                                    )}
                                    <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                                        {isFetching && !isFetchingNextPage
                                            ? "Refreshing results..."
                                            : `Viewing ${listings.length} of ${total} listings`}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-[32px] border border-black/10 bg-white px-6 py-16 text-center shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
                                <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                                    Public Sell Feed
                                </p>
                                <h2 className="mt-4 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                                    No active listings matched.
                                </h2>
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="mt-8 rounded-full bg-black px-6 py-3 font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-black/90"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default SellPage;
