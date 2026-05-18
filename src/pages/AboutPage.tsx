import React from "react";
import About from "../components/About";
import { motion } from "motion/react";

export default function AboutPage() {
  return (
    <div className="pt-32">
      <About />
      <div className="max-w-7xl mx-auto px-6 py-20">
         <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           className="glass dark:glass-dark p-12 rounded-[3rem] text-center"
         >
           <h2 className="text-3xl font-bold mb-6">আমাদের লক্ষ্য</h2>
           <p className="text-muted-foreground text-lg leading-relaxed">
             আমরা শুধু পণ্য বিক্রি করি না, আমরা একটি সপ্ন বিক্রি করি। আমাদের প্রত্যেকটি পণ্য অত্যন্ত যত্নসহকারে নির্বাচিত।
           </p>
         </motion.div>
      </div>
    </div>
  );
}
