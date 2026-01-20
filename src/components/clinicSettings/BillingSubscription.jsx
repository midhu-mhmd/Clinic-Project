import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  CreditCard, ExternalLink, ShieldCheck, 
  Check, ArrowUpRight, Clock, FileText,
  Zap, Loader2
} from "lucide-react";

const BillingSubscription = () => {
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/tenants/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTenant(res.data.data);
      } catch (err) {
        console.error("Subscription fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  if (loading) return (
    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest animate-pulse">
      <Loader2 size={14} className="animate-spin" /> Retrieving Ledger...
    </div>
  );

  const plan = tenant?.subscription?.plan || "STANDARD";

  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
      
      {/* ACTIVE PLAN CARD */}
      <section className="bg-black text-white p-10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-16">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 mb-2">Institutional Tier</p>
              <h3 className="text-3xl font-serif italic tracking-tighter">{plan} EDITION</h3>
            </div>
            <span className="bg-[#8DAA9D]/20 text-[#8DAA9D] text-[9px] px-4 py-1.5 border border-[#8DAA9D]/30 uppercase tracking-[0.2em] font-bold">
              Active Status
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            <div>
              <p className="text-[9px] uppercase text-gray-500 mb-1">Renewal Date</p>
              <p className="text-xs uppercase tracking-widest">Oct 24, 2026</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-gray-500 mb-1">Billing Cycle</p>
              <p className="text-xs uppercase tracking-widest">Annually</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-gray-500 mb-1">Monthly Fee</p>
              <p className="text-xs uppercase tracking-widest">$149.00</p>
            </div>
          </div>

          <button className="bg-white text-black px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gray-100 transition-all flex items-center gap-3">
            Upgrade Plan <ArrowUpRight size={14}/>
          </button>
        </div>
        
        {/* Background Decorative Element */}
        <Zap className="absolute -right-8 -bottom-8 text-white/5 w-64 h-64 rotate-12" />
      </section>

      {/* PLAN USAGE & LIMITS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-gray-100 p-8 space-y-6">
          <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3">
            <ShieldCheck size={16} className="text-gray-400" /> Usage Entitlements
          </h4>
          <div className="space-y-4">
            <UsageMetric label="Medical Faculty Slots" current={8} total={10} />
            <UsageMetric label="Monthly Patient Records" current={450} total={1000} />
            <UsageMetric label="Digital Storage (GB)" current={1.2} total={5} />
          </div>
        </div>

        <div className="border border-gray-100 p-8 flex flex-col justify-between">
          <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 mb-6">
            <CreditCard size={16} className="text-gray-400" /> Payment Source
          </h4>
          <div className="flex items-center justify-between py-4 border-y border-gray-50 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-6 bg-gray-50 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
              <p className="text-xs font-mono tracking-tighter">•••• 4242</p>
            </div>
            <button className="text-[9px] uppercase font-bold tracking-widest text-gray-400 hover:text-black transition-colors">Replace</button>
          </div>
          <p className="text-[9px] text-gray-400 uppercase leading-relaxed tracking-widest">
            Payments are processed securely via Stripe. Your data is encrypted and HIPAA compliant.
          </p>
        </div>
      </section>

      {/* BILLING HISTORY */}
      <section className="pt-8 border-t border-gray-50">
        <div className="flex items-center justify-between mb-8 px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3">
            <Clock size={16} className="text-gray-400" /> Transaction Ledger
          </h4>
          <button className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black">Download All</button>
        </div>

        <div className="bg-white border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-[9px] uppercase tracking-widest font-bold">Date</th>
                <th className="p-4 text-[9px] uppercase tracking-widest font-bold">Invoice ID</th>
                <th className="p-4 text-[9px] uppercase tracking-widest font-bold">Amount</th>
                <th className="p-4 text-[9px] uppercase tracking-widest font-bold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { date: "Oct 24, 2025", id: "INV-9021", amt: "$149.00" },
                { date: "Sep 24, 2025", id: "INV-8842", amt: "$149.00" },
                { date: "Aug 24, 2025", id: "INV-7210", amt: "$149.00" },
              ].map((inv, i) => (
                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                  <td className="p-4 text-xs font-light">{inv.date}</td>
                  <td className="p-4 text-xs font-mono text-gray-400">{inv.id}</td>
                  <td className="p-4 text-xs font-semibold">{inv.amt}</td>
                  <td className="p-4 text-right">
                    <button className="text-gray-300 hover:text-black transition-colors"><FileText size={14} className="ml-auto"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const UsageMetric = ({ label, current, total }) => {
  const percentage = (current / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] uppercase tracking-widest">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold">{current} / {total}</span>
      </div>
      <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-black transition-all duration-1000" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default BillingSubscription;