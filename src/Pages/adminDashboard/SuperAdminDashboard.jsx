import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, DollarSign, Users, Activity, TrendingUp, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const revenueData = [
    { month: "Jan", amount: 4500 }, { month: "Feb", amount: 5200 }, { month: "Mar", amount: 4800 },
    { month: "Apr", amount: 6100 }, { month: "May", amount: 5900 }, { month: "Jun", amount: 7200 },
  ];

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Building2 />} label="Total Clinics" value="128" trend="+4.2%" />
        <StatCard icon={<DollarSign />} label="Annual Revenue" value="$842.5k" trend="+12.1%" />
        <StatCard icon={<Users />} label="Total Patients" value="42,890" trend="+8.4%" />
        <StatCard icon={<Activity />} label="System Uptime" value="99.98%" trend="Stable" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 border border-[#2D302D]/5 rounded-sm shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold">Revenue Growth</h3>
            <TrendingUp size={16} className="text-[#8DAA9D]" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: '#f5f5f5'}} />
                <Bar dataKey="amount" fill="#8DAA9D" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#2D302D] p-8 text-[#FAF9F6] rounded-sm flex flex-col justify-between">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 mb-8">Recent Onboarding</h3>
          <div className="space-y-6 mb-8">
            <RecentEntry name="Skyline Dental" sub="NY, USA" time="2h ago" />
            <RecentEntry name="Nova Heart" sub="London, UK" time="5h ago" />
            <RecentEntry name="Zenith Well" sub="Dubai, UAE" time="2d ago" />
          </div>
          <button onClick={() => navigate("/admin/tenants")} className="group w-full py-4 border border-[#FAF9F6]/10 text-[9px] uppercase tracking-widest hover:bg-[#FAF9F6] hover:text-[#2D302D] transition-all flex items-center justify-center gap-2">
            Explore All Tenants <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-white p-8 border border-[#2D302D]/5 rounded-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-[#8DAA9D]/10 text-[#8DAA9D] rounded-sm">{icon}</div>
      <span className="text-[10px] font-bold text-green-500">{trend}</span>
    </div>
    <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-1">{label}</p>
    <p className="text-2xl font-light tracking-tighter">{value}</p>
  </div>
);

const RecentEntry = ({ name, sub, time }) => (
  <div className="flex justify-between items-center group cursor-pointer">
    <div>
      <p className="text-xs font-bold uppercase tracking-tight group-hover:text-[#8DAA9D] transition-colors">{name}</p>
      <p className="text-[9px] opacity-40 uppercase tracking-widest">{sub}</p>
    </div>
    <span className="text-[9px] opacity-40 font-mono">{time}</span>
  </div>
);

export default SuperAdminDashboard;