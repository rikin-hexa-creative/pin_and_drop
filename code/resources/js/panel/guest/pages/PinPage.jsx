import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
    useCreateCollection,
    useGetUserCollections,
} from "../../../apis/collection.api";

const PinPage = () => {
    const navigate = useNavigate();
    const token = Cookies.get("user_token");

    // Guard route logic: If not authed, return empty or redirect via useEffect
    // For now we'll display a small fallback if no token, though the router usually handles this.

    const { data, isLoading, error } = useGetUserCollections({
        enabled: !!token,
    });
    const { mutate: createCollection, isPending: isCreating } =
        useCreateCollection();

    const collections = data?.data || [];

    const handleCreateCollection = () => {
        const name = window.prompt("Enter new collection name:");
        if (name && name.trim() !== "") {
            createCollection({ name: name.trim() });
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fbf9f8]">
                <div className="text-center space-y-4">
                    <p className="font-['Space_Grotesk'] tracking-widest uppercase text-black/50 text-xs">
                        Authentication Required
                    </p>
                    <h1 className="font-['Inter'] font-black text-4xl uppercase">
                        Sign In to Save Archives
                    </h1>
                    <button
                        onClick={() =>
                            navigate("/sign-in", {
                                state: { redirectTo: "/pin" },
                            })
                        }
                        className="border border-black px-6 py-3 font-['Inter'] text-xs font-black uppercase tracking-[0.22em] transition hover:bg-black hover:text-white mt-4"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fbf9f8] animate-pulse pt-12 px-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="h-16 w-3/4 bg-black/5 rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        <div className="aspect-[4/5] bg-black/5" />
                        <div className="aspect-[4/5] bg-black/5" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="text-[#1b1c1c] bg-[#fbf9f8] min-h-screen antialiased selection:bg-black selection:text-white">
            <main className="pb-32 px-6 md:px-12 max-w-7xl mx-auto pt-12">
                <header className="mb-16">
                    <h1 className="font-['Inter'] text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-4">
                        YOUR ARCHIVE
                    </h1>
                    <div className="flex items-baseline justify-between border-b border-[#cfc4c5]/20 pb-4">
                        <p className="font-['Space_Grotesk'] text-sm tracking-widest uppercase text-[#4c4546]">
                            CURATED BOARDS /{" "}
                            {collections.length < 10
                                ? `0${collections.length}`
                                : collections.length}{" "}
                            TOTAL
                        </p>
                        <div className="flex items-center gap-2 cursor-pointer">
                            <span className="font-['Space_Grotesk'] text-xs uppercase font-bold">
                                Sort by
                            </span>
                            <span className="material-symbols-outlined text-sm">
                                expand_more
                            </span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    <button
                        onClick={handleCreateCollection}
                        disabled={isCreating}
                        className="group relative flex flex-col items-center justify-center border-2 border-dashed border-[#cfc4c5]/80 hover:border-black transition-colors aspect-[4/5] bg-[#f5f3f3] disabled:opacity-50"
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <span className="material-symbols-outlined text-5xl font-light group-hover:scale-110 transition-transform">
                                {isCreating ? "sync" : "add"}
                            </span>
                            <span className="font-['Space_Grotesk'] text-xs font-bold tracking-[0.2em] uppercase">
                                {isCreating
                                    ? "CREATING..."
                                    : "CREATE NEW COLLECTION"}
                            </span>
                        </div>
                    </button>

                    {collections.map((collection) => (
                        <div
                            key={collection.id}
                            className="flex flex-col space-y-4 group cursor-pointer"
                            onClick={() => navigate(`/pin/${collection.id}`)}
                        >
                            <div className="max-h-[28rem] relative grid grid-cols-3 grid-rows-4  bg-[#dbdad9]">
                                <div className="col-span-3 row-span-3 overflow-hidden bg-[#e9e8e7]">
                                    {collection.images[0] && (
                                        <img
                                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                            src={collection.images[0]}
                                            alt={collection.name}
                                        />
                                    )}
                                </div>
                                <div className="overflow-hidden bg-[#e9e8e7]">
                                    {collection.images[1] && (
                                        <img
                                            className="w-full h-full object-cover"
                                            src={collection.images[1]}
                                            alt={collection.name + " 2"}
                                        />
                                    )}
                                </div>
                                <div className="overflow-hidden bg-[#e9e8e7]">
                                    {collection.images[2] && (
                                        <img
                                            className="w-full h-full object-cover"
                                            src={collection.images[2]}
                                            alt={collection.name + " 3"}
                                        />
                                    )}
                                </div>
                                <div
                                    className={`overflow-hidden relative ${
                                        collection.item_count > 3
                                            ? "bg-black"
                                            : "bg-[#e9e8e7]"
                                    } flex items-center justify-center`}
                                >
                                    {collection.item_count > 3 ? (
                                        <span className="text-white font-['Space_Grotesk'] text-xs font-bold">
                                            +{collection.item_count - 3}
                                        </span>
                                    ) : (
                                        collection.images[3] && (
                                            <img
                                                className="w-full h-full object-cover"
                                                src={collection.images[3]}
                                                alt={collection.name + " 4"}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-['Inter'] text-2xl font-black tracking-tighter uppercase">
                                        {collection.name}
                                    </h3>
                                    <p className="font-['Space_Grotesk'] text-[10px] tracking-widest text-[#4c4546] uppercase">
                                        Updated {collection.updated_at_human}
                                    </p>
                                </div>
                                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#4c4546]">
                                    {collection.item_count} ITEMS
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default PinPage;
