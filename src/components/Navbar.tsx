import { ShoppingCart, Search, User, Menu, X, Sun, Moon, PackageSearch, ShoppingBag, Info, HelpCircle, SlidersHorizontal } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/src/lib/utils";
import { useCart } from "./CartContext";

export default function Navbar({ onCartClick, onTrackClick, onFilterToggle }: { onCartClick?: () => void, onTrackClick?: () => void, onFilterToggle?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const location = useLocation();

  const siteName = (import.meta as any).env.VITE_SITE_NAME || (import.meta as any).env.VITE_WEBSITE_NAME || "শুকরিয়া শপ";

  const [categories, setCategories] = useState<string[]>(["সব"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["সব"]);

  const navLinks: Array<{ name: string; href?: string; isScroll?: boolean; action?: () => void }> = [
    { name: "হোম", href: "/" },
    { name: "ক্যাটালগ", href: "/#catalog", isScroll: true },
    { name: "আমাদের সম্পর্কে", href: "/about" },
    { name: "যোগাযোগ", href: "/contact" },
  ];

  const navigate = useNavigate();

  const handleScroll = (href: string) => {
    if (location.pathname !== "/") {
       navigate("/");
       setTimeout(() => {
         const id = href.replace("/#", "");
         const el = document.getElementById(id);
         if (el) el.scrollIntoView({ behavior: "smooth" });
       }, 300);
    } else {
       const id = href.replace("/#", "");
       const el = document.getElementById(id);
       if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  React.useEffect(() => {
    try {
      const cached = localStorage.getItem("catalog_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        const cats = Array.from(new Set(["সব", ...parsed.catalog.flatMap((p: any) => p.Category)]));
        setCategories(cats as string[]);
      }
    } catch(e) {}

    const handleCatState = (e: any) => {
      if (e.detail) {
        if (e.detail.categories) setCategories(e.detail.categories);
        if (e.detail.selectedCategories) setSelectedCategories(e.detail.selectedCategories);
      }
    };
    window.addEventListener("categories-state-changed", handleCatState);
    return () => window.removeEventListener("categories-state-changed", handleCatState);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-2 sm:px-4 py-1 sm:py-1.5">
      <div className={cn(
        "max-w-7xl mx-auto rounded-2xl sm:rounded-3xl transition-all duration-500",
        "bg-white/95 dark:bg-slate-900/80 backdrop-blur-3xl px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col gap-1.5 sm:gap-2",
        "shadow-lg dark:shadow-2xl border border-slate-200 dark:border-white/10"
      )}>
        {/* Top Row: Logo & Actions */}
        <div className="flex items-center justify-between w-full">
          {/* Left Side: Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: -10 }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.2)] border border-neon-blue/20"
            >
              <img src="/logo-web.png" alt="Logo" className="w-full h-full object-cover" />
            </motion.div>
            <span className="text-base sm:text-xl font-black font-display tracking-tight text-slate-950 dark:text-white hidden xs:block">
              {siteName}
            </span>
          </Link>

          {/* Right Side: Navigation & Actions */}
          <div className="flex items-center gap-1 sm:gap-6">
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                link.action ? (
                  <button
                    key={link.name}
                    onClick={link.action}
                    className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white hover:text-neon-blue dark:hover:text-neon-blue transition-all"
                  >
                    {link.name}
                  </button>
                ) : link.isScroll ? (
                  <button
                    key={link.name}
                    onClick={() => handleScroll(link.href!)}
                    className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white hover:text-neon-blue dark:hover:text-neon-blue transition-all"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href!}
                    className={cn(
                      "text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] hover:text-neon-blue transition-all",
                      location.pathname === link.href ? "text-neon-blue" : "text-slate-950 dark:text-white"
                    )}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>

            <div className="flex items-center gap-1 sm:gap-3 lg:border-l border-slate-200 dark:border-white/10 lg:pl-5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onFilterToggle}
                className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-1.5 bg-slate-100 dark:bg-white/5 text-slate-950 dark:text-white/80 hover:text-neon-blue dark:hover:text-neon-blue hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 transition-all min-w-[42px] sm:min-w-[54px] shadow-sm dark:shadow-none"
              >
                <SlidersHorizontal size={16} className="sm:w-4 sm:h-4" />
                <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider">ফিল্টার</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onTrackClick}
                className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-1.5 bg-slate-100 dark:bg-white/5 text-slate-950 dark:text-white/80 hover:text-neon-purple dark:hover:text-neon-purple hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 transition-all min-w-[42px] sm:min-w-[54px] shadow-sm dark:shadow-none"
              >
                <PackageSearch size={16} className="sm:w-4 sm:h-4" />
                <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider">ট্র্যাক</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                animate={totalItems > 0 ? {
                  scale: [1, 1.05, 1],
                  filter: [
                    "drop-shadow(0 0 0px rgba(0, 242, 255, 0))",
                    "drop-shadow(0 0 8px rgba(0, 242, 255, 0.6))",
                    "drop-shadow(0 0 0px rgba(0, 242, 255, 0))"
                  ]
                } : {}}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                onClick={onCartClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl transition-all min-w-[42px] sm:min-w-[54px] relative border",
                  totalItems > 0 ? "bg-neon-blue/20 text-slate-950 dark:text-white border-neon-blue/40" : "bg-slate-100 dark:bg-white/5 text-slate-950 dark:text-white/80 border-slate-200 dark:border-white/10 hover:text-neon-blue dark:hover:text-neon-blue hover:bg-slate-200 dark:hover:bg-white/10 shadow-sm dark:shadow-none"
                )}
              >
                <ShoppingBag size={16} className="sm:w-4 sm:h-4" />
                <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider">কার্ট</span>
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-neon-pink rounded-full text-[8px] sm:text-[9px] flex items-center justify-center text-white dark:text-slate-950 font-black shadow-lg shadow-neon-pink/40 border border-white/20"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-1.5 bg-slate-100 dark:bg-white/5 text-slate-950 dark:text-white/80 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 transition-all min-w-[42px] sm:min-w-[54px] shadow-sm dark:shadow-none"
              >
                {theme === "dark" ? <Sun size={16} className="sm:w-4 sm:h-4" /> : <Moon size={16} className="sm:w-4 sm:h-4" />}
                <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider">{theme === "dark" ? "লাইট" : "ডার্ক"}</span>
              </motion.button>

              <button
                className="lg:hidden p-1.5 text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors ml-0.5"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Category Bar separated by a line */}
        <div className="w-full border-t border-slate-200 dark:border-white/10 pt-1.5 sm:pt-2 flex items-center justify-start md:justify-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar mx-auto px-2 sm:px-4">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => {
                if (location.pathname !== "/") {
                  navigate("/");
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("select-category", { detail: cat }));
                  }, 300);
                } else {
                  window.dispatchEvent(new CustomEvent("select-category", { detail: cat }));
                }
              }}
              className={cn(
                "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                selectedCategories.includes(cat)
                ? "bg-neon-blue text-slate-950 border-neon-blue shadow-md shadow-neon-blue/20" 
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-24 left-4 right-4 glass dark:glass-dark rounded-[2.5rem] p-8 lg:hidden shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                link.action ? (
                  <button
                    key={link.name}
                    onClick={() => { setIsOpen(false); link.action!(); }}
                    className="text-xl font-bold flex items-center justify-between p-2 text-slate-900 dark:text-white hover:text-neon-blue dark:hover:text-neon-blue transition-colors"
                  >
                    {link.name}
                    <PackageSearch size={20} className="text-neon-blue" />
                  </button>
                ) : link.isScroll ? (
                  <button
                    key={link.name}
                    onClick={() => handleScroll(link.href!)}
                    className="text-xl font-bold flex items-center justify-between p-2 text-slate-900 dark:text-white hover:text-neon-blue dark:hover:text-neon-blue transition-colors text-left"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href!}
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-bold flex items-center justify-between p-2 text-slate-900 dark:text-white hover:text-neon-blue dark:hover:text-neon-blue transition-colors"
                  >
                    {link.name}
                    {link.href === "/about" && <Info size={20} className="text-neon-purple" />}
                    {link.href === "/contact" && <HelpCircle size={20} className="text-neon-pink" />}
                  </Link>
                )
              ))}
              <div className="h-px bg-slate-200 dark:bg-white/10 my-2" />
              <button 
                onClick={() => { setIsOpen(false); onCartClick?.(); }}
                className="w-full py-5 bg-neon-blue text-slate-950 rounded-2xl font-black shadow-lg shadow-neon-blue/40 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={24} />
                চেকআউট ({totalItems})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
