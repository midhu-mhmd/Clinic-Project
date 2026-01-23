import React from "react";
import { Check, Zap } from "lucide-react";

const Subscriptions = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {["Standard", "Professional", "Institutional"].map((tier, i) => (
      <div key={tier} className={`p-10 border border-[#2D302D]/5 rounded-sm relative overflow-hidden transition-all hover:-translate-y-1 ${i === 1 ? 'bg-white shadow-xl ring-1 ring-[#8DAA9D]/20' : 'bg-white/50'}`}>
        {i === 1 && <div className="absolute top-0 left-0 w-full h-1 bg-[#8DAA9D]" />}
        <Zap size={24} className={`mb-8 ${i === 1 ? 'text-[#8DAA9D]' : 'opacity-20'}`} />
        <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30 mb-2">Protocol</h3>
        <h4 className="text-4xl font-light tracking-tighter mb-10">{tier}</h4>
        
        <ul className="space-y-4 mb-12">
          {["Global Server Access", "Priority Handshake", "Neural API", "24/7 Oversight"].map(f => (
            <li key={f} className="flex items-center gap-3 text-[11px] uppercase tracking-wider font-medium opacity-60">
              <Check size={14} className="text-[#8DAA9D]" /> {f}
            </li>
          ))}
        </ul>

        <div className="pt-8 border-t border-[#2D302D]/5 flex justify-between items-end">
          <div>
            <p className="text-[9px] uppercase font-bold opacity-30">Monthly</p>
            <p className="text-3xl font-light tracking-tighter">${i * 299 + 199}</p>
          </div>
          <button className="px-6 py-2 border border-[#2D302D] text-[9px] uppercase font-bold hover:bg-[#2D302D] hover:text-white transition-all">Select</button>
        </div>
      </div>
    ))}
  </div>
);

export default Subscriptions;