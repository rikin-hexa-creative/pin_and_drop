const footerColumns = [
    {
        title: "Marketplace",
        links: ["Browse", "Verified", "Collections", "Sale", "New Arrivals"],
    },
    {
        title: "Company",
        links: ["About", "Careers", "Press", "Affiliates", "Sustainability"],
    },
    {
        title: "Support",
        links: ["Help Center", "Buyer Protection", "Seller Guide", "Shipping", "Contact"],
    },
    {
        title: "Follow",
        links: ["Instagram", "TikTok", "X", "YouTube", "Newsletter"],
    },
];

const Footer = () => {
    return (
        <footer className="bg-black text-white">
            <div className="mx-auto max-w-6xl px-4 py-12">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    {footerColumns.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                                {column.title}
                            </h3>
                            <ul className="mt-4 space-y-3 text-sm text-white/70">
                                {column.links.map((link) => (
                                    <li key={link} className="transition hover:text-white">
                                        <a href="/" className="block">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row">
                    <span className="uppercase tracking-[0.2em]">Pine And Wear</span>
                    <div className="flex gap-4 uppercase tracking-[0.2em]">
                        <a href="/" className="transition hover:text-white">
                            Terms
                        </a>
                        <a href="/" className="transition hover:text-white">
                            Privacy
                        </a>
                        <a href="/" className="transition hover:text-white">
                            Accessibility
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
