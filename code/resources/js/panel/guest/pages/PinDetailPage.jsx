import { useParams, Link } from "react-router-dom";
import { useGetCollection, useUnpinProduct } from "../../../apis/collection.api";
import ProductCard from "../../../components/product/ProductCard";

const PinDetailPage = () => {
    const { id } = useParams();
    const { data, isLoading, error } = useGetCollection(id);
    const { mutate: unpinProduct } = useUnpinProduct();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fbf9f8] animate-pulse pt-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="h-12 w-1/3 bg-black/5 rounded" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="aspect-[3/4] bg-black/5" />
                        <div className="aspect-[3/4] bg-black/5" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data?.data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fbf9f8]">
                <div className="text-center space-y-4">
                    <h1 className="font-['Inter'] font-black text-2xl uppercase">Collection Not Found</h1>
                    <Link to="/pin" className="inline-block border border-black px-6 py-3 font-['Inter'] text-xs font-black uppercase tracking-[0.22em] transition hover:bg-black hover:text-white">
                        Back to Archives
                    </Link>
                </div>
            </div>
        );
    }

    const collection = data.data;

    return (
        <div className="text-[#1b1c1c] bg-[#fbf9f8] min-h-screen antialiased selection:bg-black selection:text-white">
            <main className="pb-32 px-6 md:px-12 max-w-7xl mx-auto pt-24">
                
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <Link to="/pin" className="font-['Space_Grotesk'] text-xs uppercase tracking-widest text-[#4c4546] hover:text-black mb-4 flex items-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            BACK TO ARCHIVES
                        </Link>
                        <h1 className="font-['Inter'] text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none mt-4">
                            {collection.name}
                        </h1>
                        <p className="font-['Space_Grotesk'] text-sm tracking-widest uppercase text-[#4c4546] mt-4">
                            {collection.products?.length || 0} ITEMS SAVED
                        </p>
                    </div>
                </div>

                {collection.products && collection.products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {collection.products.map(product => (
                            <div key={product.id} className="relative group">
                                <Link to={`/product/${product.id}`} className="block group">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-[#f5f3f3] shadow-sm border border-[#cfc4c5]/10">
                                        <img 
                                            src={product.primary_image?.src || product.images?.[0]?.src || "https://via.placeholder.com/600x800?text=No+Image"} 
                                            alt={product.name} 
                                            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-4 px-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                            <p className="font-['Inter'] text-[11px] font-black text-white uppercase tracking-widest truncate">{product.name}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="font-['Space_Grotesk'] text-[10px] text-white/70 uppercase">
                                                    {product.base_price > 0 ? `$${product.base_price}` : "Price TBD"}
                                                </p>
                                                <span className="text-[10px] text-white/50 font-bold uppercase tracking-tighter">View Detail</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        unpinProduct({ collectionId: collection.id, productId: product.id });
                                    }}
                                    className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-[#bc0000] hover:text-white transition-all transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                                    title="Unpin from collection"
                                >
                                    <span className="material-symbols-outlined text-[18px]">bookmark_remove</span>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center border-2 border-dashed border-[#cfc4c5]/40 bg-[#f5f3f3]">
                        <span className="material-symbols-outlined text-4xl text-black/20 mb-4">bookmarks</span>
                        <p className="font-['Space_Grotesk'] text-xs tracking-[0.2em] font-bold uppercase text-[#4c4546]">No items in this collection</p>
                        <Link to="/shop" className="inline-block mt-6 border border-black px-6 py-3 font-['Inter'] text-xs font-black uppercase tracking-[0.22em] transition hover:bg-black hover:text-white">
                            Explore Archive
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PinDetailPage;
