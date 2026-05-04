import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signIn, signInWithGoogle } from "../../apis/user-auth.api";
import { useUser } from "../../context/UserContext";

const SignInPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { setUser } = useUser();
    const googleClientRef = useRef(null);
    const redirectTo =
        typeof location.state?.redirectTo === "string"
            ? location.state.redirectTo
            : "/";
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    const completeSignIn = useEffectEvent((response) => {
        if (response?.token) {
            Cookies.set("user_token", response.token, {
                expires: 7,
                sameSite: "strict",
            });
        }

        if (response?.user) {
            setUser(response.user);
            queryClient.setQueryData(["getUserProfile"], response.user);
        }

        navigate(redirectTo);
    });

    const resolveApiError = useEffectEvent(
        (submitError, fallbackMessage = "Unable to sign in at the moment.") => {
            const apiMessage =
                submitError?.response?.data?.errors?.access_token?.[0] ||
                submitError?.response?.data?.message ||
                fallbackMessage;

            setError(apiMessage);
        }
    );

    const handleGoogleAccessToken = useEffectEvent(async (tokenResponse) => {
        if (tokenResponse?.error || !tokenResponse?.access_token) {
            setError(
                tokenResponse?.error_description ||
                    "Unable to sign in with Google at the moment."
            );
            setGoogleLoading(false);
            return;
        }

        try {
            const response = await signInWithGoogle({
                access_token: tokenResponse.access_token,
            });

            completeSignIn(response);
        } catch (submitError) {
            resolveApiError(
                submitError,
                "Unable to sign in with Google at the moment."
            );
        } finally {
            setGoogleLoading(false);
        }
    });

    useEffect(() => {
        if (!googleClientId) {
            googleClientRef.current = null;
            return undefined;
        }

        const initializeGoogleClient = () => {
            if (!window.google?.accounts?.oauth2) {
                return false;
            }

            googleClientRef.current = window.google.accounts.oauth2.initTokenClient(
                {
                    client_id: googleClientId,
                    scope: "openid email profile",
                    callback: (tokenResponse) => {
                        void handleGoogleAccessToken(tokenResponse);
                    },
                    error_callback: () => {
                        setGoogleLoading(false);
                        setError("Google sign in was cancelled.");
                    },
                }
            );

            return true;
        };

        if (initializeGoogleClient()) {
            return undefined;
        }

        const googleScript = document.querySelector(
            'script[src="https://accounts.google.com/gsi/client"]'
        );
        const handleScriptLoad = () => {
            initializeGoogleClient();
        };

        googleScript?.addEventListener("load", handleScriptLoad);

        return () => {
            googleScript?.removeEventListener("load", handleScriptLoad);
        };
    }, [googleClientId]);

    const onChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await signIn(form);

            completeSignIn(response);
        } catch (submitError) {
            resolveApiError(submitError);
        } finally {
            setLoading(false);
        }
    };

    const onGoogleSignIn = () => {
        setError("");

        if (!googleClientId) {
            setError("Google sign in is not configured.");
            return;
        }

        if (!googleClientRef.current) {
            setError("Google sign in is still loading. Please try again.");
            return;
        }

        setGoogleLoading(true);
        googleClientRef.current.requestAccessToken({
            prompt: "select_account",
        });
    };

    return (
        <div className="font-body selection:bg-black selection:text-white bg-gradient-to-b from-surface to-surface-dim/60 text-on-surface overflow-x-hidden min-h-screen">
            <main className=" flex items-center justify-center px-6 md:px-16 py-12 md:py-8">
                <section className="w-full max-w-md bg-surface/95 backdrop-blur-sm border border-black/10 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)] p-8 md:p-10 flex flex-col justify-center">
                    <div className="max-w-sm w-full mx-auto">
                        <div className="mb-8">
                            <h1 className="font-headline text-3xl font-black tracking-tighter uppercase mb-2">
                                MEMBER LOGIN
                            </h1>
                            <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant">
                                Enter your credentials to continue
                            </p>
                        </div>

                        <form className="space-y-8" onSubmit={onSubmit}>
                            <div className="flex flex-col">
                                <label
                                    className="font-label text-[10px] tracking-widest uppercase text-black mb-1"
                                    htmlFor="email"
                                >
                                    EMAIL ADDRESS
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    className="border-0 border-b border-black/20 bg-transparent py-3 px-0 rounded-none transition-colors focus:border-black focus:ring-0 font-label text-xs uppercase tracking-wider text-black placeholder:text-black/20"
                                    placeholder="NAME@DOMAIN.COM"
                                    type="email"
                                    value={form.email}
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            <div className="flex flex-col">
                                <div className="flex justify-between items-end mb-1">
                                    <label
                                        className="font-label text-[10px] tracking-widest uppercase text-black"
                                        htmlFor="password"
                                    >
                                        PASSWORD
                                    </label>
                                    <button
                                        className="font-label text-[9px] tracking-widest uppercase text-black/40 hover:text-black transition-colors underline underline-offset-4 decoration-black/20"
                                        type="button"
                                    >
                                        FORGOT?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        className="w-full border-0 border-b border-black/20 bg-transparent py-3 pr-9 px-0 rounded-none transition-colors focus:border-black focus:ring-0 font-label text-xs tracking-widest text-black placeholder:text-black/20"
                                        placeholder="********"
                                        type={
                                            showPassword ? "text" : "password"
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
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
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

                            {error ? (
                                <p className="font-label text-[10px] tracking-widest uppercase text-error">
                                    {error}
                                </p>
                            ) : null}

                            <div className="pt-4 space-y-4">
                                <button
                                    className="w-full bg-primary text-on-primary  font-headline font-black tracking-widest text-sm uppercase hover:bg-on-primary-fixed-variant transition-all duration-300 active:scale-95 disabled:opacity-70"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "SIGNING IN..." : "SIGN IN"}
                                </button>
                                <div className="relative  flex items-center">
                                    <div className="flex-grow border-t border-black/5" />
                                    <span className="flex-shrink mx-4 font-label text-[9px] tracking-widest text-black/30 uppercase">
                                        OR
                                    </span>
                                    <div className="flex-grow border-t border-black/5" />
                                </div>
                                <button
                                    className="w-full border border-black/15 bg-white text-black py-5 font-headline font-black tracking-widest text-sm uppercase hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70"
                                    type="button"
                                    onClick={onGoogleSignIn}
                                    disabled={loading || googleLoading}
                                >
                                    {googleLoading
                                        ? "CONNECTING TO GOOGLE..."
                                        : "LOGIN WITH GOOGLE"}
                                </button>
                            </div>
                        </form>

                        <div className="pt-8 border-t border-black/5">
                            <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-4">
                                NEW TO THE ARCHIVE?
                            </p>
                            <Link
                                className="font-headline font-black text-lg tracking-tight uppercase group flex items-center gap-2"
                                to="/sign-up"
                            >
                                CREATE AN ACCOUNT
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                    arrow_forward
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SignInPage;
