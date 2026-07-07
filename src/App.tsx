/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { CartProvider, useCart } from "./components/CartContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import Footer from "./components/Footer";
import TrackOrderModal from "./components/TrackOrderModal";
import VantaBackground from "./components/VantaBackground";
import CartBubble from "./components/CartBubble";
import { ShoppingBag, Home, Info, HelpCircle, PackageSearch } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Pages
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import SyncPage from "./pages/SyncPage";
import { initPixel, trackEvent } from "./lib/pixel";

function Layout({ children }: { children: React.ReactNode }) {
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, totalPrice } = useCart();

  React.useEffect(() => {
    const pixelId = (import.meta as any).env.VITE_FACEBOOK_PIXEL_ID;
    if (pixelId) {
      initPixel(pixelId);
    }
    trackEvent("PageView");
  }, [location.pathname]);

  const handleCartClick = () => {
    trackEvent("InitiateCheckout", {
      value: totalPrice,
      currency: "BDT",
      num_items: totalItems
    });

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById("checkout-panel") || document.getElementById("catalog");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      const el = document.getElementById("checkout-panel") || document.getElementById("catalog");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFilterToggle = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
        window.dispatchEvent(new CustomEvent("toggle-catalog-filter"));
      }, 300);
    } else {
      window.dispatchEvent(new CustomEvent("toggle-catalog-filter"));
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-neon-blue/30 overflow-x-hidden">
      <VantaBackground />
      <Navbar 
        onCartClick={handleCartClick} 
        onTrackClick={() => setIsTrackOpen(true)} 
        onFilterToggle={handleFilterToggle}
      />
      <main>{children}</main>
      
      <Footer />
      <CartBubble onOpenCheckout={handleCartClick} />

      <TrackOrderModal isOpen={isTrackOpen} onClose={() => setIsTrackOpen(false)} />
    </div>
  );
}

function HomePage() {
  return (
    <div className="flex flex-col">
      <div className="order-2 md:order-1">
        <Hero />
      </div>
      <div className="order-1 md:order-2">
        <section id="catalog"><Catalog /></section>
      </div>
    </div>
  );
}

export default function App() {
  React.useEffect(() => {
    const siteName = (import.meta as any).env.VITE_SITE_NAME || (import.meta as any).env.VITE_WEBSITE_NAME || "শুকরিয়া শপ";
    document.title = siteName;
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/:productId" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path={`/${(import.meta as any).env.VITE_SYNC_CODE}`} element={<SyncPage />} />
            </Routes>
          </Layout>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
