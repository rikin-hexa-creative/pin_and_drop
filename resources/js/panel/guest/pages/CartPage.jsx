import Cookies from "js-cookie";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    useCartQuery,
    useRemoveCartItem,
    useUpdateCartItem,
} from "../../../apis/cart.api";
import { formatCurrency } from "../../../utils/currency";

const CartPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hasToken = Boolean(Cookies.get("user_token"));
    const redirectTo = `${location.pathname}${location.search}`;
    const { data: cart, isLoading } = useCartQuery(hasToken);
    const updateCartItemMutation = useUpdateCartItem();
    const removeCartItemMutation = useRemoveCartItem();
    const items = cart?.items ?? [];
    const subtotal = Number(cart?.totals?.subtotal ?? 0);
    const discountAmount = Number(cart?.totals?.discount_amount ?? 0);
    const total = Number(cart?.totals?.grand_total ?? 0);
    const cartCount = Number(cart?.items_count ?? 0);

    const handleQuantityChange = (item, quantity) => {
        if (quantity < 1 || quantity > item.available_quantity) {
            return;
        }

        updateCartItemMutation.mutate({
            itemId: item.id,
            quantity,
        });
    };

    const handleCheckout = () => {
        if (!hasToken) {
            navigate("/sign-in", {
                state: {
                    redirectTo: "/cart",
                },
            });
            return;
        }

        navigate("/checkout?source=cart");
    };

    if (!hasToken) {
        return (
            <div className="bg-[#fbf9f8] text-[#1b1c1c]">
                <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-24 text-center">
                    <div className="space-y-5">
                        <p className="font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.3em] text-black/45">
                            Shopping Bag
                        </p>
                        <h1 className="font-['Inter'] text-4xl font-black uppercase tracking-tighter">
                            Sign in to access your cart.
                        </h1>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                to="/sign-in"
                                state={{ redirectTo }}
                                className="inline-flex border border-black bg-black px-6 py-3 font-['Inter'] text-xs font-black uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/shop"
                                className="inline-flex border border-black px-6 py-3 font-['Inter'] text-xs font-black uppercase tracking-[0.22em] transition hover:bg-black hover:text-white"
                            >
                                Return To Archive
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-[#fbf9f8] text-[#1b1c1c]">
                <main className="mx-auto min-h-screen max-w-[1600px] px-6 pb-20 pt-16 md:px-12">
                    <div className="animate-pulse space-y-8">
                        <div className="h-16 w-72 bg-black/5" />
                        <div className="grid gap-12 lg:grid-cols-12">
                            <div className="space-y-6 lg:col-span-8">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-40 rounded-[24px] bg-white"
                                    />
                                ))}
                            </div>
                            <div className="h-[420px] rounded-[24px] bg-white lg:col-span-4" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="bg-[#fbf9f8] text-[#1b1c1c]">
                <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-24 text-center">
                    <div className="space-y-5">
                        <p className="font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.3em] text-black/45">
                            Shopping Bag
                        </p>
                        <h1 className="font-['Inter'] text-4xl font-black uppercase tracking-tighter">
                            Your bag is empty.
                        </h1>
                        <Link
                            to="/shop"
                            className="inline-flex border border-black px-6 py-3 font-['Inter'] text-xs font-black uppercase tracking-[0.22em] transition hover:bg-black hover:text-white"
                        >
                            Return To Archive
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fbf9f8] text-[#1b1c1c] selection:bg-black selection:text-white">
            <main className="mx-auto min-h-screen max-w-[1600px] px-6 pb-20 pt-16 md:px-12">
                <header className="mb-12">
                    <h1 className="font-['Inter'] text-5xl font-black uppercase leading-none tracking-tighter md:text-7xl">
                        Your Shopping Bag
                    </h1>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="font-['Space_Grotesk'] text-xs uppercase tracking-widest text-black/50">
                            {cartCount} items collected
                        </span>
                    </div>
                </header>

                <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
                    <div className="space-y-8 lg:col-span-8">
                        {items.map((item) => {
                            const isBusy =
                                updateCartItemMutation.isPending ||
                                removeCartItemMutation.isPending;

                            return (
                                <article
                                    key={item.id}
                                    className="flex flex-col gap-8 border-b border-black/8 pb-8 md:flex-row md:items-start"
                                >
                                    <div className="aspect-[3/4] w-full overflow-hidden bg-[#f5f3f3] md:w-48">
                                        {item.image ? (
                                            <img
                                                alt={item.product_name}
                                                className="h-full w-full object-cover"
                                                src={item.image}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#e7e2dd,#f7f4f1)] px-6 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-black/35 font-['Space_Grotesk']">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-grow flex-col justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-['Inter'] text-xs font-black uppercase tracking-widest text-[#bc0000]">
                                                {item.brand ?? item.category?.name ?? "Archive"}
                                            </h3>
                                            <h2 className="font-['Inter'] text-2xl font-black uppercase leading-none tracking-tighter">
                                                <Link
                                                    to={`/product/${item.product_id}`}
                                                    className="transition-all hover:underline"
                                                >
                                                    {item.product_name}
                                                </Link>
                                            </h2>
                                            {item.variant_info ? (
                                                <p className="mt-4 font-['Space_Grotesk'] text-sm uppercase text-black/60">
                                                    {item.variant_info}
                                                </p>
                                            ) : null}
                                            <p className="mt-2 font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-black/45">
                                                {item.available_quantity} pieces available
                                            </p>
                                        </div>

                                        <div className="mt-8 flex items-center justify-between">
                                            <div className="flex items-center border border-black/20 p-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item,
                                                            Math.max(
                                                                1,
                                                                item.quantity - 1
                                                            )
                                                        )
                                                    }
                                                    disabled={isBusy}
                                                    className="p-2 transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:text-black/25"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        remove
                                                    </span>
                                                </button>
                                                <span className="px-6 font-['Space_Grotesk'] text-sm font-bold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item,
                                                            Math.min(
                                                                item.available_quantity,
                                                                item.quantity + 1
                                                            )
                                                        )
                                                    }
                                                    disabled={
                                                        isBusy ||
                                                        item.quantity >=
                                                            item.available_quantity
                                                    }
                                                    className="p-2 transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:text-black/25"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        add
                                                    </span>
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeCartItemMutation.mutate(
                                                        item.id
                                                    )
                                                }
                                                disabled={isBusy}
                                                className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest underline underline-offset-4 transition-colors hover:text-[#bc0000] disabled:cursor-not-allowed disabled:text-black/25"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="font-['Inter'] text-xl font-black tracking-tighter">
                                            {formatCurrency(item.total_price)}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <aside className="space-y-8 lg:sticky lg:top-32 lg:col-span-4">
                        <div className="bg-[#f5f3f3] p-8">
                            <h2 className="mb-8 border-b border-black/10 pb-4 font-['Inter'] text-xl font-black uppercase tracking-tighter">
                                Order Summary
                            </h2>
                            <div className="space-y-4 font-['Space_Grotesk'] text-xs uppercase tracking-widest text-black/80">
                                <div className="flex items-center justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-sm font-bold text-black">
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Discount</span>
                                    <span className="text-sm font-bold text-black">
                                        {formatCurrency(discountAmount)}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <span>Shipping (Calculated At Checkout)</span>
                                    <span className="text-sm font-bold text-black">
                                        FREE
                                    </span>
                                </div>
                                <div className="mt-4 flex items-end justify-between border-t border-black/20 pt-8">
                                    <span className="font-['Inter'] text-sm font-black text-black">
                                        Total
                                    </span>
                                    <span className="font-['Inter'] text-3xl font-black tracking-tighter text-black">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCheckout}
                                className="mt-12 w-full bg-black py-5 font-['Inter'] text-lg font-black uppercase tracking-tighter text-white transition-all duration-150 hover:bg-black/90 active:scale-95"
                            >
                                Proceed To Checkout
                            </button>
                            <div className="mt-8 flex flex-col gap-4">
                                <p className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest leading-relaxed text-black/50">
                                    Cart checkout uses your server-side bag and
                                    creates real order items for every product in
                                    this list.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 px-2">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-black">
                                    local_shipping
                                </span>
                                <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-black/70">
                                    Global Express Shipping Available
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-black">
                                    verified
                                </span>
                                <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-black/70">
                                    Guaranteed Authenticity
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default CartPage;
