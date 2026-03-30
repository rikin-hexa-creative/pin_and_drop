import Cookies from "js-cookie";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useCartQuery } from "../../../apis/cart.api";
import { useCheckout, useCheckoutContext } from "../../../apis/checkout.api";
import { useProductById } from "../../../apis/product.api";
import { useSellProductById } from "../../../apis/sale.api";
import { formatCurrency } from "../../../utils/currency";

const baseForm = {
    label: "Shipping",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Pakistan",
    payment_method: "cod",
    notes: "",
    save_as_default: true,
};

const Card = ({ title, children }) => (
    <section className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:p-7">
        <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.26em] text-black/45">
            {title}
        </p>
        <div className="mt-6">{children}</div>
    </section>
);

const Field = ({ label, name, value, onChange, readOnly = false }) => (
    <label className="block">
        <span className="mb-2 block font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.22em] text-black/50">
            {label}
        </span>
        <input
            name={name}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={`w-full rounded-[18px] border px-4 py-3 text-sm outline-none ${
                readOnly
                    ? "border-black/8 bg-[#f8f3ee] text-black/55"
                    : "border-black/8 bg-[#faf6f1] focus:border-black"
            }`}
        />
    </label>
);

const CheckoutPage = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const hasToken = Boolean(Cookies.get("user_token"));
    const requestedSource = searchParams.get("source");
    const source =
        requestedSource === "cart"
            ? "cart"
            : requestedSource === "user_sale"
            ? "user_sale"
            : "buy_now";
    const productId = Number(searchParams.get("productId"));
    const variantId = Number(searchParams.get("variantId"));
    const saleId = Number(searchParams.get("saleId"));
    const quantity = Math.max(1, Number(searchParams.get("quantity") ?? 1));
    const redirectTo = `${location.pathname}${location.search}`;
    const initRef = useRef(false);
    const [form, setForm] = useState(baseForm);
    const [submittedOrder, setSubmittedOrder] = useState(null);
    const checkoutMutation = useCheckout();
    const { data: checkoutContext, isLoading: isCheckoutLoading } =
        useCheckoutContext(hasToken);
    const { data: cart, isLoading: isCartLoading } = useCartQuery(
        hasToken && source === "cart"
    );
    const {
        data: product,
        error,
        isLoading: isProductLoading,
    } = useProductById(
        hasToken && source === "buy_now" && productId ? productId : null
    );
    const {
        data: sale,
        error: saleError,
        isLoading: isSaleLoading,
    } = useSellProductById(
        hasToken && source === "user_sale" && saleId && !submittedOrder
            ? saleId
            : null
    );

    const selectedVariant = useMemo(() => {
        if (source !== "buy_now" || !product?.variants?.length) {
            return null;
        }

        return (
            product.variants.find((variant) => variant.id === variantId) ?? null
        );
    }, [product, source, variantId]);

    const items = useMemo(() => {
        if (source === "cart") {
            return cart?.items ?? [];
        }

        if (source === "user_sale") {
            if (!sale) {
                return [];
            }

            return [
                {
                    id: `sale-${sale.id}`,
                    item_source: "user_sale",
                    user_sale_id: sale.id,
                    product_name: sale.name,
                    image: sale.image ?? sale.gallery?.[0]?.src ?? null,
                    brand: sale.seller?.name,
                    variant_info: sale.condition
                        ? `Condition: ${sale.condition}`
                        : "Single-piece listing",
                    quantity: 1,
                    total_price: Number(sale.actual_price ?? 0),
                },
            ];
        }

        if (!product || !selectedVariant) {
            return [];
        }

        return [
            {
                id: selectedVariant.id,
                product_name: product.name,
                image: product.image ?? product.gallery?.[0]?.src ?? null,
                brand: product.brand,
                variant_info: selectedVariant.size
                    ? `Size: ${selectedVariant.size}${
                          selectedVariant.color
                              ? ` | Color: ${selectedVariant.color}`
                              : ""
                      }`
                    : null,
                quantity,
                total_price: Number(selectedVariant.price ?? 0) * quantity,
            },
        ];
    }, [cart?.items, product, quantity, sale, selectedVariant, source]);

    const subtotal =
        source === "cart"
            ? Number(cart?.totals?.subtotal ?? 0)
            : source === "user_sale"
            ? Number(sale?.actual_price ?? 0)
            : Number(selectedVariant?.price ?? 0) * quantity;
    const discount =
        source === "cart"
            ? Number(cart?.totals?.discount_amount ?? 0)
            : source === "user_sale"
            ? Math.max(
                  Number(sale?.compare_at_price ?? 0) -
                      Number(sale?.actual_price ?? 0),
                  0
              )
            : Math.max(
                  (Number(selectedVariant?.compare_at_price ?? 0) -
                      Number(selectedVariant?.price ?? 0)) *
                      quantity,
                  0
              );
    const shipping = Number(checkoutContext?.shipping_amount ?? 0);
    const total =
        source === "cart"
            ? Number(cart?.totals?.grand_total ?? subtotal)
            : subtotal + shipping;
    const isSubmitDisabled =
        checkoutMutation.isPending ||
        (source === "cart"
            ? items.length === 0
            : source === "user_sale"
            ? !sale?.id
            : !product?.id || !selectedVariant?.id || items.length === 0);
    const formErrors = checkoutMutation.error?.response?.data?.errors ?? {};
    const generalError =
        checkoutMutation.error?.response?.data?.message ?? null;
    const confirmationItems = submittedOrder?.items?.length
        ? submittedOrder.items
        : submittedOrder?.item
        ? [submittedOrder.item]
        : [];

    useEffect(() => {
        if (!checkoutContext || initRef.current) {
            return;
        }

        const address = checkoutContext.default_address;

        setForm((current) => ({
            ...current,
            label: address?.label ?? current.label,
            full_name:
                address?.full_name ??
                checkoutContext.customer?.full_name ??
                current.full_name,
            phone:
                address?.phone ??
                checkoutContext.customer?.phone ??
                current.phone,
            address_line1: address?.address_line1 ?? current.address_line1,
            address_line2: address?.address_line2 ?? current.address_line2,
            city: address?.city ?? current.city,
            state: address?.state ?? current.state,
            postal_code: address?.postal_code ?? current.postal_code,
            country: address?.country ?? current.country,
            payment_method:
                checkoutContext.payment_methods?.[0]?.value ??
                current.payment_method,
            save_as_default: Boolean(address),
        }));

        initRef.current = true;
    }, [checkoutContext]);

    const onChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            source,
            payment_method: form.payment_method,
            notes: form.notes || null,
            save_as_default: form.save_as_default,
            shipping_address: {
                label: form.label || "Shipping",
                full_name: form.full_name,
                phone: form.phone,
                address_line1: form.address_line1,
                address_line2: form.address_line2 || null,
                city: form.city,
                state: form.state || null,
                postal_code: form.postal_code,
                country: form.country,
            },
        };

        if (source === "buy_now") {
            if (!product?.id || !selectedVariant?.id) {
                return;
            }

            payload.product_id = product.id;
            payload.variant_id = selectedVariant.id;
            payload.quantity = quantity;
        } else if (source === "user_sale") {
            if (!sale?.id) {
                return;
            }

            payload.user_sale_id = sale.id;
        }

        const order = await checkoutMutation.mutateAsync(payload);
        setSubmittedOrder(order);
    };

    if (!hasToken) {
        return (
            <div className="min-h-screen bg-[#f6f0ea] px-6 py-20 text-center">
                <div className="mx-auto max-w-3xl rounded-[30px] border border-black/8 bg-white p-10 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <h1 className="font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        Sign in to complete checkout.
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
                            to={source === "user_sale" ? "/sell" : "/shop"}
                            className="rounded-full border border-black/12 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black"
                        >
                            {source === "user_sale"
                                ? "Return To Sell Feed"
                                : "Return To Shop"}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (
        isCheckoutLoading ||
        (source === "cart" && isCartLoading) ||
        (source === "buy_now" && isProductLoading) ||
        (source === "user_sale" && isSaleLoading)
    ) {
        return (
            <div className="min-h-screen bg-[#f6f0ea] px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl animate-pulse space-y-8">
                    <div className="h-12 w-80 bg-black/5" />
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="h-[520px] rounded-[28px] bg-white" />
                        <div className="h-[520px] rounded-[28px] bg-white" />
                    </div>
                </div>
            </div>
        );
    }

    if (
        source === "buy_now" &&
        (!productId ||
            !variantId ||
            error?.response?.status === 404 ||
            !product ||
            !selectedVariant)
    ) {
        return (
            <div className="min-h-screen bg-[#f6f0ea] px-6 py-20 text-center">
                <div className="mx-auto max-w-3xl rounded-[30px] border border-black/8 bg-white p-10 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <h1 className="font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        This product checkout is unavailable.
                    </h1>
                    <Link
                        to="/shop"
                        className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                    >
                        Return To Shop
                    </Link>
                </div>
            </div>
        );
    }

    if (
        !submittedOrder &&
        source === "user_sale" &&
        (!saleId || saleError?.response?.status === 404 || !sale)
    ) {
        return (
            <div className="min-h-screen bg-[#f6f0ea] px-6 py-20 text-center">
                <div className="mx-auto max-w-3xl rounded-[30px] border border-black/8 bg-white p-10 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <h1 className="font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        This sell listing checkout is unavailable.
                    </h1>
                    <Link
                        to="/sell"
                        className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                    >
                        Return To Sell Feed
                    </Link>
                </div>
            </div>
        );
    }

    if (source === "cart" && !items.length) {
        return (
            <div className="min-h-screen bg-[#f6f0ea] px-6 py-20 text-center">
                <div className="mx-auto max-w-3xl rounded-[30px] border border-black/8 bg-white p-10 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <h1 className="font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        Your cart is empty.
                    </h1>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            to="/cart"
                            className="rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                        >
                            Return To Cart
                        </Link>
                        <Link
                            to="/shop"
                            className="rounded-full border border-black/12 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f6f0ea_0%,#f1ebe5_100%)]">
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                            Secure Checkout
                        </p>
                        <h1 className="mt-3 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black sm:text-5xl">
                            {source === "cart"
                                ? "Checkout Your Bag"
                                : source === "user_sale"
                                ? "Complete Your Purchase"
                                : "Complete Your Order"}
                        </h1>
                    </div>
                    <Link
                        to={
                            source === "cart"
                                ? "/cart"
                                : source === "user_sale"
                                ? `/sell/product/${sale.id}`
                                : `/product/${product.id}`
                        }
                        className="inline-flex w-fit rounded-full border border-black/12 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black"
                    >
                        {source === "cart"
                            ? "Back To Cart"
                            : source === "user_sale"
                            ? "Back To Listing"
                            : "Back To Product"}
                    </Link>
                </div>

                {submittedOrder ? (
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                        <Card title="Order Confirmed">
                            <h2 className="font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                                {submittedOrder.order_number}
                            </h2>
                            <p className="mt-4 text-sm leading-6 text-black/65">
                                The order items, payment record, and stock
                                reservation were created successfully.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    to={
                                        source === "user_sale"
                                            ? "/sell"
                                            : "/shop"
                                    }
                                    className="rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                                >
                                    {source === "user_sale"
                                        ? "Continue Browsing"
                                        : "Continue Shopping"}
                                </Link>
                                <Link
                                    to="/ordered"
                                    className="rounded-full border border-black/12 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black"
                                >
                                    View Orders
                                </Link>
                            </div>
                        </Card>
                        <Card title="Order Summary">
                            <div className="space-y-4">
                                {confirmationItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-[22px] bg-[#faf6f1] p-4"
                                    >
                                        <p className="text-sm font-semibold text-black">
                                            {item.product_name}
                                        </p>
                                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-black/45">
                                            {item.variant_info ??
                                                "Standard item"}
                                        </p>
                                        <div className="mt-3 flex justify-between text-sm text-black/65">
                                            <span>Qty {item.quantity}</span>
                                            <span className="font-semibold text-black">
                                                {formatCurrency(
                                                    item.total_price
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t border-black/8 pt-4 text-lg font-semibold text-black">
                                    <div className="flex items-center justify-between">
                                        <span>Total</span>
                                        <span>
                                            {formatCurrency(
                                                submittedOrder.grand_total
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="space-y-6">
                            <Card title="Account">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Full Name"
                                        value={
                                            checkoutContext?.customer
                                                ?.full_name ?? form.full_name
                                        }
                                        readOnly
                                        onChange={() => {}}
                                    />
                                    <Field
                                        label="Email"
                                        value={
                                            checkoutContext?.customer?.email ??
                                            ""
                                        }
                                        readOnly
                                        onChange={() => {}}
                                    />
                                </div>
                            </Card>

                            <form className="space-y-6" onSubmit={onSubmit}>
                                <Card title="Shipping Address">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label="Address Label"
                                            name="label"
                                            value={form.label}
                                            onChange={onChange}
                                        />
                                        <Field
                                            label="Recipient Name"
                                            name="full_name"
                                            value={form.full_name}
                                            onChange={onChange}
                                        />
                                        <Field
                                            label="Phone"
                                            name="phone"
                                            value={form.phone}
                                            onChange={onChange}
                                        />
                                        <Field
                                            label="Postal Code"
                                            name="postal_code"
                                            value={form.postal_code}
                                            onChange={onChange}
                                        />
                                        <div className="sm:col-span-2">
                                            <Field
                                                label="Address Line 1"
                                                name="address_line1"
                                                value={form.address_line1}
                                                onChange={onChange}
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Field
                                                label="Address Line 2"
                                                name="address_line2"
                                                value={form.address_line2}
                                                onChange={onChange}
                                            />
                                        </div>
                                        <Field
                                            label="City"
                                            name="city"
                                            value={form.city}
                                            onChange={onChange}
                                        />
                                        <Field
                                            label="State / Region"
                                            name="state"
                                            value={form.state}
                                            onChange={onChange}
                                        />
                                        <div className="sm:col-span-2">
                                            <Field
                                                label="Country"
                                                name="country"
                                                value={form.country}
                                                onChange={onChange}
                                            />
                                        </div>
                                    </div>
                                    <label className="mt-5 flex items-start gap-3 rounded-[20px] border border-black/8 bg-[#faf6f1] px-4 py-4 text-sm text-black/70">
                                        <input
                                            type="checkbox"
                                            name="save_as_default"
                                            checked={form.save_as_default}
                                            onChange={onChange}
                                            className="mt-0.5 h-4 w-4 rounded border-black/15 text-black focus:ring-black"
                                        />
                                        <span>
                                            Save this address as the default for
                                            future checkout.
                                        </span>
                                    </label>
                                </Card>

                                <Card title="Payment">
                                    <div className="space-y-3">
                                        {checkoutContext?.payment_methods?.map(
                                            (method) => {
                                                const active =
                                                    form.payment_method ===
                                                    method.value;
                                                return (
                                                    <label
                                                        key={method.value}
                                                        className={`flex cursor-pointer items-start gap-4 rounded-[22px] border px-4 py-4 ${
                                                            active
                                                                ? "border-black bg-black text-white"
                                                                : "border-black/8 bg-[#faf6f1] text-black"
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="payment_method"
                                                            value={method.value}
                                                            checked={active}
                                                            onChange={onChange}
                                                            className="mt-1 h-4 w-4 border-white/20 text-black focus:ring-black"
                                                        />
                                                        <span>
                                                            <span className="block text-sm font-semibold uppercase tracking-[0.12em]">
                                                                {method.label}
                                                            </span>
                                                            <span
                                                                className={`mt-1 block text-sm leading-6 ${
                                                                    active
                                                                        ? "text-white/70"
                                                                        : "text-black/55"
                                                                }`}
                                                            >
                                                                {
                                                                    method.description
                                                                }
                                                            </span>
                                                        </span>
                                                    </label>
                                                );
                                            }
                                        )}
                                    </div>
                                </Card>

                                <Card title="Notes">
                                    <textarea
                                        name="notes"
                                        value={form.notes}
                                        onChange={onChange}
                                        rows={4}
                                        className="w-full rounded-[18px] border border-black/8 bg-[#faf6f1] px-4 py-3 text-sm outline-none"
                                    />
                                </Card>

                                {Object.keys(formErrors).length ? (
                                    <div className="rounded-[22px] border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-sm text-[#9f1239]">
                                        {Object.values(formErrors).flat()[0]}
                                    </div>
                                ) : null}
                                {generalError ? (
                                    <div className="rounded-[22px] border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-sm text-[#9f1239]">
                                        {generalError}
                                    </div>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={isSubmitDisabled}
                                    className="rounded-full bg-black px-7 py-4 text-[11px] font-bold uppercase tracking-[0.24em] text-white disabled:bg-black/25"
                                >
                                    {checkoutMutation.isPending
                                        ? "Placing Order..."
                                        : source === "cart"
                                        ? "Place Cart Order"
                                        : source === "user_sale"
                                        ? "Place Purchase Order"
                                        : "Place Order"}
                                </button>
                            </form>
                        </div>

                        <aside className="lg:sticky lg:top-28 lg:h-fit">
                            <Card title="Order Summary">
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 rounded-[22px] bg-[#faf6f1] p-4"
                                        >
                                            <div className="aspect-[3/4] w-24 overflow-hidden rounded-[18px] bg-[#f4efe9]">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.product_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center px-3 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-black/35">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-black uppercase tracking-[0.16em] text-black">
                                                    {item.brand ??
                                                        item.vendor?.name}
                                                </p>
                                                <p className="mt-2 text-lg font-semibold text-black">
                                                    {item.product_name}
                                                </p>
                                                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-black/45">
                                                    {item.variant_info ??
                                                        "Standard item"}
                                                </p>
                                                <div className="mt-4 flex justify-between text-sm text-black/65">
                                                    <span>
                                                        Qty {item.quantity}
                                                    </span>
                                                    <span className="font-semibold text-black">
                                                        {formatCurrency(
                                                            item.total_price
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t border-black/8 pt-4">
                                        <div className="space-y-3 text-sm text-black/70">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span className="font-semibold text-black">
                                                    {formatCurrency(subtotal)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Discount</span>
                                                <span className="font-semibold text-black">
                                                    {formatCurrency(discount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Shipping</span>
                                                <span className="font-semibold text-black">
                                                    {formatCurrency(shipping)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-lg font-semibold text-black">
                                            <span>Total</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CheckoutPage;
