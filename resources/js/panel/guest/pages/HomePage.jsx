import { useState } from "react";
import { Link } from "react-router-dom";
import { useHomepageCategories } from "../../../apis/homepage.api";
import {
    collections,
    heroSlides,
    heroStats,
    homepageModules,
    vendors,
} from "../../data/home-page.data";

const CarouselButton = ({ direction = "next", onClick }) => (
    <button
        type="button"
        aria-label={direction === "next" ? "Next slide" : "Previous slide"}
        onClick={onClick}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur transition hover:bg-black/70"
    >
        <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={`h-4 w-4 ${
                direction === "prev" ? "rotate-90" : "-rotate-90"
            }`}
        >
            <path
                d="m3.65 6.15 3.53 3.53h1.64l3.53-3.53"
                fill="none"
                className="stroke-current"
                strokeWidth="1.5"
                strokeLinecap="square"
            />
        </svg>
    </button>
);

const PreviewImageGrid = ({ images, title }) => (
    <div className="grid h-[320px] grid-cols-3 grid-rows-2 gap-2">
        <div className="col-span-2 row-span-2 overflow-hidden rounded-[22px]">
            <img
                src={images[0]}
                alt={title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
        </div>

        {images.slice(1, 5).map((image, index) => (
            <div
                key={`${title}-${index}`}
                className="relative overflow-hidden rounded-[22px]"
            >
                <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                {index === 3 && (
                    <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/55 via-transparent to-transparent p-3">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
                            View More
                        </span>
                    </div>
                )}
            </div>
        ))}
    </div>
);

const HomepageModuleCard = ({ module }) => {
    if (module.kind === "feature") {
        return (
            <a
                href={module.href}
                className="group overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:col-span-2"
            >
                <div className="grid lg:grid-cols-[1.15fr_0.85fr] h-full">
                    <div className="overflow-hidden">
                        <img
                            src={module.image}
                            alt={module.title}
                            className="h-full min-h-[260px] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                    </div>
                    <div className="flex flex-col justify-center gap-4 bg-[#f6f3ef] p-6 lg:p-8">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/55">
                            {module.tag}
                        </p>
                        <h3 className="max-w-md text-3xl font-semibold leading-tight text-black">
                            {module.title}
                        </h3>
                        <p className="max-w-md text-sm leading-6 text-black/70">
                            {module.description}
                        </p>
                        <span className="inline-flex w-fit rounded-full border border-black/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition group-hover:bg-black group-hover:text-white">
                            Explore
                        </span>
                    </div>
                </div>
            </a>
        );
    }

    return (
        <a
            href={module.href}
            className="group rounded-[30px] border border-black/10 bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.06)] transition hover:-translate-y-1"
        >
            <div className="space-y-4">
                <div className="space-y-1">
                    <p className="text-[11px] font-medium tracking-[0.02em] text-black/55">
                        {module.tag}
                    </p>
                    <h3 className="text-lg font-semibold text-black">
                        {module.title}
                    </h3>
                </div>
                <PreviewImageGrid images={module.images} title={module.title} />
            </div>
        </a>
    );
};

const CategoryGroup = ({ group }) => (
    <section className="rounded-[30px] border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
        <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-black">{group.title}</h2>
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
                Browse
            </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {group.items.map((item) => (
                <a
                    key={item.title}
                    href={item.href}
                    className="group rounded-[24px] border border-black/8 bg-[#faf8f5] p-3 transition hover:-translate-y-1 hover:bg-white"
                >
                    <div className="aspect-square overflow-hidden rounded-[18px] bg-black/5">
                        <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                        />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-black">
                        {item.title}
                    </p>
                </a>
            ))}
        </div>
    </section>
);

const HomePage = () => {
    const [activeHeroSlide, setActiveHeroSlide] = useState(0);
    const { data: categoriesData, isLoading: isCategoriesLoading } =
        useHomepageCategories();
    console.log(categoriesData);

    const categoryGroups = categoriesData
        ? Object.values(categoriesData).map((group) => ({
              title:
                  group.title ||
                  (group.id === "menswear"
                      ? "Shop Menswear"
                      : group.id === "womenswear"
                      ? "Shop Womenswear"
                      : group.label),
              items: group.columns.map((col) => ({
                  title: col.heading.label,
                  image: col.heading.image,
                  href: col.heading.to,
              })),
          }))
        : [];

    const showPreviousSlide = () => {
        setActiveHeroSlide((current) =>
            current === 0 ? heroSlides.length - 1 : current - 1
        );
    };

    const showNextSlide = () => {
        setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    };

    return (
        <div className="pb-16">
            <section className="relative overflow-hidden px-4 pb-20 pt-16">
                <div className="pointer-events-none absolute -left-10 top-10 h-72 w-72 rounded-full bg-[#f2b15c]/30 blur-[120px]" />
                <div className="pointer-events-none absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-[#6f9ce8]/30 blur-[140px]" />

                <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-8 animate-[fade-up_0.8s_ease-out]">
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/60">
                            Explore Products, Start Selling, Join Now
                        </p>
                        <h1
                            className="text-4xl font-semibold leading-tight text-black sm:text-5xl lg:text-6xl"
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                            }}
                        >
                            Discover. Pin. Wear Your Style.
                        </h1>
                        <p className="max-w-xl text-base text-black/70">
                            A fashion marketplace connecting designers, brands,
                            and style lovers in one place.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                to="/my-feed"
                                className="rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5"
                            >
                                Explore Products
                            </Link>
                            <Link
                                to="/sell"
                                className="rounded-full border border-black/20 bg-white/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:-translate-y-0.5"
                            >
                                Start Selling
                            </Link>
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
                            Trending Vendors
                        </h2>
                        <button className="text-xs font-semibold uppercase tracking-[0.3em] text-black/60">
                            View all
                        </button>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                        {vendors.map((designer) => (
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
                <div className="mx-auto max-w-7xl">
                    <div className="space-y-10">
                        <div
                            className="relative overflow-hidden rounded-[34px] border border-black/10 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.2)]"
                            role="region"
                            aria-roledescription="carousel"
                            aria-label="Featured homepage stories"
                        >
                            <div
                                className="flex transition-transform duration-500 ease-out"
                                style={{
                                    transform: `translateX(-${
                                        activeHeroSlide * 100
                                    }%)`,
                                }}
                            >
                                {heroSlides.map((slide) => (
                                    <article
                                        key={slide.title}
                                        className="relative min-w-full"
                                        aria-roledescription="slide"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent" />
                                        <picture>
                                            <source
                                                media="(max-width: 768px)"
                                                srcSet={slide.mobileImage}
                                            />
                                            <img
                                                src={slide.desktopImage}
                                                alt={slide.title}
                                                className="h-[460px] w-full object-cover sm:h-[520px]"
                                            />
                                        </picture>
                                        <div className="absolute inset-0 flex items-end p-6 sm:p-8 lg:p-12">
                                            <div className="max-w-xl space-y-4 text-white">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                                                    {slide.eyebrow}
                                                </p>
                                                <h2 className="text-4xl font-semibold leading-none sm:text-5xl lg:text-6xl">
                                                    {slide.title}
                                                </h2>
                                                <a
                                                    href={slide.href}
                                                    className="inline-flex rounded-full bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-black transition hover:bg-[#f6f3ef]"
                                                >
                                                    {slide.cta}
                                                </a>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-4 sm:p-6">
                                <div className="flex gap-2">
                                    <CarouselButton
                                        direction="prev"
                                        onClick={showPreviousSlide}
                                    />
                                    <CarouselButton
                                        direction="next"
                                        onClick={showNextSlide}
                                    />
                                </div>
                                <div className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur">
                                    {heroSlides.map((slide, index) => (
                                        <button
                                            key={slide.title}
                                            type="button"
                                            aria-label={`Go to slide ${
                                                index + 1
                                            }`}
                                            aria-current={
                                                activeHeroSlide === index
                                            }
                                            onClick={() =>
                                                setActiveHeroSlide(index)
                                            }
                                            className={`h-2.5 rounded-full transition ${
                                                activeHeroSlide === index
                                                    ? "w-8 bg-white"
                                                    : "w-2.5 bg-white/45"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-3">
                            {homepageModules.map((module) => (
                                <HomepageModuleCard
                                    key={`${module.title}-${module.href}`}
                                    module={module}
                                />
                            ))}
                        </div>

                        {/* <div className="grid gap-6">
                            {isCategoriesLoading ? (
                                <div className="space-y-4">
                                    <div className="h-64 animate-pulse rounded-[30px] bg-black/5" />
                                    <div className="h-64 animate-pulse rounded-[30px] bg-black/5" />
                                </div>
                            ) : (
                                categoryGroups.map((group) => (
                                    <CategoryGroup
                                        key={group.title}
                                        group={group}
                                    />
                                ))
                            )}
                        </div> */}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
