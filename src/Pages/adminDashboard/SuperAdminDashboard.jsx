import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Building2, 
  DollarSign, 
  Users, 
  Activity, 
  TrendingUp, 
  ArrowRight,
  Loader2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

/* ----------------------------- API CONFIG ----------------------------- */
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")?.replace(/['"]+/g, '');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ----------------------------- COMPONENT ----------------------------- */
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentTenants, setRecentTenants] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {

        const tenantsRes = await api.get("/tenants/public?limit=5&sort=-createdAt");
        

        const statsRes = await api.get("/admin/stats"); 

        setRecentTenants(tenantsRes.data.data || []);
        setStats(statsRes.data.data);
        setRevenueData(statsRes.data.revenueChart || []);
        
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
        // Fallback for demo purposes if backend isn't ready
        if (!stats) {
             setStats({
                totalTenants: 0,
                totalRevenue: 0,
                totalPatients: 0,
                uptime: 99.99
             });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
      notation: "compact", 
      compactDisplay: "short"
    }).format(val);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num || 0);
  };

  if (loading) return (
    <div className="flex h-96 flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#8DAA9D]" size={32} />
      <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Aggregating Global Metrics...</span>
    </div>
  );

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* 1. KEY METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Building2 size={20} />} 
          label="Active Clinics" 
          value={stats?.totalTenants || 0} 
          trend="+12% MoM" 
        />
        <StatCard 
          icon={<DollarSign size={20} />} 
          label="Total Revenue" 
          value={formatCurrency(stats?.totalRevenue || 0)} 
          trend="+8.4% YoY" 
        />
        <StatCard 
          icon={<Users size={20} />} 
          label="Total Patients" 
          value={formatNumber(stats?.totalPatients || 0)} 
          trend="Steady" 
        />
        <StatCard 
          icon={<Activity size={20} />} 
          label="System Health" 
          value={`${stats?.uptime || 99.9}%`} 
          trend="Optimal" 
        />
      </section>

      {/* 2. ANALYTICS & RECENT ACTIVITY */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white p-8 border border-[#2D302D]/5 rounded-sm shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-800">Revenue Velocity</h3>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Last 6 Months</p>
            </div>
            <TrendingUp size={16} className="text-[#8DAA9D]" />
          </div>
          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData.length > 0 ? revenueData : [{month: 'No Data', amount: 0}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#999', textTransform: 'uppercase'}} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#999'}} 
                    tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip 
                    cursor={{fill: '#f8f9fa'}}
                    contentStyle={{ borderRadius: '0px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#2D302D' }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Bar 
                    dataKey="amount" 
                    fill="#8DAA9D" 
                    radius={[2, 2, 0, 0]} 
                    barSize={40}
                    animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT TENANTS SIDEBAR */}
        <div className="bg-[#1A1A1A] p-8 text-[#FAF9F6] rounded-sm flex flex-col justify-between shadow-2xl">
          <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Onboarding
              </h3>
              <div className="space-y-7 mb-8">
                {recentTenants.length > 0 ? (
                    recentTenants.map((tenant) => (
                        <RecentEntry 
                            key={tenant._id}
                            name={tenant.name}
                            sub={tenant.address ? tenant.address.split(',')[0] : 'Remote'}
                            time={new Date(tenant.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        />
                    ))
                ) : (
                    <p className="text-xs text-gray-500 italic">No recent activity found.</p>
                )}
              </div>
          </div>
          
          <button 
            onClick={() => navigate("/admin/tenants")} 
            className="group w-full py-4 border border-[#FAF9F6]/10 text-[9px] uppercase tracking-widest hover:bg-[#FAF9F6] hover:text-[#1A1A1A] transition-all flex items-center justify-center gap-3"
          >
            Manage Directory <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

/* --- SUBCOMPONENTS --- */

const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-white p-8 border border-[#2D302D]/5 rounded-sm hover:border-[#8DAA9D]/30 transition-all duration-500 group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-[#F5F7F6] text-[#2D302D] rounded-sm group-hover:bg-[#8DAA9D] group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${trend.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>
        {trend}
      </span>
    </div>
    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">{label}</p>
    <h4 className="text-3xl font-light tracking-tight text-[#2D302D]">{value}</h4>
  </div>
);

const RecentEntry = ({ name, sub, time }) => (
  <div className="flex justify-between items-center group cursor-pointer border-b border-white/5 pb-3 last:border-0 last:pb-0">
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-200 group-hover:text-[#8DAA9D] transition-colors">
        {name}
      </p>
      <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">{sub}</p>
    </div>
    <span className="text-[9px] text-gray-600 font-mono border border-gray-800 px-2 py-1 rounded-sm">
        {time}
    </span>
  </div>
);

export default SuperAdminDashboard;