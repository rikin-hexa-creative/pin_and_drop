import { Pin } from "lucide-react";
import { useState } from "react";
import {
    useCreateCollection,
    useGetUserCollections,
    usePinProduct,
    useUnpinProduct,
} from "../../apis/collection.api";

const PinModal = ({ isOpen, onClose, productId }) => {
    const { data: collectionsData, isLoading } = useGetUserCollections({
        enabled: isOpen,
    });
    const { mutate: createCollection, isPending: isCreating } =
        useCreateCollection();
    const { mutate: pinProduct, isPending: isPinning } = usePinProduct();
    const { mutate: unpinProduct } = useUnpinProduct();

    const [newCollectionName, setNewCollectionName] = useState("");

    const collections = collectionsData?.data || [];

    if (!isOpen) return null;

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;

        createCollection(
            { name: newCollectionName.trim() },
            {
                onSuccess: (res) => {
                    setNewCollectionName("");
                    // Auto pin to the newly created collection
                    const newId = res.data?.id;
                    if (newId) {
                        pinProduct({ collectionId: newId, productId });
                    }
                },
            }
        );
    };

    const togglePin = (collection) => {
        // Technically we should know if it's already pinned to display proper state.
        // For now, we will just pin it. (The backend handles duplicate pins gracefully).
        pinProduct({ collectionId: collection.id, productId });
        // We could close on selection, or let them pin to multiple.
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#fbf9f8] w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#cfc4c5]/20 p-6">
                    <h2 className="font-['Inter'] text-xl font-black uppercase tracking-tighter">
                        Create A Board
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#efeded] transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="animate-pulse flex flex-col gap-4">
                            <div className="h-12 bg-black/5" />
                            <div className="h-12 bg-black/5" />
                        </div>
                    ) : collections.length > 0 ? (
                        <ul className="space-y-2">
                            {collections.map((c) => (
                                <li key={c.id}>
                                    <button
                                        onClick={() => togglePin(c)}
                                        disabled={isPinning}
                                        className="w-full text-left flex items-center justify-between p-4 border border-[#cfc4c5]/40 hover:border-black transition-colors group bg-white"
                                    >
                                        <span className="font-['Space_Grotesk'] text-sm tracking-widest uppercase font-bold">
                                            {c.name}
                                        </span>
                                        <Pin />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="font-['Space_Grotesk'] text-xs text-center text-black/50 uppercase tracking-widest py-4">
                            No collections yet. Create your first board below.
                        </p>
                    )}
                </div>

                <div className="border-t border-[#cfc4c5]/20 p-6 bg-[#f5f3f3]">
                    <form onSubmit={handleCreate} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="NEW COLLECTION NAME..."
                            value={newCollectionName}
                            onChange={(e) =>
                                setNewCollectionName(e.target.value)
                            }
                            className="w-full border-none bg-white px-4 py-3 font-['Space_Grotesk'] text-xs tracking-widest uppercase focus:ring-1 focus:ring-black"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isCreating || !newCollectionName.trim()}
                            className="bg-black text-white px-6 font-['Inter'] text-xs tracking-[0.2em] font-black uppercase transition-colors hover:bg-zinc-800 disabled:opacity-50"
                        >
                            {isCreating ? "..." : "ADD"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PinModal;
