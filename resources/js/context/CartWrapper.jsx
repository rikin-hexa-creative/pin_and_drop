import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const item = window.localStorage.getItem("cart");
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error("Failed to load cart from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem("cart", JSON.stringify(cart));
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }, [cart]);

    const addToCart = (product, variant, qty) => {
        setCart((prevCart) => {
            const payload = {
                product_id: product.id,
                name: product.name,
                slug: product.slug,
                category: product.category ? [{ 
                    id: product.category.id, 
                    name: product.category.name, 
                    slug: product.category.slug 
                }] : [],
                price: variant?.price ?? product.price,
                sku: variant?.sku ?? product.sku,
                selected_variants_id: variant?.id ?? null,
                variants_size: variant?.size ?? null,
                variants_color: variant?.color ?? null,
                quantity: qty,
                total_price: (variant?.price ?? product.price) * qty,
                variant_image: variant?.image ?? product.gallery?.find(g => g.is_primary)?.src ?? product.gallery?.[0]?.src ?? null,
                variant_images: variant?.images ?? [],
            };

            const existingItemIndex = prevCart.findIndex(
                (item) =>
                    item.product_id === payload.product_id &&
                    item.selected_variants_id === payload.selected_variants_id
            );

            if (existingItemIndex >= 0) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += qty;
                newCart[existingItemIndex].total_price =
                    newCart[existingItemIndex].price *
                    newCart[existingItemIndex].quantity;
                return newCart;
            }

            return [...prevCart, payload];
        });
    };

    const updateQuantity = (productId, variantId, qty) => {
        setCart((prevCart) => {
            return prevCart.map((item) => {
                if (item.product_id === productId && item.selected_variants_id === variantId) {
                    return {
                        ...item,
                        quantity: qty,
                        total_price: item.price * qty,
                    };
                }
                return item;
            });
        });
    };

    const removeFromCart = (productId, variantId) => {
        setCart((prevCart) =>
            prevCart.filter(
                (item) =>
                    !(item.product_id === productId && item.selected_variants_id === variantId)
            )
        );
    };

    const value = useMemo(
        () => ({
            cart,
            addToCart,
            updateQuantity,
            removeFromCart,
            cartCount: cart.reduce((count, item) => count + item.quantity, 0),
        }),
        [cart]
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

export const useCart = () => {
    return useContext(CartContext);
};
