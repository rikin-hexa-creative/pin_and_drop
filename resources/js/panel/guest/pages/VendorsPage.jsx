import { Link } from "react-router-dom";
import { useVendors } from "../../../apis/vendor.api";

const VendorsPage = () => {
    const { data: vendors = [], error, isLoading } = useVendors();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[linear-gradient(180deg,#f6f3ef_0%,#efebe6_100%)] px-4 pb-16 pt-24 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="space-y-3">
                        <div className="h-4 w-28 animate-pulse rounded bg-black/10" />
                        <div className="h-12 w-72 animate-pulse rounded bg-black/10" />
                    </div>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)]"
                            >
                                <div className="h-32 animate-pulse rounded-[24px] bg-[#f4efe9]" />
                                <div className="mt-5 h-4 w-3/4 animate-pulse rounded bg-black/10" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[linear-gradient(180deg,#f6f3ef_0%,#efebe6_100%)] px-4 pb-16 pt-24 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl rounded-[30px] border border-black/8 bg-white p-10 text-center shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                        Vendors Unavailable
                    </p>
                    <h1 className="mt-4 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        We could not load vendors right now.
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f6f3ef_0%,#efebe6_100%)] px-4 pb-16 pt-24 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-7xl">
                <section className="rounded-[34px] border border-black/8 bg-white p-6 shadow-[0_22px_70px_rgba(0,0,0,0.08)] sm:p-8">
                    <div className="max-w-3xl">
                        <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                            Vendor Directory
                        </p>
                        <h1 className="mt-4 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black sm:text-5xl">
                            All Vendors
                        </h1>
                    </div>

                    {vendors.length ? (
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {vendors.map((vendor) => (
                                <Link
                                    key={vendor.id}
                                    to={vendor.profile_link}
                                    className="group rounded-[30px] border border-black/8 bg-[#faf6f1] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:border-black/18 hover:bg-white"
                                >
                                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[24px] bg-white">
                                        {vendor.logo ? (
                                            <img
                                                src={vendor.logo}
                                                alt={vendor.name}
                                                className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-[1.03]"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-black text-4xl font-black uppercase tracking-[0.12em] text-white">
                                                {vendor.name?.slice(0, 2) || "VD"}
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-5 text-center text-sm font-black uppercase tracking-[0.18em] text-black">
                                        {vendor.name}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 rounded-[28px] border border-dashed border-black/10 bg-[#faf6f1] px-6 py-20 text-center">
                            <p className="font-['Inter'] text-2xl font-black uppercase tracking-tight text-black">
                                No vendors available
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default VendorsPage;
