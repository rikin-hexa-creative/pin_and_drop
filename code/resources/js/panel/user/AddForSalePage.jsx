import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCreateUserSale } from "../../apis/sale.api";
import { formatCurrency } from "../../utils/currency";

const conditionOptions = [
    "New With Tags",
    "Excellent",
    "Very Good",
    "Good",
    "Fair",
];

const getTodayDateInputValue = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatPreviewPrice = (value) => {
    return formatCurrency(value);
};

const AddForSalePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const hasToken = Boolean(Cookies.get("user_token"));
    const redirectTo = `${location.pathname}${location.search}`;
    const createUserSaleMutation = useCreateUserSale();
    const todayDate = getTodayDateInputValue();
    const [form, setForm] = useState(() => ({
        name: "",
        description: "",
        actual_price: "",
        compare_at_price: "",
        condition: "Excellent",
        created_date: todayDate,
        sale_status: "not_sold",
        status: "active",
    }));
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [formError, setFormError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const currentPrice = formatPreviewPrice(form.actual_price);
    const compareAtPrice = formatPreviewPrice(form.compare_at_price);
    const hasCompareAtPrice =
        Number.isFinite(Number(form.compare_at_price)) &&
        Number(form.compare_at_price) > 0;

    useEffect(() => {
        const previews = imageFiles.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        setImagePreviews(previews);

        return () => {
            previews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [imageFiles]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
        setFieldErrors((current) => ({
            ...current,
            [name]: undefined,
        }));
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files ?? []);

        if (!selectedFiles.length) {
            return;
        }

        setImageFiles((current) => [...current, ...selectedFiles].slice(0, 8));
        event.target.value = "";
        setFormError("");
        setFieldErrors((current) => ({
            ...current,
            images: undefined,
        }));
    };

    const handleRemoveImage = (indexToRemove) => {
        setImageFiles((current) =>
            current.filter((_, index) => index !== indexToRemove)
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");
        setFieldErrors({});

        if (!imageFiles.length) {
            setFieldErrors({
                images: ["Upload at least one product image."],
            });
            return;
        }

        if (
            form.compare_at_price &&
            Number(form.compare_at_price) < Number(form.actual_price)
        ) {
            setFieldErrors({
                compare_at_price: [
                    "Strike-through price must be greater than or equal to the actual price.",
                ],
            });
            return;
        }

        const payload = new FormData();
        imageFiles.forEach((file) => payload.append("images[]", file));
        payload.append("name", form.name);
        payload.append("description", form.description);
        payload.append("actual_price", form.actual_price);
        payload.append("condition", form.condition);
        payload.append("created_date", todayDate);
        payload.append("sale_status", form.sale_status);
        payload.append("status", form.status);

        if (form.compare_at_price) {
            payload.append("compare_at_price", form.compare_at_price);
        }

        try {
            const listing = await createUserSaleMutation.mutateAsync(payload);
            navigate(
                listing?.sale_status === "sold"
                    ? "/sell/sold"
                    : "/sell/for-sale"
            );
        } catch (error) {
            const apiErrors = error?.response?.data?.errors;

            if (apiErrors) {
                setFieldErrors(apiErrors);
                return;
            }

            setFormError(
                error?.response?.data?.message ||
                    "Unable to create the listing right now."
            );
        }
    };

    if (!hasToken) {
        return (
            <div className="min-h-screen bg-[#f6f1eb] px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-[32px] border border-black/8 bg-white p-10 text-center shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
                    <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                        Create Listing
                    </p>
                    <h1 className="mt-4 font-['Inter'] text-4xl font-black uppercase tracking-tight text-black">
                        Sign in to post an item for sale.
                    </h1>
                    <p className="mt-4 text-sm leading-6 text-black/60">
                        Multi-image uploads, pricing, condition, and sale-state
                        management are available for authenticated users only.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            to="/sign-in"
                            state={{ redirectTo }}
                            className="rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/sell/for-sale"
                            className="rounded-full border border-black/12 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                        >
                            View Listings
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fbf7f1_0%,#f1e8de_100%)]">
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="overflow-hidden rounded-[32px] border border-black/8 bg-[#111111] text-white shadow-[0_28px_90px_rgba(0,0,0,0.14)]">
                        <div className="p-6 sm:p-8">
                            <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">
                                Seller Studio
                            </p>
                            <h1 className="mt-4 font-['Inter'] text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl">
                                Add For Sale
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68">
                                Upload a product image set, define its archive
                                story, pricing, condition, sale state, and
                                visibility. The listing will appear in your
                                seller dashboard as soon as it is created.
                            </p>
                        </div>

                        <div className="border-t border-white/10 bg-white/5 p-6 sm:p-8">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                                        Images
                                    </p>
                                    <p className="mt-3 font-['Inter'] text-4xl font-black tracking-tight text-white">
                                        {imageFiles.length}
                                    </p>
                                    <p className="mt-2 text-xs text-white/55">
                                        Up to 8 files per listing
                                    </p>
                                </div>
                                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                                        Sale State
                                    </p>
                                    <p className="mt-3 font-['Inter'] text-3xl font-black uppercase tracking-tight text-white">
                                        {form.sale_status === "sold"
                                            ? "Sold"
                                            : "Not Sold"}
                                    </p>
                                </div>
                                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                                        Visibility
                                    </p>
                                    <p className="mt-3 font-['Inter'] text-3xl font-black uppercase tracking-tight text-white">
                                        {form.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[32px] border border-black/8 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                            Image Set
                                        </p>
                                        <h2 className="mt-2 font-['Inter'] text-2xl font-black uppercase tracking-tight text-black">
                                            Product Images
                                        </h2>
                                    </div>
                                    <label className="inline-flex cursor-pointer items-center rounded-full border border-black/12 bg-[#f7f2eb] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white">
                                        Upload Images
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {imagePreviews.length ? (
                                        imagePreviews.map((preview, index) => (
                                            <div
                                                key={`${preview.name}-${index}`}
                                                className="group relative overflow-hidden rounded-[24px] border border-black/8 bg-[#f5efe8]"
                                            >
                                                <div className="aspect-[4/5] overflow-hidden">
                                                    <img
                                                        src={preview.url}
                                                        alt={preview.name}
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveImage(index)
                                                    }
                                                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-white transition hover:bg-black"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        close
                                                    </span>
                                                </button>
                                                <div className="border-t border-black/8 px-4 py-3">
                                                    <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-black/65">
                                                        {preview.name}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="sm:col-span-2 xl:col-span-3">
                                            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-dashed border-black/12 bg-[#faf7f3] px-6 py-12 text-center">
                                                <span className="material-symbols-outlined text-[34px] text-black/30">
                                                    image
                                                </span>
                                                <h3 className="mt-4 font-['Inter'] text-2xl font-black uppercase tracking-tight text-black">
                                                    Add at least one image
                                                </h3>
                                                <p className="mt-3 max-w-md text-sm leading-6 text-black/60">
                                                    Upload a full image set for
                                                    the piece. Front, side, and
                                                    detail shots work best.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {fieldErrors.images ? (
                                    <p className="mt-3 text-[11px] font-semibold text-[#b91c1c]">
                                        {fieldErrors.images[0]}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <label className="space-y-3">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                        Product Name
                                    </span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Rick Owens Stooges Leather Jacket"
                                        className="w-full rounded-[20px] border border-black/10 bg-[#f7f2eb] px-5 py-4 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
                                        required
                                    />
                                    {fieldErrors.name ? (
                                        <p className="text-[11px] font-semibold text-[#b91c1c]">
                                            {fieldErrors.name[0]}
                                        </p>
                                    ) : null}
                                </label>

                                <label className="space-y-3">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                        Condition
                                    </span>
                                    <select
                                        name="condition"
                                        value={form.condition}
                                        onChange={handleChange}
                                        className="w-full rounded-[20px] border border-black/10 bg-[#f7f2eb] px-5 py-4 text-sm text-black focus:border-black focus:outline-none"
                                    >
                                        {conditionOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.condition ? (
                                        <p className="text-[11px] font-semibold text-[#b91c1c]">
                                            {fieldErrors.condition[0]}
                                        </p>
                                    ) : null}
                                </label>
                            </div>

                            <label className="block space-y-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                    Description
                                </span>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="Describe fit, materials, flaws, provenance, and anything a buyer should know."
                                    className="w-full rounded-[24px] border border-black/10 bg-[#f7f2eb] px-5 py-4 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
                                    required
                                />
                                {fieldErrors.description ? (
                                    <p className="text-[11px] font-semibold text-[#b91c1c]">
                                        {fieldErrors.description[0]}
                                    </p>
                                ) : null}
                            </label>

                            <section className="rounded-[28px] border border-black/8 bg-[linear-gradient(180deg,#f9f3ec_0%,#f4ebe1_100%)] p-5 sm:p-6">
                                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                            Pricing
                                        </p>
                                        <h3 className="mt-2 font-['Inter'] text-2xl font-black uppercase tracking-tight text-black">
                                            Current Price
                                        </h3>
                                        <div className="mt-4 flex flex-wrap items-end gap-3">
                                            <span className="font-['Inter'] text-5xl font-black tracking-tight text-black">
                                                {currentPrice}
                                            </span>
                                            {hasCompareAtPrice ? (
                                                <span className="pb-1 text-lg font-semibold text-black/35 line-through">
                                                    {compareAtPrice}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="mt-3 max-w-lg text-sm leading-6 text-black/58">
                                            Set the final selling amount first.
                                            Add the strike-through price if you
                                            want the listing to show the
                                            original higher reference price.
                                        </p>
                                    </div>

                                    <div className="min-w-[220px] rounded-[24px] bg-white/75 p-5">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
                                            Price Preview
                                        </p>
                                        <div className="mt-4 space-y-3 text-sm text-black/68">
                                            <div className="flex items-center justify-between gap-4">
                                                <span>Live price</span>
                                                <span className="font-semibold text-black">
                                                    {currentPrice}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <span>Strike-through</span>
                                                <span className="font-semibold text-black">
                                                    {hasCompareAtPrice
                                                        ? compareAtPrice
                                                        : "Not set"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-6 md:grid-cols-2">
                                    <label className="space-y-3">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                            Actual Price
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="actual_price"
                                            value={form.actual_price}
                                            onChange={handleChange}
                                            placeholder="180.00"
                                            className="w-full rounded-[20px] border border-black/10 bg-white px-5 py-4 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
                                            required
                                        />
                                        {fieldErrors.actual_price ? (
                                            <p className="text-[11px] font-semibold text-[#b91c1c]">
                                                {fieldErrors.actual_price[0]}
                                            </p>
                                        ) : null}
                                    </label>

                                    <label className="space-y-3">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                            Strike-through Price
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="compare_at_price"
                                            value={form.compare_at_price}
                                            onChange={handleChange}
                                            placeholder="220.00"
                                            className="w-full rounded-[20px] border border-black/10 bg-white px-5 py-4 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
                                        />
                                        {fieldErrors.compare_at_price ? (
                                            <p className="text-[11px] font-semibold text-[#b91c1c]">
                                                {fieldErrors.compare_at_price[0]}
                                            </p>
                                        ) : null}
                                    </label>
                                </div>
                            </section>

                            <div className="grid gap-6 md:grid-cols-2">
                                <label className="space-y-3">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                        Sold Status
                                    </span>
                                    <select
                                        name="sale_status"
                                        value={form.sale_status}
                                        onChange={handleChange}
                                        className="w-full rounded-[20px] border border-black/10 bg-[#f7f2eb] px-5 py-4 text-sm text-black focus:border-black focus:outline-none"
                                    >
                                        <option value="not_sold">
                                            Not Sold
                                        </option>
                                        <option value="sold">Sold</option>
                                    </select>
                                    {fieldErrors.sale_status ? (
                                        <p className="text-[11px] font-semibold text-[#b91c1c]">
                                            {fieldErrors.sale_status[0]}
                                        </p>
                                    ) : null}
                                </label>

                                <label className="space-y-3">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                        Visibility Status
                                    </span>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full rounded-[20px] border border-black/10 bg-[#f7f2eb] px-5 py-4 text-sm text-black focus:border-black focus:outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>
                                    {fieldErrors.status ? (
                                        <p className="text-[11px] font-semibold text-[#b91c1c]">
                                            {fieldErrors.status[0]}
                                        </p>
                                    ) : null}
                                </label>
                            </div>

                            <label className="block space-y-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                                    Created Date
                                </span>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-black/35">
                                        <span className="material-symbols-outlined text-[18px]">
                                            calendar_month
                                        </span>
                                    </span>
                                    <input
                                        type="date"
                                        name="created_date"
                                        value={form.created_date}
                                        disabled
                                        readOnly
                                        className="w-full cursor-not-allowed rounded-[20px] border border-black/10 bg-[#f2ece5] pl-11 pr-5 py-4 text-sm text-black/65 focus:outline-none"
                                    />
                                </div>
                                <p className="text-[11px] leading-5 text-black/48">
                                    The created date is fixed to today when the
                                    listing is posted.
                                </p>
                                {fieldErrors.created_date ? (
                                    <p className="text-[11px] font-semibold text-[#b91c1c]">
                                        {fieldErrors.created_date[0]}
                                    </p>
                                ) : null}
                            </label>

                            {formError ? (
                                <div className="rounded-[20px] border border-[#f2c5c5] bg-[#fff6f6] px-5 py-4 text-sm text-[#b91c1c]">
                                    {formError}
                                </div>
                            ) : null}

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Link
                                    to="/sell/for-sale"
                                    className="inline-flex justify-center rounded-full border border-black/12 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition hover:border-black hover:bg-black hover:text-white"
                                >
                                    Back To Listings
                                </Link>
                                <button
                                    type="submit"
                                    disabled={createUserSaleMutation.isPending}
                                    className="inline-flex justify-center rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {createUserSaleMutation.isPending
                                        ? "Creating Listing..."
                                        : "Create Listing"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AddForSalePage;
