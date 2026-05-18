import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Database, Download, CheckCircle, AlertCircle, Loader2, Plus, RefreshCw, Trash2, ChevronRight } from "lucide-react";

interface SyncSummary {
  added: string[];
  updated: string[];
  deleted: string[];
}

export default function SyncPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<SyncSummary | null>(null);

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
        <p className="text-white/40 mb-8 text-sm">গুগল শিট থেকে লেটেস্ট ডেটা লোকাল স্টোরেজে সিঙ্ক করুন।</p>

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
