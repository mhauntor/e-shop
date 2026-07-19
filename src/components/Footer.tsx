import React, { useState } from "react";
import { ShoppingCart, Facebook, Instagram, Twitter, Youtube, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Footer() {
  const siteName = (import.meta as any).env.VITE_SITE_NAME || (import.meta as any).env.VITE_WEBSITE_NAME || "শুকরিয়া শপ";
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const modalContent: Record<string, { title: string; content: React.ReactNode }> = {
    "ক্যারিয়ার": {
      title: "ক্যারিয়ার",
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 dark:text-white/80 leading-relaxed">
            আমরা শুকরিয়া শপ-এ সব সময় সেরা প্রতিভাদের স্বাগত জানাই। আপনি যদি আমাদের গতিশীল টিমের সাথে ক্যারিয়ার গড়তে চান, তবে আপনার সিভি এবং কভার লেটার পাঠিয়ে দিন আমাদের ইমেইলে।
          </p>
          <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl">
            <p className="font-bold text-slate-900 dark:text-white">ইমেল করুন:</p>
            <p className="text-neon-blue font-semibold">career@shukriashop.com</p>
          </div>
        </div>
      )
    },
    "ব্লগ": {
      title: "ব্লগ",
      content: (
        <div className="py-8 text-center text-slate-500 dark:text-white/40 italic">
          আমাদের ব্লগ সেকশনটি শীঘ্রই চালু হতে যাচ্ছে। আকর্ষণীয় সব রিভিউ ও আপডেট পেতে আমাদের সাথেই থাকুন!
        </div>
      )
    },
    "প্রাইভেসি পলিসি": {
      title: "প্রাইভেসি পলিসি",
      content: (
        <div className="space-y-4 text-slate-700 dark:text-white/80 leading-relaxed text-sm">
          <p>
            ১. আপনার তথ্যের গোপনীয়তা রক্ষা করা আমাদের দায়িত্ব। আমরা গ্রাহকদের নাম, ঠিকানা ও ফোন নম্বর শুধুমাত্র অর্ডার নিশ্চিতকরণ এবং ডেলিভারি সম্পন্ন করার জন্য ব্যবহার করি।
          </p>
          <p>
            ২. আপনার কোনো পেমেন্ট বা ব্যক্তিগত তথ্য অননুমোদিত কোনো তৃতীয় পক্ষের কাছে হস্তান্তর করা হয় না।
          </p>
          <p>
            ৩. আমাদের ওয়েবসাইটে ব্রাউজিং অভিজ্ঞতার উন্নতির জন্য কুকিজ (cookies) ব্যবহৃত হতে পারে।
          </p>
        </div>
      )
    },
    "ডেলিভারি তথ্য": {
      title: "ডেলিভারি তথ্য",
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 dark:text-white/80 leading-relaxed">
            আমরা গ্রাহকদের কাছে দ্রুত ও নিরাপদে পণ্য পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।
          </p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-neon-blue/10 border border-neon-blue/20 p-4 rounded-2xl text-center">
              <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">ঢাকার ভিতরে</p>
              <p className="text-neon-blue font-black text-lg">৭২ ঘণ্টা</p>
            </div>
            <div className="bg-neon-purple/10 border border-neon-purple/20 p-4 rounded-2xl text-center">
              <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">ঢাকার বাইরে</p>
              <p className="text-neon-purple font-black text-lg">৫ থেকে ৭ দিন</p>
            </div>
          </div>
        </div>
      )
    },
    "রিটার্ন পলিসি": {
      title: "রিটার্ন পলিসি",
      content: (
        <div className="space-y-4 text-slate-700 dark:text-white/80 leading-relaxed text-sm">
          <p>
            ১. পণ্য হাতে পাওয়ার পর কোনো ত্রুটি বা অমিল থাকলে অনুগ্রহ করে ২৪ ঘণ্টার মধ্যে আমাদের সাপোর্ট লাইনে যোগাযোগ করুন।
          </p>
          <p>
            ২. পরিবর্তনের ক্ষেত্রে পণ্যটি অব্যবহৃত এবং এর মূল প্যাকেজিং অক্ষত থাকতে হবে।
          </p>
          <p>
            ৩. কোনো যৌক্তিক ত্রুটির কারণে পণ্য রিটার্ন বা এক্সচেঞ্জ করতে হলে অতিরিক্ত কোনো ডেলিভারি চার্জ প্রযোজ্য হবে না।
          </p>
        </div>
      )
    },
    "পেমেন্ট মেথড": {
      title: "পেমেন্ট মেথড",
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 dark:text-white/80 leading-relaxed">
            আমরা গ্রাহকদের স্বাচ্ছন্দ্যের জন্য সহজ ও বিশ্বস্ত পেমেন্ট মাধ্যম সমর্থন করি:
          </p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <span className="w-2 h-2 rounded-full bg-neon-blue" />
              ক্যাশ অন ডেলিভারি (Cash on Delivery)
            </li>
            <li className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <span className="w-2 h-2 rounded-full bg-neon-purple" />
              বিকাশ সেন্ড মানি (Send Money on Bkash)
            </li>
          </ul>
        </div>
      )
    },
    "যোগাযোগ": {
      title: "যোগাযোগ",
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 dark:text-white/80 leading-relaxed">
            যেকোনো জিজ্ঞাসা, অভিযোগ বা পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন।
          </p>
          <div className="space-y-3 bg-slate-100 dark:bg-white/5 p-5 rounded-2xl text-sm">
            <p className="text-slate-700 dark:text-white/80">
              <strong className="text-slate-950 dark:text-white">হেল্পলাইন:</strong> {(import.meta as any).env.VITE_HELPLINE_PHONE || "01983914915"}
            </p>
            <p className="text-slate-700 dark:text-white/80">
              <strong className="text-slate-950 dark:text-white">ঠিকানা:</strong> {(import.meta as any).env.VITE_OUR_LOCATION || "Ahammed Nagar, Mirpur 1, Dhaka 1216"}
            </p>
          </div>
        </div>
      )
    }
  };

  return (
    <footer className="relative mt-12 md:mt-20 pt-16 md:pt-20 pb-8 md:pb-10 px-4 sm:px-6 overflow-hidden bg-white/90 dark:bg-transparent border-t border-slate-200 dark:border-transparent">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-20" />
      <div className="absolute -bottom-20 -left-20 w-64 md:w-96 h-64 md:h-96 bg-neon-blue/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 md:w-96 h-64 md:h-96 bg-neon-purple/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-20 mb-16 md:mb-20">
          <div className="flex flex-col gap-4 md:gap-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center shadow-lg shadow-neon-blue/10 border border-neon-blue/20"
              >
                <img src="/logo-web.png" alt="Logo" className="w-full h-full object-cover" />
              </motion.div>
              <span className="text-2xl md:text-3xl font-black font-display tracking-tighter text-slate-950 dark:text-white">
                {siteName}
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
              {["ক্যারিয়ার", "ব্লগ", "প্রাইভেসি পলিসি"].map(item => (
                <li key={item}>
                  <button 
                    onClick={() => setActiveModal(item)}
                    className="text-slate-700 dark:text-white/60 font-bold hover:text-neon-blue transition-colors flex items-center group text-sm md:text-base text-left"
                  >
                    <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all md:w-3.5 md:h-3.5" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden sm:block">
            <h4 className="text-slate-950 dark:text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-6 md:mb-8">সহায়তা</h4>
            <ul className="flex flex-col gap-3 md:gap-4">
              {["ডেলিভারি তথ্য", "রিটার্ন পলিসি", "পেমেন্ট মেথড", "যোগাযোগ"].map(item => (
                <li key={item}>
                  <button 
                    onClick={() => setActiveModal(item)}
                    className="text-slate-700 dark:text-white/60 font-bold hover:text-neon-purple transition-colors flex items-center group text-sm md:text-base text-left"
                  >
                    <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all md:w-3.5 md:h-3.5" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[8px] md:text-[10px] font-black text-slate-600 dark:text-white/40 uppercase tracking-[0.2em] md:tracking-[0.3em] text-center md:text-left">
              © ২০২৪ {siteName.toUpperCase()} INC. | {(import.meta as any).env.VITE_OUR_LOCATION || "ঢাকা, বাংলাদেশ"}
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

      {/* Modal Popup overlay */}
      <AnimatePresence>
        {activeModal && modalContent[activeModal] && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {modalContent[activeModal].title}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="text-slate-700 dark:text-white/80">
                {modalContent[activeModal].content}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
