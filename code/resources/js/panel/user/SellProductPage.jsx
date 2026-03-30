import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSellProductById } from "../../apis/sale.api";
import { formatCurrency } from "../../utils/currency";

const DetailSkeleton = () => (
    <div className="bg-[#fbf9f8] text-[#1b1c1c]">
        <main className="mx-auto min-h-screen max-w-[1920px] px-4 pb-20 pt-24 md:px-8 lg:px-12">
            <div className="animate-pulse lg:flex lg:gap-16">
                <div className="flex-1">
                    <div className="aspect-[3/4] bg-black/5" />
                </div>
                <div className="mt-8 space-y-6 lg:mt-0 lg:w-[450px]">
                    <div className="h-4 w-32 bg-black/5" />
                    <div className="h-16 w-full bg-black/5" />
                    <div className="h-8 w-40 bg-black/5" />
                    <div className="h-24 w-full bg-black/5" />
                    <div className="h-40 w-full bg-black/5" />
                </div>
            </div>
        </main>
    </div>
);

const SellProductPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data: sale, error, isLoading } = useSellProductById(id);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (sale?.gallery?.length) {
            setSelectedImageId(sale.gallery[0].id);
        }
    }, [sale]);

    if (isLoading) {
        return <DetailSkeleton />;
    }

    if (error?.response?.status === 404 || !sale) {
        return (
            <div className="bg-[#fbf9f8] text-[#1b1c1c]">
                <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-24 text-center">
                    <div className="space-y-5">
                        <p className="font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.3em] text-black/45">
                            Listing Not Found
                        </p>
                        <h1 className="font-['Inter'] text-4xl font-black uppercase tracking-tighter">
                            This sell listing is no longer available.
                        </h1>
                        <Link
                            to="/sell"
                            className="inline-flex border border-black px-6 py-3 font-['Inter'] text-xs font-black uppercase tracking-[0.22em] transition hover:bg-black hover:text-white"
                        >
                            Return To Sell Feed
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const gallery = sale.gallery ?? [];
    const selectedImage =
        gallery.find((image) => image.id === selectedImageId) ?? gallery[0] ?? null;
    const details = [
        { label: "Seller", value: sale.seller?.name ?? "User Listing" },
        { label: "Condition", value: sale.condition },
        { label: "Added", value: sale.created_date_formatted ?? sale.created_date },
        { label: "Images", value: `${sale.images_count} uploaded` },
    ];

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1600);
        } catch {
            setIsCopied(false);
        }
    };

    const handleBuyNow = () => {
        if (!sale?.id) {
            return;
        }

        const checkoutUrl = `/checkout?source=user_sale&saleId=${sale.id}`;

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

    return (
        <div className="bg-[#fbf9f8] text-[#1b1c1c] selection:bg-black selection:text-white">
            <main className="mx-auto min-h-screen max-w-[1920px] px-4 pb-20 pt-24 md:px-8 lg:px-12 md:pb-0">
                <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
                    <div className="flex flex-1 flex-col-reverse gap-4 md:flex-row">
                        <div className="flex shrink-0 gap-3 overflow-x-auto md:w-24 md:flex-col md:overflow-y-auto">
                            {gallery.map((image) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    onClick={() => setSelectedImageId(image.id)}
                                    className={`h-28 w-20 shrink-0 overflow-hidden bg-[#e9e8e7] transition md:h-32 md:w-full ${
                                        image.id === selectedImage?.id
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
                            ))}
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
                                    User Sale / {sale.condition}
                                </span>
                                <span className="bg-black px-2 py-1 font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.2em] text-white">
                                    Active Listing
                                </span>
                            </div>
                            <h2 className="font-['Inter'] text-xs font-black uppercase tracking-widest text-[#bc0000]">
                                {sale.seller?.name ?? "User Listing"}
                            </h2>
                            <h1 className="font-['Inter'] text-4xl font-black uppercase leading-[0.9] tracking-tighter lg:text-5xl">
                                {sale.name}
                            </h1>
                            <div className="mt-4 flex items-end gap-3 font-['Inter']">
                                <p className="text-2xl">
                                    {formatCurrency(sale.actual_price)}
                                </p>
                                {sale.compare_at_price ? (
                                    <p className="text-base text-black/35 line-through">
                                        {formatCurrency(sale.compare_at_price)}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-3 rounded-[28px] border border-black/8 bg-white p-5">
                            {details.map((detail) => (
                                <div
                                    key={detail.label}
                                    className="flex items-center justify-between gap-4 border-b border-black/8 pb-3 last:border-b-0 last:pb-0"
                                >
                                    <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                        {detail.label}
                                    </span>
                                    <span className="text-sm font-semibold text-black">
                                        {detail.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-[28px] border border-black/8 bg-white p-5">
                                <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                    Ready To Purchase
                                </p>
                                <p className="mt-3 text-sm leading-6 text-black/65">
                                    This is a single-piece user listing. Checkout reserves the listing immediately and marks it sold after the order is created.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    className="mt-5 w-full border-2 border-black bg-black py-4 font-['Inter'] text-sm font-black uppercase tracking-widest text-white transition hover:bg-white hover:text-black"
                                >
                                    Buy It Now
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <Link
                                    to="/sell"
                                    className="flex-1 border border-black px-5 py-4 text-center font-['Inter'] text-sm font-black uppercase tracking-widest transition hover:bg-black hover:text-white"
                                >
                                    Back To Sell Feed
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="border border-zinc-300 px-5 py-4 font-['Inter'] text-sm font-black uppercase tracking-widest transition hover:bg-[#efeded]"
                                >
                                    {isCopied ? "Copied" : "Share"}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-zinc-300 pt-8">
                            <h3 className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-zinc-400">
                                The Narrative
                            </h3>
                            <p className="text-sm leading-relaxed text-zinc-700">
                                {sale.description}
                            </p>
                            <ul className="space-y-2 font-['Space_Grotesk'] text-[11px] uppercase tracking-widest text-zinc-500">
                                {details.map((detail) => (
                                    <li key={detail.label}>
                                        - {detail.label}: {detail.value}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>

                <div className="h-24 md:hidden" />
            </main>
        </div>
    );
};

export default SellProductPage;
