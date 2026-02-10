import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  CreditCard,
  ArrowRight
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const PLAN_CATALOG = {
  PRO: { name: "Standard", price: { monthly: 1999, yearly: 19990 } },
  ENTERPRISE: { name: "Institutional", price: { monthly: 4999, yearly: 49990 } },
  PROFESSIONAL: { name: "Professional", price: { monthly: 7999, yearly: 79990 } },
};

const Subscriptions = () => {
  const [billing, setBilling] = useState("monthly");
  const [clinicPage, setClinicPage] = useState(1);
  const [clinicLimit] = useState(12);
  const [clinicSearch, setClinicSearch] = useState("");
  const [clinics, setClinics] = useState([]);
  const [clinicsMeta, setClinicsMeta] = useState({ total: 0, totalPages: 1 });
  const [clinicsLoading, setClinicsLoading] = useState(false);
  const [clinicsError, setClinicsError] = useState("");

  const formatINR = useMemo(() => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  }, []);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, []);

  const getPlanDisplay = useCallback((backendPlanRaw) => {
    const backend = String(backendPlanRaw || "PRO").toUpperCase();
    const plan = PLAN_CATALOG[backend] || PLAN_CATALOG.PRO;
    return {
      backend,
      name: plan.name,
      price: Number(plan.price[billing] ?? 0),
    };
  }, [billing]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchClinics = async () => {
      try {
        setClinicsLoading(true);
        const res = await api.get("/tenants/all", {
          signal: controller.signal,
          params: {
            page: clinicPage,
            limit: clinicLimit,
            search: clinicSearch.trim() || undefined,
          },
        });
        setClinics(res.data?.data || []);
        setClinicsMeta({
          total: Number(res.data?.meta?.total || 0),
          totalPages: Number(res.data?.meta?.totalPages || 1),
        });
      } catch (err) {
        if (err?.name === "CanceledError") return;
        setClinicsError(err?.response?.data?.message || "Connection failed.");
      } finally {
        setClinicsLoading(false);
      }
    };
    fetchClinics();
    return () => controller.abort();
  }, [api, clinicPage, clinicLimit, clinicSearch]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-zinc-900 selection:text-white">
      {/* SECTION 02: UTILITY BAR */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative group w-full md:w-96">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
          <input
            value={clinicSearch}
            onChange={(e) => { setClinicPage(1); setClinicSearch(e.target.value); }}
            placeholder="Filter by institution or ID..."
            className="w-full bg-transparent border-none py-2 pl-7 text-sm outline-none placeholder:text-zinc-300"
          />
        </div>
      </div>

      {/* SECTION 03: THE GRID */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-12 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-t-sm text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <div className="col-span-5">Clinical Entity</div>
          <div className="col-span-2">Tier</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Revenue ({billing})</div>
        </div>

        <div className="border-x border-b border-zinc-100 divide-y divide-zinc-50 bg-white">
          <AnimatePresence mode="wait">
            {clinicsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 size={20} className="animate-spin text-zinc-200" />
                <span className="text-[10px] uppercase tracking-widest text-zinc-400">Fetching Records</span>
              </div>
            ) : clinics.length === 0 ? (
              <div className="py-20 text-center text-xs text-zinc-400 italic">No entities match your current filter.</div>
            ) : (
              clinics.map((c, idx) => (
                <ClinicRow 
                  key={c._id} 
                  clinic={c} 
                  idx={idx} 
                  getPlanDisplay={getPlanDisplay} 
                  formatINR={formatINR} 
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 04: PAGINATION */}
        {!clinicsLoading && (
          <footer className="py-10 flex items-center justify-between">
            <button
              className="p-2 border border-zinc-100 rounded-md hover:border-zinc-900 transition-colors disabled:opacity-20"
              onClick={() => setClinicPage((p) => Math.max(1, p - 1))}
              disabled={clinicPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
              {clinicPage} <span className="mx-2 opacity-20">/</span> {clinicsMeta.totalPages}
            </span>
            <button
              className="p-2 border border-zinc-100 rounded-md hover:border-zinc-900 transition-colors disabled:opacity-20"
              onClick={() => setClinicPage((p) => Math.min(clinicsMeta.totalPages, p + 1))}
              disabled={clinicPage >= clinicsMeta.totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </footer>
        )}
      </main>
    </div>
  );
};

const ClinicRow = ({ clinic, idx, getPlanDisplay, formatINR }) => {
  const planRaw = clinic.subscription?.plan || clinic.tier || "PRO";
  const statusRaw = clinic.subscription?.status || clinic.subscriptionStatus || "PENDING";
  const { name, price, backend } = getPlanDisplay(planRaw);
  const status = String(statusRaw).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
      className="grid grid-cols-12 items-center py-5 px-4 hover:bg-zinc-50 transition-colors group cursor-pointer"
    >
      <div className="col-span-5 flex items-center gap-4">
        <div className="w-8 h-8 rounded bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-white transition-colors border border-zinc-200/50">
          <Building2 size={14} />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-zinc-900">{clinic.name}</h3>
          <div className="flex items-center gap-1.5 text-zinc-400 mt-0.5">
            <MapPin size={10} />
            <span className="text-[10px] truncate max-w-[200px]">{clinic.location || "Undisclosed"}</span>
          </div>
        </div>
      </div>

      <div className="col-span-2">
        <span className="text-[10px] font-mono font-bold text-zinc-400 px-2 py-0.5 border border-zinc-100 rounded-sm">
          {backend}
        </span>
      </div>

      <div className="col-span-2 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${status === "ACTIVE" ? "bg-emerald-500" : "bg-orange-400 animate-pulse"}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{status}</span>
      </div>

      <div className="col-span-3 text-right group-hover:translate-x-[-4px] transition-transform">
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-sm font-medium text-zinc-900">{formatINR.format(price)}</span>
          <ArrowRight size={12} className="text-zinc-200 group-hover:text-zinc-900 transition-colors" />
        </div>
        <p className="text-[9px] text-zinc-400 uppercase tracking-tighter mt-0.5">{name} Rate</p>
      </div>
    </motion.div>
  );
};

export default Subscriptions;