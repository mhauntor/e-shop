import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Zap, Truck, RotateCcw } from "lucide-react";

export default function About() {
  const features = [
    { icon: ShieldCheck, title: "নিরাপদ শপিং", desc: "আমরা আপনার পেমেন্ট এবং তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিত করি।" },
    { icon: Zap, title: "দ্রুত ডেলিভারি", desc: "সমগ্র বাংলাদেশে ৩-৫ দিনের মধ্যে হোম ডেলিভারি।" },
    { icon: RotateCcw, title: "সহজ রিটার্ন", desc: "৭ দিনের মধ্যে কোনো প্রশ্ন ছাড়াই পণ্য পরিবর্তনের সুবিধা।" },
    { icon: Truck, title: "ফ্রি শিপিং", desc: "২০০০ টাকার বেশি কেনাকাটায় সারা দেশে ফ্রি শিপিং।" },
  ];

  return (
    <section id="about" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           className="relative"
        >
          <div className="aspect-video rounded-3xl overflow-hidden glass dark:glass-dark p-2">
             <img 
               src="https://placehold.co/1000x600/111111/00f2ff?text=AirFit+Premium" 
               alt="Store" 
               className="w-full h-full object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-500"
             />
          </div>
          <div className="absolute -bottom-8 -right-8 glass dark:glass-dark p-6 rounded-2xl hidden md:block">
            <div className="text-4xl font-bold text-neon-purple">১২+</div>
            <div className="text-sm font-bold uppercase text-slate-900 dark:text-white">বছরের অভিজ্ঞতা</div>
          </div>
        </motion.div>

        <div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-neon-blue font-bold uppercase tracking-widest text-sm mb-2"
          >
            আমাদের সম্পর্কে
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">কেন আমাদের <span className="text-neon-purple">পছন্দ করবেন?</span></h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            আমরা গত ১ যুগ ধরে বাংলাদেশের মানুষের কাছে মানসম্মত পণ্য পৌঁছে দিচ্ছি। 
            আমাদের মূল লক্ষ্য হলো গ্রাহক সন্তুষ্টি এবং সেরা অনলাইন এক্সপেরিয়েন্স। 
            আমরা সরাসরি আমদানিকারক থেকে পণ্য সংগ্রহ করি, তাই গুণগত মানের ব্যাপারে আমরা আপোসহীন।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex gap-4 p-4 glass dark:glass-dark rounded-2xl hover:border-neon-blue transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue group-hover:bg-neon-blue group-hover:text-white transition-all">
                  <f.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">{f.title}</h4>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
