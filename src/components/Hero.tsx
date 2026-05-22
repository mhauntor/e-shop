import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

interface AdItem {
  headerText: string;
  title: string;
  category: string;
}

export default function Hero() {
  const [settings, setSettings] = useState({
    adTexts: [] as AdItem[],
    badgeText: "নতুন কালেকশন চলে এসেছে!",
    justInText: "JUST IN",
    buyBtnText: "এখনই কিনুন",
    promoBtnText: "প্রমোশন দেখুন",
    stat1Number: "৫০ক+",
    stat1Label: "সন্তুষ্ট গ্রাহক",
    stat2Number: "১০ক+",
    stat2Label: "সেরা পণ্য",
  });

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const loadSettings = () => {
      fetch("/data/settings.json?t=" + Date.now(), { cache: "no-store" })
        .then(res => res.json())
        .then(data => {
          if (data) {
            let normalizedAdTexts = data.adTexts || [];
            if (normalizedAdTexts.length > 0 && typeof normalizedAdTexts[0] === 'string') {
              normalizedAdTexts = normalizedAdTexts.map((text: string) => ({
                headerText: data.badgeText || "নতুন কালেকশন চলে এসেছে!",
                title: text,
                category: "সব"
              }));
            }
            setSettings(prev => ({ ...prev, ...data, adTexts: normalizedAdTexts }));
          }
        })
        .catch(() => {});
    };

    loadSettings();

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setSettings(prev => ({ ...prev, ...e.detail }));
      } else {
        loadSettings();
      }
    };
    window.addEventListener("settings-updated", handleUpdate);
    return () => window.removeEventListener("settings-updated", handleUpdate);
  }, []);

  useEffect(() => {
    if (settings.adTexts && settings.adTexts.length > 1) {
      const timer = setInterval(() => {
        setCurrentAdIndex(prev => (prev + 1) % settings.adTexts.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [settings.adTexts]);

  const handleAdClick = () => {
    const currentAd = settings.adTexts && settings.adTexts.length > 0 ? settings.adTexts[currentAdIndex] : null;
    const targetCat = currentAd ? currentAd.category : "সব";
    
    window.dispatchEvent(new CustomEvent("select-category", { detail: targetCat }));
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-blue/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-purple/20 rounded-full blur-[100px] animate-pulse delay-700" />
      
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-300 dark:border-neon-blue/40 bg-white dark:bg-neon-blue/5 text-slate-950 dark:text-neon-blue text-xs md:text-sm font-bold mb-6 shadow-sm dark:shadow-none"
          >
            <Sparkles size={16} className="text-neon-blue" />
            {settings.badgeText || "নতুন কালেকশন চলে এসেছে!"}
          </motion.div>
          
          <h1 
            onClick={handleAdClick}
            className="text-3xl md:text-4xl lg:text-5xl font-bold font-display leading-[1.25] mb-6 text-slate-950 dark:text-white min-h-[80px] cursor-pointer hover:opacity-90 transition-opacity"
          >
            {settings.adTexts && settings.adTexts.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAdIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink animate-gradient">
                    {settings.adTexts[currentAdIndex]?.headerText}
                  </span>
                </motion.div>
              </AnimatePresence>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink animate-gradient">
                {settings.badgeText || "নতুনত্ব ও প্রিমিয়াম কোয়ালিটি"}
              </span>
            )}
          </h1>
          
          <div className="min-h-[90px] mb-6 max-w-lg">
            {settings.adTexts && settings.adTexts.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentAdIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-lg text-slate-700 dark:text-white/80 font-medium leading-relaxed"
                >
                  {settings.adTexts[currentAdIndex]?.title}
                </motion.p>
              </AnimatePresence>
            ) : (
              <p className="text-lg text-slate-700 dark:text-white/60 font-medium leading-relaxed">
                সবচেয়ে আধুনিক ফ্যাশন এবং ট্রেন্ডিং পণ্যগুলো এখন আপনার হাতের মুঠোয়। 
                গ্লাসি ডিজাইন এবং প্রিমিয়াম কোয়ালিটির সাথে নতুনত্বের ছোঁয়া।
              </p>
            )}
          </div>

          {/* Slide Pagination Indicators */}
          {settings.adTexts && settings.adTexts.length > 1 && (
            <div className="flex items-center gap-2 mb-8">
              {settings.adTexts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentAdIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentAdIndex ? "w-8 bg-neon-blue shadow-[0_0_12px_rgba(0,242,255,0.8)]" : "w-3 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40"}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-4">
            <motion.button
              onClick={handleAdClick}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 242, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-neon-blue text-slate-950 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-neon-blue/30 cursor-pointer"
            >
              {settings.buyBtnText || "এখনই কিনুন"}
              <ArrowRight size={20} />
            </motion.button>
            <motion.button
              onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-950 dark:text-white rounded-2xl font-bold transition-all shadow-sm dark:shadow-none cursor-pointer"
            >
              {settings.promoBtnText || "প্রমোশন দেখুন"}
            </motion.button>
          </div>
          
          <div className="mt-12 flex items-center gap-8 border-l-2 border-neon-blue/30 pl-6">
            <div>
              <div className="text-3xl font-black text-slate-950 dark:text-white">{settings.stat1Number || "৫০ক+"}</div>
              <div className="text-sm font-bold text-slate-600 dark:text-white/40">{settings.stat1Label || "সন্তুষ্ট গ্রাহক"}</div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-950 dark:text-white">{settings.stat2Number || "১০ক+"}</div>
              <div className="text-sm font-bold text-slate-600 dark:text-white/40">{settings.stat2Label || "সেরা পণ্য"}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative h-[600px] lg:h-[700px] flex items-center justify-center [perspective:2000px] cursor-grab active:cursor-grabbing"
        >
          <MouseResponsiveCarousel />

          {/* Just In Floating Tag */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-0 right-0 z-40 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-2xl border border-neon-blue/30 lg:translate-x-12 lg:-translate-y-6"
          >
            <span className="text-sm font-black text-neon-blue italic font-aboreto">{settings.justInText || "JUST IN"}</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function MouseResponsiveCarousel() {
  const rotation = React.useRef(0);
  const [targetRotation, setTargetRotation] = React.useState(0);
  const [velocity, setVelocity] = React.useState(0.5); // Default slow spin
  const [images, setImages] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail && e.detail.length > 0) {
        setImages(e.detail.slice(0, 8)); // Limit to 8 images for the carousel
      }
    };
    window.addEventListener("hero-images-updated", handleUpdate);
    return () => window.removeEventListener("hero-images-updated", handleUpdate);
  }, []);

  React.useEffect(() => {

    let frame: number;
    const animate = () => {
      setTargetRotation(prev => prev + velocity);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [velocity]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    // Map mouse position to velocity (-1.5 to 1.5 for smoother control)
    const newVelocity = (x / (rect.width / 2)) * 1.5;
    setVelocity(Math.abs(newVelocity) < 0.1 ? 0.3 : newVelocity);
  };

  const handleMouseLeave = () => {
    setVelocity(0.3);
  };

  const angleStep = 360 / images.length;


  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-80 h-80 lg:w-[450px] lg:h-[450px] [transform-style:preserve-3d] [transform:translate3d(0,0,-800px)] transition-transform duration-300"
    >
      <motion.div 
        animate={{ 
          rotateY: targetRotation,
          rotateX: 12,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30, mass: 0.5 }}
        className="w-full h-full [transform-style:preserve-3d]"
      >
        {images.map((img, i) => (
          <div 
            key={i} 
            className="absolute inset-0 m-auto h-full aspect-[9/16] [transform-style:preserve-3d] [backface-visibility:visible]"
            style={{ transform: `rotateY(${i * angleStep}deg) translateX(180%)` }}
          >

            <img 
              src={img} 
              alt={`Hero Item ${i}`} 
              referrerPolicy="no-referrer"
              className="block w-full h-full rounded-[48px] object-cover grayscale-[0.2] transition-all duration-300 hover:grayscale-0 [transform:rotateY(90deg)] shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/20"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
