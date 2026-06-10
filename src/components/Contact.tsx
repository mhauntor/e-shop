import React from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  const rawSiteName = (import.meta as any).env.VITE_SITE_NAME || (import.meta as any).env.VITE_WEBSITE_NAME || "AmarDokan";
  const hasBangla = /[\u0980-\u09FF]/.test(rawSiteName);
  const cleanName = hasBangla ? "shukriashop" : rawSiteName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const contactEmail = `support@${cleanName}.com`;

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
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="নাম" className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-neon-blue outline-none shadow-sm dark:shadow-none" />
            <input type="email" placeholder="ইমেল" className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-neon-blue outline-none shadow-sm dark:shadow-none" />
          </div>
          <input type="text" placeholder="বিষয়" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-neon-blue outline-none shadow-sm dark:shadow-none" />
          <textarea placeholder="আপনার মেসেজ..." className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 h-32 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-neon-blue outline-none shadow-sm dark:shadow-none" />
          <button className="w-full py-4 bg-neon-pink text-white dark:text-slate-950 rounded-xl font-bold shadow-lg shadow-neon-pink/30 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            মেসেজ পাঠান <Send size={20} />
          </button>
        </motion.form>
      </div>
    </section>
  );
}
