import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Minus, Plus, X, Share2, Phone, User, MapPin, Notebook, CheckCircle, Trash2 } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { useCart } from "./CartContext";

const QuickCheckout = ({ setIsAdded }: { setIsAdded: (val: boolean) => void }) => {
  const { cart, totalPrice, deliveryCharge, submitOrder, updateQuantity, removeFromCart, isCooldownActive, remainingTime } = useCart();
  const [form, setForm] = React.useState({ name: "", phone: "", address: "", note: "" });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderSuccess, setOrderSuccess] = React.useState<string | null>(null);

  const HELPLINE = (import.meta as any).env.VITE_HELPLINE_PHONE || "01983914915";

  const bengaliToEnglishDigits = (str: string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[০-৯]/g, (w) => String(bengaliDigits.indexOf(w)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleanPhone = bengaliToEnglishDigits(form.phone.trim());
    if (cleanPhone.startsWith("+88")) cleanPhone = cleanPhone.slice(3);
    if (cleanPhone.startsWith("88")) cleanPhone = cleanPhone.slice(2);

    if (!cleanPhone.startsWith("01") || cleanPhone.length !== 11) {
      if (!cleanPhone.startsWith("01")) alert("মোবাইল নম্বরটি অবশ্যই 01 দিয়ে শুরু হতে হবে।");
      else if (cleanPhone.length !== 11) alert("মোবাইল নম্বরটি অবশ্যই ১১ ডিজিটের হতে হবে।");
      return;
    }

    setIsSubmitting(true);
    const res = await submitOrder({ ...form, phone: cleanPhone });
    setIsSubmitting(false);

    if (res.success) {
      setOrderSuccess(res.orderId!);
      setForm({ name: "", phone: "", address: "", note: "" });
    } else {
      alert(res.message || "অর্ডার করতে সমস্যা হয়েছে।");
    }
  };

  if (orderSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-500/10 border border-green-500/20 rounded-3xl p-8 text-center my-6"
      >
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-white" size={32} />
        </div>
        <h3 className="text-xl font-black text-white mb-2">অর্ডার সফল হয়েছে!</h3>
        <p className="text-white/60 text-sm mb-4">অর্ডার আইডি: <span className="text-neon-blue font-bold">{orderSuccess}</span></p>
        <button 
          onClick={() => { setOrderSuccess(null); setIsAdded(false); }}
          className="text-xs font-black uppercase tracking-widest text-neon-blue hover:underline"
        >
          আবার অর্ডার করুন
        </button>
      </motion.div>
    );
  }

  if (cart.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 sm:p-6 my-6 space-y-6 overflow-hidden"
    >
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <ShoppingBag className="text-neon-blue" size={20} />
        <h4 className="text-lg font-bold text-white">আপনার অর্ডার</h4>
      </div>

      {/* Mini Cart Items */}
      <div className="space-y-3">
        {cart.map((item) => (
          <div key={`${item.id}-${item.size}`} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
            <img src={item.image} className="w-10 h-10 object-contain rounded-lg bg-black" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate leading-[1.8]">{item.title}</p>
              <p className="text-[10px] text-white/40 leading-[1.8]">{item.price} x {item.quantity}</p>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)} className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-white"><Minus size={10}/></button>
               <span className="text-xs font-bold text-white">{item.quantity}</span>
               <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)} className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-white"><Plus size={10}/></button>
               <button onClick={() => removeFromCart(item.id, item.size)} className="ml-2 text-white/20 hover:text-red-500"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-white/5 pt-4">
        <div className="flex justify-between text-xs text-white/60">
          <span>সাবটোটাল</span>
          <span>{totalPrice.toLocaleString()} ৳</span>
        </div>
        <div className="flex justify-between text-xs text-white/60">
          <span>ডেলিভারি চার্জ</span>
          <span>{deliveryCharge} ৳</span>
        </div>
        <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/5">
          <span>সর্বমোট</span>
          <span className="text-neon-blue">{(totalPrice + deliveryCharge).toLocaleString()} ৳</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text" 
              placeholder="আপনার নাম (ঐচ্ছিক)"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:border-neon-blue outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="tel" 
              placeholder="মোাবাইল নম্বর"
              required
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:border-neon-blue outline-none transition-all"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-3 text-white/20" size={16} />
            <textarea 
              placeholder="সম্পূর্ণ ঠিকানা (ঐচ্ছিক)"
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:border-neon-blue outline-none transition-all min-h-[80px]"
            />
          </div>
        </div>

        <p className="text-[10px] text-white/40 leading-relaxed italic">
          * অর্ডার করতে প্রবলেম হলে শুধু আপনার ফোন নম্বর লিখে সাবমিট করুন। অথবা এই হেল্পলাইন নম্বরে কল করুন: <a href={`tel:${HELPLINE}`} className="text-neon-blue font-bold">{HELPLINE}</a>
        </p>

        <button 
          type="submit"
          disabled={isSubmitting || isCooldownActive}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2",
            isCooldownActive ? "bg-white/10 text-white/40" : "bg-neon-blue text-black hover:bg-white active:scale-95"
          )}
        >
          {isSubmitting ? "অর্ডার সাবমিট হচ্ছে..." : isCooldownActive ? `অপেক্ষা করুন (${Math.floor(remainingTime / 60)}m)` : "অর্ডার কনফার্ম করুন"}
        </button>
      </form>
    </motion.div>
  );
};

interface ProductCardProps {
  id: string | number;
  title: string;
  price: string;
  category: string;
  rating: number;
  image: string;
  images?: any;
  description?: string;
  sizes?: string[];
  sizeInfo?: string;
  link?: string;
  sellQuantity?: number | string;
  gradient?: string;
  discountTag?: string;
  optionTags?: string[];
  groupImages?: string[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}



export default function ProductCard({ 
  id, title, price, category, rating, image, images, description, sizes, sizeInfo, link, sellQuantity, discountTag, optionTags, groupImages, isExpanded, onToggleExpand 
}: ProductCardProps) {
  const { addToCart, totalItems } = useCart();
  const [quantity, setQuantity] = React.useState(1);
  const [selectedSize, setSelectedSize] = React.useState("");
  const [activeImg, setActiveImg] = React.useState(image || "");
  const [currentTagIndex, setCurrentTagIndex] = React.useState(0);
  const [adImage, setAdImage] = React.useState("");
  const [showSizeGuide, setShowSizeGuide] = React.useState(false);
  const [showFullScreen, setShowFullScreen] = React.useState(false);
  const [error, setError] = React.useState("");
  
  // Update active image when prop changes (needed for async data)
  React.useEffect(() => {
    if (image) setActiveImg(image);
  }, [image]);
  
  const [isAdded, setIsAdded] = React.useState(false);
  
  const productImages = Array.isArray(images) 
    ? (images.length > 0 ? images : [image]) 
    : (images && typeof images === "string" 
        ? images.split(",").map((s: string) => s.trim()) 
        : [image]);

  const validSizes = sizes?.filter(s => s && s.trim() !== "") || [];

  // Reset selected size when modal closes
  React.useEffect(() => {
    if (!isExpanded) {
      setSelectedSize("");
      setError("");
      setIsAdded(false);
    }
  }, [isExpanded]);



  // Random Ad Selection
  React.useEffect(() => {
    if (isExpanded) {
      const allPossibleAds = [...(images || []), ...(groupImages || [])].filter(Boolean);
      if (allPossibleAds.length > 0) {
        setAdImage(allPossibleAds[Math.floor(Math.random() * allPossibleAds.length)]);
      }
    }
  }, [isExpanded, images, groupImages]);

  // Sliding Tags Logic
  React.useEffect(() => {
    if (optionTags && optionTags.length > 1) {
      const interval = setInterval(() => {
        setCurrentTagIndex((prev) => (prev + 1) % optionTags.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [optionTags]);


  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (validSizes.length > 0 && !selectedSize) {
      setError("দয়া করে সাইজ নির্বাচন করুন");
      return;
    }
    addToCart({ id, title, price, image: activeImg, category, rating, quantity, size: selectedSize || "N/A" });
    setError("");
    setIsAdded(true);
    setError("");
  };

  const handleGoToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand?.();
  };


  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/${id}`;
    const shareData = {
      title: title,
      text: description,
      url: shareUrl
    };
    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("লিঙ্ক কপি করা হয়েছে!");
    }
  };




  return (
    <>
      {/* Small Card */}
      <motion.div
        layoutId={`card-${id}`}
        onClick={() => !isExpanded && onToggleExpand?.()}
        className={cn(
          "relative rounded-[20px] bg-[#1a1a1a] flex flex-col group border border-neon-blue/20 h-[300px] sm:h-[460px] cursor-pointer hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,255,0.05)] hover:border-neon-blue/40 transition-all duration-300",
          isExpanded && "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-3">
          <div className="h-4 sm:h-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTagIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="px-2 py-0.5 bg-white text-black text-[7px] sm:text-[9px] font-black rounded-sm uppercase tracking-tighter shadow-lg shadow-white/10"
              >
                {optionTags && optionTags.length > 0 ? optionTags[currentTagIndex] : (discountTag || "OFFER")}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>


        <div className="relative h-[140px] sm:h-[250px] rounded-t-[20px] bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center overflow-hidden border-b border-neon-blue/20">
          <motion.img 
            layoutId={`img-${id}`}
            src={activeImg} 
            alt={title} 
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Try the first image from productImages if activeImg fails
              if (productImages.length > 0 && activeImg !== productImages[0]) {
                setActiveImg(productImages[0]);
              } else {
                target.src = "https://placehold.co/600x800/1a1a1a/00f2ff?text=Image+Error";
              }
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>


        <div className="px-2 sm:px-5 py-2 sm:py-6 flex flex-col flex-1 text-white">
          <motion.h1 
            layoutId={`title-${id}`}
            className="font-display font-black leading-[1.4] tracking-tight text-[11px] xs:text-[13px] sm:text-lg truncate mb-0.5"
          >
            {title}
          </motion.h1>

          <div className="flex flex-col mb-1.5">
            <h3 className="text-[13px] xs:text-sm sm:text-lg font-black text-neon-blue leading-[1.3]">{price}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={cn("text-[8px] sm:text-xs", i < Math.floor(rating) ? "opacity-100" : "opacity-30")}>★</span>
                ))}
              </div>
              <span className="text-[7px] sm:text-[10px] text-white/60 font-black">({rating})</span>
            </div>
          </div>

          <p className="text-[10px] xs:text-[11px] sm:text-[13px] leading-relaxed text-white/50 line-clamp-3 mb-3 sm:mb-5 font-medium">
            {description?.split('\n')[0]}
          </p>

          <div className="mt-auto">
            <button 
              className="w-full h-7 sm:h-12 bg-neon-blue border border-neon-blue rounded-md sm:rounded-xl text-[9px] sm:text-xs font-black text-black transition-all flex items-center justify-center gap-1"
              onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
            >
              <ShoppingBag size={10} className="sm:w-4 sm:h-4 text-black" />
              অর্ডার করুন
            </button>
          </div>
        </div>
      </motion.div>

      {/* Expanded Modal Content */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={onToggleExpand}
            />
            
            <motion.div
              layoutId={`card-${id}`}
              className="bg-[#0a0a0a] w-full max-w-[950px] h-fit max-h-[95vh] md:max-h-[90vh] rounded-[30px] md:rounded-[40px] overflow-y-auto md:overflow-hidden border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.9)] flex flex-col md:flex-row relative z-10 no-scrollbar"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-50 bg-black/40 backdrop-blur-md hover:bg-white/20 p-2 md:p-3 rounded-full transition-all border border-white/10"
              >
                <X className="text-white" size={20} />
              </button>

              {/* Image Side */}
              <div className="w-full md:w-[45%] h-auto md:min-h-[500px] bg-[#050505] flex flex-col items-center relative shrink-0">
                <div className="absolute inset-0 bg-grid-white/[0.01] -z-10" />
                <div className="w-full aspect-square md:h-full flex items-center justify-center relative overflow-hidden">
                  <motion.img 
                    layoutId={`img-${id}`}
                    src={activeImg} 
                    alt={title} 
                    referrerPolicy="no-referrer"
                    onClick={() => setShowFullScreen(true)}
                    className="w-full h-full object-cover relative z-10 cursor-zoom-in hover:scale-105 transition-transform duration-700"
                  />

                  {/* Thumbnails Overlay */}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex gap-2.5 z-20 overflow-x-auto no-scrollbar justify-center px-4">
                      {productImages.slice(0, 8).map((img, i) => (
                        <button 
                          key={i} 
                          onClick={() => setActiveImg(img)}
                          className={cn(
                            "w-12 h-12 rounded-xl border-2 transition-all p-0.5 shrink-0 shadow-2xl", 
                            activeImg === img ? "border-neon-blue scale-110 bg-black/40" : "border-white/10 bg-black/20 opacity-60 hover:opacity-100"
                          )}
                        >
                          <img src={img || undefined} className="w-full h-full object-contain rounded-lg" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Share Button Overlay - Positioned to the left of the close button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleShare(e); }}
                    className="absolute top-4 right-16 md:top-6 md:right-20 z-[60] bg-black/60 backdrop-blur-md hover:bg-neon-blue p-2.5 rounded-full transition-all border border-white/20 group/share shadow-2xl"
                    title="পণ্যটি শেয়ার করুন"
                  >
                    <Share2 className="text-white group-hover/share:text-black" size={16} />
                  </button>
                </div>
              </div>

              {/* Info Side */}
              <div className="w-full md:w-[55%] p-6 sm:p-10 md:p-14 flex flex-col bg-[#0a0a0a] border-t md:border-t-0 md:border-l border-white/5 md:overflow-y-auto no-scrollbar">
                <div className="mb-6 md:mb-8">
                  <span className="text-neon-blue font-black text-[10px] uppercase tracking-[0.2em] mb-2 md:mb-3 block">{category}</span>
                  <motion.h1 
                    layoutId={`title-${id}`}
                    className="text-2xl sm:text-3xl md:text-5xl font-black font-display text-white mb-3 md:mb-4 leading-[1.3] md:leading-[1.2] tracking-tight"
                  >
                    {title}
                  </motion.h1>
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-2xl md:text-3xl font-black text-white">{price}</h3>
                    <div className="h-4 md:h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                       <div className="flex text-yellow-400">
                         {[...Array(5)].map((_, i) => (
                           <span key={i} className={cn("text-xs", i < Math.floor(rating) ? "opacity-100" : "opacity-30")}>★</span>
                         ))}
                       </div>
                       <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">({rating})</span>
                    </div>
                    <div className="h-4 md:h-6 w-px bg-white/10" />
                    <span className="text-[10px] md:text-[11px] text-white/40 font-bold uppercase tracking-widest">{sellQuantity || 0}+ বিক্রি হয়েছে</span>
                  </div>

                </div>

                <div className="flex-1 flex flex-col gap-6 md:gap-8">
                  <div className="space-y-4 md:space-y-6">
                    {validSizes.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase font-black tracking-widest text-white/30">সাইজ নির্বাচন করুন</span>
                          {sizeInfo && (
                            <button 
                              onClick={() => setShowSizeGuide(true)}
                              className="text-[10px] uppercase font-black tracking-widest text-neon-blue hover:underline"
                            >
                              সাইজ গাইড
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {validSizes.map(s => (
                            <button 
                              key={s}
                              onClick={() => { setSelectedSize(s); setError(""); }}
                              className={cn(
                                "min-w-[44px] md:min-w-[50px] h-10 md:h-12 font-bold px-3 md:px-4 rounded-xl border transition-all text-xs md:text-sm",
                                selectedSize === s ? "bg-neon-blue border-neon-blue text-black" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        {error && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest animate-pulse">{error}</p>}
                      </div>
                    )}

                  <div className="flex flex-row gap-2 md:gap-3 items-stretch">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between bg-white/5 px-2 md:px-3 py-2 rounded-2xl border border-white/5 flex-1 max-w-[120px] md:max-w-[140px]">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 text-white"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="w-4 md:w-6 text-center font-black text-white text-sm md:text-base">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 text-white"
                      >
                        <Plus size={10} />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                      onClick={handleAddToCart}
                      className={cn(
                        "flex-[3] py-3 md:py-4 text-black font-black text-xs md:text-base rounded-2xl transition-all shadow-[0_20px_40px_rgba(0,242,255,0.15)] active:scale-[0.98] flex items-center justify-center gap-2 group",
                        isAdded ? "bg-green-500 text-white" : "bg-neon-blue hover:bg-white"
                      )}
                    >
                      <ShoppingBag size={16} className="group-hover:translate-y-[-1px] transition-transform" />
                      {isAdded ? "যোগ হয়েছে" : "যোগ করুন"}
                    </button>

                    {/* Cart Icon Button */}
                    <button 
                      onClick={handleGoToCart}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 hover:border-neon-blue/40 transition-all group"
                    >
                      <div className="relative">
                        <ShoppingBag size={18} />
                        <AnimatePresence>
                          {totalItems > 0 && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              key="cart-badge"
                              className="absolute -top-2 -right-2 w-5 h-5 bg-neon-blue text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-neon-blue/20"
                            >
                              {totalItems}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </button>
                  </div>

                  <AnimatePresence>
                    {isAdded && <QuickCheckout setIsAdded={setIsAdded} />}
                  </AnimatePresence>

                   {/* Description Section */}
                    <div className="relative pt-6 border-t border-white/5">
                      <span className="absolute top-2 right-0 text-[10px] font-black text-white/20 tracking-widest uppercase">ID: {id}</span>
                      <h4 className="text-white font-black mb-4 text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-neon-blue rounded-full" />
                        পণ্যের বিবরণ
                      </h4>
                      <div className="space-y-4">
                        <div className="grid gap-3">
                          {description?.split('\n').map((line, index) => {
                            const trimmedLine = line.trim();
                            if (!trimmedLine) return null;
                            
                            const isHeading = trimmedLine.endsWith(':') || trimmedLine.endsWith('?');
                            const hasCheck = trimmedLine.startsWith('✅');
                            const hasStar = trimmedLine.startsWith('✨') || trimmedLine.startsWith('🔹') || trimmedLine.startsWith('🔥');
                            
                            // Remove the icon from text for custom rendering
                            const cleanText = trimmedLine.replace(/^[✅✨🔹🔥✅]\s*/, '');

                            return (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 + 0.2 }}
                                className={cn(
                                  "rounded-2xl transition-all duration-300",
                                  isHeading 
                                    ? "text-neon-blue font-black text-lg md:text-xl pt-6 pb-2 first:pt-0" 
                                    : "text-white/80 bg-white/[0.04] border border-white/[0.06] p-4 md:p-6 hover:bg-white/[0.08] hover:border-white/[0.12] shadow-xl backdrop-blur-sm"
                                )}
                              >
                                {isHeading ? (
                                  trimmedLine
                                ) : (
                                  <div className="flex gap-4 items-start">
                                    {(hasCheck || hasStar) ? (
                                      <span className="text-neon-blue shrink-0 mt-1.5 text-xl">
                                        {hasCheck ? "✓" : "•"}
                                      </span>
                                    ) : null}
                                    <span className="text-base md:text-lg leading-[1.6] font-medium">{cleanText}</span>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Size Guide Modal */}
                <AnimatePresence>
                  {showSizeGuide && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                      onClick={() => setShowSizeGuide(false)}
                    >
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 max-w-lg w-full relative"
                        onClick={e => e.stopPropagation()}
                      >
                        <button 
                          onClick={() => setShowSizeGuide(false)}
                          className="absolute top-4 right-4 text-white/40 hover:text-white"
                        >
                          <X size={20} />
                        </button>
                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">সাইজ গাইড</h3>
                        <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                          {sizeInfo}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Full Screen Image Viewer */}
                <AnimatePresence>
                  {showFullScreen && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[300] bg-black flex items-center justify-center p-4"
                      onClick={() => setShowFullScreen(false)}
                    >
                      <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full"><X /></button>
                      <img 
                        src={activeImg} 
                        className="max-w-full max-h-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </>
  );
}

