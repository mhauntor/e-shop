import React from "react";
import { useCart } from "./CartContext";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, ChevronRight } from "lucide-react";

export default function CartBubble({ onOpenCheckout }: { onOpenCheckout: () => void }) {
  const { totalItems, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-[90] hidden md:block"
        >
          <motion.button
            whileHover={{ scale: 1.1, x: -10 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenCheckout}
            className="flex flex-col items-center gap-2 glass dark:glass-dark p-4 rounded-[2rem] border-neon-blue/30 shadow-2xl group"
          >
            <div className="relative p-4 bg-neon-blue text-white rounded-2xl shadow-lg shadow-neon-blue/40">
              <ShoppingBag size={24} />
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-neon-pink rounded-full text-xs flex items-center justify-center font-bold">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">মোট</span>
               <span className="text-sm font-bold text-neon-blue">{totalPrice.toLocaleString('bn-BD')}৳</span>
            </div>
            <div className="mt-2 text-neon-blue opacity-0 group-hover:opacity-100 transition-opacity">
               <ChevronRight size={20} />
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
