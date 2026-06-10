import React, { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, User, Phone, MapPin, Notebook, CheckCircle, Trash2, Plus, Minus, Search, SearchX, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useCart } from "./CartContext";

// Data will be fetched from Google Sheets
const INITIAL_PRODUCTS: any[] = [];


// Helper to get category mapping (Bengali category names to English IDs)
const getCategoryMapping = (cats: string[]) => {
  const sortedCats = [...cats]
    .filter(c => c !== "সব")
    .sort((a, b) => a.localeCompare(b, "bn"));
  
  const mapping: { [key: string]: string } = { "সব": "all" };
  const reverseMapping: { [key: string]: string } = { "all": "সব" };
  
  sortedCats.forEach((cat, index) => {
    const id = `category${String(index + 1).padStart(2, '0')}`;
    mapping[cat] = id;
    reverseMapping[id] = cat;
  });
  
  return { mapping, reverseMapping };
};

export default function Catalog() {
  const { 
    cart, updateQuantity, removeFromCart, totalPrice, clearCart, 
    submitOrder, isCooldownActive, remainingTime, deliveryCharge 
  } = useCart();
  const [products, setProducts] = useState<any[]>(() => {
    try {
      const cachedData = localStorage.getItem("catalog_cache");
      const cacheTime = localStorage.getItem("catalog_cache_time");
      if (cachedData && cacheTime && (Date.now() - Number(cacheTime)) < 24 * 60 * 60 * 1000) {
        const parsed = JSON.parse(cachedData);
        return [...parsed.catalog].sort(() => Math.random() - 0.5);
      }
    } catch(e) {}
    return [];
  });
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const cachedData = localStorage.getItem("catalog_cache");
      const cacheTime = localStorage.getItem("catalog_cache_time");
      if (cachedData && cacheTime && (Date.now() - Number(cacheTime)) < 24 * 60 * 60 * 1000) {
        const parsed = JSON.parse(cachedData);
        return Array.from(new Set(["সব", ...parsed.catalog.flatMap((p: any) => p.Category)]));
      }
    } catch(e) {}
    return ["সব"];
  });
  const [groupImages, setGroupImages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["সব"]);
  const [expandedId, setExpandedId] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [isLoading, setIsLoading] = useState(() => {
    try {
      const cachedData = localStorage.getItem("catalog_cache");
      const cacheTime = localStorage.getItem("catalog_cache_time");
      if (cachedData && cacheTime && (Date.now() - Number(cacheTime)) < 24 * 60 * 60 * 1000) {
        return false;
      }
    } catch(e) {}
    return true;
  });
  
  // Temporary states for the modal
  const [tempSearch, setTempSearch] = useState("");
  const [tempMin, setTempMin] = useState(0);
  const [tempMax, setTempMax] = useState(50000);
  const [tempCategories, setTempCategories] = useState<string[]>(["সব"]);


  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  const catalogRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{id: string} | null>(null);
  const [isGiftEnabled] = useState((import.meta as any).env.VITE_GIFT_ENABLED === "true");
  const [isGiftClaimed, setIsGiftClaimed] = useState(false);
  const [giftCountdown, setGiftCountdown] = useState(570); // 9:30 in seconds

  const { mapping, reverseMapping } = getCategoryMapping(categories);

  // Removed redundant cooldown logic (now in CartContext)

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Gift & Timer Effects
  useEffect(() => {
    if (isGiftEnabled) {
      const lastClaim = localStorage.getItem("last_gift_claim_date");
      const today = new Date().toDateString();
      if (lastClaim === today) {
        setIsGiftClaimed(true);
      }
    }
  }, [isGiftEnabled]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (giftCountdown > 0) {
      timer = setInterval(() => {
        setGiftCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [giftCountdown]);



  // Fetch data from local JSON or Google Sheets
  useEffect(() => {
    const loadCatalogData = async () => {
      try {
        if (products.length === 0) {
          setIsLoading(true);
        }

        // 1. Try Cache First (Fastest)
        const cachedData = localStorage.getItem("catalog_cache");
        const cacheTime = localStorage.getItem("catalog_cache_time");
        
        // If cache is less than 24 hours old, use it immediately
        if (cachedData && cacheTime && (Date.now() - Number(cacheTime)) < 24 * 60 * 60 * 1000) {
          const parsed = JSON.parse(cachedData);
          await processData(parsed);
          setIsLoading(false);
          return;
        }

        // 2. Load from local JSON file
        const res = await fetch("/data/catalog.json");
        if (res.ok) {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            await processData(data);
            return;
          } catch (e) {
            console.warn("Local catalog.json is invalid, falling back to sheet...");
          }
        }

        // 3. Fallback to Sheet API if local JSON not found or invalid
        const apiUrl = (import.meta as any).env.VITE_SHEET_API_URL;
        if (apiUrl && !apiUrl.includes("YOUR_GOOGLE_APPS_SCRIPT_URL")) {
          const sheetRes = await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify({ action: "get_catalog" })
          });
          if (sheetRes.ok) {
            const sheetText = await sheetRes.text();
            try {
              const sheetData = JSON.parse(sheetText);
              if (sheetData.success) {
                await processData(sheetData);
              }
            } catch (e) {
              console.error("Sheet API returned invalid JSON");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const processData = async (data: any) => {
      const allCats = new Set<string>(["সব"]);
      const sanitizedCatalog = data.catalog.map((p: any) => ({
        ...p,
        Image_Link: typeof p.Image_Link === 'string' ? p.Image_Link.trim() : p.Image_Link,
        Group_Images: Array.isArray(p.Group_Images) ? p.Group_Images.map((img: string) => typeof img === 'string' ? img.trim() : img) : p.Group_Images
      }));

      sanitizedCatalog.forEach((p: any) => {
        if (Array.isArray(p.Category)) {
          p.Category.forEach((c: string) => allCats.add(c));
        } else if (p.Category) {
          allCats.add(p.Category);
        }
      });

      setProducts([...sanitizedCatalog].sort(() => Math.random() - 0.5));
      
      let finalCategories = Array.from(allCats);
      let heroImages = [
        ...sanitizedCatalog.map((p: any) => p.Image_Link),
        ...(data.groupImages || []).map((img: string) => typeof img === 'string' ? img.trim() : img)
      ].filter(Boolean);

      try {
        const settingsRes = await fetch("/data/settings.json?t=" + Date.now(), { cache: "no-store" });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.heroImageIds) {
            const chosenIds = settingsData.heroImageIds.split(",").map((s: string) => s.trim()).filter(Boolean);
            if (chosenIds.length > 0) {
              const matchedImages = sanitizedCatalog
                .filter((p: any) => chosenIds.includes(String(p.id)))
                .map((p: any) => p.Image_Link)
                .filter(Boolean);
              if (matchedImages.length > 0) {
                heroImages = matchedImages;
              }
            }
          }
        }
      } catch (e) {}

      setCategories(finalCategories);
      window.dispatchEvent(new CustomEvent("hero-images-updated", { detail: heroImages }));

      // Save to Cache
      localStorage.setItem("catalog_cache", JSON.stringify(data));
      localStorage.setItem("catalog_cache_time", Date.now().toString());
    };

    loadCatalogData();

    const handleSettingsUpdate = () => {
      loadCatalogData();
    };
    window.addEventListener("settings-updated", handleSettingsUpdate);
    return () => window.removeEventListener("settings-updated", handleSettingsUpdate);
  }, []);

  useEffect(() => {
    const handleSelectCat = (e: any) => {
      if (e.detail) {
        setSelectedCategories([e.detail]);
        setTempCategories([e.detail]);
      }
    };
    window.addEventListener("select-category", handleSelectCat);
    return () => window.removeEventListener("select-category", handleSelectCat);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("categories-state-changed", {
      detail: { categories, selectedCategories }
    }));
  }, [categories, selectedCategories]);


  // Handle deep linking and URL updates
  useEffect(() => {
    const handleLocationChange = () => {
      const pathId = window.location.pathname.replace(/^\/|\/$/g, "").toLowerCase();
      if (!pathId || products.length === 0) return;

      // 1. Check if it's a product
      const product = products.find(p => String(p.id).toLowerCase() === pathId);
      if (product) {
        setExpandedId(product.id);
        setSelectedCategories(["সব"]);
        setTimeout(() => {
          document.getElementById("catalog")?.scrollIntoView({ behavior: "instant" });
        }, 100);
        return;
      }

      // 2. Check if it's a mapped category
      const matchedCategoryName = reverseMapping[pathId];
      if (matchedCategoryName) {
        setSelectedCategories([matchedCategoryName]);
        setExpandedId(null);
        setTimeout(() => {
          document.getElementById("catalog")?.scrollIntoView({ behavior: "instant" });
        }, 100);
        return;
      }

      // 3. If nothing matches and loading is finished, clear
      if (!isLoading) {
        setExpandedId(null);
      }
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, [products, categories, isLoading]);

  // 3. Sync URL with expandedId or category
  useEffect(() => {
    if (isLoading) return;
    const currentPath = window.location.pathname.replace(/^\/|\/$/g, "").toLowerCase();
    
    if (expandedId) {
      if (currentPath !== String(expandedId).toLowerCase()) {
        window.history.pushState(null, "", `/${expandedId}`);
      }
    } else if (selectedCategories.length === 1 && selectedCategories[0] !== "সব") {
      const catId = mapping[selectedCategories[0]];
      if (catId) {
        const catPath = catId.toLowerCase();
        if (currentPath !== catPath) {
          window.history.pushState(null, "", `/${catPath}`);
        }
      }
    } else if (!expandedId && selectedCategories[0] === "সব" && currentPath) {
      // Don't redirect to home if we are on a page like /about or /contact
      // but since Catalog is only on home, currentPath here would be a product or category that no longer exists
      const knownPages = ["about", "contact", (import.meta as any).env.VITE_SYNC_CODE?.toLowerCase()];
      if (!knownPages.includes(currentPath)) {
        window.history.pushState(null, "", "/");
      }
    }
  }, [expandedId, selectedCategories, isLoading]);

  const applyFilters = () => {
    setSearchTerm(tempSearch);
    setMinPrice(tempMin);
    setMaxPrice(tempMax);
    setSelectedCategories(tempCategories);
    setIsFilterPanelOpen(false);
  };
  const toggleCategory = (cat: string, isTemp: boolean = false) => {
    const current = isTemp ? tempCategories : selectedCategories;
    const setFunc = isTemp ? setTempCategories : setSelectedCategories;

    if (cat === "সব") {
      setFunc(["সব"]);
      return;
    }
    let next = current.filter(c => c !== "সব");
    if (next.includes(cat)) {
      next = next.filter(c => c !== cat);
      if (next.length === 0) next = ["সব"];
    } else {
      next = [...next, cat];
    }
    
    if (!isTemp) {
      const testFiltered = products.filter(p => {
        const cats = Array.isArray(p.Category) ? p.Category : [p.Category];
        return next.includes("সব") || next.every(sc => cats.includes(sc));
      });
      if (testFiltered.length === 0) {
        setFunc([cat]);
      } else {
        setFunc(next);
      }
    } else {
      setFunc(next);
    }
  };


  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), tempMax - 500);
    setTempMin(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), tempMin + 500);
    setTempMax(value);
  };

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bengaliToEnglishDigits = (str: string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[০-৯]/g, (w) => String(bengaliDigits.indexOf(w)));
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isCooldownActive) return;
    
    let cleanPhone = bengaliToEnglishDigits(form.phone.trim());
    if (cleanPhone.startsWith("+88")) cleanPhone = cleanPhone.slice(3);
    if (cleanPhone.startsWith("88")) cleanPhone = cleanPhone.slice(2);

    if (!cleanPhone.startsWith("01") || cleanPhone.length !== 11) {
      if (!cleanPhone.startsWith("01")) {
        alert("মোবাইল নম্বরটি অবশ্যই 01 দিয়ে শুরু হতে হবে।");
      } else if (cleanPhone.length !== 11) {
        alert("মোবাইল নম্বরটি অবশ্যই ১১ ডিজিটের হতে হবে।");
      }
      return;
    }

    setIsSubmitting(true);
    const res = await submitOrder({ ...form, phone: cleanPhone }, isGiftClaimed);
    setIsSubmitting(false);

    if (res.success) {
      setOrderSuccessData({ id: res.orderId! });
      setForm({ name: "", phone: "", address: "", note: "" });
    } else {
      alert(res.message || "অর্ডার করতে সমস্যা হয়েছে।");
    }
  };


  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (catalogRef.current) {
        const { top, bottom } = catalogRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          setIsSticky(top < 90 && bottom > 400);
        } else {
          // On desktop, only "sticky" if not expanded and catalog is in view
          setIsSticky(!expandedId && top < 0 && bottom > 400);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    const handleFilterToggle = () => {
      setIsFilterPanelOpen(prev => !prev);
      if (catalogRef.current) {
        catalogRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("toggle-catalog-filter", handleFilterToggle);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("toggle-catalog-filter", handleFilterToggle);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const filteredProducts = products.filter(p => {
    const cats = Array.isArray(p.Category) ? p.Category : [p.Category];
    const matchesCategory = selectedCategories.includes("সব") || selectedCategories.every(sc => cats.includes(sc));
    const matchesSearch = String(p.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = (p.Price || 0) >= minPrice && (p.Price || 0) <= maxPrice;
    return matchesCategory && matchesSearch && matchesPrice;
  });



  return (
    <section ref={catalogRef} id="catalog" className="py-20 px-1 sm:px-10 w-full min-h-[1000px] sm:min-h-screen">
      <div className="flex flex-col mb-16 max-w-7xl mx-auto px-4 sm:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-neon-purple font-black uppercase tracking-widest text-sm mb-4"
        >
          আমাদের কালেকশন
        </motion.div>
        
        <div className="flex flex-col items-center text-center gap-6">
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black font-display leading-[1.3] md:leading-[1.1] text-slate-900 dark:text-white tracking-tighter">
            সেরা পণ্যগুলো <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">খুঁজুন</span>
          </h2>
          <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full mt-2 md:mt-4" />
        </div>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterPanelOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-y-auto no-scrollbar shadow-2xl dark:shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <SlidersHorizontal className="text-neon-blue" size={20} /> ফিল্টার
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="w-10 h-10 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-500 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 dark:text-white/40">পণ্য খুঁজুন</span>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20" size={16} />
                      <input 
                        type="text" 
                        placeholder="কি খুঁজতে চাচ্ছেন?"
                        value={tempSearch}
                        onChange={(e) => setTempSearch(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-6 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-neon-blue transition-all"
                      />
                    </div>
                  </div>

                  {/* Dual Price Range Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 dark:text-white/40">মূল্যর পরিসীমা</span>
                      <div className="flex items-center gap-1.5">
                         <span className="text-[10px] font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-1 rounded border border-slate-200 dark:border-white/5">{tempMin}৳</span>
                         <span className="text-slate-400 dark:text-white/20">-</span>
                         <span className="text-[10px] font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-1 rounded border border-slate-200 dark:border-white/5">{tempMax}৳</span>
                      </div>
                    </div>
                    
                    <div className="relative h-6 flex items-center mt-2 group">
                      {/* Range Track */}
                      <div className="absolute w-full h-1 bg-slate-200 dark:bg-white/5 rounded-full" />
                      
                      {/* Active Range Highlight */}
                      <div 
                        className="absolute h-1 bg-neon-blue rounded-full"
                        style={{
                          left: `${(tempMin / 50000) * 100}%`,
                          width: `${((tempMax - tempMin) / 50000) * 100}%`
                        }}
                      />
                      
                      {/* Min Thumb */}
                      <input 
                        type="range"
                        min="0"
                        max="50000"
                        step="500"
                        value={tempMin}
                        onChange={handleMinChange}
                        className="absolute w-full h-0 appearance-none bg-transparent pointer-events-none z-30 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-neon-blue [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-neon-blue [&::-moz-range-thumb]:cursor-pointer"
                        style={{ zIndex: tempMin > 25000 ? 45 : 35 }}
                      />

                      {/* Max Thumb */}
                      <input 
                        type="range"
                        min="0"
                        max="50000"
                        step="500"
                        value={tempMax}
                        onChange={handleMaxChange}
                        className="absolute w-full h-0 appearance-none bg-transparent pointer-events-none z-40 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-neon-blue [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-neon-blue [&::-moz-range-thumb]:cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 dark:text-white/40">ক্যাটাগরি</span>
                    <div className="flex flex-wrap gap-2">
                       {categories.map((cat) => (
                        <button 
                          key={cat}
                          onClick={() => toggleCategory(cat, true)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                            tempCategories.includes(cat)
                            ? "bg-neon-blue text-slate-950 border-neon-blue shadow-lg" 
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/40 border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
                          )}
                        >
                          {cat}
                        </button>
                      ))}


                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-white/5">
                  <button 
                    onClick={() => {
                      setTempSearch("");
                      setTempMin(0);
                      setTempMax(50000);
                      setTempCategories(["সব"]);

                    }}
                    className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/40 font-bold py-3.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest"
                  >
                    রিসেট
                  </button>
                  <button 
                    onClick={applyFilters}
                    className="flex-[2] bg-neon-blue text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-neon-blue/20 transition-transform active:scale-95 text-[10px] uppercase tracking-widest"
                  >
                    ফিল্টার APPLY
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-6">
        <AnimatePresence>
          {isLoading ? (
            <div className="col-span-full py-20 text-center">
              <div className="inline-block w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-slate-500 dark:text-white/40 font-bold uppercase tracking-widest text-[10px]">পণ্য লোড হচ্ছে...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true }}
                className={cn(
                  "relative transition-all duration-500",
                  expandedId === product.id ? "z-[100]" : "z-10"
                )}
              >
                <ProductCard 
                  id={product.id}
                  title={product.title}
                  price={`${product.Price} ৳`}
                  category={Array.isArray(product.Category) ? product.Category.join(", ") : product.Category}
                  rating={product.Rating || 5}
                  image={product.Image_Link}
                  images={product.Group_Images}
                  description={product.description}
                  sizes={product.Size}
                  sizeInfo={product.Size_Info}
                  link={product.Link}
                  sellQuantity={product.Sell_Quantity}
                  discountTag={Array.isArray(product.OptionType) ? product.OptionType[0] : ""}
                  optionTags={product.OptionType}
                  groupImages={groupImages}
                  isExpanded={expandedId === product.id}
                  onToggleExpand={() => setExpandedId(expandedId === product.id ? null : product.id)}
                />

              </motion.div>
            ))
          ) : (

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 dark:text-white/20">
                <SearchX size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="text-sm text-slate-500 dark:text-white/40 max-w-sm">
                আপনার খোঁজা ক্যাটাগরি বা ফিল্টারের সাথে মিল রয়েছে এমন কোনো পণ্য পাওয়া যায়নি।
              </p>
              <button 
                onClick={() => { setSelectedCategories(["সব"]); setSearchTerm(""); }}
                className="mt-4 px-6 py-2.5 bg-neon-blue text-slate-950 font-bold rounded-xl hover:opacity-90 transition-opacity text-xs uppercase tracking-widest"
              >
                সব পণ্য দেখুন
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            id="checkout-panel" 
            className="mt-20 md:mt-40 bg-white/80 dark:bg-black/60 backdrop-blur-[60px] p-6 sm:p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 dark:border-white/20 relative overflow-hidden shadow-2xl dark:shadow-[0_0_100px_rgba(0,242,255,0.1)]"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-neon-blue/10 blur-[120px] -z-10 animate-pulse" />
            
            <div className="max-w-6xl mx-auto relative z-10">
              <div className="text-center mb-16">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-blue/20 text-neon-blue mb-6 border border-neon-blue/30"
                >
                  <CheckCircle size={32} />
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-6xl font-black font-display text-slate-900 dark:text-white mb-6 tracking-tight"
                >
                  আপনার অর্ডার ফাইনাল করুন
                </motion.h3>

                <p className="text-slate-600 dark:text-white/60 text-lg max-w-2xl mx-auto">সঠিক তথ্য প্রদান করে আপনার পছন্দের পণ্যগুলো আজই ঘরে পৌঁছে নিন।</p>

                {/* Timer & Gift Claim */}
                {isGiftEnabled && (
                  <div className="mt-10 flex flex-col items-center gap-6">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-neon-pink/10 border border-neon-pink/20 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-md"
                    >
                      <div className="w-2 h-2 bg-neon-pink rounded-full animate-ping" />
                      <span className="text-neon-pink font-black text-[10px] md:text-sm uppercase tracking-[0.2em]">
                        অফার শেষ হতে আর মাত্র <span className="bg-neon-pink text-white px-2 py-0.5 rounded ml-1">{formatTime(giftCountdown)}</span> মিনিট বাকি! দ্রুত অর্ডার কনফার্ম করুন।
                      </span>
                    </motion.div>
                    
                    {!isGiftClaimed ? (
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 242, 255, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsGiftClaimed(true);
                          localStorage.setItem("last_gift_claim_date", new Date().toDateString());
                        }}
                        className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-white px-10 py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl flex items-center gap-3 group transition-all"
                      >
                        <span className="text-xl group-hover:rotate-12 transition-transform">🎁</span>
                        আপনার গিফট ক্লেইম করুন
                      </motion.button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-neon-blue/10 border border-neon-blue/20 px-8 py-4 rounded-2xl text-neon-blue font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-3 backdrop-blur-md"
                      >
                        <span className="text-xl">🎉</span>
                        গিফট ক্লেইম করা হয়েছে! (Gift *[1] আপনার অর্ডারে যোগ হবে)
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-12">
                {/* 1. Order Summary */}
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-3 text-neon-blue mb-6">
                    <ShoppingBag size={24} />
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">আপনার পণ্যসমূহ ({cart.length})</h4>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {cart.length > 0 ? (
                        cart.map((item) => (
                          <motion.div 
                            key={`${item.id}-${item.size}`}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex items-center gap-3 sm:gap-6 group hover:border-slate-300 dark:hover:border-white/30 transition-all shadow-lg backdrop-blur-md"
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center p-2 border border-slate-200 dark:border-white/5 shrink-0">
                              <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-slate-900 dark:text-white font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 truncate leading-[1.6]">{item.title}</h5>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <p className="text-neon-blue font-bold text-xs sm:text-base tracking-tight leading-[1.6]">{item.price}</p>
                                  {item.size && (
                                    <span className="text-[8px] sm:text-[10px] bg-slate-200 dark:bg-white/10 px-1.5 sm:px-2 py-0.5 rounded text-slate-700 dark:text-white/60 font-bold uppercase tracking-widest">{item.size}</span>
                                  )}
                                </div>
                                <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-white/40 font-bold mt-1 leading-[1.6]">
                                  {item.priceNum} x {item.quantity} = {(item.priceNum * item.quantity).toLocaleString()} ৳
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-slate-200 dark:bg-black/40 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-300 dark:border-white/10">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-white dark:bg-white/5 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-4 text-center font-bold text-slate-900 dark:text-white text-[10px] sm:text-sm">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-white dark:bg-white/5 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id, item.size)}
                              className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-white/20 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-20 bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/20">
                          <p className="text-slate-500 dark:text-white/30 italic">আপনার কার্ট খালি। শপিং শুরু করুন!</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {cart.length > 0 && (
                    <div className="pt-8 border-t border-slate-200 dark:border-white/10">
                      <div className="flex justify-between items-center text-slate-600 dark:text-white/60 mb-2">
                        <span>সাব-টোটাল:</span>
                        <span>{totalPrice.toLocaleString()} ৳</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-white/60 mb-6">
                        <span>ডেলিভারি চার্জ:</span>
                        <span>{deliveryCharge.toLocaleString()} ৳</span>
                      </div>
                      <div className="flex justify-between items-center text-3xl font-black text-slate-900 dark:text-white">
                        <span>মোট:</span>
                        <span className="text-neon-blue">{(totalPrice + deliveryCharge).toLocaleString()} ৳</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Form */}
                <div className="w-full lg:w-[450px]">
                  <div className="bg-white dark:bg-white/5 p-8 rounded-[3rem] border-2 border-slate-200 dark:border-white/10 relative shadow-2xl backdrop-blur-3xl">
                    <form 
                      onSubmit={handleOrderSubmit}
                      className="space-y-4"
                    >
                      <div className="space-y-2 group">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-600 dark:text-white/60 flex items-center gap-2 mb-2 ml-2">
                          <User size={12} className="text-neon-blue" /> আপনার নাম
                        </label>
                        <input 
                          type="text" 
                          name="name"
                          autoComplete="name"
                          placeholder="আপনার নাম লিখুন (ঐচ্ছিক)"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-black/60 border-2 border-neon-blue/40 dark:border-neon-blue/30 rounded-2xl px-6 py-4 text-slate-950 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-white/50 focus:outline-none focus:border-neon-blue focus:ring-4 focus:ring-neon-blue/30 focus:shadow-[0_0_18px_rgba(0,242,255,0.35)] transition-all text-sm shadow-inner"
                        />
                      </div>

                      <div className="space-y-2 group">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-600 dark:text-white/60 flex items-center gap-2 mb-2 ml-2">
                          <Phone size={12} className="text-neon-blue" /> ফোন নম্বর
                        </label>
                        <input 
                          required
                          type="tel" 
                          name="phone"
                          autoComplete="tel"
                          placeholder="০১৮XXXXXXXX"
                          value={form.phone}
                          onChange={(e) => {
                            let val = e.target.value.trim();
                            val = bengaliToEnglishDigits(val);
                            if (val.startsWith("+88")) val = val.slice(3);
                            if (val.startsWith("88")) val = val.slice(2);
                            // Only allow digits and max 11 chars
                            val = val.replace(/\D/g, "").slice(0, 11);
                            setForm({ ...form, phone: val });
                          }}
                          className="w-full bg-slate-100 dark:bg-black/60 border-2 border-neon-blue/40 dark:border-neon-blue/30 rounded-2xl px-6 py-4 text-slate-950 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-white/50 focus:outline-none focus:border-neon-blue focus:ring-4 focus:ring-neon-blue/30 focus:shadow-[0_0_18px_rgba(0,242,255,0.35)] transition-all text-sm shadow-inner"
                        />
                      </div>



                      <div className="space-y-2 group">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-600 dark:text-white/60 flex items-center gap-2 mb-2 ml-2">
                          <MapPin size={12} className="text-neon-blue" /> আপনার পুরো ঠিকানা (শহর, উপজেলা সহ)
                        </label>
                        <textarea 
                          name="address"
                          autoComplete="street-address"
                          placeholder="বাসা নং, রোড নং, এলাকা বিস্তারিত লিখুন... (ঐচ্ছিক)"
                          rows={3}
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-black/60 border-2 border-neon-blue/40 dark:border-neon-blue/30 rounded-2xl px-6 py-4 text-slate-950 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-white/50 focus:outline-none focus:border-neon-blue focus:ring-4 focus:ring-neon-blue/30 focus:shadow-[0_0_18px_rgba(0,242,255,0.35)] transition-all text-sm resize-none shadow-inner"
                        />
                      </div>

                      <div className="space-y-2 group">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-600 dark:text-white/60 flex items-center gap-2 mb-2 ml-2">
                          <Notebook size={12} className="text-neon-blue" /> অর্ডার নোট (ঐচ্ছিক)
                        </label>
                        <input 
                          type="text" 
                          name="note"
                          autoComplete="off"
                          placeholder="অর্ডার সম্পর্কে কোনো বিশেষ কথা"
                          value={form.note}
                          onChange={(e) => setForm({ ...form, note: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-black/60 border-2 border-neon-blue/40 dark:border-neon-blue/30 rounded-2xl px-6 py-4 text-slate-950 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-white/50 focus:outline-none focus:border-neon-blue focus:ring-4 focus:ring-neon-blue/30 focus:shadow-[0_0_18px_rgba(0,242,255,0.35)] transition-all text-sm shadow-inner"
                        />
                      </div>
                      <div className="pt-4">
                        <button 
                          type="submit"
                          disabled={cart.length === 0 || isCooldownActive || isSubmitting}
                          className="w-full relative group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-1000" />
                          <div className="relative w-full bg-neon-blue text-slate-950 font-black text-xl py-5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-neon-blue/30">
                            <CheckCircle size={22} />
                            {isSubmitting ? "অর্ডার সাবমিট হচ্ছে..." : isCooldownActive ? `অপেক্ষা করুন (${formatTime(remainingTime)})` : "অর্ডার কনফার্ম করুন"}
                          </div>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Order Success Popup */}
      <AnimatePresence>
        {orderSuccessData && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-xl"
              onClick={() => setOrderSuccessData(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-8 sm:p-12 rounded-[3rem] text-center max-w-lg w-full shadow-2xl dark:shadow-[0_0_100px_rgba(0,242,255,0.2)]"
            >
              <div className="w-20 h-20 bg-neon-blue/20 rounded-full flex items-center justify-center text-neon-blue mx-auto mb-8 border border-neon-blue/30">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">অর্ডার সফল হয়েছে!</h3>
              <p className="text-slate-600 dark:text-white/60 mb-8">
                আপনার অর্ডার আইডি: <span className="text-neon-blue font-black">{orderSuccessData.id}</span>
                <br />
                অল্প সময়ের মধ্যে আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
              </p>
              
              <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-8">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-white/40 mb-2">পরবর্তী অর্ডারের জন্য অপেক্ষা</p>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-display">{formatTime(remainingTime)}</div>
              </div>

              <button 
                onClick={() => setOrderSuccessData(null)}
                className="w-full py-4 bg-neon-blue text-slate-950 font-black rounded-xl shadow-lg shadow-neon-blue/20 hover:scale-105 transition-all"
              >
                ঠিক আছে
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
