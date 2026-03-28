import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartWrapper";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const formatCurrency = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? currencyFormatter.format(amount) : "$0.00";
};

const CartPage = () => {
    const { cart, updateQuantity, removeFromCart, cartCount } = useCart();

    const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
    const taxes = subtotal * 0.08;
    const total = subtotal + taxes;

    if (cart.length === 0) {
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
        <div className="bg-[#fbf9f8] text-[#1b1c1c] antialiased min-h-screen selection:bg-black selection:text-white">
            <main className="pb-20 px-6 md:px-12 max-w-[1600px] mx-auto min-h-screen pt-16">
                <header className="mb-12">
                    <h1 className="font-['Inter'] text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">Your Shopping Bag</h1>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="font-['Space_Grotesk'] text-xs tracking-widest uppercase text-black/50">{cartCount} ITEMS COLLECTED</span>
                    </div>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-12">
                        {cart.map((item, index) => (
                            <div key={`${item.product_id}-${item.selected_variants_id}-${index}`} className="flex flex-col md:flex-row gap-8 items-start border-none">
                                <div className="w-full md:w-48 aspect-[3/4] bg-[#f5f3f3] overflow-hidden">
                                    <img 
                                        alt={item.name} 
                                        className="w-full h-full object-cover" 
                                        src={item.variant_image ?? "https://via.placeholder.com/300?text=No+Image"} 
                                    />
                                </div>
                                <div className="flex-grow flex flex-col h-full justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-['Inter'] font-black text-xs tracking-widest uppercase text-[#bc0000]">
                                            {item.category?.[0]?.name ?? "Archive"}
                                        </h3>
                                        <h2 className="font-['Inter'] text-2xl font-black tracking-tighter uppercase leading-none">
                                            <Link to={`/products/${item.product_id}`} className="hover:underline transition-all">
                                                {item.name}
                                            </Link>
                                        </h2>
                                        {item.variants_size && (
                                            <p className="font-['Space_Grotesk'] text-sm uppercase text-black/60 mt-4">
                                                SIZE: {item.variants_size} {item.variants_color ? `| ${item.variants_color}` : ""}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-8">
                                        <div className="flex items-center border border-black/20 p-1">
                                            <button 
                                                onClick={() => updateQuantity(item.product_id, item.selected_variants_id, Math.max(1, item.quantity - 1))}
                                                className="p-2 transition-colors hover:bg-black/5"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">remove</span>
                                            </button>
                                            <span className="px-6 font-['Space_Grotesk'] font-bold text-sm">
                                                {item.quantity}
                                            </span>
                                            <button 
                                                onClick={() => updateQuantity(item.product_id, item.selected_variants_id, item.quantity + 1)}
                                                className="p-2 transition-colors hover:bg-black/5"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">add</span>
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.product_id, item.selected_variants_id)}
                                            className="font-['Space_Grotesk'] text-[10px] tracking-widest uppercase underline underline-offset-4 hover:text-[#bc0000] transition-colors"
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
                            </div>
                        ))}
                    </div>

                    {/* Sticky Order Summary Sidebar */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
                        <div className="bg-[#f5f3f3] p-8">
                            <h2 className="font-['Inter'] text-xl font-black tracking-tighter uppercase mb-8 border-b border-black/10 pb-4">
                                Order Summary
                            </h2>
                            <div className="space-y-4 font-['Space_Grotesk'] text-xs tracking-widest uppercase text-black/80">
                                <div className="flex justify-between items-center">
                                    <span>SUBTOTAL</span>
                                    <span className="font-bold text-sm text-black">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span>SHIPPING (CALCULATED AT CHECKOUT)</span>
                                    <span className="font-bold text-sm text-black">FREE</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>TAXES (8%)</span>
                                    <span className="font-bold text-sm text-black">{formatCurrency(taxes)}</span>
                                </div>
                                <div className="pt-8 mt-4 border-t border-black/20 flex justify-between items-end">
                                    <span className="font-['Inter'] text-sm font-black text-black">TOTAL</span>
                                    <span className="font-['Inter'] text-3xl font-black tracking-tighter text-black">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>
                            <button className="font-['Inter'] w-full mt-12 py-5 bg-black text-white font-black tracking-tighter uppercase text-lg hover:bg-black/90 transition-all active:scale-95 duration-150">
                                PROCEED TO CHECKOUT
                            </button>
                            <div className="mt-8 flex flex-col gap-4">
                                <p className="font-['Space_Grotesk'] text-[10px] tracking-widest text-black/50 leading-relaxed uppercase">
                                    WE ACCEPT PAYMENTS VIA CRYPTO, CREDIT CARD, AND ARCHIVE CREDIT. 
                                    ALL SALES OF ARCHIVAL ITEMS ARE FINAL.
                                </p>
                            </div>
                        </div>

                        {/* Value Props */}
                        <div className="space-y-4 px-2">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-black">local_shipping</span>
                                <span className="font-['Space_Grotesk'] text-[10px] tracking-widest uppercase text-black/70">Global Express Shipping Available</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-black">verified</span>
                                <span className="font-['Space_Grotesk'] text-[10px] tracking-widest uppercase text-black/70">Guaranteed Authenticity</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default CartPage;
