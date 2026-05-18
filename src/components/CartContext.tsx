import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string | number;
  title: string;
  price: string;
  priceNum: number;
  image: string;
  quantity: number;
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string | number, size?: string) => void;
  updateQuantity: (id: string | number, quantity: number, size?: string) => void;
  clearCart: () => void;
  submitOrder: (formData: any, isGiftClaimed?: boolean) => Promise<{success: boolean; message?: string; orderId?: string}>;
  totalItems: number;
  totalPrice: number;
  deliveryCharge: number;
  isCooldownActive: boolean;
  remainingTime: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("amarDokan_cart");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const DELIVERY_CHARGE = Number((import.meta as any).env.VITE_DELIVERY_CHARGE || 0);
  const COOLDOWN_MINUTES = Number((import.meta as any).env.VITE_ORDER_COOLDOWN_MINUTES || 60);

  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    localStorage.setItem("amarDokan_cart", JSON.stringify(cart));
  }, [cart]);

  // Cooldown logic
  useEffect(() => {
    const lastOrderTime = localStorage.getItem("last_order_time");
    if (lastOrderTime) {
      const diff = Date.now() - Number(lastOrderTime);
      const remaining = (COOLDOWN_MINUTES * 60 * 1000) - diff;
      if (remaining > 0) {
        setIsCooldownActive(true);
        setRemainingTime(Math.floor(remaining / 1000));
      }
    }
  }, [COOLDOWN_MINUTES]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldownActive && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setIsCooldownActive(false);
            localStorage.removeItem("last_order_time");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCooldownActive, remainingTime]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.size === product.size);
      if (existing) {
        return prev.map((item) =>
          (item.id === product.id && item.size === product.size) 
            ? { ...item, quantity: item.quantity + (product.quantity || 1) } 
            : item
        );
      }
      // Extract number from price string like "494.1 ৳"
      // Replace everything except digits and dot, then parse and round
      const priceNum = Math.round(parseFloat(product.price.replace(/[^\d.]/g, "")) || 0);
      return [...prev, { ...product, priceNum, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (id: string | number, size?: string) => {
    setCart((prev) => prev.filter((item) => !(String(item.id) === String(id) && item.size === size)));
  };

  const updateQuantity = (id: string | number, quantity: number, size?: string) => {
    setCart((prev) => 
      quantity <= 0 
        ? prev.filter(item => !(String(item.id) === String(id) && item.size === size))
        : prev.map(item => (String(item.id) === String(id) && item.size === size) ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.priceNum * item.quantity, 0);

  const submitOrder = async (formData: any, isGiftClaimed: boolean = false) => {
    const apiUrl = (import.meta as any).env.VITE_SHEET_API_URL;
    if (!apiUrl || apiUrl.includes("YOUR_GOOGLE_APPS_SCRIPT_URL")) {
      return { success: false, message: "API কনফিগারেশন করা হয়নি।" };
    }

    try {
      const orderId = `AMR-${Date.now()}`;
      const productsStr = cart.map(item => `[ID:${item.id}] ${item.title} (${item.size}) x${item.quantity}`).join(" | ");
      const imagesStr = cart.map(item => item.image).join(" | ");
      const finalTotal = totalPrice + DELIVERY_CHARGE;
      
      const res = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "order",
          orderId,
          timestamp: new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }),
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          area: formData.area || "",
          products: productsStr,
          images: imagesStr,
          deliveryCharge: DELIVERY_CHARGE,
          total: finalTotal,
          note: formData.note || "",
          status: "Pending",
          ip: "127.0.0.1",
          browser: navigator.userAgent,
          cartItems: cart,
          isGift: isGiftClaimed ? "Gift *[1]" : ""
        })
      });
      
      const data = await res.json();
      if (data.success) {
        clearCart();
        const now = Date.now();
        localStorage.setItem("last_order_time", now.toString());
        setIsCooldownActive(true);
        setRemainingTime(COOLDOWN_MINUTES * 60);
        return { success: true, orderId };
      } else {
        return { success: false, message: data.message };
      }
      
    } catch (err) {
      console.error("Order error:", err);
      return { success: false, message: "অর্ডার সাবমিট করা যায়নি। আবার চেষ্টা করুন।" };
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, 
      submitOrder, totalItems, totalPrice, deliveryCharge: DELIVERY_CHARGE,
      isCooldownActive, remainingTime 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
