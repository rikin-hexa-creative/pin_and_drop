import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useVendorProfile } from "../../apis/vendor.api";
import ProductCard from "../../components/product/ProductCard";

const StatBlock = ({ label, value }) => (
    <div className="min-w-[110px]">
        <p className="text-2xl font-black tracking-tight text-black">{value}</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
            {label}
        </p>
    </div>
);

const VendorProfilePage = () => {
    const { id } = useParams();
    const { data: vendor, error, isLoading } = useVendorProfile(id);
    const [activeTab, setActiveTab] = useState("posts");

    const vendorDescription = vendor?.description?.trim() || "No Discription";

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f6f3ef] px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl animate-pulse space-y-6">
                    <div className="h-72 rounded-[36px] bg-white" />
                    <div className="h-48 rounded-[36px] bg-white" />
                    <div className="h-[420px] rounded-[36px] bg-white" />
                </div>
            </div>
        );
    }

    if (error?.response?.status === 404 || !vendor) {
        return (
            <div className="min-h-screen bg-[#f6f3ef] px-6 py-20 text-center">
                <div className="mx-auto max-w-3xl rounded-[30px] border border-black/8 bg-white p-10 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                        Vendor Not Found
                    </p>
                    <h1 className="mt-4 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        This vendor profile is no longer available.
                    </h1>
                    <Link
                        to="/shop"
                        className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                    >
                        Browse The Archive
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen mt-16 bg-[linear-gradient(180deg,#f6f3ef_0%,#efebe6_100%)] pb-16">
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="rounded-[34px] border border-black/8 bg-white p-6 shadow-[0_22px_70px_rgba(0,0,0,0.08)] sm:p-8">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#f4efe9] shadow-[0_18px_45px_rgba(0,0,0,0.12)] sm:h-36 sm:w-36">
                                {vendor.logo ? (
                                    <img
                                        src={vendor.logo}
                                        alt={vendor.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-black text-3xl font-black uppercase text-white">
                                        {vendor.name.slice(0, 2)}
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                                    Verified Vendor
                                </p>
                                <h1 className="mt-3 font-['Inter'] text-4xl font-black uppercase leading-none tracking-tight text-black sm:text-5xl">
                                    {vendor.name}
                                </h1>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-black/65">
                                    {vendor.description ||
                                        "No brand narrative has been added for this vendor yet."}
                                </p>
                                {/* <div className="mt-5 flex flex-wrap gap-3">
                                    {vendor.email ? (
                                        <a
                                            href={`mailto:${vendor.email}`}
                                            className="rounded-full border border-black/12 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                                        >
                                            {vendor.email}
                                        </a>
                                    ) : null}
                                    {vendor.phone ? (
                                        <a
                                            href={`tel:${vendor.phone}`}
                                            className="rounded-full border border-black/12 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                                        >
                                            {vendor.phone}
                                        </a>
                                    ) : null}
                                </div> */}
                            </div>
                        </div>

                        <div className="grid gap-4 rounded-[28px] bg-[#faf6f1] p-5 sm:grid-cols-2 lg:min-w-[320px]">
                            <StatBlock
                                label="Posted Products"
                                value={vendor.stats.products_count}
                            />
                            {/* <StatBlock
                                label="Sold Items"
                                value={vendor.stats.sold_items_count}
                            /> */}
                            <StatBlock
                                label="Featured"
                                value={vendor.stats.featured_products_count}
                            />
                            <StatBlock
                                label="Member Since"
                                value={vendor.member_since ?? "N/A"}
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-8 rounded-[34px] border border-black/8 bg-white p-6 shadow-[0_22px_70px_rgba(0,0,0,0.08)] sm:p-8">
                    <div className="flex flex-col gap-4 border-b border-black/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab("posts")}
                                className={`pb-3 text-sm font-black uppercase tracking-[0.18em] ${
                                    activeTab === "posts"
                                        ? "border-b-2 border-black text-black"
                                        : "text-black/35"
                                }`}
                            >
                                Posts
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("about")}
                                className={`pb-3 text-sm font-black uppercase tracking-[0.18em] ${
                                    activeTab === "about"
                                        ? "border-b-2 border-black text-black"
                                        : "text-black/35"
                                }`}
                            >
                                About
                            </button>
                        </div>

                        <Link
                            to="/shop"
                            className="inline-flex w-fit rounded-full border border-black/12 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                        >
                            Back To Shop
                        </Link>
                    </div>

                    {activeTab === "posts" ? (
                        vendor.products?.length ? (
                            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {vendor.products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        variant="shop"
                                        title={product.name}
                                        image={product.image}
                                        size={product.size}
                                        price={product.price_formatted}
                                        brand={product.brand}
                                        badge={product.badge}
                                        to={`/product/${product.id}`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-8 rounded-[28px] border border-dashed border-black/10 bg-[#faf6f1] px-6 py-20 text-center">
                                <p className="font-['Inter'] text-2xl font-black uppercase tracking-tight text-black">
                                    No public posts yet
                                </p>
                                <p className="mt-3 text-sm leading-6 text-black/60">
                                    When this vendor publishes approved active
                                    products, they will appear here.
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="mt-8 rounded-[28px] border border-black/8 bg-[#faf6f1] px-6 py-10">
                            <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                                About Vendor
                            </p>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/70">
                                {vendorDescription}
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default VendorProfilePage;
