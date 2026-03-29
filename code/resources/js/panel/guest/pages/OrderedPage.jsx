import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserOrders } from "../../../apis/order.api";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const formatCurrency = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? currencyFormatter.format(amount) : "$0.00";
};

const statusClassNames = {
    pending: "bg-[#fef3c7] text-[#92400e]",
    confirmed: "bg-[#dbeafe] text-[#1d4ed8]",
    processing: "bg-[#e0e7ff] text-[#4338ca]",
    shipped: "bg-[#d1fae5] text-[#065f46]",
    delivered: "bg-[#dcfce7] text-[#166534]",
    cancelled: "bg-[#fee2e2] text-[#b91c1c]",
    refunded: "bg-[#f3f4f6] text-[#4b5563]",
};

const OrderedPage = () => {
    const location = useLocation();
    const hasToken = Boolean(Cookies.get("user_token"));
    const redirectTo = `${location.pathname}${location.search}`;
    const { data: orders = [], isLoading } = useUserOrders(hasToken);
    const [openOrderId, setOpenOrderId] = useState(null);

    useEffect(() => {
        if (!orders.length || openOrderId !== null) {
            return;
        }

        setOpenOrderId(orders[0].id);
    }, [openOrderId, orders]);

    if (!hasToken) {
        return (
            <div className="min-h-screen bg-[#f6f3ef] px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-[30px] border border-black/8 bg-white p-10 text-center shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                        Order History
                    </p>
                    <h1 className="mt-4 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        Sign in to view your purchased items.
                    </h1>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            to="/sign-in"
                            state={{ redirectTo }}
                            className="rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/shop"
                            className="rounded-full border border-black/12 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f6f3ef] px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl animate-pulse space-y-6">
                    <div className="h-12 w-72 bg-black/5" />
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-40 rounded-[28px] bg-white" />
                    ))}
                </div>
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="min-h-screen bg-[#f6f3ef] px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-[30px] border border-black/8 bg-white p-10 text-center shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                        Order History
                    </p>
                    <h1 className="mt-4 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        No orders yet.
                    </h1>
                    <p className="mt-4 text-sm leading-6 text-black/60">
                        When you place an order, the product details, pricing,
                        quantity, and vendor links will appear here.
                    </p>
                    <Link
                        to="/shop"
                        className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                    >
                        Explore The Archive
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f6f3ef_0%,#f0ece7_100%)]">
            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                            Purchased Archive
                        </p>
                        <h1 className="mt-3 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black sm:text-5xl">
                            Your Ordered Items
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
                            Expand any order to view the product, quantity,
                            unit price, total, shipping snapshot, and the vendor
                            profile link.
                        </p>
                    </div>
                    <Link
                        to="/shop"
                        className="inline-flex w-fit rounded-full border border-black/12 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                    >
                        Shop More
                    </Link>
                </div>

                <div className="space-y-5">
                    {orders.map((order) => {
                        const isOpen = openOrderId === order.id;
                        const firstItem = order.items[0];

                        return (
                            <section
                                key={order.id}
                                className="rounded-[28px] border border-black/8 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.06)]"
                            >
                                <div className="flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex min-w-0 flex-1 gap-4">
                                        <div className="aspect-[3/4] w-24 overflow-hidden rounded-[18px] bg-[#f4efe9]">
                                            {firstItem?.image ? (
                                                <img
                                                    src={firstItem.image}
                                                    alt={firstItem.product_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center px-3 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-black/35">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <p className="font-['Inter'] text-xl font-black uppercase tracking-tight text-black">
                                                    {order.order_number}
                                                </p>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                                        statusClassNames[
                                                            order.status
                                                        ] ??
                                                        "bg-black/5 text-black/60"
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-black/55">
                                                Ordered {order.created_at} •{" "}
                                                {order.items_count} item
                                                {order.items_count === 1
                                                    ? ""
                                                    : "s"}
                                            </p>
                                            {firstItem ? (
                                                <p className="mt-3 text-sm leading-6 text-black/65">
                                                    {firstItem.product_name}
                                                    {firstItem.variant_info
                                                        ? ` • ${firstItem.variant_info}`
                                                        : ""}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
                                                Grand Total
                                            </p>
                                            <p className="mt-2 font-['Inter'] text-2xl font-black tracking-tight text-black">
                                                {formatCurrency(
                                                    order.totals.grand_total
                                                )}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenOrderId(
                                                    isOpen ? null : order.id
                                                )
                                            }
                                            className="rounded-full border border-black/12 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                                        >
                                            {isOpen ? "Hide" : "View"}
                                        </button>
                                    </div>
                                </div>

                                {isOpen ? (
                                    <div className="border-t border-black/8 px-6 py-6 sm:px-7">
                                        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                                            <div className="space-y-4 rounded-[24px] bg-[#faf6f1] p-5">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                                    Order Summary
                                                </p>
                                                <div className="space-y-3 text-sm text-black/70">
                                                    <div className="flex justify-between gap-4">
                                                        <span>Payment</span>
                                                        <span className="font-semibold uppercase text-black">
                                                            {order.payment_method}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span>Payment Status</span>
                                                        <span className="font-semibold uppercase text-black">
                                                            {order.payment_status}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span>Subtotal</span>
                                                        <span className="font-semibold text-black">
                                                            {formatCurrency(
                                                                order.totals
                                                                    .subtotal
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span>Discount</span>
                                                        <span className="font-semibold text-black">
                                                            {formatCurrency(
                                                                order.totals
                                                                    .discount_amount
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span>Shipping</span>
                                                        <span className="font-semibold text-black">
                                                            {formatCurrency(
                                                                order.totals
                                                                    .shipping_amount
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="border-t border-black/8 pt-3">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                                            Shipping Address
                                                        </p>
                                                        <p className="mt-3 font-semibold text-black">
                                                            {
                                                                order
                                                                    .shipping_address
                                                                    ?.full_name
                                                            }
                                                        </p>
                                                        <p className="mt-1 leading-6 text-black/65">
                                                            {
                                                                order
                                                                    .shipping_address
                                                                    ?.full_address
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {order.items.map((item) => (
                                                    <article
                                                        key={item.id}
                                                        className="rounded-[24px] border border-black/8 bg-white p-5"
                                                    >
                                                        <div className="flex flex-col gap-4 sm:flex-row">
                                                            <div className="aspect-[3/4] w-full max-w-[120px] overflow-hidden rounded-[18px] bg-[#f4efe9]">
                                                                {item.image ? (
                                                                    <img
                                                                        src={item.image}
                                                                        alt={
                                                                            item.product_name
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full items-center justify-center px-3 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-black/35">
                                                                        No Image
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                                    <div>
                                                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-black">
                                                                            {
                                                                                item
                                                                                    .vendor
                                                                                    ?.name
                                                                            }
                                                                        </p>
                                                                        <p className="mt-2 text-lg font-semibold text-black">
                                                                            {item.product_name}
                                                                        </p>
                                                                    </div>
                                                                    <span
                                                                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                                                            statusClassNames[
                                                                                item
                                                                                    .item_status
                                                                            ] ??
                                                                            "bg-black/5 text-black/60"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            item.item_status
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <p className="mt-3 text-sm leading-6 text-black/60">
                                                                    {item.variant_info ??
                                                                        "Standard item"}
                                                                </p>

                                                                <div className="mt-4 grid gap-3 text-sm text-black/70 sm:grid-cols-3">
                                                                    <div>
                                                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
                                                                            Quantity
                                                                        </p>
                                                                        <p className="mt-1 font-semibold text-black">
                                                                            {
                                                                                item.quantity
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
                                                                            Unit Price
                                                                        </p>
                                                                        <p className="mt-1 font-semibold text-black">
                                                                            {formatCurrency(
                                                                                item.unit_price
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
                                                                            Total
                                                                        </p>
                                                                        <p className="mt-1 font-semibold text-black">
                                                                            {formatCurrency(
                                                                                item.total_price
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-5 flex flex-wrap gap-3">
                                                                    {item.product_link ? (
                                                                        <Link
                                                                            to={
                                                                                item.product_link
                                                                            }
                                                                            className="rounded-full border border-black/12 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                                                                        >
                                                                            View Product
                                                                        </Link>
                                                                    ) : null}
                                                                    {item.vendor
                                                                        ?.link ? (
                                                                        <Link
                                                                            to={
                                                                                item
                                                                                    .vendor
                                                                                    .link
                                                                            }
                                                                            className="rounded-full border border-black/12 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                                                                        >
                                                                            Vendor Profile
                                                                        </Link>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </section>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default OrderedPage;
