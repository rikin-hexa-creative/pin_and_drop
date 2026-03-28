import Cookies from "js-cookie";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useCheckout, useCheckoutContext } from "../../../apis/checkout.api";
import { useProductById } from "../../../apis/product.api";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const emptyForm = {
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

const formatCurrency = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? currencyFormatter.format(amount) : "$0.00";
};

const fieldError = (errors, key) => errors?.[key]?.[0] ?? null;

const Card = ({ title, copy, children }) => (
    <section className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:p-7">
        <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.26em] text-black/45">
            {title}
        </p>
        {copy ? (
            <p className="mt-3 text-sm leading-6 text-black/60">{copy}</p>
        ) : null}
        <div className="mt-6">{children}</div>
    </section>
);

const Input = ({ label, name, value, onChange, error, readOnly = false }) => (
    <label className="block">
        <span className="mb-2 block font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.22em] text-black/50">
            {label}
        </span>
        <input
            name={name}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={`w-full rounded-[18px] border px-4 py-3 text-sm outline-none transition ${
                readOnly
                    ? "border-black/8 bg-[#f8f3ee] text-black/55"
                    : error
                      ? "border-[#b91c1c] bg-[#fff7f7]"
                      : "border-black/8 bg-[#faf6f1] focus:border-black"
            }`}
        />
        {error ? (
            <span className="mt-2 block text-xs text-[#b91c1c]">{error}</span>
        ) : null}
    </label>
);

const Line = ({ label, value, faded = false }) => (
    <div className={`flex items-center justify-between gap-4 text-sm ${faded ? "text-black/50" : "text-black/70"}`}>
        <span>{label}</span>
        <span className="font-semibold text-black">{value}</span>
    </div>
);

const CheckoutPage = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const hasToken = Boolean(Cookies.get("user_token"));
    const productId = Number(searchParams.get("productId"));
    const variantId = Number(searchParams.get("variantId"));
    const requestedQuantity = Number(searchParams.get("quantity") ?? 1);
    const quantity =
        Number.isFinite(requestedQuantity) && requestedQuantity > 0
            ? Math.floor(requestedQuantity)
            : 1;
    const hasValidProductId = Number.isInteger(productId) && productId > 0;
    const hasValidVariantId = Number.isInteger(variantId) && variantId > 0;
    const redirectTo = `${location.pathname}${location.search}`;
    const hasInitializedForm = useRef(false);
    const [form, setForm] = useState(emptyForm);
    const [submittedOrder, setSubmittedOrder] = useState(null);
    const checkoutMutation = useCheckout();
    const { data: checkoutContext, isLoading: isCheckoutLoading } =
        useCheckoutContext(hasToken);
    const { data: product, error, isLoading: isProductLoading } =
        useProductById(hasValidProductId ? productId : null);

    const selectedVariant = useMemo(() => {
        if (!product?.variants?.length) {
            return null;
        }

        return product.variants.find((variant) => variant.id === variantId) ?? null;
    }, [product, variantId]);

    useEffect(() => {
        if (!checkoutContext || hasInitializedForm.current) {
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
                checkoutContext.payment_methods?.[0]?.value ?? current.payment_method,
            save_as_default: Boolean(address),
        }));

        hasInitializedForm.current = true;
    }, [checkoutContext]);

    useEffect(() => {
        setSubmittedOrder(null);
        checkoutMutation.reset();
    }, [productId, quantity, variantId]);

    useEffect(() => {
        if (!selectedVariant?.stock_qty || quantity <= selectedVariant.stock_qty) {
            return;
        }

        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("quantity", String(selectedVariant.stock_qty));
        setSearchParams(nextParams, { replace: true });
    }, [quantity, searchParams, selectedVariant, setSearchParams]);

    const shippingAmount = Number(checkoutContext?.shipping_amount ?? 0);
    const subtotal = Number(selectedVariant?.price ?? 0) * quantity;
    const compareTotal =
        Number(
            selectedVariant?.compare_at_price ?? selectedVariant?.price ?? 0
        ) * quantity;
    const discountAmount = Math.max(compareTotal - subtotal, 0);
    const grandTotal = subtotal + shippingAmount;
    const formErrors = checkoutMutation.error?.response?.data?.errors ?? {};
    const generalError = checkoutMutation.error?.response?.data?.message ?? null;

    const updateQuantity = (delta) => {
        if (!selectedVariant?.stock_qty) {
            return;
        }

        const nextQuantity = Math.min(
            selectedVariant.stock_qty,
            Math.max(1, quantity + delta)
        );

        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("quantity", String(nextQuantity));
        setSearchParams(nextParams, { replace: true });
    };

    const onChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        if (!product?.id || !selectedVariant?.id) {
            return;
        }

        const order = await checkoutMutation.mutateAsync({
            product_id: product.id,
            variant_id: selectedVariant.id,
            quantity,
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
        });

        setSubmittedOrder(order);
    };

    if (isProductLoading || (hasToken && isCheckoutLoading)) {
        return (
            <div className="min-h-screen bg-[#f6f0ea] px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl animate-pulse space-y-8">
                    <div className="h-12 w-80 bg-black/5" />
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="space-y-6">
                            <div className="h-40 rounded-[28px] bg-white" />
                            <div className="h-80 rounded-[28px] bg-white" />
                        </div>
                        <div className="h-[520px] rounded-[28px] bg-white" />
                    </div>
                </div>
            </div>
        );
    }

    if (!hasValidProductId || !hasValidVariantId) {
        return (
            <div className="min-h-screen bg-[#f6f0ea] px-6 py-20 text-center">
                <div className="mx-auto max-w-3xl rounded-[30px] border border-black/8 bg-white p-10 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                        Invalid Checkout Link
                    </p>
                    <h1 className="mt-4 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        Select a product variant before checkout.
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

    if (error?.response?.status === 404 || !product) {
        return (
            <div className="min-h-screen bg-[#f6f0ea] px-6 py-20 text-center">
                <div className="mx-auto max-w-3xl rounded-[30px] border border-black/8 bg-white p-10 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <h1 className="font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        This product is no longer available for checkout.
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

    if (!selectedVariant) {
        return (
            <div className="min-h-screen bg-[#f6f0ea] px-6 py-20 text-center">
                <div className="mx-auto max-w-3xl rounded-[30px] border border-black/8 bg-white p-10 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                    <h1 className="font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        The selected variant is no longer available.
                    </h1>
                    <Link
                        to={`/product/${product.id}`}
                        className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                    >
                        Choose Another Variant
                    </Link>
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
                            Complete Your Order
                        </h1>
                    </div>
                    <Link
                        to={`/product/${product.id}`}
                        className="inline-flex w-fit rounded-full border border-black/12 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                    >
                        Back To Product
                    </Link>
                </div>

                {submittedOrder ? (
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                        <Card
                            title="Order Confirmed"
                            copy="The order, order item, payment record, and stock reservation were created successfully."
                        >
                            <h2 className="font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                                {submittedOrder.order_number}
                            </h2>
                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-[22px] bg-[#faf6f1] p-5 text-sm leading-6 text-black/65">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                        Shipping
                                    </p>
                                    <p className="mt-3 font-semibold text-black">
                                        {submittedOrder.shipping_address?.full_name}
                                    </p>
                                    <p>{submittedOrder.shipping_address?.full_address}</p>
                                </div>
                                <div className="rounded-[22px] bg-[#faf6f1] p-5 text-sm leading-6 text-black/65">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                        Payment
                                    </p>
                                    <p className="mt-3 font-semibold uppercase text-black">
                                        {submittedOrder.payment_method?.replaceAll("_", " ")}
                                    </p>
                                    <p>Status: {submittedOrder.payment_status}</p>
                                </div>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link to="/shop" className="rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                                    Continue Shopping
                                </Link>
                                <Link to="/user-profile" className="rounded-full border border-black/12 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white">
                                    View Account
                                </Link>
                            </div>
                        </Card>

                        <Card title="Order Summary">
                            <div className="space-y-4">
                                <Line label="Subtotal" value={formatCurrency(submittedOrder.item?.total_price)} />
                                <Line label="Discount" value={formatCurrency(submittedOrder.discount_amount)} faded />
                                <Line label="Shipping" value={formatCurrency(submittedOrder.shipping_amount)} faded />
                                <div className="flex items-center justify-between border-t border-black/8 pt-4 text-lg font-semibold text-black">
                                    <span>Total</span>
                                    <span>{formatCurrency(submittedOrder.grand_total)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="space-y-6">
                            {!hasToken ? (
                                <Card
                                    title="Authentication"
                                    copy="Checkout is bound to the authenticated user because orders, addresses, and payments are stored under the account."
                                >
                                    <div className="flex flex-wrap gap-3">
                                        <Link to="/sign-in" state={{ redirectTo }} className="rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                                            Sign In To Continue
                                        </Link>
                                        <Link to="/sign-up" className="rounded-full border border-black/12 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white">
                                            Create Account
                                        </Link>
                                    </div>
                                </Card>
                            ) : (
                                <>
                                    <Card title="Account">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Input label="Full Name" value={checkoutContext?.customer?.full_name ?? form.full_name} readOnly onChange={() => {}} />
                                            <Input label="Email" value={checkoutContext?.customer?.email ?? ""} readOnly onChange={() => {}} />
                                        </div>
                                    </Card>

                                    <form className="space-y-6" onSubmit={onSubmit}>
                                        <Card
                                            title="Shipping Address"
                                            copy="A new address snapshot is stored on the order so later address changes do not rewrite purchase history."
                                        >
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <Input label="Address Label" name="label" value={form.label} onChange={onChange} error={fieldError(formErrors, "shipping_address.label")} />
                                                <Input label="Recipient Name" name="full_name" value={form.full_name} onChange={onChange} error={fieldError(formErrors, "shipping_address.full_name")} />
                                                <Input label="Phone" name="phone" value={form.phone} onChange={onChange} error={fieldError(formErrors, "shipping_address.phone")} />
                                                <Input label="Postal Code" name="postal_code" value={form.postal_code} onChange={onChange} error={fieldError(formErrors, "shipping_address.postal_code")} />
                                                <div className="sm:col-span-2">
                                                    <Input label="Address Line 1" name="address_line1" value={form.address_line1} onChange={onChange} error={fieldError(formErrors, "shipping_address.address_line1")} />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Input label="Address Line 2" name="address_line2" value={form.address_line2} onChange={onChange} error={fieldError(formErrors, "shipping_address.address_line2")} />
                                                </div>
                                                <Input label="City" name="city" value={form.city} onChange={onChange} error={fieldError(formErrors, "shipping_address.city")} />
                                                <Input label="State / Region" name="state" value={form.state} onChange={onChange} error={fieldError(formErrors, "shipping_address.state")} />
                                                <div className="sm:col-span-2">
                                                    <Input label="Country" name="country" value={form.country} onChange={onChange} error={fieldError(formErrors, "shipping_address.country")} />
                                                </div>
                                            </div>
                                            <label className="mt-5 flex items-start gap-3 rounded-[20px] border border-black/8 bg-[#faf6f1] px-4 py-4 text-sm text-black/70">
                                                <input type="checkbox" name="save_as_default" checked={form.save_as_default} onChange={onChange} className="mt-0.5 h-4 w-4 rounded border-black/15 text-black focus:ring-black" />
                                                <span>Save this address as the default for future checkout.</span>
                                            </label>
                                        </Card>

                                        <Card
                                            title="Payment"
                                            copy="The backend creates a payment record at checkout, but gateway capture still remains pending."
                                        >
                                            <div className="space-y-3">
                                                {checkoutContext?.payment_methods?.map((method) => {
                                                    const active = form.payment_method === method.value;

                                                    return (
                                                        <label key={method.value} className={`flex cursor-pointer items-start gap-4 rounded-[22px] border px-4 py-4 transition ${active ? "border-black bg-black text-white" : "border-black/8 bg-[#faf6f1] text-black"}`}>
                                                            <input type="radio" name="payment_method" value={method.value} checked={active} onChange={onChange} className="mt-1 h-4 w-4 border-white/20 text-black focus:ring-black" />
                                                            <span>
                                                                <span className="block text-sm font-semibold uppercase tracking-[0.12em]">{method.label}</span>
                                                                <span className={`mt-1 block text-sm leading-6 ${active ? "text-white/70" : "text-black/55"}`}>{method.description}</span>
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </Card>

                                        <Card title="Notes">
                                            <label className="block">
                                                <span className="mb-2 block font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.22em] text-black/50">
                                                    Order Notes
                                                </span>
                                                <textarea
                                                    name="notes"
                                                    value={form.notes}
                                                    onChange={onChange}
                                                    rows={4}
                                                    className="w-full rounded-[18px] border border-black/8 bg-[#faf6f1] px-4 py-3 text-sm outline-none transition focus:border-black"
                                                />
                                            </label>
                                        </Card>

                                        {generalError ? (
                                            <div className="rounded-[22px] border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-sm text-[#9f1239]">
                                                {generalError}
                                            </div>
                                        ) : null}

                                        <button
                                            type="submit"
                                            disabled={!selectedVariant.in_stock || checkoutMutation.isPending}
                                            className="rounded-full bg-black px-7 py-4 text-[11px] font-bold uppercase tracking-[0.24em] text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/25"
                                        >
                                            {checkoutMutation.isPending ? "Placing Order..." : "Place Order"}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>

                        <aside className="lg:sticky lg:top-28 lg:h-fit">
                            <Card title="Order Summary">
                                <div className="flex gap-4">
                                    <div className="aspect-[3/4] w-28 overflow-hidden rounded-[20px] bg-[#f4efe9]">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center px-3 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-black/35">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-black">{product.brand}</p>
                                        <p className="mt-2 text-lg font-semibold text-black">{product.name}</p>
                                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-black/45">
                                            {selectedVariant.size ? `Size ${selectedVariant.size}` : "One Size"}
                                            {selectedVariant.color ? ` / ${selectedVariant.color}` : ""}
                                        </p>
                                        <div className="mt-5 flex items-center gap-3">
                                            <button type="button" onClick={() => updateQuantity(-1)} disabled={quantity <= 1} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#faf6f1] text-lg text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/25">
                                                -
                                            </button>
                                            <span className="min-w-10 text-center text-sm font-semibold uppercase tracking-[0.18em] text-black">
                                                {String(quantity).padStart(2, "0")}
                                            </span>
                                            <button type="button" onClick={() => updateQuantity(1)} disabled={quantity >= selectedVariant.stock_qty} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#faf6f1] text-lg text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/25">
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 rounded-[22px] bg-[#faf6f1] p-5 text-sm leading-6 text-black/65">
                                    {selectedVariant.in_stock
                                        ? `${selectedVariant.stock_qty} unit(s) currently available for this variant.`
                                        : "This variant is currently out of stock."}
                                </div>

                                <div className="mt-8 space-y-4 border-t border-black/8 pt-6">
                                    <Line label="Unit Price" value={formatCurrency(selectedVariant.price)} />
                                    <Line label="Subtotal" value={formatCurrency(subtotal)} />
                                    <Line label="Discount" value={formatCurrency(discountAmount)} faded />
                                    <Line label="Shipping" value={formatCurrency(shippingAmount)} faded />
                                    <div className="flex items-center justify-between border-t border-black/8 pt-4 text-lg font-semibold text-black">
                                        <span>Total</span>
                                        <span>{formatCurrency(grandTotal)}</span>
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
