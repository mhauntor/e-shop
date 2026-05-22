import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Database, Download, CheckCircle, AlertCircle, Loader2, Plus, RefreshCw, Trash2, ChevronRight } from "lucide-react";

interface SyncSummary {
  added: string[];
  updated: string[];
  deleted: string[];
}

interface AdItem {
  headerText: string;
  title: string;
  category: string;
}

export default function SyncPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<SyncSummary | null>(null);

  // New states for Settings Tab
  const [activeTab, setActiveTab] = useState<"catalog" | "settings">("catalog");
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
    heroImageIds: "1, 2, 3, 4, 5, 6, 7, 8",
    categories: ["সব"]
  });

  const [newAdHeader, setNewAdHeader] = useState("");
  const [newAdTitle, setNewAdTitle] = useState("");
  const [newAdCategory, setNewAdCategory] = useState("সব");

  const [newCategory, setNewCategory] = useState("");
  const [settingsStatus, setSettingsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [settingsMessage, setSettingsMessage] = useState("");

  // States for catalog product & category picker
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<string[]>(["সব"]);
  const [productSearch, setProductSearch] = useState("");

  React.useEffect(() => {
    // Load catalog to get products and categories for the admin picker
    fetch("/data/catalog.json")
      .then(res => res.json())
      .then(data => {
        if (data && data.catalog) {
          setCatalogProducts(data.catalog);
          const cats = Array.from(new Set(["সব", ...data.catalog.flatMap((p: any) => p.Category)]));
          setCatalogCategories(cats as string[]);
        }
      })
      .catch(() => {});

    // Load settings
    fetch("/api/settings?t=" + Date.now(), { cache: "no-store" })
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
  }, []);

  const handleSync = async () => {
    setStatus("loading");
    setSummary(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const text = await res.text();
      console.log("Raw Response:", text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("সার্ভার থেকে সঠিক রেসপন্স পাওয়া যায়নি। কনসোল চেক করুন।");
      }

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(`${data.count} টি পণ্য সফলভাবে সিঙ্ক করা হয়েছে।`);
        setSummary(data.summary);
      } else {
        throw new Error(data.error || data.message || "সিঙ্ক ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  const handleSaveSettings = async () => {
    setSettingsStatus("loading");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsStatus("success");
        setSettingsMessage("সেটিংস সফলভাবে সেভ ও সিঙ্ক হয়েছে!");
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: settings }));
      } else {
        throw new Error(data.error || "সেটিংস সেভ ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      setSettingsStatus("error");
      setSettingsMessage(err.message || "একটি সমস্যা হয়েছে।");
    }
  };

  // Helper to get selected product objects based on heroImageIds string
  const selectedIdsList = settings.heroImageIds.split(",").map(id => id.trim()).filter(Boolean);
  const selectedProductsPreview = catalogProducts.filter(p => selectedIdsList.includes(String(p.id)));

  const filteredProducts = catalogProducts.filter(p => 
    String(p.id).toLowerCase().includes(productSearch.toLowerCase()) ||
    String(p.title || "").toLowerCase().includes(productSearch.toLowerCase()) ||
    String(p.Category || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const toggleProductId = (id: string) => {
    const currentIds = settings.heroImageIds.split(",").map(s => s.trim()).filter(Boolean);
    if (currentIds.includes(id)) {
      setSettings(prev => ({ ...prev, heroImageIds: currentIds.filter(item => item !== id).join(", ") }));
    } else {
      setSettings(prev => ({ ...prev, heroImageIds: [...currentIds, id].join(", ") }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-white overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 sm:p-10 text-center shadow-2xl my-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-neon-blue/20 rounded-3xl flex items-center justify-center text-neon-blue mx-auto mb-6 border border-neon-blue/30 shadow-[0_0_30px_rgba(0,242,255,0.2)]"
        >
          <Database size={40} />
        </motion.div>
        
        <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Data Synchronizer</h1>
        <p className="text-white/40 mb-8 text-sm">গুগল শিট থেকে লেটেস্ট ডেটা ও সাইট সেটিংস সিঙ্ক করুন।</p>

        {/* Tab Navigation */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/10">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "catalog" ? "bg-neon-blue text-slate-950 shadow-lg shadow-neon-blue/20" : "text-white/60 hover:text-white"}`}
          >
            ক্যাটালগ সিঙ্ক
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "settings" ? "bg-neon-blue text-slate-950 shadow-lg shadow-neon-blue/20" : "text-white/60 hover:text-white"}`}
          >
            হিরো ও ক্যাটাগরি সেটিংস
          </button>
        </div>

        {activeTab === "settings" ? (
          <div className="space-y-8 text-left">
            {/* Ad Texts Section */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-neon-blue flex items-center gap-2">
                হিরো স্লাইডার (Ad Texts ও ক্যাটাগরি লিংকিং)
              </h3>
              <p className="text-xs text-white/40">
                প্রতিটি অ্যাডের জন্য আলাদা হেডার/টপ ব্যাজ, মূল টেক্সট এবং ক্যাটাগরি সিলেক্ট করুন। অ্যাডে বা বাটনে ক্লিক করলে সরাসরি ওই ক্যাটাগরির প্রোডাক্টগুলো চলে আসবে।
              </p>
              
              {/* Existing Ads List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {settings.adTexts.map((ad, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-neon-blue uppercase tracking-wider flex items-center gap-2">
                        <span>ব্যাজ: {ad.headerText}</span>
                        <span>•</span>
                        <span className="bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded-md">ক্যাটাগরি: {ad.category}</span>
                      </div>
                      <div className="text-sm font-bold whitespace-pre-wrap text-white">{ad.title}</div>
                    </div>
                    <button 
                      onClick={() => setSettings(prev => ({ ...prev, adTexts: prev.adTexts.filter((_, index) => index !== i) }))}
                      className="self-end sm:self-center p-2.5 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {settings.adTexts.length === 0 && (
                  <p className="text-xs text-white/20 italic py-4 text-center border border-dashed border-white/10 rounded-2xl">কোনো অ্যাড টেক্সট নেই। ডিফল্ট টেক্সট প্রদর্শিত হবে।</p>
                )}
              </div>

              {/* Add New Ad Form */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 pt-4">
                <span className="text-xs font-bold text-white block">নতুন অ্যাড যুক্ত করুন:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-white/60 mb-1 block">হেডার / টপ ব্যাজ টেক্সট</label>
                    <input 
                      type="text" 
                      value={newAdHeader}
                      onChange={e => setNewAdHeader(e.target.value)}
                      placeholder="যেমন: ধামাকা অফার!" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-neon-blue outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/60 mb-1 block">লিঙ্কড ক্যাটাগরি (ক্লিক করলে যেখানে যাবে)</label>
                    <select 
                      value={newAdCategory}
                      onChange={e => setNewAdCategory(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-neon-blue outline-none text-white"
                    >
                      {catalogCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/60 mb-1 block">মূল স্লাইডার টেক্সট (\n দিয়ে লাইন ভাঙুন)</label>
                  <textarea 
                    value={newAdTitle}
                    onChange={e => setNewAdTitle(e.target.value)}
                    placeholder="যেমন: স্মার্ট ও প্রিমিয়াম \n গ্যাজেট কালেকশন" 
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-neon-blue outline-none text-white resize-none"
                  />
                </div>

                <button 
                  onClick={() => {
                    if (newAdTitle.trim()) {
                      setSettings(prev => ({
                        ...prev,
                        adTexts: [...prev.adTexts, {
                          headerText: newAdHeader.trim() || settings.badgeText || "নতুন কালেকশন চলে এসেছে!",
                          title: newAdTitle.trim(),
                          category: newAdCategory
                        }]
                      }));
                      setNewAdHeader("");
                      setNewAdTitle("");
                      setNewAdCategory("সব");
                    }
                  }}
                  className="w-full py-3 bg-neon-blue text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1 hover:opacity-90 shadow-md shadow-neon-blue/20"
                >
                  <Plus size={18} /> অ্যাড যুক্ত করুন
                </button>
              </div>
            </div>

            {/* Hero Text & Stats Settings */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-neon-pink flex items-center gap-2">
                হিরো টেক্সট, বাটন ও ইমেজ সেটিংস
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/60 mb-1 block">টপ ব্যাজ টেক্সট</label>
                  <input 
                    type="text" 
                    value={settings.badgeText}
                    onChange={e => setSettings(prev => ({ ...prev, badgeText: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-pink outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-1 block">JUST IN ট্যাগ</label>
                  <input 
                    type="text" 
                    value={settings.justInText}
                    onChange={e => setSettings(prev => ({ ...prev, justInText: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-pink outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-1 block">ক্রয় বাটন টেক্সট</label>
                  <input 
                    type="text" 
                    value={settings.buyBtnText}
                    onChange={e => setSettings(prev => ({ ...prev, buyBtnText: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-pink outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-1 block">প্রমোশন বাটন টেক্সট</label>
                  <input 
                    type="text" 
                    value={settings.promoBtnText}
                    onChange={e => setSettings(prev => ({ ...prev, promoBtnText: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-pink outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-1 block">পরিসংখ্যান ১ (সংখ্যা)</label>
                  <input 
                    type="text" 
                    value={settings.stat1Number}
                    onChange={e => setSettings(prev => ({ ...prev, stat1Number: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-pink outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-1 block">পরিসংখ্যান ১ (লেবেল)</label>
                  <input 
                    type="text" 
                    value={settings.stat1Label}
                    onChange={e => setSettings(prev => ({ ...prev, stat1Label: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-pink outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-1 block">পরিসংখ্যান ২ (সংখ্যা)</label>
                  <input 
                    type="text" 
                    value={settings.stat2Number}
                    onChange={e => setSettings(prev => ({ ...prev, stat2Number: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-pink outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-1 block">পরিসংখ্যান ২ (লেবেল)</label>
                  <input 
                    type="text" 
                    value={settings.stat2Label}
                    onChange={e => setSettings(prev => ({ ...prev, stat2Label: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-pink outline-none text-white"
                  />
                </div>
              </div>
            </div>

            {/* Hero Image Picker & Preview Section */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-neon-pink flex items-center gap-2">
                ক্যারোসেল ইমেজ (প্রোডাক্ট আইডি ও প্রিভিউ)
              </h3>
              <p className="text-xs text-white/40">
                প্রোডাক্ট আইডি লিখে সার্চ করুন অথবা নিচের তালিকা থেকে প্রোডাক্ট সিলেক্ট করে ক্যারোসেলে যুক্ত করুন।
              </p>

              {/* Current Selection Input & Preview */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white/60 block">নির্বাচিত প্রোডাক্ট আইডি সমূহ:</label>
                <input 
                  type="text" 
                  value={settings.heroImageIds}
                  onChange={e => setSettings(prev => ({ ...prev, heroImageIds: e.target.value }))}
                  placeholder="যেমন: 1, 2, 3, 4" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-pink outline-none text-white"
                />
                
                {/* Live Preview Thumbnails */}
                {selectedProductsPreview.length > 0 && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-xs font-bold text-neon-blue block">লাইভ প্রিভিউ ({selectedProductsPreview.length}টি ছবি):</span>
                    <div className="flex flex-wrap gap-3">
                      {selectedProductsPreview.map(p => (
                        <div key={p.id} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-white/20 bg-slate-800 shrink-0">
                          <img src={p.Image_Link} alt={p.title} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => toggleProductId(String(p.id))}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                          >
                            বাদ দিন
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Search & Picker List */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                  <input 
                    type="text" 
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="প্রোডাক্ট আইডি, নাম বা ক্যাটাগরি দিয়ে খুঁজুন..." 
                    className="w-full bg-transparent text-sm outline-none text-white placeholder:text-white/30"
                  />
                  {productSearch && (
                    <button onClick={() => setProductSearch("")} className="text-white/40 hover:text-white text-xs">ক্লিয়ার</button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                  {filteredProducts.map(p => {
                    const isSelected = selectedIdsList.includes(String(p.id));
                    return (
                      <div 
                        key={p.id}
                        onClick={() => toggleProductId(String(p.id))}
                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${isSelected ? "bg-neon-pink/20 border-neon-pink text-white shadow-md shadow-neon-pink/20" : "bg-white/5 border-white/5 hover:border-white/20 text-white/70 hover:text-white"}`}
                      >
                        <img src={p.Image_Link} alt={p.title} className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">{p.title || `Product #${p.id}`}</div>
                          <div className="text-[10px] text-white/40 flex items-center gap-2 mt-0.5">
                            <span>ID: {p.id}</span>
                            <span>•</span>
                            <span className="truncate">{p.Category}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${isSelected ? "bg-neon-pink border-neon-pink text-slate-950" : "border-white/20 text-transparent"}`}>
                          ✓
                        </div>
                      </div>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-white/30 text-xs italic">
                      কোনো প্রোডাক্ট পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={settingsStatus === "loading"}
              className="w-full bg-neon-blue text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden shadow-lg shadow-neon-blue/30"
            >
              {settingsStatus === "loading" ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <CheckCircle size={24} />
              )}
              <span className="text-lg">সেটিংস সিঙ্ক ও সেভ করুন</span>
            </button>

            <AnimatePresence>
              {settingsStatus === "success" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-400 text-sm font-bold justify-center"
                >
                  <CheckCircle size={20} />
                  {settingsMessage}
                </motion.div>
              )}

              {settingsStatus === "error" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold justify-center"
                >
                  <AlertCircle size={20} />
                  {settingsMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={handleSync}
              disabled={status === "loading"}
              className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-neon-blue transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Download size={24} className="group-hover:translate-y-1 transition-transform" />
              )}
              <span className="text-lg">Sync Catalog Now</span>
            </button>

            <AnimatePresence>
              {status === "success" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-400 text-sm font-bold justify-center">
                    <CheckCircle size={20} />
                    {message}
                  </div>

                  {summary && (
                    <div className="grid grid-cols-1 gap-4 text-left">
                      {/* Added */}
                      {summary.added.length > 0 && (
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                          <div className="flex items-center gap-2 text-green-400 mb-3 font-black text-xs uppercase tracking-widest">
                            <Plus size={14} /> নতুন যুক্ত হয়েছে ({summary.added.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {summary.added.slice(0, 10).map((name, i) => (
                              <span key={i} className="px-3 py-1 bg-green-500/10 text-green-400/70 rounded-lg text-[10px] font-bold">{name}</span>
                            ))}
                            {summary.added.length > 10 && <span className="text-[10px] text-white/20 font-bold">+{summary.added.length - 10} more</span>}
                          </div>
                        </div>
                      )}

                      {/* Updated */}
                      {summary.updated.length > 0 && (
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                          <div className="flex items-center gap-2 text-neon-blue mb-3 font-black text-xs uppercase tracking-widest">
                            <RefreshCw size={14} /> আপডেট হয়েছে ({summary.updated.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {summary.updated.slice(0, 10).map((name, i) => (
                              <span key={i} className="px-3 py-1 bg-neon-blue/10 text-neon-blue/70 rounded-lg text-[10px] font-bold">{name}</span>
                            ))}
                            {summary.updated.length > 10 && <span className="text-[10px] text-white/20 font-bold">+{summary.updated.length - 10} more</span>}
                          </div>
                        </div>
                      )}

                      {/* Deleted */}
                      {summary.deleted.length > 0 && (
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                          <div className="flex items-center gap-2 text-red-400 mb-3 font-black text-xs uppercase tracking-widest">
                            <Trash2 size={14} /> রিমুভ হয়েছে ({summary.deleted.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {summary.deleted.slice(0, 10).map((name, i) => (
                              <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400/70 rounded-lg text-[10px] font-bold">{name}</span>
                            ))}
                            {summary.deleted.length > 10 && <span className="text-[10px] text-white/20 font-bold">+{summary.deleted.length - 10} more</span>}
                          </div>
                        </div>
                      )}

                      {summary.added.length === 0 && summary.updated.length === 0 && summary.deleted.length === 0 && (
                        <div className="text-center py-6 text-white/20 italic text-sm">
                          কোনো পরিবর্তন পাওয়া যায়নি। ডেটা আগের মতোই আছে।
                        </div>
                      )}

                      <button 
                        onClick={() => { setStatus("idle"); setSummary(null); }}
                        className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 font-bold transition-all text-xs uppercase tracking-widest border border-white/5"
                      >
                        বুঝেছি
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {status === "error" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold justify-center"
                >
                  <AlertCircle size={20} />
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest leading-relaxed">
            Main Host-এ আপলোড করার আগে এই প্রসেসটি অবশ্যই সম্পন্ন করবেন <br />
            যাতে ইউজাররা দ্রুত সাইট লোড হতে দেখে।
          </p>
          <a href="/" className="text-neon-blue text-xs font-bold flex items-center gap-1 hover:underline">
            হোম পেজে ফিরে যান <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
