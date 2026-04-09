import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../../apis/user-auth.api";

const SignUpPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const avatarLabel = useMemo(() => {
        if (!avatar) return "Drag & Drop or Click to Upload";
        return avatar.name;
    }, [avatar]);

    const onChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onAvatarChange = (event) => {
        const file = event.target.files?.[0] || null;
        setAvatar(file);
    };

    useEffect(() => {
        if (!avatar) {
            setAvatarPreview("");
            return undefined;
        }

        const objectUrl = URL.createObjectURL(avatar);
        setAvatarPreview(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [avatar]);

    const onSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const payload = new FormData();
            payload.append("full_name", form.full_name);
            payload.append("email", form.email);
            payload.append("phone", form.phone);
            payload.append("password", form.password);
            payload.append("password_confirmation", form.password_confirmation);
            if (avatar) payload.append("avatar", avatar);

            const response = await signUp(payload);
            setSuccess(response?.message || "Sign up successful.");
            setTimeout(() => navigate("/sign-in"), 700);
        } catch (submitError) {
            const apiMessage =
                submitError?.response?.data?.message ||
                "Unable to register at the moment.";
            setError(apiMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-body selection:bg-black selection:text-white bg-gradient-to-b from-surface to-surface-dim/60 text-on-surface overflow-x-hidden min-h-screen">
            <main className="flex items-center justify-center px-6 md:px-16 py-12 md:py-8">
                <section className="w-full max-w-md bg-surface/95 backdrop-blur-sm border border-black/10 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)] p-8 md:p-10 flex flex-col justify-center">
                    <div className="max-w-sm w-full mx-auto">
                        <header className="mb-8">
                            <h2 className="font-headline text-3xl font-black tracking-tighter uppercase text-primary mb-2">
                                Create Account
                            </h2>
                            <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                                Enter your credentials to begin the curation.
                            </p>
                        </header>

                        <form className="space-y-8" onSubmit={onSubmit}>
                            <div className="space-y-3">
                                <span className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant">
                                    Profile Identity
                                </span>
                                <label
                                    htmlFor="avatar-upload"
                                    className="group relative flex items-center justify-center border-2 border-dashed border-outline-variant hover:border-primary transition-colors cursor-pointer p-8 bg-surface-container-low h-40"
                                >
                                    <input
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={onAvatarChange}
                                    />
                                    {avatarPreview ? (
                                        <div className="absolute inset-0">
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2">
                                                <p className="font-label text-[10px] tracking-widest uppercase break-all text-white text-center">
                                                    {avatarLabel}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center flex flex-col items-center">
                                            <span className="material-symbols-outlined text-outline mb-2">
                                                add_a_photo
                                            </span>
                                            <p className="font-label text-[10px] tracking-widest uppercase break-all px-4">
                                                {avatarLabel}
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className="space-y-6">
                                <div className="relative group">
                                    <label
                                        className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-1 group-focus-within:text-primary transition-colors"
                                        htmlFor="full_name"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 font-headline font-bold text-sm tracking-tight placeholder:text-outline-variant/50 placeholder:font-light"
                                        id="full_name"
                                        name="full_name"
                                        placeholder="ALEXANDER MCQUEEN"
                                        type="text"
                                        value={form.full_name}
                                        onChange={onChange}
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <label
                                        className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-1 group-focus-within:text-primary transition-colors"
                                        htmlFor="email"
                                    >
                                        Email
                                    </label>
                                    <input
                                        className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 font-headline font-bold text-sm tracking-tight placeholder:text-outline-variant/50 placeholder:font-light"
                                        id="email"
                                        name="email"
                                        placeholder="CURATOR@ARCHIVE.COM"
                                        type="email"
                                        value={form.email}
                                        onChange={onChange}
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <label
                                        className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-1 group-focus-within:text-primary transition-colors"
                                        htmlFor="phone"
                                    >
                                        Telephone
                                    </label>
                                    <input
                                        className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 font-headline font-bold text-sm tracking-tight placeholder:text-outline-variant/50 placeholder:font-light"
                                        id="phone"
                                        name="phone"
                                        placeholder="+1 (000) 000-0000"
                                        type="tel"
                                        value={form.phone}
                                        onChange={onChange}
                                    />
                                </div>

                                <div className="relative group">
                                    <label
                                        className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-1 group-focus-within:text-primary transition-colors"
                                        htmlFor="password"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 pr-9 font-headline font-bold text-sm tracking-tight placeholder:text-outline-variant/50 placeholder:font-light"
                                            id="password"
                                            name="password"
                                            placeholder="********"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={form.password}
                                            onChange={onChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                        >
                                            <span className="material-symbols-outlined text-base">
                                                {showPassword
                                                    ? "visibility_off"
                                                    : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label
                                        className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-1 group-focus-within:text-primary transition-colors"
                                        htmlFor="password_confirmation"
                                    >
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 pr-9 font-headline font-bold text-sm tracking-tight placeholder:text-outline-variant/50 placeholder:font-light"
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            placeholder="********"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={form.password_confirmation}
                                            onChange={onChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide confirm password"
                                                    : "Show confirm password"
                                            }
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                        >
                                            <span className="material-symbols-outlined text-base">
                                                {showConfirmPassword
                                                    ? "visibility_off"
                                                    : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error ? (
                                <p className="text-xs font-label tracking-wide text-error uppercase">
                                    {error}
                                </p>
                            ) : null}
                            {success ? (
                                <p className="text-xs font-label tracking-wide text-tertiary uppercase">
                                    {success}
                                </p>
                            ) : null}

                            <div className="pt-4 space-y-6">
                                <button
                                    className="w-full bg-primary text-on-primary font-headline font-black py-4 tracking-widest uppercase text-sm hover:bg-on-primary-fixed-variant transition-colors active:scale-[0.98] duration-150 disabled:opacity-70"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Registering..."
                                        : "Register Member"}
                                </button>
                                <div className="flex items-center justify-between pt-4 border-t border-surface-container">
                                    <span className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant">
                                        Already Registered?
                                    </span>
                                    <Link
                                        className="font-label text-[10px] tracking-widest uppercase text-primary font-bold hover:underline underline-offset-4"
                                        to="/sign-in"
                                    >
                                        Secure Login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SignUpPage;
