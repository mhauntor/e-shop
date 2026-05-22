import { ShoppingCart, Facebook, Instagram, Twitter, Youtube, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function Footer() {
  return (
    <footer className="relative mt-12 md:mt-20 pt-16 md:pt-20 pb-8 md:pb-10 px-4 sm:px-6 overflow-hidden bg-white/90 dark:bg-transparent border-t border-slate-200 dark:border-transparent">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-20" />
      <div className="absolute -bottom-20 -left-20 w-64 md:w-96 h-64 md:h-96 bg-neon-blue/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 md:w-96 h-64 md:h-96 bg-neon-purple/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 lg:gap-20 mb-16 md:mb-20">
          <div className="flex flex-col gap-4 md:gap-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white shadow-lg shadow-neon-blue/20"
              >
                <ShoppingCart size={22} className="md:w-7 md:h-7" />
              </motion.div>
              <span className="text-2xl md:text-3xl font-black font-display tracking-tighter text-slate-950 dark:text-white">
                আমার <span className="text-neon-blue">দোকান</span>
              </span>
            </div>
            <p className="text-slate-700 dark:text-white/60 text-base md:text-lg leading-relaxed font-medium px-4 sm:px-0">
              বাংলাদেশের সবচেয়ে আধুনিক এবং প্রিমিয়াম ডিজিটাল শপিং প্ল্যাটফর্ম। 
              পণ্য যাচাই এবং দ্রুত ডেলিভারির নিশ্চয়তা আমাদের মূল লক্ষ্য।
            </p>
            <div className="flex justify-center sm:justify-start gap-3 md:gap-4 mt-2">
              <motion.a 
                href={(import.meta as any).env.VITE_Facebook || "#"} 
                whileHover={{ y: -5, color: "#00f2ff" }}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-xl md:rounded-2xl text-slate-700 dark:text-white/60 border border-slate-200 dark:border-white/10 transition-colors shadow-sm dark:shadow-none"
              >
                <Facebook size={18} className="md:w-5 md:h-5" />
              </motion.a>
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <motion.a 
                  key={i} 
                  href="#" 
                  whileHover={{ y: -5, color: "#00f2ff" }}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-xl md:rounded-2xl text-slate-700 dark:text-white/60 border border-slate-200 dark:border-white/10 transition-colors shadow-sm dark:shadow-none"
                >
                  <Icon size={18} className="md:w-5 md:h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="hidden sm:block">
            <h4 className="text-slate-950 dark:text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-6 md:mb-8">কোম্পানি</h4>
            <ul className="flex flex-col gap-3 md:gap-4">
              {["আমাদের গল্প", "ক্যারিয়ার", "ব্লগ", "প্রাইভেসি পলিসি", "শর্তাবলী"].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-700 dark:text-white/60 font-bold hover:text-neon-blue transition-colors flex items-center group text-sm md:text-base">
                    <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all md:w-3.5 md:h-3.5" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden sm:block">
            <h4 className="text-slate-950 dark:text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-6 md:mb-8">সহায়তা</h4>
            <ul className="flex flex-col gap-3 md:gap-4">
              {["ডেলিভারি তথ্য", "রিটার্ন পলিসি", "অর্ডার ট্র্যাকিং", "পেমেন্ট মেথড", "হেল্প সেন্টার"].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-700 dark:text-white/60 font-bold hover:text-neon-purple transition-colors flex items-center group text-sm md:text-base">
                    <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all md:w-3.5 md:h-3.5" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block">
            <h4 className="text-slate-950 dark:text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-6 md:mb-8">লিঙ্কসমূহ</h4>
            <ul className="flex flex-col gap-3 md:gap-4">
              {["যোগাযোগ", "অর্ডার ট্র্যাকিং", "হেল্প সেন্টার"].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-700 dark:text-white/60 font-bold hover:text-neon-blue transition-colors flex items-center group text-sm md:text-base">
                    <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all md:w-3.5 md:h-3.5" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[8px] md:text-[10px] font-black text-slate-600 dark:text-white/40 uppercase tracking-[0.2em] md:tracking-[0.3em] text-center md:text-left">
              © ২০২৪ AMARDOKAN INC. | {(import.meta as any).env.VITE_OUR_LOCATION || "ঢাকা, বাংলাদেশ"}
            </p>
          </div>
          
          <div className="flex items-center gap-5 md:gap-8 grayscale opacity-30 hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            <img src="/images/ssl-logo.png" alt="SSLCommerz" className="h-5 md:h-8" />
            <div className="h-4 md:h-6 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />
            <div className="flex gap-3 md:gap-4">
               {/* Payment Icons Placeholder */}
               <div className="w-8 md:w-10 h-5 md:h-6 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10" />
               <div className="w-8 md:w-10 h-5 md:h-6 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10" />
               <div className="w-8 md:w-10 h-5 md:h-6 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
