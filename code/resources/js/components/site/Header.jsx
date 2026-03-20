import { Link } from "react-router-dom";

const navItems = [
    { label: "Shop", to: "/shop" },
    { label: "Designers", to: "/" },
    { label: "Collections", to: "/" },
    { label: "Sale", to: "/" },
    { label: "New In", to: "/" },
];

const Header = () => {
    return (
        <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f3ef]/80 backdrop-blur">
            <div className="bg-black text-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs uppercase tracking-[0.24em]">
                    <span className="opacity-80">Authenticated luxury, updated daily</span>
                    <span className="hidden sm:inline opacity-80">Global shipping and verified sellers</span>
                </div>
            </div>

            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                <div className="flex items-center gap-4">
                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-sm lg:hidden"
                        aria-label="Open navigation menu"
                        type="button"
                    >
                        <span className="block h-0.5 w-4 bg-black"></span>
                    </button>
                    <Link
                        to="/"
                        className="text-2xl font-semibold uppercase tracking-[0.35em] text-black"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        Grailed
                    </Link>
                </div>

                <nav className="hidden items-center gap-6 text-sm font-medium uppercase tracking-[0.16em] text-black/70 lg:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            className="transition hover:text-black"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden flex-1 items-center justify-center lg:flex">
                    <label className="flex w-full max-w-md items-center gap-3 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/70 shadow-sm">
                        <input
                            type="text"
                            placeholder="Search designers, pieces, brands"
                            className="w-full bg-transparent text-sm font-medium text-black placeholder:text-black/40 focus:outline-none"
                        />
                    </label>
                </div>

                <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.16em]">
                    <Link to="/" className="hidden text-black/70 transition hover:text-black sm:inline">
                        Sign In
                    </Link>
                    <Link to="/" className="hidden text-black/70 transition hover:text-black sm:inline">
                        Register
                    </Link>
                    <Link
                        to="/"
                        className="rounded-full bg-black px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-black/30"
                    >
                        Sell
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
