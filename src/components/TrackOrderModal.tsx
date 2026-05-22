import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Package, MapPin, Printer, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const bengaliToEnglishDigits = (str: string) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (w) => String(bengaliDigits.indexOf(w)));
};

export default function TrackOrderModal({ isOpen, onClose }: TrackOrderModalProps) {
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<null | any[]>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [catalogData, setCatalogData] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      fetch("/data/catalog.json")
        .then(res => res.json())
        .then(data => {
          if (data && data.catalog) setCatalogData(data.catalog);
        })
        .catch(err => console.error("Failed to load catalog:", err));
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!orderId.trim()) return;
    
    let query = bengaliToEnglishDigits(orderId.trim());
    if (query.startsWith("+88")) query = query.slice(3);
    if (query.startsWith("88")) query = query.slice(2);
    if (query.startsWith("0") && query.length === 11) {
      query = query.slice(1);
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    setExpandedIndex(0);

    try {
      const apiUrl = (import.meta as any).env.VITE_SHEET_API_URL;
      const res = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({ action: "track", query: query })
      });
      const data = await res.json();

      if (data.success && data.orders && data.orders.length > 0) {
        setResult(data.orders);
      } else {
        setError("কোনো অর্ডার পাওয়া যায়নি। সঠিক ফোন নম্বর বা অর্ডার আইডি দিন।");
      }
    } catch (err) {
      setError("সার্ভারে সমস্যা হচ্ছে। দয়া করে একটু পর আবার চেষ্টা করুন।");
    }
    setIsLoading(false);
  };

  const parseProducts = (order: any) => {
    const productLines = (order.products || "").split('|').map((l: string) => l.trim()).filter(Boolean);
    const imageLines = (order.images || "").split('|').map((l: string) => l.trim()).filter(Boolean);

    return productLines.map((line: string, idx: number) => {
      let name = line;
      let qty = 1;
      const qtyMatch = line.match(/x(\d+)$/);
      if (qtyMatch) {
        qty = parseInt(qtyMatch[1], 10);
        name = line.replace(/x\d+$/, '').trim();
      }

      let prodId = "";
      const idMatch = name.match(/\[ID:([^\]]+)\]/);
      if (idMatch) {
        prodId = idMatch[1];
        name = name.replace(/\[ID:[^\]]+\]/, '').trim();
      }

      const found = catalogData.find(p => p.id === prodId);
      let price = found ? (found.Price || found.Regular_price || 0) : 0;
      let image = imageLines[idx] || (found ? found.Image_Link : "/images/placeholder.png");

      return {
        id: prodId,
        name,
        quantity: qty,
        price,
        totalPrice: price * qty,
        image
      };
    });
  };

  const handlePrint = (order: any) => {
    const items = parseProducts(order);
    const siteName = (import.meta as any).env.VITE_SITE_NAME || (import.meta as any).env.VITE_WEBSITE_NAME || "শুকরিয়া শপ";
    
    const itemRows = items.map((item, idx) => `<tr>
      <td style="text-align:center;border:1px solid #eee;padding:12px;">${idx + 1}</td>
      <td style="border:1px solid #eee;padding:12px;">
        <div style="font-weight:bold;font-size:15px;">${item.name}</div>
        ${item.id ? `<div style="font-size:12px;color:#666;margin-top:4px;">Product ID: ${item.id}</div>` : ''}
      </td>
      <td style="text-align:center;border:1px solid #eee;padding:12px;">৳${item.price}</td>
      <td style="text-align:center;border:1px solid #eee;padding:12px;">${item.quantity}</td>
      <td style="text-align:right;border:1px solid #eee;padding:12px;font-weight:bold;">৳${item.totalPrice > 0 ? item.totalPrice : '-'}</td>
    </tr>`).join('');

    let htmlContent = `<html><head><title>Invoice - ${order.orderId}</title><style>body{font-family:sans-serif;padding:40px;color:#222;}.container{max-width:800px;margin:auto;border:1px solid #eee;padding:40px;border-radius:12px;}.header{display:flex;justify-content:space-between;border-bottom:4px solid #00f2ff;padding-bottom:20px;margin-bottom:30px;}.brand{font-size:36px;font-weight:900;}.brand span{color:#00f2ff;}table{width:100%;border-collapse:collapse;margin:30px 0;}th,td{padding:12px;border:1px solid #eee;text-align:left;}th{background:#f8fafc;}.summary{text-align:right;}.total{background:#00f2ff;color:#000;padding:15px;margin-top:10px;border-radius:8px;display:inline-block;min-width:200px;}</style></head><body><div class="container"><div class="header"><div class="brand">${siteName}</div><div style="text-align:right"><h1>INVOICE</h1><p>Order ID: ${order.orderId}</p></div></div><div style="display:flex;justify-content:space-between;margin-bottom:30px;"><div><h3>Customer Details</h3><p><strong>Name:</strong> ${order.name || 'সম্মানিত গ্রাহক'}</p><p><strong>Phone:</strong> ${order.phone}</p><p><strong>Address:</strong> ${order.address || 'ঠিকানা দেওয়া হয়নি'}</p></div><div style="text-align:right"><h3>Order Info</h3><p><strong>Date:</strong> ${order.timestamp ? order.timestamp : '-'}</p><p><strong>Status:</strong> ${order.status}</p></div></div><table><thead><tr><th style="text-align:center;width:50px;">#</th><th>Product Details</th><th style="text-align:center;width:100px;">Unit Price</th><th style="text-align:center;width:80px;">Qty</th><th style="text-align:right;width:120px;">Total</th></tr></thead><tbody>${itemRows}</tbody></table><div class="summary"><p>Delivery Charge: ৳${order.deliveryCharge || '70'}</p><div class="total"><h3 style="margin:0;">Grand Total: ৳${order.total}</h3></div></div><div style="margin-top:50px;text-align:center;font-size:12px;color:#888;"><p>Thank you for shopping with ${siteName}!</p></div></div><script>window.print();</script></body></html>`;
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(htmlContent);
    printWindow?.document.close();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#0B1220] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full z-10">
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold font-display mb-6 shrink-0">আপনার অর্ডার খুঁজুন</h2>
          
          <div className="space-y-4 shrink-0 mb-4">
            <div className="relative">
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="আপনার ১১-ডিজিটের ফোন নম্বর বা অর্ডার আইডি দিন"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-12 outline-none focus:border-neon-blue transition-colors text-sm sm:text-base font-bold"
              />
              <button 
                onClick={handleSearch}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-neon-blue text-white rounded-lg disabled:opacity-50 hover:bg-neon-blue/80 transition-colors"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin text-black" /> : <Search size={18} className="text-black font-black" />}
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm font-bold"
              >
                <AlertCircle size={18} /> {error}
              </motion.div>
            )}
          </div>

          {result && result.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
              <div className="px-2 py-1 bg-neon-blue/10 border border-neon-blue/20 rounded-xl mb-4 text-center">
                <p className="text-xs sm:text-sm font-bold text-neon-blue">
                  মোট <span className="font-black text-base">{result.length}</span> টি অর্ডার পাওয়া গেছে
                </p>
              </div>

              {result.map((order, i) => {
                const isExpanded = expandedIndex === i;
                const items = parseProducts(order);

                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 sm:p-6 bg-white/5 rounded-2xl border border-neon-blue/20 space-y-4 transition-all hover:border-neon-blue/40"
                  >
                    <div 
                      onClick={() => setExpandedIndex(isExpanded ? -1 : i)}
                      className="cursor-pointer select-none"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[10px] text-neon-blue font-black uppercase tracking-widest">অর্ডার আইডি</p>
                          <p className="font-bold text-base sm:text-lg">{order.orderId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white border border-white/10">
                            {order.status}
                          </span>
                          <div className="p-1 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue shrink-0">
                          <Package size={18} />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">কাস্টমার</div>
                          <div className="font-bold text-xs sm:text-sm">{order.name || "গ্রাহক"} ({order.phone})</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple shrink-0">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">ঠিকানা</div>
                          <div className="font-bold text-xs sm:text-sm line-clamp-2">{order.address || "ঠিকানা দেওয়া হয়নি"}</div>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden border-t border-white/10 pt-4 mt-2 space-y-3"
                        >
                          <p className="text-[11px] font-bold text-neon-blue uppercase tracking-widest mb-2">অর্ডারকৃত আইটেমসমূহ:</p>
                          {items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                onError={(e) => { (e.target as any).src = "/images/placeholder.png"; }}
                                className="w-12 h-12 rounded-lg object-cover bg-black/40 border border-white/10 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs sm:text-sm truncate">{item.name}</p>
                                {item.id && <p className="text-[10px] text-muted-foreground">ID: {item.id}</p>}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-bold text-neon-blue">৳{item.price}</span>
                                  <span className="text-[10px] text-muted-foreground font-bold">x{item.quantity}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] text-muted-foreground">মোট</p>
                                <p className="font-black text-xs sm:text-sm text-neon-blue">৳{item.totalPrice > 0 ? item.totalPrice : '-'}</p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">মোট বিল (ডেলিভারি সহ)</p>
                        <p className="font-black text-base sm:text-lg text-neon-blue">৳{order.total}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePrint(order); }}
                        className="bg-white text-black px-4 py-2.5 rounded-xl text-xs font-black hover:bg-neon-blue hover:text-white transition-all flex items-center gap-2 shadow-lg hover:shadow-neon-blue/20"
                      >
                        <Printer size={14} /> ইনভয়েস প্রিন্ট
                      </button>
                    </div>

                    <div className="pt-2 text-center">
                      <p className="text-[10px] text-white/30 font-bold">অর্ডারের তারিখ: {order.timestamp}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="text-center pt-4 shrink-0 border-t border-white/5 mt-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
              অর্ডার সংক্রান্ত যেকোনো প্রয়োজনে কল করুন: <br/>
              <span className="text-neon-blue font-black text-xs">{(import.meta as any).env.VITE_HELPLINE_PHONE || "01983914915"}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

