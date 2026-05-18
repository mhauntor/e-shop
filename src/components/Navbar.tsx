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

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-2 sm:px-4 py-2 sm:py-3">
      <div className={cn(
        "max-w-7xl mx-auto rounded-2xl sm:rounded-3xl transition-all duration-500",
        "bg-slate-900/60 backdrop-blur-3xl px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between",
        "shadow-2xl border border-white/5"
      )}>
        {/* Left Side: Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -10 }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-neon-blue flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,242,255,0.4)]"
          >
            <ShoppingCart size={24} className="sm:w-7 sm:h-7" />
          </motion.div>
          <span className="text-lg sm:text-2xl font-black font-display tracking-tight text-white hidden xs:block">
            AMAR<span className="text-neon-blue">DOKAN</span>
          </span>
        </Link>

        {/* Right Side: Navigation & Actions */}
        <div className="flex items-center gap-1 sm:gap-10">
          {/* Desktop Menu - Moved to right */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              link.action ? (
                <button
                  key={link.name}
                  onClick={link.action}
                  className="text-xs font-black uppercase tracking-[0.2em] text-white hover:text-neon-blue hover:blur-[0.5px] transition-all"
                >
                  {link.name}
                </button>
              ) : link.isScroll ? (
                <button
                  key={link.name}
                  onClick={() => handleScroll(link.href!)}
                  className="text-xs font-black uppercase tracking-[0.2em] text-white hover:text-neon-blue hover:blur-[0.5px] transition-all"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.href!}
                  className={cn(
                    "text-xs font-black uppercase tracking-[0.2em] hover:text-neon-blue hover:blur-[0.5px] transition-all",
                    location.pathname === link.href ? "text-neon-blue" : "text-white"
                  )}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-4 lg:border-l border-white/10 lg:pl-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onFilterToggle}
              className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 bg-white/5 text-white/70 hover:text-neon-blue hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all min-w-[50px] sm:min-w-[64px]"
            >
              <SlidersHorizontal size={18} className="sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">ক্যাটাগরি</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onTrackClick}
              className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 bg-white/5 text-white/70 hover:text-neon-purple hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all min-w-[50px] sm:min-w-[64px]"
            >
              <PackageSearch size={18} className="sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">ট্র্যাক</span>
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
                "flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl transition-all min-w-[50px] sm:min-w-[64px] relative border border-transparent",
                totalItems > 0 ? "bg-neon-blue/20 text-white border-neon-blue/30" : "bg-white/5 text-white/70 hover:text-neon-blue hover:bg-white/10"
              )}
            >
              <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">কার্ট</span>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-neon-pink rounded-full text-[9px] sm:text-[10px] flex items-center justify-center text-white font-black shadow-lg shadow-neon-pink/40 border border-[#111]"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 bg-white/5 text-white/70 hover:text-yellow-400 hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all min-w-[50px] sm:min-w-[64px]"
            >
              {theme === "dark" ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">{theme === "dark" ? "লাইট" : "ডার্ক"}</span>
            </motion.button>

            <button
              className="lg:hidden p-2 text-white/70 hover:text-white transition-colors ml-1"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-24 left-4 right-4 glass dark:glass-dark rounded-[2.5rem] p-8 lg:hidden shadow-2xl border border-white/10 overflow-hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                link.action ? (
                  <button
                    key={link.name}
                    onClick={() => { setIsOpen(false); link.action!(); }}
                    className="text-xl font-bold flex items-center justify-between p-2 hover:text-neon-blue transition-colors"
                  >
                    {link.name}
                    <PackageSearch size={20} className="text-neon-blue" />
                  </button>
                ) : link.isScroll ? (
                  <button
                    key={link.name}
                    onClick={() => handleScroll(link.href!)}
                    className="text-xl font-bold flex items-center justify-between p-2 hover:text-neon-blue transition-colors text-left"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href!}
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-bold flex items-center justify-between p-2 hover:text-neon-blue transition-colors"
                  >
                    {link.name}
                    {link.href === "/about" && <Info size={20} className="text-neon-purple" />}
                    {link.href === "/contact" && <HelpCircle size={20} className="text-neon-pink" />}
                  </Link>
                )
              ))}
              <div className="h-px bg-white/10 my-2" />
              <button 
                onClick={() => { setIsOpen(false); onCartClick?.(); }}
                className="w-full py-5 bg-neon-blue text-white rounded-2xl font-bold shadow-lg shadow-neon-blue/40 flex items-center justify-center gap-2"
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
