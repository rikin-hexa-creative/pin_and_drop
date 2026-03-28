import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProductById } from "../../../apis/product.api";
import { useCart } from "../../../context/CartWrapper";
import PinModal from "../../../components/site/PinModal";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const navItems = [
    { label: "Collections", to: "/" },
    { label: "Editorial", to: "/" },
    { label: "Archive", to: "/shop", active: true },
    { label: "Search", to: "/shop" },
];

const mobileNavItems = [
    { label: "Explore", icon: "grid_view", to: "/shop" },
    { label: "Saved", icon: "bookmark", to: "/user-profile" },
    { label: "Cart", icon: "shopping_cart", to: "/sign-in" },
    { label: "Profile", icon: "person", to: "/user-profile", active: true },
];

const starIndexes = [1, 2, 3, 4, 5];

const formatCurrency = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? currencyFormatter.format(amount) : "$0.00";
};

const selectVariant = (variants, color, size) => {
    if (!variants?.length) {
        return null;
    }

    return (
        variants.find(
            (variant) =>
                variant.color === color &&
                variant.size === size &&
                variant.in_stock
        ) ||
        variants.find(
            (variant) => variant.color === color && variant.size === size
        ) ||
        variants.find(
            (variant) => variant.color === color && variant.in_stock
        ) ||
        variants.find((variant) => variant.color === color) ||
        variants.find((variant) => variant.size === size && variant.in_stock) ||
        variants.find((variant) => variant.size === size) ||
        variants.find((variant) => variant.in_stock) ||
        variants[0]
    );
};

const ProductPageSkeleton = () => (
    <div className="bg-[#fbf9f8] text-[#1b1c1c]">
        <main className="mx-auto min-h-screen max-w-[1920px] px-4 pb-20 pt-24 md:px-8 lg:px-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-16 animate-pulse">
                <div className="flex flex-1 flex-col-reverse gap-4 md:flex-row">
                    <div className="flex shrink-0 gap-3 md:w-24 md:flex-col">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-28 w-20 bg-black/5 md:h-32 md:w-full"
                            />
                        ))}
                    </div>
                    <div className="aspect-[3/4] flex-1 bg-black/5" />
                </div>

                <div className="space-y-6 lg:w-[450px]">
                    <div className="space-y-3">
                        <div className="h-3 w-40 bg-black/5" />
                        <div className="h-4 w-28 bg-black/5" />
                        <div className="h-16 w-full bg-black/5" />
                        <div className="h-8 w-32 bg-black/5" />
                    </div>
                    <div className="h-20 w-full bg-black/5" />
                    <div className="h-24 w-full bg-black/5" />
                    <div className="h-28 w-full bg-black/5" />
                </div>
            </div>
        </main>
    </div>
);

const ProductPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data: product, error, isLoading } = useProductById(id);
    const { addToCart } = useCart();
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isSaved, setIsSaved] = useState(false);
    const [showSizeChart, setShowSizeChart] = useState(false);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    useEffect(() => {
        if (!product) {
            return;
        }

        const initialVariantId =
            product.default_variant_id ?? product.variants?.[0]?.id ?? null;
        const initialImageId =
            product.gallery?.find((image) => image.is_primary)?.id ??
            product.gallery?.[0]?.id ??
            null;

        setSelectedVariantId(initialVariantId);
        setSelectedImageId(initialImageId);
        setQuantity(1);
        setIsSaved(false);
        setShowSizeChart(false);
    }, [product]);

    const selectedVariant =
        product?.variants?.find((variant) => variant.id === selectedVariantId) ??
        product?.variants?.find(
            (variant) => variant.id === product?.default_variant_id
        ) ??
        product?.variants?.find((variant) => variant.in_stock) ??
        product?.variants?.[0] ??
        null;

    const gallery = product?.gallery ?? [];
    const selectedImage =
        gallery.find((image) => image.id === selectedImageId) ??
        gallery[0] ??
        null;
    const selectedColor =
        selectedVariant?.color ??
        product?.colors?.find((color) => color.in_stock)?.value ??
        product?.colors?.[0]?.value ??
        null;
    const selectedSize =
        selectedVariant?.size ??
        product?.sizes?.find((size) => size.available)?.value ??
        product?.sizes?.[0]?.value ??
        null;
    const displayedPrice = selectedVariant?.price ?? product?.price ?? 0;
    const displayedCompareAtPrice =
        selectedVariant?.compare_at_price ?? product?.compare_at_price;
    const reviewAverage = product?.review_summary?.average ?? 0;
    const reviewCount = product?.review_summary?.count ?? 0;
    const availableQuantity = Math.max(selectedVariant?.stock_qty ?? 1, 1);
    const details = [
        {
            label: "Category",
            value: product?.category?.name ?? "Archive",
        },
        {
            label: "SKU",
            value: selectedVariant?.sku ?? product?.sku ?? "N/A",
        },
        {
            label: "Available Sizes",
            value:
                product?.sizes?.map((size) => size.value).join(", ") ??
                "One Size",
        },
        {
            label: "Stock",
            value: selectedVariant
                ? `${selectedVariant.stock_qty} pieces available`
                : "Limited availability",
        },
    ];

    useEffect(() => {
        if (!selectedVariant) {
            return;
        }

        const preferredImage =
            selectedVariant.image ?? selectedVariant.images?.[0] ?? null;

        if (!preferredImage) {
            return;
        }

        const matchingGalleryImage = gallery.find(
            (image) => image.src === preferredImage
        );

        if (matchingGalleryImage) {
            setSelectedImageId(matchingGalleryImage.id);
        }
    }, [gallery, selectedVariant]);

    useEffect(() => {
        setQuantity((currentValue) => Math.min(currentValue, availableQuantity));
    }, [availableQuantity]);

    const updateVariant = (variant) => {
        if (!variant) {
            return;
        }

        setSelectedVariantId(variant.id);
        setQuantity(1);
    };

    const handleColorSelect = (color) => {
        updateVariant(selectVariant(product?.variants ?? [], color, selectedSize));
    };

    const handleSizeSelect = (size) => {
        updateVariant(selectVariant(product?.variants ?? [], selectedColor, size));
    };

    const decrementQuantity = () => {
        setQuantity((currentValue) => Math.max(1, currentValue - 1));
    };

    const incrementQuantity = () => {
        setQuantity((currentValue) =>
            Math.min(availableQuantity, currentValue + 1)
        );
    };

    const handleAddToCart = () => {
        if (!product?.id || !selectedVariant?.id || !selectedVariant?.in_stock) {
            return;
        }
        addToCart(product, selectedVariant, quantity);
        setIsAddedToCart(true);
        setTimeout(() => setIsAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        if (!product?.id || !selectedVariant?.id || !selectedVariant?.in_stock) {
            return;
        }

        const checkoutUrl = `/checkout?productId=${product.id}&variantId=${selectedVariant.id}&quantity=${quantity}`;

        if (Cookies.get("user_token")) {
            navigate(checkoutUrl);
            return;
        }

        navigate("/sign-in", {
            state: {
                redirectTo: checkoutUrl,
            },
        });
    };

    if (isLoading) {
        return <ProductPageSkeleton />;
    }

    if (error?.response?.status === 404) {
        return (
            <div className="bg-[#fbf9f8] text-[#1b1c1c]">
                <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-24 text-center">
                    <div className="space-y-5">
                        <p className="font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.3em] text-black/45">
                            Product Not Found
                        </p>
                        <h1 className="font-['Inter'] text-4xl font-black uppercase tracking-tighter">
                            This archive piece is no longer available.
                        </h1>
                        <Link
                            to="/shop"
                            className="inline-flex border border-black px-6 py-3 font-['Inter'] text-xs font-black uppercase tracking-[0.22em] transition hover:bg-black hover:text-white"
                        >
                            Return To Archive
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="bg-[#fbf9f8] text-[#1b1c1c]">
                <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-24 text-center">
                    <div className="space-y-5">
                        <p className="font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.3em] text-black/45">
                            Product Unavailable
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex border border-black px-6 py-3 font-['Inter'] text-xs font-black uppercase tracking-[0.22em] transition hover:bg-black hover:text-white"
                        >
                            Return To Archive
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-[#fbf9f8] text-[#1b1c1c] selection:bg-black selection:text-white">

            <main className="mx-auto min-h-screen max-w-[1920px] px-4 pb-20 pt-24 md:px-8 lg:px-12 md:pb-0">
                <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
                    <div className="flex flex-1 flex-col-reverse gap-4 md:flex-row">
                        <div className="flex shrink-0 gap-3 overflow-x-auto md:w-24 md:flex-col md:overflow-y-auto">
                            {gallery.length ? (
                                gallery.map((image) => {
                                    const isActive =
                                        image.id === selectedImage?.id;

                                    return (
                                        <button
                                            key={image.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedImageId(image.id)
                                            }
                                            className={`h-28 w-20 shrink-0 overflow-hidden bg-[#e9e8e7] transition md:h-32 md:w-full ${
                                                isActive
                                                    ? "ring-1 ring-black ring-offset-2 ring-offset-[#fbf9f8]"
                                                    : "opacity-50 hover:opacity-100"
                                            }`}
                                        >
                                            <img
                                                src={image.src}
                                                alt={image.alt}
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="flex h-28 w-20 items-center justify-center bg-[#e9e8e7] text-[10px] uppercase tracking-[0.22em] text-black/35 md:h-32 md:w-full">
                                    No Image
                                </div>
                            )}
                        </div>

                        <div className="aspect-[3/4] flex-1 overflow-hidden bg-[#f5f3f3]">
                            {selectedImage ? (
                                <img
                                    src={selectedImage.src}
                                    alt={selectedImage.alt}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#e7e2dd,#f7f4f1)] px-6 text-center font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-[0.22em] text-black/35">
                                    No Image Available
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="h-fit space-y-8 lg:sticky lg:top-32 lg:w-[450px]">
                        <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                                <span className="font-['Space_Grotesk'] text-xs uppercase tracking-widest text-zinc-500">
                                    {product.collection_label} /{" "}
                                    {product.category?.name ?? "Archive"}
                                </span>
                                {product.badge ? (
                                    <span className="bg-black px-2 py-1 font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.2em] text-white">
                                        {product.badge}
                                    </span>
                                ) : null}
                            </div>

                            <h2 className="font-['Inter'] text-xs font-black uppercase tracking-widest text-[#bc0000]">
                                {product.brand}
                            </h2>
                            <h1 className="font-['Inter'] text-4xl font-black uppercase leading-[0.9] tracking-tighter lg:text-5xl">
                                {product.name}
                            </h1>
                            <div className="mt-4 flex items-end gap-3 font-['Inter']">
                                <p className="text-2xl">
                                    {formatCurrency(displayedPrice)}
                                </p>
                                {displayedCompareAtPrice ? (
                                    <p className="text-base text-black/35 line-through">
                                        {formatCurrency(displayedCompareAtPrice)}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        {product.colors?.length ? (
                            <div className="space-y-3">
                                <label className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-zinc-400">
                                    Selected Color - {selectedColor ?? "N/A"}
                                </label>
                                <div className="flex gap-2">
                                    {product.colors.map((color) => {
                                        const isActive =
                                            color.value === selectedColor;

                                        return (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() =>
                                                    handleColorSelect(
                                                        color.value
                                                    )
                                                }
                                                aria-pressed={isActive}
                                                title={color.label}
                                                className={`h-10 w-10 border transition ${
                                                    isActive
                                                        ? "border-black ring-1 ring-black ring-offset-2 ring-offset-[#fbf9f8]"
                                                        : "border-zinc-300 hover:scale-95"
                                                } ${!color.in_stock ? "opacity-40" : ""}`}
                                                style={{
                                                    backgroundColor:
                                                        color.value,
                                                }}
                                            >
                                                <span className="sr-only">
                                                    {color.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}

                        {product.sizes?.length ? (
                            <div className="space-y-3">
                                <div className="flex items-end justify-between gap-4">
                                    <label className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-zinc-400">
                                        Select Size - IT
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowSizeChart(
                                                (currentValue) =>
                                                    !currentValue
                                            )
                                        }
                                        className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-black underline"
                                    >
                                        {showSizeChart
                                            ? "Hide Size Chart"
                                            : "Size Chart"}
                                    </button>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {product.sizes.map((size) => {
                                        const isActive =
                                            size.value === selectedSize;

                                        return (
                                            <button
                                                key={size.value}
                                                type="button"
                                                disabled={!size.available}
                                                onClick={() =>
                                                    size.available &&
                                                    handleSizeSelect(
                                                        size.value
                                                    )
                                                }
                                                className={`py-3 font-['Space_Grotesk'] text-sm transition ${
                                                    !size.available
                                                        ? "cursor-not-allowed border border-zinc-200 text-zinc-300"
                                                        : isActive
                                                          ? "border border-black bg-black text-white"
                                                          : "border border-zinc-300 hover:border-black"
                                                }`}
                                            >
                                                {size.value}
                                            </button>
                                        );
                                    })}
                                </div>

                                {showSizeChart ? (
                                    product.size_chart_html ? (
                                        <div
                                            className="prose prose-sm max-w-none border border-zinc-200 bg-white p-4"
                                            dangerouslySetInnerHTML={{
                                                __html: product.size_chart_html,
                                            }}
                                        />
                                    ) : (
                                        <div className="border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
                                            No size chart available for this
                                            product.
                                        </div>
                                    )
                                ) : null}
                            </div>
                        ) : null}

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex items-center border border-zinc-300">
                                    <button
                                        type="button"
                                        onClick={decrementQuantity}
                                        className="px-4 py-3 transition hover:bg-[#efeded]"
                                    >
                                        -
                                    </button>
                                    <input
                                        readOnly
                                        type="text"
                                        value={String(quantity).padStart(
                                            2,
                                            "0"
                                        )}
                                        className="w-12 border-none bg-transparent text-center font-['Space_Grotesk'] text-sm focus:ring-0"
                                    />
                                    <button
                                        type="button"
                                        onClick={incrementQuantity}
                                        disabled={quantity >= availableQuantity}
                                        className="px-4 py-3 transition hover:bg-[#efeded] disabled:cursor-not-allowed disabled:text-black/25"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={!selectedVariant?.in_stock}
                                    className="flex-1 bg-black py-4 font-['Inter'] text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-black/35"
                                >
                                    {selectedVariant?.in_stock
                                        ? isAddedToCart ? "Added To Cart" : "Add To Cart"
                                        : "Out Of Stock"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!Cookies.get("user_token")) {
                                            navigate("/sign-in", { state: { redirectTo: window.location.pathname } });
                                            return;
                                        }
                                        setIsPinModalOpen(true);
                                    }}
                                    className="border border-zinc-300 p-4 transition-colors hover:bg-[#efeded]"
                                >
                                    <span
                                        className="material-symbols-outlined"
                                        style={{ fontVariationSettings: "'FILL' 0" }}
                                    >
                                        bookmark
                                    </span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleBuyNow}
                                disabled={!selectedVariant?.in_stock}
                                className="w-full border-2 border-black py-4 font-['Inter'] text-sm font-black uppercase tracking-widest transition-all hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-black/25 disabled:text-black/30"
                            >
                                Buy It Now
                            </button>
                        </div>

                        <div className="space-y-4 border-t border-zinc-300 pt-8">
                            <h3 className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-zinc-400">
                                The Narrative
                            </h3>
                            {product.description_html ? (
                                <div
                                    className="prose prose-sm max-w-none text-zinc-700"
                                    dangerouslySetInnerHTML={{
                                        __html: product.description_html,
                                    }}
                                />
                            ) : (
                                <p className="text-sm leading-relaxed text-zinc-700">
                                    No editorial description has been added for
                                    this archive piece yet.
                                </p>
                            )}

                            <ul className="space-y-2 font-['Space_Grotesk'] text-[11px] uppercase tracking-widest text-zinc-500">
                                {details.map((detail) => (
                                    <li key={detail.label}>
                                        - {detail.label}: {detail.value}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6 border-t border-zinc-300 pt-8">
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-zinc-400">
                                    Authenticated Reviews ({reviewCount})
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex text-[10px]">
                                        {starIndexes.map((value) => (
                                            <span
                                                key={value}
                                                className="material-symbols-outlined text-[14px]"
                                                style={{
                                                    fontVariationSettings:
                                                        value <=
                                                        Math.round(
                                                            reviewAverage
                                                        )
                                                            ? "'FILL' 1"
                                                            : "'FILL' 0",
                                                }}
                                            >
                                                star
                                            </span>
                                        ))}
                                    </div>
                                    <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-zinc-500">
                                        {reviewAverage || "0.0"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {product.reviews?.length ? (
                                    product.reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="bg-white p-4"
                                        >
                                            <div className="mb-2 flex justify-between gap-4">
                                                <span className="text-[10px] font-black uppercase">
                                                    {review.author}
                                                </span>
                                                <span className="text-[10px] uppercase text-zinc-400">
                                                    {review.date}
                                                </span>
                                            </div>
                                            <div className="mb-3 flex text-[10px]">
                                                {starIndexes.map((value) => (
                                                    <span
                                                        key={value}
                                                        className="material-symbols-outlined text-[14px]"
                                                        style={{
                                                            fontVariationSettings:
                                                                value <=
                                                                review.rating
                                                                    ? "'FILL' 1"
                                                                    : "'FILL' 0",
                                                        }}
                                                    >
                                                        star
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-xs italic leading-relaxed text-zinc-700">
                                                &quot;{review.comment}&quot;
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white p-4 text-sm text-zinc-500">
                                        No approved reviews yet for this
                                        product.
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>

                <div className="h-24 md:hidden" />
            </main>

            <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around bg-[#fbf9f8] px-4 py-3 md:hidden">
                <div className="absolute left-0 top-0 h-px w-full bg-[#dbdad9]" />

                {mobileNavItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.to}
                        className={`flex flex-col items-center justify-center font-['Space_Grotesk'] text-[10px] uppercase tracking-widest transition-transform active:scale-90 ${
                            item.active
                                ? "font-bold text-black"
                                : "text-zinc-400"
                        }`}
                    >
                        <span
                            className="material-symbols-outlined mb-1"
                            style={{
                                fontVariationSettings: item.active
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                            }}
                        >
                            {item.icon}
                        </span>
                        {item.label}
                    </Link>
                ))}
            </nav>
            <PinModal 
                isOpen={isPinModalOpen} 
                onClose={() => setIsPinModalOpen(false)} 
                productId={product.id} 
            />
        </div>
    );
};

export default ProductPage;
