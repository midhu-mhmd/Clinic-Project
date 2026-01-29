import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Hexagon, ArrowRight, ShieldCheck, Activity, Loader2 } from "lucide-react";

const PLANS = [
  {
    id: "plan_standard", // ID matches backend key
    name: "Standard",
    price: { monthly: 199, yearly: 1990 },
    tagline: "Basic Neural Link",
    features: ["Global Server Access", "Standard Handshake", "10k Requests/mo", "Community Support"],
    highlight: false
  },
  {
    id: "plan_professional",
    name: "Professional",
    price: { monthly: 499, yearly: 4990 },
    tagline: "Full Architecture",
    features: ["Priority Neural API", "Unlimited Handshakes", "Real-time Encryption", "24/7 Oversight Node"],
    highlight: true 
  },
  {
    id: "plan_institutional",
    name: "Institutional",
    price: { monthly: 999, yearly: 9990 },
    tagline: "Sovereign Control",
    features: ["Dedicated Server Core", "Quantum Encryption", "Unlimited Bandwidth", "On-site Integration"],
    highlight: false
  }
];

const Subscriptions = () => {
  const [billing, setBilling] = useState("monthly");
  const [stats, setStats] = useState({ plan_standard: 0, plan_professional: 0, plan_institutional: 0 });
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH BACKEND DATA ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Replace with your actual endpoint
        // const { data } = await axios.get("http://localhost:5000/api/analytics/plans");
        
        // SIMULATED API RESPONSE (Remove this in production)
        const data = await new Promise(resolve => setTimeout(() => resolve({
          plan_standard: 1240,
          plan_professional: 856,
          plan_institutional: 42
        }), 1500));

        setStats(data);
      } catch (err) {
        console.error("Failed to sync metrics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="w-full bg-[#FBFBF9] text-[#1A1A1A] py-32 px-6 md:px-16 selection:bg-[#8DAA9D] selection:text-white">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[#8DAA9D]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Live Network Metrics</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-light tracking-tighter uppercase leading-[0.9]">
            Select <span className="italic font-serif opacity-50">Protocol.</span>
          </h2>
        </div>

        {/* BILLING TOGGLE */}
        <div className="flex items-center gap-6 bg-white border border-[#1A1A1A]/5 p-2 rounded-full">
          <span className={`text-[10px] uppercase font-bold tracking-widest ${billing === 'monthly' ? 'opacity-100' : 'opacity-30'}`}>Monthly</span>
          <button 
            onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
            className="w-12 h-6 bg-[#1A1A1A]/5 rounded-full relative p-1 transition-colors hover:bg-[#1A1A1A]/10"
          >
            <motion.div 
              layout 
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
              className={`w-4 h-4 rounded-full bg-[#1A1A1A] shadow-lg ${billing === "yearly" ? "ml-auto" : "ml-0"}`}
            />
          </button>
          <span className={`text-[10px] uppercase font-bold tracking-widest ${billing === 'yearly' ? 'opacity-100' : 'opacity-30'}`}>Yearly</span>
        </div>
      </div>

      {/* PRICING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {PLANS.map((tier, i) => (
          <PricingCard 
            key={tier.id} 
            tier={tier} 
            billing={billing} 
            index={i} 
            // Pass the specific count for this plan
            count={stats[tier.id] || 0} 
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

// --- CARD COMPONENT WITH METRICS ---
const PricingCard = ({ tier, billing, index, count, loading }) => {
  const isDark = tier.highlight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className={`
        relative group p-10 flex flex-col justify-between min-h-[600px] border transition-all duration-500
        ${isDark 
          ? 'bg-[#1A1A1A] text-[#FBFBF9] border-[#1A1A1A] shadow-2xl scale-105 z-10' 
          : 'bg-white border-[#1A1A1A]/5 hover:border-[#1A1A1A]/20 hover:shadow-xl z-0'
        }
      `}
    >
      {/* Dark Mode Accent */}
      {isDark && <div className="absolute top-0 left-0 w-full h-1 bg-[#8DAA9D]" />}
      
      <div>
        <div className="flex justify-between items-start mb-8">
          <Zap size={20} className={`${isDark ? 'text-[#8DAA9D]' : 'opacity-20'}`} />
          
          {/* --- NEW: LIVE CUSTOMER COUNT BADGE --- */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${isDark ? 'border-[#8DAA9D]/30 bg-[#8DAA9D]/10 text-[#8DAA9D]' : 'border-[#1A1A1A]/10 bg-[#1A1A1A]/5 text-[#1A1A1A]/60'}`}>
            {loading ? (
               <Loader2 size={10} className="animate-spin" />
            ) : (
               <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            )}
            <span>
                {loading ? "Syncing..." : `${count.toLocaleString()} Nodes Active`}
            </span>
          </div>
        </div>

        <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 mb-2">{tier.tagline}</h3>
        <h4 className="text-4xl font-light tracking-tighter mb-12">{tier.name}</h4>

        {/* Price Section */}
        <div className="mb-12 border-b border-dashed border-current/10 pb-12">
           <div className="flex items-baseline gap-1">
             <span className="text-lg opacity-40">$</span>
             <AnimatePresence mode="wait">
               <motion.span 
                 key={billing}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="text-6xl font-light tracking-tighter"
               >
                 {tier.price[billing]}
               </motion.span>
             </AnimatePresence>
           </div>
           <span className="text-[10px] uppercase font-bold opacity-30 tracking-widest">
             Per {billing === 'monthly' ? 'Month' : 'Year'}
           </span>
        </div>

        <ul className="space-y-5">
          {tier.features.map((feature, j) => (
            <li key={j} className="flex items-center gap-4 text-[11px] uppercase tracking-wider font-medium opacity-60 group-hover:opacity-100 transition-opacity">
              <Check size={14} className={`${isDark ? 'text-[#8DAA9D]' : 'text-[#1A1A1A]'}`} /> 
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button className={`
        w-full py-4 mt-12 flex items-center justify-between px-6 border transition-all duration-300 group-hover:px-8
        ${isDark 
          ? 'bg-[#FBFBF9] text-[#1A1A1A] hover:bg-[#8DAA9D] hover:text-white border-transparent' 
          : 'bg-transparent border-[#1A1A1A]/20 hover:bg-[#1A1A1A] hover:text-white'
        }
      `}>
        <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Initialize</span>
        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};

export default Subscriptions;