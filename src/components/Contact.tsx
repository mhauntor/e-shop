import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  const rawSiteName = (import.meta as any).env.VITE_SITE_NAME || (import.meta as any).env.VITE_WEBSITE_NAME || "AmarDokan";
  const hasBangla = /[\u0980-\u09FF]/.test(rawSiteName);
  const cleanName = hasBangla ? "shukriashop" : rawSiteName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const contactEmail = `support@${cleanName}.com`;

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; msg: string }>({ type: null, msg: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact || !formData.message) {
      alert("যোগাযোগ নম্বর/ইমেইল এবং মেসেজ অবশ্যই পূরণ করতে হবে।");
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: null, msg: "" });

    try {
      const apiUrl = (import.meta as any).env.VITE_SHEET_API_URL;
      if (!apiUrl) {
        throw new Error("API configuration missing.");
      }

      const chatId = `MSG-${Date.now()}`;
      const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });

      const res = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "chat",
          id: chatId,
          timestamp,
          ip: "127.0.0.1",
          browser: navigator.userAgent,
          contect: formData.name ? `${formData.name} (${formData.contact})` : formData.contact,
          subject: formData.subject || "No Subject",
          message: formData.message,
          replay: ""
        })
      });

      const result = await res.json();
      if (result.success) {
        setStatus({ type: "success", msg: "আপনার মেসেজটি সফলভাবে পাঠানো হয়েছে!" });
        setFormData({ name: "", contact: "", subject: "", message: "" });
      } else {
        setStatus({ type: "error", msg: result.message || "মেসেজ পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "নেটওয়ার্ক ত্রুটি! অনুগ্রহ করে আবার চেষ্টা করুন।" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-neon-pink font-bold uppercase tracking-widest text-sm mb-2"
        >
          যোগাযোগ করুন
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-bold font-display">যেকোনো দরকারে আমরা <span className="text-neon-pink">পাশে আছি</span></h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="glass dark:glass-dark p-8 rounded-3xl space-y-8"
        >
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-neon-blue/20 flex items-center justify-center text-neon-blue">
              <Phone size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">সাপোর্ট লাইন</h4>
              <p className="text-muted-foreground">{(import.meta as any).env.VITE_HELPLINE_PHONE || "+৮৮০ ১৭০০ ০০০০০০"}</p>
              <p className="text-xs text-muted-foreground">সকাল ৯টা - রাত ১০টা</p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-neon-purple/20 flex items-center justify-center text-neon-purple">
              <Mail size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">ইমেল করুন</h4>
              <p className="text-muted-foreground">{contactEmail}</p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-neon-pink/20 flex items-center justify-center text-neon-pink">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">হেড অফিস</h4>
              <p className="text-muted-foreground">{(import.meta as any).env.VITE_OUR_LOCATION || "ঢাকা, বাংলাদেশ"}</p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="glass dark:glass-dark p-8 rounded-3xl space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="নাম" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-neon-blue outline-none shadow-sm dark:shadow-none" 
            />
            <input 
              type="text" 
              required
              placeholder="ফোন নম্বর / ইমেল" 
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-neon-blue outline-none shadow-sm dark:shadow-none" 
            />
          </div>
          <input 
            type="text" 
            placeholder="বিষয়" 
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-neon-blue outline-none shadow-sm dark:shadow-none" 
          />
          <textarea 
            required
            placeholder="আপনার মেসেজ..." 
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 h-32 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-neon-blue outline-none shadow-sm dark:shadow-none" 
          />
          {status.msg && (
            <p className={status.type === "success" ? "text-green-500 font-bold text-sm" : "text-red-500 font-bold text-sm"}>
              {status.msg}
            </p>
          )}
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-neon-pink text-white dark:text-slate-950 rounded-xl font-bold shadow-lg shadow-neon-pink/30 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "মেসেজ পাঠানো হচ্ছে..." : "মেসেজ পাঠান"} <Send size={20} />
          </button>
        </motion.form>
      </div>
    </section>
  );
}
