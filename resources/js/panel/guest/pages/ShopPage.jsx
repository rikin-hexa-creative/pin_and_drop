import {
    startTransition,
    useDeferredValue,
    useEffect,
    useRef,
    useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCategories, useCategoryMenu } from "../../../apis/categories.api";
import { useProductFilters, useProducts } from "../../../apis/product.api";
import ProductCard from "../../../components/product/ProductCard";
import { formatCurrency } from "../../../utils/currency";

const navItems = [
    { label: "Shop", to: "/my-feed", active: true },
    { label: "Home", to: "/" },
    { label: "Designers", to: "/my-feed#designers" },
    { label: "Archive", to: "/my-feed#archive" },
];

const sortOptions = [
    { value: "latest", label: "Sort: Latest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
];

const getCategorySlugFromPath = (path = "") =>
    path.split("/").filter(Boolean).pop() ?? "";

const formatCategorySlug = (slug = "") =>
    slug
        .split("-")
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");

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

const buildPriceLabel = (minPrice, maxPrice) => {
    if (minPrice !== undefined && maxPrice !== undefined) {
        return `${formatCurrency(minPrice, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })} - ${formatCurrency(maxPrice, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    }

    if (minPrice !== undefined) {
        return `${formatCurrency(minPrice, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}+`;
    }

    if (maxPrice !== undefined) {
        return `Up to ${formatCurrency(maxPrice, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    }

    return "";
};

const useDebouncedValue = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => window.clearTimeout(timeoutId);
    }, [delay, value]);

    return debouncedValue;
};

const LoadingCard = () => (
    <div className="animate-pulse">
        <div className="aspect-[3/4] bg-black/5" />
        <div className="mt-4 space-y-2">
            <div className="h-3 w-24 bg-black/8" />
            <div className="h-4 w-3/4 bg-black/8" />
            <div className="flex justify-between pt-2">
                <div className="h-3 w-20 bg-black/8" />
                <div className="h-4 w-16 bg-black/8" />
            </div>
        </div>
    </div>
);

const FilterSection = ({ title, subtitle, children }) => (
    <section className="space-y-4 border-t border-black/10 pt-5 first:border-t-0 first:pt-0">
        <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.28em] text-black font-['Space_Grotesk']">
                {title}
            </h3>
            {subtitle ? (
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-black/40">
                    {subtitle}
                </p>
            ) : null}
        </div>
        {children}
    </section>
);

const FilterToggle = ({
    active,
    count,
    label,
    onClick,
    swatch,
    disabled = false,
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex w-full items-center justify-between gap-3 border px-3 py-2 text-left transition ${
            active
                ? "border-black bg-black text-white"
                : "border-black/10 bg-white text-black hover:border-black/40"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
        <span className="flex min-w-0 items-center gap-3">
            {swatch ? (
                <span
                    className={`h-3 w-3 rounded-full border ${
                        active ? "border-white/70" : "border-black/10"
                    }`}
                    style={{ backgroundColor: swatch }}
                />
            ) : null}
            <span className="truncate text-[11px] font-bold uppercase tracking-[0.18em] font-['Space_Grotesk']">
                {label}
            </span>
        </span>
        {count !== undefined ? (
            <span
                className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                    active ? "text-white/70" : "text-black/35"
                }`}
            >
                {count}
            </span>
        ) : null}
    </button>
);

const CategoryMenuFilter = ({ menuData, selectedCategories, onToggleCategory }) => {
    if (!menuData) {
        return <p className="text-xs text-black/45">Loading categories...</p>;
    }

    const groups = Object.values(menuData);

    if (!groups.length) {
        return <p className="text-xs text-black/45">No categories available.</p>;
    }

    return (
        <div className="space-y-5">
            {groups.map((group) => (
                <div key={group.id}>
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-black/35 font-['Space_Grotesk']">
                        {group.label}
                    </p>
                    <div className="space-y-1">
                        {group.columns.map((col, colIdx) => {
                            const headingSlug = getCategorySlugFromPath(
                                col.heading.to
                            );
                            const isHeadingActive =
                                selectedCategories.includes(headingSlug);

                            return (
                                <div key={colIdx}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onToggleCategory(headingSlug)
                                        }
                                        className={`flex w-full items-center justify-between border px-3 py-2 text-left transition ${
                                            isHeadingActive
                                                ? "border-black bg-black text-white"
                                                : "border-black/10 bg-white text-black hover:border-black/40"
                                        }`}
                                    >
                                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] font-['Space_Grotesk']">
                                            {col.heading.label}
                                        </span>
                                        {col.links?.length > 0 && (
                                            <span
                                                className={`text-[10px] font-bold ${
                                                    isHeadingActive
                                                        ? "text-white/70"
                                                        : "text-black/25"
                                                }`}
                                            >
                                                {col.links.length}
                                            </span>
                                        )}
                                    </button>
                                    {col.links?.length > 0 && (
                                        <div className="ml-3 mt-1 space-y-1 border-l border-black/8 pl-3">
                                            {col.links.map((link) => {
                                                const linkSlug =
                                                    getCategorySlugFromPath(
                                                        link.to
                                                    );
                                                const isLinkActive =
                                                    selectedCategories.includes(
                                                        linkSlug
                                                    );
                                                return (
                                                    <button
                                                        key={link.to}
                                                        type="button"
                                                        onClick={() => onToggleCategory(linkSlug)}
                                                        className={`flex w-full items-center border px-3 py-1.5 text-left transition ${
                                                            isLinkActive
                                                                ? "border-black bg-black text-white"
                                                                : "border-black/8 bg-[#faf8f5] text-black/70 hover:border-black/30 hover:text-black"
                                                        }`}
                                                    >
                                                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] font-['Space_Grotesk']">
                                                            {link.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

const FiltersPanel = ({
    categoryMenuData,
    colorOptions,
    designerOptions,
    maxPriceInput,
    minPriceInput,
    priceBounds,
    selectedCategories,
    selectedColors,
    selectedDesigners,
    selectedSizes,
    sizeOptions,
    onClearAll,
    onMaxPriceChange,
    onMinPriceChange,
    onToggleCategory,
    onToggleColor,
    onToggleDesigner,
    onToggleSize,
}) => (
    <div className="space-y-8">
        <FilterSection title="Designers" subtitle="Approved vendors only">
            <div className="space-y-2">
                {designerOptions.length ? (
                    designerOptions.map((designer) => (
                        <FilterToggle
                            key={designer.id ?? designer.name}
                            active={selectedDesigners.includes(designer.name)}
                            count={designer.products_count}
                            label={designer.name}
                            onClick={() => onToggleDesigner(designer.name)}
                        />
                    ))
                ) : (
                    <p className="text-xs text-black/45">No designer filters available.</p>
                )}
            </div>
        </FilterSection>

        <FilterSection title="Categories" subtitle="Browse by hierarchy">
            <CategoryMenuFilter
                menuData={categoryMenuData}
                selectedCategories={selectedCategories}
                onToggleCategory={onToggleCategory}
            />
        </FilterSection>

        <FilterSection title="Sizes" subtitle="From active product variants">
            <div className="space-y-2">
                {sizeOptions.length ? (
                    sizeOptions.map((size) => (
                        <FilterToggle
                            key={size.name}
                            active={selectedSizes.includes(size.name)}
                            count={size.products_count}
                            label={size.name}
                            onClick={() => onToggleSize(size.name)}
                        />
                    ))
                ) : (
                    <p className="text-xs text-black/45">No size filters available.</p>
                )}
            </div>
        </FilterSection>

        <FilterSection title="Colors" subtitle="Variant colors in stock feed">
            <div className="space-y-2">
                {colorOptions.length ? (
                    colorOptions.map((color) => (
                        <FilterToggle
                            key={color.value}
                            active={selectedColors.includes(color.value)}
                            count={color.products_count}
                            label={color.value}
                            onClick={() => onToggleColor(color.value)}
                            swatch={color.value}
                        />
                    ))
                ) : (
                    <p className="text-xs text-black/45">No color filters available.</p>
                )}
            </div>
        </FilterSection>

        <FilterSection title="Price" subtitle="Filter by catalog range">
            <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                        Min
                    </span>
                    <input
                        type="number"
                        min="0"
                        value={minPriceInput}
                        onChange={(event) => onMinPriceChange(event.target.value)}
                        placeholder={
                            priceBounds.min
                                ? String(Math.floor(priceBounds.min))
                                : "0"
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
                        onChange={(event) => onMaxPriceChange(event.target.value)}
                        placeholder={
                            priceBounds.max
                                ? String(Math.ceil(priceBounds.max))
                                : "0"
                        }
                        className="w-full border border-black/10 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                    />
                </label>
            </div>

            {priceBounds.max > 0 ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">
                    Available:{" "}
                    {formatCurrency(priceBounds.min, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    })}{" "}
                    to{" "}
                    {formatCurrency(priceBounds.max, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    })}
                </p>
            ) : null}
        </FilterSection>

        <button
            type="button"
            onClick={onClearAll}
            className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#bc0000] transition-opacity hover:opacity-80 font-['Space_Grotesk']"
        >
            Clear All
        </button>
    </div>
);

const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearchValue = searchParams.get("search") ?? "";
    const [searchInput, setSearchInput] = useState(urlSearchValue);
    const [selectedDesigners, setSelectedDesigners] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [sort, setSort] = useState("latest");
    const [minPriceInput, setMinPriceInput] = useState("");
    const [maxPriceInput, setMaxPriceInput] = useState("");
    const loadMoreRef = useRef(null);
    const selectedCategorySlugs = Array.from(
        new Set(searchParams.getAll("category").filter(Boolean))
    );

    const debouncedSearchInput = useDebouncedValue(searchInput, 350);
    const debouncedSearch = debouncedSearchInput.trim();
    const deferredMinPrice = useDeferredValue(minPriceInput);
    const deferredMaxPrice = useDeferredValue(maxPriceInput);
    const minPrice = parsePriceValue(deferredMinPrice);
    const maxPrice = parsePriceValue(deferredMaxPrice);

    useEffect(() => {
        setSearchInput((currentValue) =>
            currentValue === urlSearchValue ? currentValue : urlSearchValue
        );
    }, [urlSearchValue]);

    useEffect(() => {
        if (searchInput !== debouncedSearchInput) {
            return;
        }

        const nextSearchParams = new URLSearchParams(searchParams);

        if (debouncedSearch) {
            nextSearchParams.set("search", debouncedSearch);
        } else {
            nextSearchParams.delete("search");
        }

        const nextSearchString = nextSearchParams.toString();
        const currentSearchString = searchParams.toString();

        if (nextSearchString === currentSearchString) {
            return;
        }

        setSearchParams(nextSearchParams, { replace: true });
    }, [
        debouncedSearch,
        debouncedSearchInput,
        searchInput,
        searchParams,
        setSearchParams,
    ]);

    const handleSearchInputChange = (value) => {
        setSearchInput(value);
    };

    const clearSearch = () => {
        setSearchInput("");

        if (!searchParams.has("search")) {
            return;
        }

        const nextSearchParams = new URLSearchParams(searchParams);
        nextSearchParams.delete("search");
        setSearchParams(nextSearchParams, { replace: true });
    };

    const { data: categories = [], error: categoriesError } = useCategories();
    const { data: categoryMenuData } = useCategoryMenu();
    const {
        data: filterData = {},
        error: filterError,
        isLoading: isFilterLoading,
    } = useProductFilters();
    const categoryOptions =
        categories.length > 0 ? categories : filterData.categories ?? [];
    const slugToCategory = new Map(
        categoryOptions.map((category) => [category.slug, category])
    );
    const designerOptions = filterData.designers ?? [];
    const sizeOptions = filterData.sizes ?? [];
    const colorOptions = filterData.colors ?? [];
    const priceBounds = filterData.price_range ?? { min: 0, max: 0 };

    const productParams = {
        search: debouncedSearch || undefined,
        category: selectedCategorySlugs,
        designer: selectedDesigners,
        size: selectedSizes,
        color: selectedColors,
        sort,
        min_price: minPrice,
        max_price: maxPrice,
        per_page: 12,
    };

    const {
        data,
        error: productsError,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        isLoading,
    } = useProducts(productParams);

    useEffect(() => {
        const target = loadMoreRef.current;

        if (!target || !hasNextPage) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];

                if (
                    firstEntry?.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            {
                rootMargin: "280px 0px",
            }
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const productPages = data?.pages ?? [];
    const products = productPages.flatMap((page) => page?.data ?? []);
    const totalProducts = productPages[0]?.meta?.total ?? 0;
    const activeFilterCount =
        selectedCategorySlugs.length +
        selectedDesigners.length +
        selectedSizes.length +
        selectedColors.length +
        (debouncedSearch ? 1 : 0) +
        (minPrice !== undefined || maxPrice !== undefined ? 1 : 0);

    // Build a slug→id lookup from the flat categories list
    const updateUrlSearchParams = (updateFn) => {
        const nextSearchParams = new URLSearchParams(searchParams);
        updateFn(nextSearchParams);

        if (nextSearchParams.toString() === searchParams.toString()) {
            return;
        }

        setSearchParams(nextSearchParams, { replace: true });
    };

    const onToggleCategory = (slugOrId) => {
        const slug =
            typeof slugOrId === "string"
                ? slugOrId
                : categoryOptions.find((category) => category.id === slugOrId)
                      ?.slug;

        if (!slug) {
            return;
        }

        startTransition(() => {
            updateUrlSearchParams((nextSearchParams) => {
                const currentValues = Array.from(
                    new Set(nextSearchParams.getAll("category").filter(Boolean))
                );
                const nextValues = toggleSelection(currentValues, slug);

                nextSearchParams.delete("category");
                nextValues.forEach((value) =>
                    nextSearchParams.append("category", value)
                );
            });
        });
    };

    const onToggleDesigner = (value) => {
        startTransition(() => {
            setSelectedDesigners((currentValues) =>
                toggleSelection(currentValues, value)
            );
        });
    };

    const onToggleSize = (value) => {
        startTransition(() => {
            setSelectedSizes((currentValues) =>
                toggleSelection(currentValues, value)
            );
        });
    };

    const onToggleColor = (value) => {
        startTransition(() => {
            setSelectedColors((currentValues) =>
                toggleSelection(currentValues, value)
            );
        });
    };

    const clearAllFilters = () => {
        startTransition(() => {
            setSearchInput("");
            setSelectedDesigners([]);
            setSelectedSizes([]);
            setSelectedColors([]);
            setSort("latest");
            setMinPriceInput("");
            setMaxPriceInput("");
            updateUrlSearchParams((nextSearchParams) => {
                nextSearchParams.delete("search");
                nextSearchParams.delete("category");
            });
        });
    };

    const activeFilterChips = [
        ...selectedDesigners.map((designer) => ({
            key: `designer-${designer}`,
            label: designer,
            onRemove: () => onToggleDesigner(designer),
        })),
        ...selectedCategorySlugs.map((categorySlug) => {
            const category = slugToCategory.get(categorySlug);
            return {
                key: `category-${categorySlug}`,
                label: category?.name ?? formatCategorySlug(categorySlug),
                onRemove: () => onToggleCategory(categorySlug),
            };
        }),
        ...selectedSizes.map((size) => ({
            key: `size-${size}`,
            label: `Size ${size}`,
            onRemove: () => onToggleSize(size),
        })),
        ...selectedColors.map((color) => ({
            key: `color-${color}`,
            label: `Color ${color}`,
            onRemove: () => onToggleColor(color),
        })),
    ];

    if (debouncedSearch) {
        activeFilterChips.unshift({
            key: "search",
            label: `Search: ${debouncedSearch}`,
            onRemove: clearSearch,
        });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        activeFilterChips.push({
            key: "price",
            label: `Price: ${buildPriceLabel(minPrice, maxPrice)}`,
            onRemove: () => {
                setMinPriceInput("");
                setMaxPriceInput("");
            },
        });
    }

    return (
        <div className="bg-[#fbf9f8] text-[#1b1c1c] selection:bg-black selection:text-white">

            <main className="min-h-screen pt-8">
                <div className="mx-auto flex max-w-[1600px] gap-12 px-4 pb-20 sm:px-8">
                    <aside className="sticky top-24 hidden h-[calc(auto)] w-72  bg-[#fbf9f8] pt-8 lg:block">
                        <div className="mb-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-black font-['Space_Grotesk']">
                                Filter
                            </h2>
                            <p className="mt-1 text-[10px] uppercase tracking-widest text-black/40">
                                Refine Selection
                            </p>
                        </div>

                        <FiltersPanel
                            categoryMenuData={categoryMenuData}
                            colorOptions={colorOptions}
                            designerOptions={designerOptions}
                            maxPriceInput={maxPriceInput}
                            minPriceInput={minPriceInput}
                            priceBounds={priceBounds}
                            selectedCategories={selectedCategorySlugs}
                            selectedColors={selectedColors}
                            selectedDesigners={selectedDesigners}
                            selectedSizes={selectedSizes}
                            sizeOptions={sizeOptions}
                            onClearAll={clearAllFilters}
                            onMaxPriceChange={setMaxPriceInput}
                            onMinPriceChange={setMinPriceInput}
                            onToggleCategory={onToggleCategory}
                            onToggleColor={onToggleColor}
                            onToggleDesigner={onToggleDesigner}
                            onToggleSize={onToggleSize}
                        />
                    </aside>

                    <section className="flex-1">
                        <div className="mb-8 rounded-[28px] border border-black/8 bg-white/70 p-5 lg:hidden">
                            <details>
                                <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-[0.28em] text-black font-['Space_Grotesk']">
                                    Filters {activeFilterCount ? `(${activeFilterCount})` : ""}
                                </summary>
                                <div className="mt-6">
                                    <FiltersPanel
                                        categoryMenuData={categoryMenuData}
                                        colorOptions={colorOptions}
                                        designerOptions={designerOptions}
                                        maxPriceInput={maxPriceInput}
                                        minPriceInput={minPriceInput}
                                        priceBounds={priceBounds}
                                        selectedCategories={selectedCategorySlugs}
                                        selectedColors={selectedColors}
                                        selectedDesigners={selectedDesigners}
                                        selectedSizes={selectedSizes}
                                        sizeOptions={sizeOptions}
                                        onClearAll={clearAllFilters}
                                        onMaxPriceChange={setMaxPriceInput}
                                        onMinPriceChange={setMinPriceInput}
                                        onToggleCategory={onToggleCategory}
                                        onToggleColor={onToggleColor}
                                        onToggleDesigner={onToggleDesigner}
                                        onToggleSize={onToggleSize}
                                    />
                                </div>
                            </details>
                        </div>

                        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <div className="w-full md:max-w-lg">
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest font-['Space_Grotesk']">
                                    Search Archive
                                </label>
                                <div className="group relative">
                                    <input
                                        value={searchInput}
                                        onChange={(event) =>
                                            handleSearchInputChange(event.target.value)
                                        }
                                        className="w-full border-b border-black/20 bg-transparent px-0 py-2 pr-8 text-sm uppercase tracking-tighter placeholder:text-black/20 focus:border-black focus:outline-none focus:ring-0 font-['Inter']"
                                        placeholder="Search by product, designer, or category"
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
                                        className="cursor-pointer appearance-none border-none bg-transparent pr-8 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-0 font-['Space_Grotesk']"
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

                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 font-['Space_Grotesk']">
                                    {isLoading
                                        ? "Loading archive"
                                        : `Viewing ${products.length} of ${totalProducts} items`}
                                </p>
                            </div>
                        </div>

                        {activeFilterChips.length ? (
                            <div className="mb-8 flex flex-wrap gap-3">
                                {activeFilterChips.map((chip) => (
                                    <button
                                        key={chip.key}
                                        type="button"
                                        onClick={chip.onRemove}
                                        className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition hover:border-black"
                                    >
                                        <span>{chip.label}</span>
                                        <span className="material-symbols-outlined text-sm">
                                            close
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : null}

                        {(categoriesError || filterError || productsError) && (
                            <div className="mb-8 border border-[#bc0000]/20 bg-[#fff4f2] px-4 py-3 text-sm text-[#8a1d16]">
                                Something went wrong while loading the shop
                                feed. Try refreshing the page.
                            </div>
                        )}

                        {isFilterLoading && !categoryOptions.length ? (
                            <div className="mb-8 text-xs uppercase tracking-[0.22em] text-black/35">
                                Loading filters...
                            </div>
                        ) : null}

                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <LoadingCard key={index} />
                                ))}
                            </div>
                        ) : products.length ? (
                            <>
                                <div
                                    id="archive"
                                    className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                >
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            variant="shop"
                                            brand={product.brand}
                                            badge={product.badge}
                                            image={product.image}
                                            price={product.price_formatted}
                                            size={product.size}
                                            title={product.name}
                                            to={`/product/${product.id}`}
                                        />
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
                                            className="bg-black px-12 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/40 font-['Inter']"
                                        >
                                            {isFetchingNextPage
                                                ? "Loading More Pieces"
                                                : "Load More Pieces"}
                                        </button>
                                    ) : (
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35 font-['Space_Grotesk']">
                                            All matching items loaded
                                        </p>
                                    )}

                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 font-['Space_Grotesk']">
                                        {isFetching && !isFetchingNextPage
                                            ? "Refreshing results..."
                                            : `Viewing ${products.length} of ${totalProducts} items`}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-[32px] border border-black/10 bg-white px-6 py-12 text-center">
                                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
                                    No active products matched these filters
                                </p>
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="mt-5 border border-black px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-black transition hover:bg-black hover:text-white"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <footer className="mt-20 flex w-full flex-col items-center justify-between gap-4 bg-[#dbdad9] px-8 py-12 md:flex-row">
                <div className="text-sm font-bold uppercase tracking-tighter text-black font-['Inter']">
                    THE DIGITAL CURATOR
                </div>
                <div className="flex flex-wrap gap-6 md:gap-8">
                    {["Privacy", "Terms", "Accessibility", "Contact"].map(
                        (item) => (
                            <Link
                                key={item}
                                to="/"
                                className="text-[10px] uppercase tracking-widest text-black/60 transition-colors hover:text-black font-['Space_Grotesk']"
                            >
                                {item}
                            </Link>
                        )
                    )}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-black/40 font-['Space_Grotesk']">
                    (C) 2026 THE DIGITAL CURATOR. ALL RIGHTS RESERVED.
                </div>
            </footer>
        </div>
    );
};

export default ShopPage;
