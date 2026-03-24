import ProductCard from "../../../components/product/ProductCard";

const navItems = ["Shop", "Designers", "Editorial", "Archive"];

const filters = [
    { icon: "sell", label: "Designers", active: true },
    { icon: "category", label: "Categories" },
    { icon: "straighten", label: "Sizes" },
    { icon: "payments", label: "Price" },
];

const products = [
    {
        brand: "Rick Owens",
        title: "Archival Stooges Leather Jacket",
        size: "48 (M)",
        price: "$1,450",
        badge: "New",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfHsVRJhepzWSQOL0mrubE9H8a4Ma5Yz-_h5OKuXvEwFXam8lE02Iaz-icMKy_ODZDEspvVyLhiT4giqHEZQ8evrnU2MTkunycQcWEzqJlSShRf4wGWdZ3TGzeod_kasbzmCpM1RnQaAn53ieSinsKIyfOz_8sB-JMzIQZ0A535ec456o3CyW1q62Xs4LpXGr9m5RBAdKmJlH4lwvrdR07TwELm2ltwKXdUXFr9reCtD119Uc0D_pSTPRrqF90zC4ey134M97xlwiq",
    },
    {
        brand: "Maison Margiela",
        title: "GAT Replica Sneakers 'White/Grey'",
        size: "42",
        price: "$425",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBR2rKM6XPDtfr5xw9Vqc5AFmUVi7SqdF0qSWr7hwAU7id66PehWsLx6MCRmPpzmYNH5yn8O8LMOnVIty5IKWDxbmm5crCX8WYJSEYo153mDtlc0k3dUV8jl7ynblWj2EEztUrhI-sC5O5Y7qBHvhm4glokCuJ3hGgkQSBRmOyo6rzp0SY5mU0sFIkWy6kW-UuAobuk7ymfZY0-7F3S6XaTL6-lJdYuqAYq-4bqe82iQ1C72873ltMtL6FfCOhSTer6Zl6p6yIiZoEp",
    },
    {
        brand: "Jil Sander",
        title: "Heavyweight Boxy Tee",
        size: "L",
        price: "$280",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC51X9xFEuNufzBbwPhFRijyXFmWmuSpkvrnZpDxHJDc2lVCP9qlUaLXaUnV3CoaM2MBaz2WS8PBhGt-77YN8Fp1iEOLZAPCrvq2__bjwWHMGvJJUBAEiYZhsq-CmWIwu6uCTJ7h8Lvsy-R4bJ1oT0RLdlZNfy9avCCx1u0s5mmqgiyQW48Cj1r937ggUe3fMpxNYgvxvSidId6m8gkyNjlxc3c2ttE383UNX91Mr4BxW2Zl3IVItvP-ixAnZ8oGP4C5cS_WTjdahQI",
    },
    {
        brand: "Yohji Yamamoto",
        title: "Pour Homme Gabardine Trousers",
        size: "32",
        price: "$690",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKd4JuOQrg8vHH2bb-iQcPnhkk6mqzFk60zuChkqIY5nF3jH3pMGWGbJPUON-zTSzThCPcrLriHPquiBy8vHMK9COqe_5u3pfb04AVjoQ1MvWF7TDUIp_7unRH8umyYsXVolNXgFiHJv6LrDXSjigHGbu1k62Nnkza4V2oFlEz0FhgzstRRXSBmvPCL-s8sN_CuG8LGc24cripKWl27Yf9Xbi0NGhQ-SGk_ao7RavFRjmKWm1mUrmILv3UAMUnYW1ilBq7hM6QjrW3",
    },
    {
        brand: "Helmut Lang",
        title: "1998 Raw Denim Trucker",
        size: "46 (S)",
        price: "$850",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsi_SJR4ESoaJ3fIteH8V5SyLuRe6pFK21l-vlEB7XIPvOH4uOIllRawWiELr-V-7JDNxpd9Hb_KZjO-3ui6zG-BLm0GAFtLDWT-PRKbM-Z3ZlNAg6hRHHr0-T-oYmCVHIZ9iGMr184d98i9ykCVX8bf0Du6mlpDKw7Obv_EhbZ10e27PiRrWX5dbJusGF6hwQhOEjOKJtYuIR1QpRQ2VLHjDp1rtlYiO6NCbwHkwnLZ9FTtAyGqWKfoIXQnwu1NbqzQeKbqEylPwc",
    },
    {
        brand: "Prada",
        title: "Technical Knit Half-Zip",
        size: "M",
        price: "$520",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3AgIgnnajIKVQE-4W-NVij2CeXqfhqT7xCZvtSbP5KN7oGSuq-RxjiT6zGfLcHDFCp9SinzlAlicly4Dyo7Cj2yv20xSh7LgAhrAybz0HLXjH3nqeId59Iu1UFIXdOfGfhfr6GXa4mQthIfatWcl_6ioA1dGKr44_fX02c47XGQ8-GNjUanx8PGlQtvNngphoWwHDfDmG0I05TR8q2Qhj837mpwIBEdTYrmquCo-Rs5_wu1-GwNAqRGrinhZjWbXw1Jr-4ta5iQVu",
    },
    {
        brand: "Saint Laurent",
        title: "Classic Chesterfield Wool Coat",
        size: "50 (L)",
        price: "$2,100",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0jkQ9Z_8d2YZwCC89Ebed-mc-3lhzUCUbrbugiIPi-90JPdVvWX-JUbcoluf6Tspe6rp1Pcl9lkO-mbGsWIpL4N_YsWJzUL9juFi5zqd9H7i9pFXy9k9RqCAdcqlU6i7XFC1IyPCLZJ-LIZJ6qcvsNRRgicvS4gXbUH0WTvRZ1PpbdeRPz4V25NuyImgQfUs000DO62pgJIWYwUpj10zYy8p12BRx6zj4k2Qx9sP0zbOg9jZmoPFC9USY7bHD8TJd9G1hTdcB0f4A",
    },
    {
        brand: "Balenciaga",
        title: "WFP Oversized Hoodie Black",
        size: "S (Fits L)",
        price: "$640",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPDy31d2okfGby24I0SwxtLJ_EF_-vR39jy8CTfPYw99nfAmRAKKW1rs9MJpJkwlQd-McHg79A2iqO3DfZ4Punzikij2PE7QCoWdXN0ZMuHTt9uvTInIb3Td2Td7w3I9hVSV4bpBPbp40lgqW1Zxb6i2ngF6M1f1kfPDgfBZ-u4npfcFX46bZjNGCPEUookb2lqUtX5s5H9UBv8fXBRIzijafkSl4YLtijACvADkDzaS_G3WgKle20XFpjEF0EXVBk37SJR9ON_31Y",
    },
];

const ShopPage = () => {
    return (
        <div className="bg-[#fbf9f8] text-[#1b1c1c] selection:bg-black selection:text-white">
            <nav className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-none bg-[#fbf9f8]/95 px-8 backdrop-blur-xl">
                <div className="text-2xl font-black uppercase tracking-tighter text-black font-['Inter']">
                    THE DIGITAL CURATOR
                </div>
                <div className="hidden items-center gap-8 md:flex">
                    {navItems.map((item) => (
                        <a
                            key={item}
                            href="#"
                            className={`font-['Inter'] font-black uppercase tracking-tighter transition-colors duration-150 ${
                                item === "Shop"
                                    ? "border-b-2 border-black pb-1 text-black"
                                    : "text-black/50 hover:text-black"
                            }`}
                        >
                            {item}
                        </a>
                    ))}
                </div>
                <div className="flex items-center gap-6">
                    <button
                        className="transition-transform active:scale-95"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-black">
                            shopping_bag
                        </span>
                    </button>
                    <button
                        className="transition-transform active:scale-95"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-black">
                            person
                        </span>
                    </button>
                </div>
            </nav>

            <main className="min-h-screen pt-24">
                <div className="mx-auto flex max-w-[1600px] gap-12 px-8">
                    <aside className="sticky top-24 hidden h-[calc(100vh-6rem)] w-64 flex-col gap-6 overflow-y-auto bg-[#fbf9f8] pt-8 lg:flex">
                        <div className="mb-4">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-black font-['Space Grotesk']">
                                Filter
                            </h2>
                            <p className="mt-1 text-[10px] uppercase tracking-widest text-black/40">
                                Refine Selection
                            </p>
                        </div>
                        <div className="space-y-8">
                            {filters.map((filter) => (
                                <div
                                    key={filter.label}
                                    className="group cursor-pointer"
                                >
                                    <div
                                        className={`flex items-center gap-3 font-bold transition-all ${
                                            filter.active
                                                ? "text-black"
                                                : "text-black/40 group-hover:text-black"
                                        }`}
                                    >
                                        <span className="material-symbols-outlined">
                                            {filter.icon}
                                        </span>
                                        <span className="text-xs uppercase tracking-widest font-['Space Grotesk']">
                                            {filter.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto pb-8">
                            <button
                                className="text-[10px] font-bold uppercase tracking-widest text-[#bc0000] transition-opacity hover:opacity-80 font-['Space Grotesk']"
                                type="button"
                            >
                                Clear All
                            </button>
                        </div>
                    </aside>

                    <section className="flex-1">
                        <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
                            <div className="w-full md:max-w-md">
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest font-['Space Grotesk']">
                                    Search Archive
                                </label>
                                <div className="group relative">
                                    <input
                                        className="w-full border-b border-black/20 bg-transparent px-0 py-2 text-sm uppercase tracking-tighter placeholder:text-black/20 focus:border-black focus:outline-none focus:ring-0 font-['Inter']"
                                        placeholder="Search by designer, item, or era"
                                        type="text"
                                    />
                                    <span className="material-symbols-outlined absolute bottom-2 right-0 text-black/40">
                                        search
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <select className="cursor-pointer appearance-none border-none bg-transparent pr-8 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-0 font-['Space Grotesk']">
                                        <option>Sort: Default</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                        <option>Newest Arrivals</option>
                                    </select>
                                    <span className="material-symbols-outlined pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-xs">
                                        expand_more
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.title}
                                    variant="shop"
                                    {...product}
                                />
                            ))}
                        </div>

                        <div className="mt-20 flex flex-col items-center gap-6">
                            <button
                                className="bg-black px-12 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-black/80 font-['Inter']"
                                type="button"
                            >
                                Load More Pieces
                            </button>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 font-['Space Grotesk']">
                                Viewing 8 of 142 Items
                            </p>
                        </div>
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
                            <a
                                key={item}
                                href="#"
                                className="text-[10px] uppercase tracking-widest text-black/60 transition-colors hover:text-black font-['Space Grotesk']"
                            >
                                {item}
                            </a>
                        )
                    )}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-black/40 font-['Space Grotesk']">
                    © 2024 THE DIGITAL CURATOR. ALL RIGHTS RESERVED.
                </div>
            </footer>
        </div>
    );
};

export default ShopPage;
