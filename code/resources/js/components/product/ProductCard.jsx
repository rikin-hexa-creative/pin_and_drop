import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";

const ProductCard = ({
    variant = "home",
    title,
    image,
    size,
    price,
    brand,
    badge,
    animationDelay,
    to,
}) => {
    if (variant === "shop") {
        const content = (
            <>
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f3f3]">
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#e7e2dd,#f7f4f1)] px-6 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-black/35 font-['Space_Grotesk']">
                            No Image
                        </div>
                    )}
                    {/* {badge && (
                        <div className="absolute right-2 top-2 rounded-full border border-black/10 bg-white ">
                            <span className="text-[10px] font-bold uppercase tracking-tighter font-['Space Grotesk']">
                                {badge}
                            </span>
                        </div>
                    )} */}
                </div>
                <div className="mt-4 space-y-1">
                    {brand && (
                        <p className="text-xs font-black uppercase tracking-tight font-['Inter']">
                            {brand}
                        </p>
                    )}
                    <p className="truncate text-sm text-black/60">{title}</p>
                    <div className="flex items-end justify-between pt-2">
                        <p className="text-[10px] font-bold uppercase text-black/40 font-['Space Grotesk']">
                            Size: {size}
                        </p>
                        <p className="text-sm font-bold font-['Inter']">
                            {formatCurrency(price)}
                        </p>
                    </div>
                </div>
            </>
        );

        if (to) {
            return (
                <Link to={to} className="group block cursor-pointer">
                    {content}
                </Link>
            );
        }

        return (
            <div className="group cursor-pointer">
                {content}
            </div>
        );
    }

    return (
        <article
            className="group flex flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg animate-[fade-up_0.8s_ease-out]"
            style={animationDelay ? { animationDelay } : undefined}
        >
            <div className="h-64 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                <div>
                    <p className="text-sm font-semibold text-black">{title}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-black/50">
                        Size {size}
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-black">
                        {formatCurrency(price)}
                    </span>
                    {badge && (
                        <span className="rounded-full border border-black/10 bg-[#f6f3ef] px-3 py-1 text-xs uppercase tracking-[0.2em] text-black/60">
                            {badge}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
