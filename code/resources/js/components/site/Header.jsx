import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCategoryMenu } from "../../apis/categories.api";
import { useVendorMenu } from "../../apis/vendor.api";
import { useUser } from "../../context/UserContext";

const APP_ROUTES = new Set(["/", "/shop"]);

const fallbackVendorsMenu = {
    id: "vendors",
    label: "Vendors",
    title: "Shop Popular vendors",
    cta: { label: "See All Vendors", to: "/vendors" },
    columns: [
        [
            { label: "Acne Studios", to: "/vendors/acne-studios" },
            { label: "Amiri", to: "/vendors/amiri" },
            { label: "Arc'teryx", to: "/vendors/arcteryx" },
            { label: "Balenciaga", to: "/vendors/balenciaga" },
            { label: "Bape", to: "/vendors/bape" },
            { label: "Bottega Veneta", to: "/vendors/bottega-veneta" },
            { label: "Carhartt", to: "/vendors/carhartt" },
            { label: "Celine", to: "/vendors/celine" },
        ],
        [
            { label: "Chanel", to: "/vendors/chanel" },
            { label: "Chrome Hearts", to: "/vendors/chrome-hearts" },
            { label: "Comme des Garcons", to: "/vendors/comme-des-garcons" },
            { label: "Dior", to: "/vendors/dior" },
            {
                label: "Enfants Riches Deprimes",
                to: "/vendors/enfants-riches-deprimes",
            },
            { label: "Gucci", to: "/vendors/gucci" },
            { label: "Kapital", to: "/vendors/kapital" },
            { label: "Louis Vuitton", to: "/vendors/louis-vuitton" },
        ],
        [
            { label: "Maison Margiela", to: "/vendors/maison-margiela" },
            { label: "Moncler", to: "/vendors/moncler" },
            { label: "Nike", to: "/vendors/nike" },
            { label: "Polo Ralph Lauren", to: "/vendors/polo-ralph-lauren" },
            { label: "Prada", to: "/vendors/prada" },
            { label: "Raf Simons", to: "/vendors/raf-simons" },
            { label: "Rick Owens", to: "/vendors/rick-owens" },
            {
                label: "Saint Laurent Paris",
                to: "/vendors/saint-laurent-paris",
            },
        ],
        [
            { label: "Stone Island", to: "/vendors/stone-island" },
            { label: "Stussy", to: "/vendors/stussy" },
            { label: "Supreme", to: "/vendors/supreme" },
            { label: "Undercover", to: "/vendors/undercover" },
            { label: "Vetements", to: "/vendors/vetements" },
            { label: "Vintage", to: "/vendors/vintage" },
            { label: "Vivienne Westwood", to: "/vendors/vivienne-westwood" },
            { label: "Yohji Yamamoto", to: "/vendors/yohji-yamamoto" },
        ],
    ],
};

const fallbackMenswearMenu = {
    id: "menswear",
    label: "MENSWEAR",
    title: "Shop By Category",
    cta: { label: "See All Categories", to: "/categories/all" },
    columns: [
        {
            heading: { label: "Tops", to: "/categories/tops" },
            links: [
                {
                    label: "Long Sleeve T-Shirts",
                    to: "/categories/long-sleeve-t-shirts",
                },
                { label: "Polos", to: "/categories/polos" },
                {
                    label: "Shirts (Button Ups)",
                    to: "/categories/shirts-button-ups",
                },
                {
                    label: "Short Sleeve T-Shirts",
                    to: "/categories/short-sleeve-t-shirts",
                },
                {
                    label: "Sweaters & Knitwear",
                    to: "/categories/sweaters-knitwear",
                },
                {
                    label: "Sweatshirts & Hoodies",
                    to: "/categories/sweatshirts-hoodies",
                },
                {
                    label: "Tank Tops & Sleeveless",
                    to: "/categories/tank-tops-sleeveless",
                },
                { label: "Jerseys", to: "/categories/jerseys" },
            ],
        },
        {
            heading: { label: "Bottoms", to: "/categories/bottoms" },
            links: [
                { label: "Casual Pants", to: "/categories/casual-pants" },
                { label: "Cropped Pants", to: "/categories/cropped-pants" },
                { label: "Denim", to: "/categories/denim" },
                { label: "Leggings", to: "/categories/leggings" },
                {
                    label: "Overalls & Jumpsuits",
                    to: "/categories/overalls-jumpsuits",
                },
                { label: "Shorts", to: "/categories/shorts" },
                {
                    label: "Sweatpants & Joggers",
                    to: "/categories/sweatpants-joggers",
                },
                { label: "Swimwear", to: "/categories/swimwear" },
            ],
        },
        {
            heading: { label: "Outerwear", to: "/categories/outerwear" },
            links: [
                { label: "Bombers", to: "/categories/bombers" },
                { label: "Cloaks & Capes", to: "/categories/cloaks-capes" },
                { label: "Denim Jackets", to: "/categories/denim-jackets" },
                { label: "Heavy Coats", to: "/categories/heavy-coats" },
                { label: "Leather Jackets", to: "/categories/leather-jackets" },
                { label: "Light Jackets", to: "/categories/light-jackets" },
                { label: "Parkas", to: "/categories/parkas" },
                { label: "Raincoats", to: "/categories/raincoats" },
                { label: "Vests", to: "/categories/vests" },
            ],
        },
        {
            heading: { label: "Footwear", to: "/categories/footwear" },
            links: [
                { label: "Boots", to: "/categories/boots" },
                {
                    label: "Casual Leather Shoes",
                    to: "/categories/casual-leather-shoes",
                },
                { label: "Formal Shoes", to: "/categories/formal-shoes" },
                { label: "Hi-Top Sneakers", to: "/categories/hi-top-sneakers" },
                {
                    label: "Low-Top Sneakers",
                    to: "/categories/low-top-sneakers",
                },
                { label: "Sandals", to: "/categories/sandals" },
                { label: "Slip Ons", to: "/categories/slip-ons" },
            ],
        },
        {
            heading: { label: "Accessories", to: "/categories/accessories" },
            links: [
                { label: "Bags & Luggage", to: "/categories/bags-luggage" },
                { label: "Belts", to: "/categories/belts" },
                { label: "Glasses", to: "/categories/glasses" },
                { label: "Gloves & Scarves", to: "/categories/gloves-scarves" },
                { label: "Hats", to: "/categories/hats" },
                {
                    label: "Jewelry & Watches",
                    to: "/categories/jewelry-watches",
                },
                { label: "Wallets", to: "/categories/wallets" },
                {
                    label: "Miscellaneous",
                    to: "/categories/accessories-miscellaneous",
                },
                {
                    label: "Socks & Underwear",
                    to: "/categories/socks-underwear",
                },
                { label: "Sunglasses", to: "/categories/sunglasses" },
                {
                    label: "Ties & Pocketsquares",
                    to: "/categories/ties-pocketsquares",
                },
            ],
        },
        {
            heading: { label: "Tailoring", to: "/categories/tailoring" },
            links: [
                { label: "Blazers", to: "/categories/blazers" },
                { label: "Formal Shirting", to: "/categories/formal-shirting" },
                { label: "Formal Trousers", to: "/categories/formal-trousers" },
                { label: "Suits", to: "/categories/suits" },
                { label: "Tuxedos", to: "/categories/tuxedos" },
                { label: "Vests", to: "/categories/suit-vests" },
            ],
        },
    ],
};

const fallbackWomenswearMenu = {
    id: "womenswear",
    label: "WOMENSWEAR",
    title: "Shop By Category",
    cta: { label: "See All Categories", to: "/categories/womenswear/all" },
    columns: [
        {
            heading: { label: "Tops", to: "/categories/womenswear/tops" },
            links: [
                { label: "Blouses", to: "/categories/womenswear/blouses" },
                { label: "Bodysuits", to: "/categories/womenswear/bodysuits" },
                {
                    label: "Button Ups",
                    to: "/categories/womenswear/button-ups",
                },
                { label: "Crop Tops", to: "/categories/womenswear/crop-tops" },
                { label: "Hoodies", to: "/categories/womenswear/hoodies" },
                {
                    label: "Long Sleeve T-Shirts",
                    to: "/categories/womenswear/long-sleeve-t-shirts",
                },
                { label: "Polos", to: "/categories/womenswear/polos" },
                {
                    label: "Short Sleeve T-Shirts",
                    to: "/categories/womenswear/short-sleeve-t-shirts",
                },
                { label: "Sweaters", to: "/categories/womenswear/sweaters" },
                {
                    label: "Sweatshirts",
                    to: "/categories/womenswear/sweatshirts",
                },
                { label: "Tank Tops", to: "/categories/womenswear/tank-tops" },
            ],
        },
        {
            heading: { label: "Bottoms", to: "/categories/womenswear/bottoms" },
            links: [
                { label: "Jeans", to: "/categories/womenswear/jeans" },
                { label: "Jumpsuits", to: "/categories/womenswear/jumpsuits" },
                { label: "Leggings", to: "/categories/womenswear/leggings" },
                {
                    label: "Maxi Skirts",
                    to: "/categories/womenswear/maxi-skirts",
                },
                {
                    label: "Midi Skirts",
                    to: "/categories/womenswear/midi-skirts",
                },
                {
                    label: "Mini Skirts",
                    to: "/categories/womenswear/mini-skirts",
                },
                { label: "Pants", to: "/categories/womenswear/pants" },
                { label: "Shorts", to: "/categories/womenswear/shorts" },
                {
                    label: "Mini Dresses",
                    to: "/categories/womenswear/mini-dresses",
                },
                {
                    label: "Midi Dresses",
                    to: "/categories/womenswear/midi-dresses",
                },
                {
                    label: "Maxi Dresses",
                    to: "/categories/womenswear/maxi-dresses",
                },
                { label: "Gowns", to: "/categories/womenswear/gowns-dresses" },
            ],
        },
        {
            heading: {
                label: "Outerwear",
                to: "/categories/womenswear/outerwear",
            },
            links: [
                { label: "Blazers", to: "/categories/womenswear/blazers" },
                { label: "Bombers", to: "/categories/womenswear/bombers" },
                { label: "Coats", to: "/categories/womenswear/coats" },
                {
                    label: "Denim Jackets",
                    to: "/categories/womenswear/denim-jackets",
                },
                {
                    label: "Down Jackets",
                    to: "/categories/womenswear/down-jackets",
                },
                {
                    label: "Fur & Faux Fur",
                    to: "/categories/womenswear/fur-faux-fur",
                },
                { label: "Jackets", to: "/categories/womenswear/jackets" },
                {
                    label: "Leather Jackets",
                    to: "/categories/womenswear/leather-jackets",
                },
                {
                    label: "Rain Jackets",
                    to: "/categories/womenswear/rain-jackets",
                },
                { label: "Vests", to: "/categories/womenswear/vests" },
            ],
        },
        {
            heading: {
                label: "Footwear",
                to: "/categories/womenswear/footwear",
            },
            links: [
                { label: "Boots", to: "/categories/womenswear/boots" },
                { label: "Heels", to: "/categories/womenswear/heels" },
                { label: "Platforms", to: "/categories/womenswear/platforms" },
                { label: "Mules", to: "/categories/womenswear/mules" },
                { label: "Flats", to: "/categories/womenswear/flats" },
                {
                    label: "Hi-Top Sneakers",
                    to: "/categories/womenswear/hi-top-sneakers",
                },
                {
                    label: "Low-Top Sneakers",
                    to: "/categories/womenswear/low-top-sneakers",
                },
                { label: "Sandals", to: "/categories/womenswear/sandals" },
                { label: "Slip Ons", to: "/categories/womenswear/slip-ons" },
                { label: "Bracelets", to: "/categories/womenswear/bracelets" },
                { label: "Earrings", to: "/categories/womenswear/earrings" },
                { label: "Necklaces", to: "/categories/womenswear/necklaces" },
                { label: "Rings", to: "/categories/womenswear/rings" },
            ],
        },
        {
            heading: {
                label: "Accessories",
                to: "/categories/womenswear/accessories",
            },
            links: [
                { label: "Belts", to: "/categories/womenswear/belts" },
                { label: "Glasses", to: "/categories/womenswear/glasses" },
                { label: "Gloves", to: "/categories/womenswear/gloves" },
                {
                    label: "Hair Accessories",
                    to: "/categories/womenswear/hair-accessories",
                },
                { label: "Hats", to: "/categories/womenswear/hats" },
                {
                    label: "Miscellaneous",
                    to: "/categories/womenswear/miscellaneous",
                },
                { label: "Scarves", to: "/categories/womenswear/scarves" },
                {
                    label: "Socks & Intimates",
                    to: "/categories/womenswear/socks-intimates",
                },
                {
                    label: "Sunglasses",
                    to: "/categories/womenswear/sunglasses",
                },
                { label: "Wallets", to: "/categories/womenswear/wallets" },
                { label: "Watches", to: "/categories/womenswear/watches" },
            ],
        },
        {
            heading: {
                label: "Bags & Luggage",
                to: "/categories/womenswear/bags-luggage",
            },
            links: [
                { label: "Backpacks", to: "/categories/womenswear/backpacks" },
                { label: "Belt Bags", to: "/categories/womenswear/belt-bags" },
                {
                    label: "Bucket Bags",
                    to: "/categories/womenswear/bucket-bags",
                },
                { label: "Clutches", to: "/categories/womenswear/clutches" },
                {
                    label: "Crossbody Bags",
                    to: "/categories/womenswear/crossbody-bags",
                },
                {
                    label: "Handle Bags",
                    to: "/categories/womenswear/handle-bags",
                },
                { label: "Hobo Bags", to: "/categories/womenswear/hobo-bags" },
                {
                    label: "Luggage & Travel",
                    to: "/categories/womenswear/luggage-travel",
                },
                {
                    label: "Messengers & Satchels",
                    to: "/categories/womenswear/messengers-satchels",
                },
                { label: "Mini Bags", to: "/categories/womenswear/mini-bags" },
                {
                    label: "Shoulder Bags",
                    to: "/categories/womenswear/shoulder-bags",
                },
                { label: "Tote Bags", to: "/categories/womenswear/tote-bags" },
                { label: "Other", to: "/categories/womenswear/other" },
            ],
        },
    ],
};

// const megaMenus = [vendorsMenu, menswearMenu, womenswearMenu];

const merchandisingLinks = [{ label: "COLLECTIONS", to: "/collections" }];

const quickActions = [
    { label: "SELL", to: "/sell/add", bordered: true },
    { label: "MY FEED", to: "/my-feed" },
];

const profileMenu = {
    username: { label: "senyad5139", to: "/user-profile" },
    accountLinks: [
        // { label: "FAVORITES", to: "/favorites" },
        { label: "PIN", to: "/pin" },
        { label: "CART", to: "/cart" },
        { label: "ORDERS", to: "/ordered" },
    ],
    selling: {
        heading: { label: "SELLING", to: "/sell/for-sale" },
        links: [
            { label: "FOR SALE", to: "/sell/for-sale" },
            { label: "SOLD", to: "/sell/sold" },
            // { label: "DRAFTS", to: "/sell/drafts" },
        ],
    },
    settings: {
        heading: { label: "SETTINGS", to: "/users/myprofile" },
    },
};

const AppLink = ({ to, children, ...props }) => {
    return (
        <Link to={to} {...props}>
            {children}
        </Link>
    );
};

const MenuIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none">
        <path
            d="M3 5.75H21"
            className="stroke-current"
            strokeWidth="1.5"
            strokeLinecap="square"
        />
        <path
            d="M3 12H21"
            className="stroke-current"
            strokeWidth="1.5"
            strokeLinecap="square"
        />
        <path
            d="M3 18.25H21"
            className="stroke-current"
            strokeWidth="1.5"
            strokeLinecap="square"
        />
    </svg>
);

const SearchIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none">
        <path
            d="M10.5 18A7.5 7.5 0 1 0 10.5 3a7.5 7.5 0 0 0 0 15Z"
            className="stroke-current"
            strokeWidth="1.75"
        />
        <path
            d="m16 16 5 5"
            className="stroke-current"
            strokeWidth="1.75"
            strokeLinecap="square"
        />
    </svg>
);

const MessageIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none">
        <path
            d="M4 6.25 5.75 4.5h12.5L20 6.25v9.5l-1.75 1.75H7.25L4 20.75V6.25Z"
            className="stroke-current"
            strokeWidth="1.5"
        />
    </svg>
);

const HeartIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none">
        <path
            d="m12 7.5-.74-.73a4.33 4.33 0 0 0-6.12 6.12L12 19.74l6.86-6.85a4.33 4.33 0 1 0-6.12-6.12L12 7.5Z"
            className="stroke-current"
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
    </svg>
);

const CaretIcon = ({ open }) => (
    <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
    >
        <path
            d="m4.25 6.25 3.3 3.3h.9l3.3-3.3"
            fill="none"
            className="stroke-current"
            strokeWidth="1.2"
            strokeLinecap="square"
        />
    </svg>
);

const ForwardCaretIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none">
        <path
            d="M13.75 11.31 8.97 6.53l1.06-1.06 5.22 5.22v2.62l-5.22 5.22-1.06-1.06 4.78-4.78v-1.38Z"
            className="fill-current"
        />
    </svg>
);

const renderDesktopMegaMenu = (menu) => {
    if (!menu) {
        return null;
    }

    if (menu.id === "vendors") {
        return (
            <div className="space-y-6">
                <div className="text-base font-bold tracking-[0.01em] text-black">
                    {menu.title}
                </div>
                <div className="grid gap-8 lg:grid-cols-4">
                    {menu.columns.map((column, index) => (
                        <div key={index} className="space-y-2">
                            {column.map((item) => (
                                <AppLink
                                    key={item.label}
                                    to={item.to}
                                    className="block text-sm tracking-[0.02em] text-black/75 transition hover:text-black"
                                >
                                    {item.label}
                                </AppLink>
                            ))}
                        </div>
                    ))}
                </div>
                <AppLink
                    to={menu.cta.to}
                    className="inline-flex text-[11px] font-bold uppercase tracking-[0.22em] text-black"
                >
                    {menu.cta.label}
                </AppLink>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-base font-bold tracking-[0.01em] text-black">
                {menu.title}
            </div>
            <div className="grid gap-8 lg:grid-cols-6">
                {menu.columns.map((column) => (
                    <div key={column.heading.label} className="space-y-3">
                        <AppLink
                            to={column.heading.to}
                            className="block text-sm font-bold uppercase tracking-[0.08em] text-black"
                        >
                            {column.heading.label}
                        </AppLink>
                        <div className="space-y-2">
                            {column.links.map((item) => (
                                <AppLink
                                    key={item.label}
                                    to={item.to}
                                    className="block text-sm tracking-[0.02em] text-black/75 transition hover:text-black"
                                >
                                    {item.label}
                                </AppLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <AppLink
                to={menu.cta.to}
                className="inline-flex text-[11px] font-bold uppercase tracking-[0.22em] text-black"
            >
                {menu.cta.label}
            </AppLink>
        </div>
    );
};

const renderMobileMegaMenu = (menu) => {
    if (menu.id === "vendors") {
        return (
            <div className="grid gap-2 sm:grid-cols-2">
                {menu.columns.flat().map((item) => (
                    <AppLink
                        key={item.label}
                        to={item.to}
                        className="text-sm tracking-[0.02em] text-black/75 transition hover:text-black"
                    >
                        {item.label}
                    </AppLink>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {menu.columns.map((column) => (
                <div key={column.heading.label} className="space-y-2">
                    <AppLink
                        to={column.heading.to}
                        className="block text-sm font-bold uppercase tracking-[0.08em] text-black"
                    >
                        {column.heading.label}
                    </AppLink>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {column.links.map((item) => (
                            <AppLink
                                key={item.label}
                                to={item.to}
                                className="text-sm tracking-[0.02em] text-black/75 transition hover:text-black"
                            >
                                {item.label}
                            </AppLink>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const Header = () => {
    const { user, setUser } = useUser();
    const { data: vendorsMenuData } = useVendorMenu();
    const { data: categoriesMenuData } = useCategoryMenu();

    const vendorsMenu = vendorsMenuData || fallbackVendorsMenu;
    const menswearMenu = categoriesMenuData?.menswear || fallbackMenswearMenu;
    const womenswearMenu =
        categoriesMenuData?.womenswear || fallbackWomenswearMenu;

    const megaMenus = [vendorsMenu, menswearMenu, womenswearMenu];

    const [activeMenu, setActiveMenu] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const isAuthenticated = Boolean(user);
    const userDisplayName =
        user?.full_name || user?.email || profileMenu.username.label;
    const userAvatar =
        "/storage/" + user?.avatar ||
        "https://media-assets.grailed.com/prd/misc/PVEFHQYACL92VZTZETOTVQNFENXZW7S5U0MLUG";

    useEffect(() => {
        if (!profileMenuOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!profileMenuRef.current?.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [profileMenuOpen]);

    const openMenu = (menuId) => {
        setProfileMenuOpen(false);
        setActiveMenu(menuId);
    };

    const toggleMenu = (menuId) => {
        setProfileMenuOpen(false);
        setActiveMenu((current) => (current === menuId ? null : menuId));
    };

    const toggleMobileMenu = () => {
        setProfileMenuOpen(false);
        setMobileMenuOpen((open) => !open);
    };

    const toggleProfileMenu = () => {
        setActiveMenu(null);
        setMobileMenuOpen(false);
        setProfileMenuOpen((open) => !open);
    };

    const closeProfileMenu = () => setProfileMenuOpen(false);
    const handleSignOut = () => {
        Cookies.remove("user_token");
        setUser(null);
        closeProfileMenu();
        window.location.href = "/sign-in";
    };

    return (
        <header
            id="globalHeader"
            className="sticky top-0 z-50 border-b border-black/10 bg-white/95 text-black backdrop-blur"
        >
            <nav aria-label="global" className="border-b border-black/10">
                <div className="mx-auto grid max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 lg:grid-cols-[220px_minmax(320px,1fr)_auto] lg:gap-6 lg:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="Open navigation menu"
                            aria-expanded={mobileMenuOpen}
                            className="inline-flex h-10 w-10 items-center justify-center border border-black/10 text-black transition hover:bg-black hover:text-white lg:hidden"
                            onClick={toggleMobileMenu}
                        >
                            <MenuIcon />
                        </button>

                        <div className="min-w-0">
                            <AppLink to="/" className="block">
                                {/* <video
                                    poster="https://assets.grailed.com/logo.jpg"
                                    className="h-10 w-[126px] object-contain"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                >
                                    <source src="https://assets.grailed.com/logo.webm" type="video/webm" />
                                    <source src="https://assets.grailed.com/logo.mp4" type="video/mp4" />
                                </video> */}
                                Pin & Wear
                            </AppLink>
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <form
                            className="flex items-center gap-2"
                            onSubmit={(event) => event.preventDefault()}
                        >
                            <label className="relative flex-1">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-black/60">
                                    <SearchIcon />
                                </span>
                                <input
                                    type="search"
                                    placeholder="Search for anything"
                                    className="h-10 w-full border border-black/15 bg-white pl-10 pr-4 text-sm text-black placeholder:text-black/40 focus:border-black focus:outline-none"
                                />
                            </label>
                            <button
                                type="submit"
                                className="h-10 border border-black/15 px-4 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                        <button
                            type="button"
                            aria-label="Open search"
                            className="inline-flex h-10 w-10 items-center justify-center border border-black/10 text-black transition hover:bg-black hover:text-white lg:hidden"
                        >
                            <SearchIcon />
                        </button>

                        {quickActions.map((action) => (
                            <AppLink
                                key={action.label}
                                to={action.to}
                                className={`hidden h-10 items-center px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white sm:inline-flex ${
                                    action.bordered
                                        ? "border border-black/15"
                                        : ""
                                }`}
                            >
                                {action.label}
                            </AppLink>
                        ))}

                        {/* <AppLink
                            to="/messages"
                            aria-label="Messages"
                            className="hidden h-10 w-10 items-center justify-center text-black transition hover:bg-black hover:text-white sm:inline-flex"
                        >
                            <MessageIcon />
                        </AppLink> */}

                        <AppLink
                            to="/pin"
                            aria-label="Favorites"
                            className="hidden h-10 w-10 items-center justify-center text-black transition hover:bg-black hover:text-white sm:inline-flex"
                        >
                            <HeartIcon />
                        </AppLink>

                        {isAuthenticated ? (
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    type="button"
                                    id="desktop-profile-trigger"
                                    aria-label="Open profile menu"
                                    aria-haspopup="menu"
                                    aria-expanded={profileMenuOpen}
                                    aria-controls={
                                        profileMenuOpen
                                            ? "desktop-profile-menu"
                                            : undefined
                                    }
                                    data-state={
                                        profileMenuOpen ? "open" : "closed"
                                    }
                                    className={`inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition ${
                                        profileMenuOpen
                                            ? "border-black shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                                            : "border-black/10"
                                    }`}
                                    onClick={toggleProfileMenu}
                                >
                                    <img
                                        className="h-full w-full object-cover"
                                        alt="User avatar"
                                        src={userAvatar}
                                    />
                                </button>

                                {profileMenuOpen && (
                                    <div
                                        id="desktop-profile-menu"
                                        data-side="bottom"
                                        data-align="center"
                                        data-state="open"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="desktop-profile-trigger"
                                        className="absolute right-0 top-[calc(100%+12px)] z-50 w-[284px] rounded-[28px] border border-black/10 bg-white p-3 text-black shadow-[0_28px_90px_rgba(0,0,0,0.18)]"
                                    >
                                        <AppLink
                                            to={profileMenu.username.to}
                                            role="menuitem"
                                            className="flex items-center justify-between rounded-[20px] px-4 py-3 transition hover:bg-[#f6f3ef]"
                                            onClick={closeProfileMenu}
                                        >
                                            <span className="text-base font-bold tracking-[0.01em] text-black">
                                                {userDisplayName}
                                            </span>
                                            <ForwardCaretIcon />
                                        </AppLink>

                                        <div className="mt-1 space-y-1">
                                            {profileMenu.accountLinks.map(
                                                (item) => (
                                                    <AppLink
                                                        key={item.label}
                                                        to={item.to}
                                                        role="menuitem"
                                                        className="block rounded-[18px] px-4 py-3 text-[12px] leading-[14px] text-black/80 transition hover:bg-[#f6f3ef] hover:text-black"
                                                        onClick={
                                                            closeProfileMenu
                                                        }
                                                    >
                                                        {item.label}
                                                    </AppLink>
                                                )
                                            )}
                                        </div>

                                        <div
                                            role="separator"
                                            aria-orientation="horizontal"
                                            className="my-2 h-px bg-black/10"
                                        />

                                        <AppLink
                                            to={profileMenu.selling.heading.to}
                                            role="menuitem"
                                            className="flex items-center justify-between rounded-[18px] px-4 py-3 transition hover:bg-[#f6f3ef]"
                                            onClick={closeProfileMenu}
                                        >
                                            <span className="text-[12px] font-bold tracking-[0.08em] text-black">
                                                {
                                                    profileMenu.selling.heading
                                                        .label
                                                }
                                            </span>
                                            <ForwardCaretIcon />
                                        </AppLink>

                                        <div className="space-y-1">
                                            {profileMenu.selling.links.map(
                                                (item) => (
                                                    <AppLink
                                                        key={item.label}
                                                        to={item.to}
                                                        role="menuitem"
                                                        className="block rounded-[18px] px-4 py-3 text-[12px] leading-[14px] text-black/80 transition hover:bg-[#f6f3ef] hover:text-black"
                                                        onClick={
                                                            closeProfileMenu
                                                        }
                                                    >
                                                        {item.label}
                                                    </AppLink>
                                                )
                                            )}
                                        </div>

                                        <div
                                            role="separator"
                                            aria-orientation="horizontal"
                                            className="my-2 h-px bg-black/10"
                                        />

                                        <AppLink
                                            to={profileMenu.settings.heading.to}
                                            role="menuitem"
                                            className="flex items-center justify-between rounded-[18px] px-4 py-3 transition hover:bg-[#f6f3ef]"
                                            onClick={closeProfileMenu}
                                        >
                                            <span className="text-[12px] font-bold tracking-[0.08em] text-black">
                                                {
                                                    profileMenu.settings.heading
                                                        .label
                                                }
                                            </span>
                                            <ForwardCaretIcon />
                                        </AppLink>

                                        <button
                                            type="button"
                                            role="menuitem"
                                            className="mt-1 block w-full rounded-[18px] px-4 py-3 text-left text-[12px] leading-[14px] text-black/80 transition hover:bg-[#f6f3ef] hover:text-black"
                                            onClick={handleSignOut}
                                        >
                                            SIGN OUT
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden items-center gap-2 sm:flex">
                                <AppLink
                                    to="/sign-in"
                                    className="h-10 border border-black/15 px-4 inline-flex items-center text-[11px] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white"
                                >
                                    SIGN IN
                                </AppLink>
                                <AppLink
                                    to="/sign-up"
                                    className="h-10 border border-black bg-black px-4 inline-flex items-center text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
                                >
                                    SIGN UP
                                </AppLink>
                            </div>
                        )}
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="border-t border-black/10 bg-white px-4 py-5 lg:hidden">
                        <div className="space-y-4">
                            {quickActions.map((action) => (
                                <AppLink
                                    key={action.label}
                                    to={action.to}
                                    className="block border border-black/15 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black"
                                >
                                    {action.label}
                                </AppLink>
                            ))}

                            {megaMenus.map((menu) => (
                                <details
                                    key={menu.id}
                                    className="border-t border-black/10 pt-4"
                                >
                                    <summary className="cursor-pointer list-none text-[12px] font-bold uppercase tracking-[0.18em] text-black">
                                        {menu.label}
                                    </summary>
                                    <div className="mt-4 space-y-4">
                                        {renderMobileMegaMenu(menu)}
                                        <AppLink
                                            to={menu.cta.to}
                                            className="inline-flex text-[11px] font-bold uppercase tracking-[0.22em] text-black"
                                        >
                                            {menu.cta.label}
                                        </AppLink>
                                    </div>
                                </details>
                            ))}

                            <div className="grid gap-3 border-t border-black/10 pt-4">
                                {!isAuthenticated && (
                                    <>
                                        <AppLink
                                            to="/sign-in"
                                            className="text-[12px] font-bold uppercase tracking-[0.18em] text-black"
                                        >
                                            SIGN IN
                                        </AppLink>
                                        <AppLink
                                            to="/sign-up"
                                            className="text-[12px] font-bold uppercase tracking-[0.18em] text-black"
                                        >
                                            SIGN UP
                                        </AppLink>
                                    </>
                                )}
                                {merchandisingLinks.map((item) => (
                                    <AppLink
                                        key={item.label}
                                        to={item.to}
                                        className="text-[12px] font-bold uppercase tracking-[0.18em] text-black"
                                    >
                                        {item.label}
                                    </AppLink>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            <div
                className="hidden lg:block"
                onMouseLeave={() => setActiveMenu(null)}
            >
                <nav
                    aria-label="Main"
                    className="mx-auto flex max-w-[1440px] items-center gap-8 px-6"
                >
                    {megaMenus.map((menu) => {
                        const isOpen = activeMenu === menu.id;

                        return (
                            <button
                                key={menu.id}
                                type="button"
                                className="inline-flex h-12 items-center gap-1 text-[12px] font-bold tracking-[0.08em] text-black"
                                aria-expanded={isOpen}
                                onMouseEnter={() => openMenu(menu.id)}
                                onFocus={() => openMenu(menu.id)}
                                onClick={() => toggleMenu(menu.id)}
                            >
                                <span>{menu.label}</span>
                                <CaretIcon open={isOpen} />
                            </button>
                        );
                    })}

                    {merchandisingLinks.map((item) => (
                        <AppLink
                            key={item.label}
                            to={item.to}
                            className="inline-flex h-12 items-center text-[12px] font-bold tracking-[0.08em] text-black"
                        >
                            {item.label}
                        </AppLink>
                    ))}
                </nav>

                <div
                    className={`overflow-hidden border-t border-black/10 bg-white transition-[max-height,opacity] duration-200 ${
                        activeMenu
                            ? "max-h-[80vh] opacity-100"
                            : "max-h-0 opacity-0"
                    }`}
                >
                    <div className="mx-auto max-w-[1440px] px-6 py-8">
                        {renderDesktopMegaMenu(
                            megaMenus.find((menu) => menu.id === activeMenu) ||
                                null
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
