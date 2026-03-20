
import ProductCard from "../components/product/ProductCard";

const heroStats = [
    { label: "Active listings", value: "3.2M+" },
    { label: "Verified sellers", value: "180k" },
    { label: "Countries served", value: "120+" },
    { label: "Daily drops", value: "45k" },
];

const designers = [
    "Raf Simons",
    "Prada Sport",
    "Rick Owens",
    "Kapital",
    "Acronym",
    "Visvim",
    "Bottega",
    "Stone Island",
    "Our Legacy",
    "Jil Sander",
];

const collections = [
    {
        title: "Archive Outerwear",
        subtitle: "Cold weather grails",
        image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "Footwear Rotation",
        subtitle: "Sneakers and boots",
        image:
            "https://images.unsplash.com/photo-1521579971123-119293719870?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "Tailored Edge",
        subtitle: "Sharp layers",
        image:
            "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
    },
];

const drops = [
    {
        title: "Acronym J91-WS",
        size: "M",
        price: "$1,240",
        image:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "Bottega Pouch",
        size: "OS",
        price: "$780",
        image:
            "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "Raf Simons MA-1",
        size: "L",
        price: "$920",
        image:
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "Our Legacy Mohair",
        size: "M",
        price: "$260",
        image:
            "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "Stone Island Shell",
        size: "L",
        price: "$540",
        image:
            "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "Prada Sport Nylon",
        size: "M",
        price: "$430",
        image:
            "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=800&q=80",
    },
];

const HomePage = () => {
    return (
        <div className="pb-16">
            <section className="relative overflow-hidden px-4 pb-20 pt-16">
                <div className="pointer-events-none absolute -left-10 top-10 h-72 w-72 rounded-full bg-[#f2b15c]/30 blur-[120px]" />
                <div className="pointer-events-none absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-[#6f9ce8]/30 blur-[140px]" />

                <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-8 animate-[fade-up_0.8s_ease-out]">
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/60">
                            Curated menswear marketplace
                        </p>
                        <h1
                            className="text-4xl font-semibold leading-tight text-black sm:text-5xl lg:text-6xl"
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                            }}
                        >
                            Discover rare pieces, iconic designers, and the next
                            grail.
                        </h1>
                        <p className="max-w-xl text-base text-black/70">
                            Shop verified listings from the worlds best
                            wardrobes. Every day brings fresh drops, curated
                            edits, and exclusive price drops tailored to your
                            style.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <button className="rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5">
                                Shop menswear
                            </button>
                            <button className="rounded-full border border-black/20 bg-white/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:-translate-y-0.5">
                                Sell an item
                            </button>
                        </div>
                        <div
                            className="grid gap-4 sm:grid-cols-2 animate-[fade-up_0.9s_ease-out]"
                            style={{ animationDelay: "0.1s" }}
                        >
                            {heroStats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-black/10 bg-white/70 px-5 py-4 shadow-sm"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
                                        {stat.label}
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-black">
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="relative animate-[fade-up_1s_ease-out]"
                        style={{ animationDelay: "0.15s" }}
                    >
                        <div className="absolute inset-0 -rotate-3 rounded-[32px] border border-black/10 bg-white/50 shadow-2xl shadow-black/10" />
                        <div className="relative grid gap-4 rounded-[32px] border border-black/10 bg-white p-4 shadow-2xl shadow-black/10 sm:grid-cols-2">
                            <div className="overflow-hidden rounded-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80"
                                    alt="Featured look"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col justify-between gap-4 rounded-2xl bg-black p-5 text-white">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                                        Editors pick
                                    </p>
                                    <h3 className="mt-3 text-2xl font-semibold">
                                        The modern archive uniform
                                    </h3>
                                    <p className="mt-2 text-sm text-white/70">
                                        Layered silhouettes and utilitarian
                                        detail, sourced from top sellers.
                                    </p>
                                </div>
                                <button className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.25em]">
                                    Explore edit
                                </button>
                            </div>
                            <div className="col-span-2 grid gap-3 rounded-2xl border border-black/10 bg-[#f6f3ef] p-4 sm:grid-cols-3">
                                {collections.map((item) => (
                                    <div key={item.title} className="space-y-3">
                                        <div className="h-28 overflow-hidden rounded-2xl">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-black">
                                                {item.title}
                                            </p>
                                            <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                                                {item.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-2xl font-semibold text-black">
                            Trending designers
                        </h2>
                        <button className="text-xs font-semibold uppercase tracking-[0.3em] text-black/60">
                            View all
                        </button>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                        {designers.map((designer) => (
                            <span
                                key={designer}
                                className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70"
                            >
                                {designer}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 pt-16">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-2xl font-semibold text-black">
                            Fresh drops
                        </h2>
                        <div className="flex gap-3">
                            <button className="rounded-full border border-black/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-black/60">
                                Filters
                            </button>
                            <button className="rounded-full bg-black px-4 py-2 text-xs uppercase tracking-[0.3em] text-white">
                                Shop now
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {drops.map((drop, index) => (
                            <ProductCard
                                key={drop.title}
                                {...drop}
                                badge="Verified"
                                variant="shop"
                                animationDelay={`${index * 0.05}s`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 pt-16">
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-8 rounded-[32px] border border-black/10 bg-white/80 p-8 shadow-xl shadow-black/10 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/50">
                                The Grailed edit
                            </p>
                            <h2
                                className="text-3xl font-semibold text-black"
                                style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                }}
                            >
                                Archive staples, reimagined for the modern
                                wardrobe.
                            </h2>
                            <p className="text-sm text-black/70">
                                Explore expertly curated capsules built by our
                                editorial team. Each collection mixes cult
                                classics and new arrivals to keep your rotation
                                fresh.
                            </p>
                            <button className="rounded-full bg-black px-5 py-2 text-xs uppercase tracking-[0.3em] text-white">
                                Read the edit
                            </button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="overflow-hidden rounded-3xl">
                                <img
                                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
                                    alt="Editorial look"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="grid gap-4">
                                <div className="overflow-hidden rounded-3xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=800&q=80"
                                        alt="Editorial detail"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="rounded-3xl bg-black px-6 py-8 text-white">
                                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                                        Community spotlight
                                    </p>
                                    <p className="mt-4 text-lg font-semibold">
                                        48-hour drop events every weekend.
                                    </p>
                                    <p className="mt-2 text-sm text-white/70">
                                        Limited releases, exclusive sellers, and
                                        rare pieces only available on Grailed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
