import {
    ChevronDown,
    Lock,
    MapPin,
    Plus,
    Search,
    Settings,
    Share2,
    Star,
} from "lucide-react";

const UserProfilePage = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Info Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Avatar Wrapper */}
                        <div className="relative group">
                            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-black flex items-center justify-center text-white text-2xl md:text-3xl font-bold border-4 border-white shadow-sm overflow-hidden">
                                SE
                            </div>
                            <label
                                htmlFor="editAvatar"
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Plus className="text-white w-6 h-6" />
                                <input
                                    id="editAvatar"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                />
                            </label>
                        </div>

                        {/* Name and Meta */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                senyad5139
                            </h1>
                            <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500">
                                <p className="font-medium text-gray-900">
                                    0 Transactions
                                </p>
                                <div className="flex items-center gap-3">
                                    <span>Joined 2026</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} /> Asia
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-300 rounded-md font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            <Settings size={18} />
                            Edit Profile
                        </button>
                        <button className="p-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="flex gap-8 mb-8 pb-8 border-b border-gray-100">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-bold text-lg">
                            <Star size={18} className="fill-current" />
                            <span>0.0</span>
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                            No Reviews
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-gray-900 cursor-pointer hover:underline">
                            0
                        </span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                            Following
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-gray-900 cursor-pointer hover:underline">
                            0
                        </span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                            Followers
                        </span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
                    {[
                        "Selling",
                        "Favorites",
                        "Saved",
                        "Purchases",
                        "Reviews",
                    ].map((tab, idx) => (
                        <button
                            key={tab}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${
                                idx === 0
                                    ? "text-black"
                                    : "text-gray-400 hover:text-black"
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                {(tab === "Saved" || tab === "Purchases") && (
                                    <Lock size={14} />
                                )}
                                {tab}
                            </span>
                            {idx === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Layout */}
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters - Desktop Only */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                            <h3 className="font-bold text-sm mb-2">My Sizes</h3>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                Filter out listings that aren't in your size.
                            </p>
                            <button className="w-full py-2 bg-white border border-gray-300 rounded text-xs font-bold hover:shadow-sm transition-shadow">
                                Add My Sizes
                            </button>
                        </div>

                        {[
                            "Department",
                            "Seller Location",
                            "Category",
                            "Size",
                            "Designer",
                            "Price",
                        ].map((filter) => (
                            <div
                                key={filter}
                                className="border-b border-gray-100 py-4 flex items-center justify-between cursor-pointer group"
                            >
                                <span className="text-sm font-bold text-gray-800 group-hover:text-black">
                                    {filter}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className="text-gray-400"
                                />
                            </div>
                        ))}
                    </aside>

                    {/* Main Feed Area */}
                    <main className="flex-1">
                        {/* Feed Header */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm font-bold text-gray-500">
                                0 Listings
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">
                                    Sort:
                                </span>
                                <select className="text-sm font-bold bg-transparent border-none focus:ring-0 cursor-pointer">
                                    <option>Most Relevant</option>
                                    <option>Newest</option>
                                    <option>Price: Low to High</option>
                                </select>
                            </div>
                        </div>

                        {/* Empty State */}
                        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-gray-100 rounded-2xl">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="text-gray-300" size={32} />
                            </div>
                            <h2 className="text-xl font-bold mb-2">
                                No listings yet
                            </h2>
                            <p className="text-gray-500 mb-8 text-center max-w-xs">
                                When you start selling, your items will appear
                                here for the community to see.
                            </p>
                            <a
                                href="/sell/new"
                                className="px-8 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-transform active:scale-95 shadow-lg shadow-black/10"
                            >
                                + Start a new Listing
                            </a>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
