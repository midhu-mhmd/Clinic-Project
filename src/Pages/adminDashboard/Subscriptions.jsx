import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Activity,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

/**
 * ✅ Backend plans (enum):
 * PRO, ENTERPRISE, PROFESSIONAL
 *
 * ✅ UI prices in INR
 */
const PLAN_CATALOG = {
  PRO: {
    name: "Standard",
    price: { monthly: 199, yearly: 1990 },
  },
  ENTERPRISE: {
    name: "Institutional",
    price: { monthly: 999, yearly: 9990 },
  },
  PROFESSIONAL: {
    name: "Professional",
    price: { monthly: 499, yearly: 4990 },
  },
};

const Subscriptions = () => {
  const [billing, setBilling] = useState("monthly");

  // ✅ clinics list state
  const [clinicPage, setClinicPage] = useState(1);
  const [clinicLimit] = useState(20);
  const [clinicSearch, setClinicSearch] = useState("");
  const [clinics, setClinics] = useState([]);
  const [clinicsMeta, setClinicsMeta] = useState({ total: 0, totalPages: 1 });
  const [clinicsLoading, setClinicsLoading] = useState(false);
  const [clinicsError, setClinicsError] = useState("");

  // ✅ INR formatter (en-IN grouping + ₹)
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

  /**
   * ✅ Helper: get display plan & price from backend plan
   */
  const getPlanDisplay = useCallback(
    (backendPlanRaw) => {
      const backend = String(backendPlanRaw || "PRO").toUpperCase();
      const plan = PLAN_CATALOG[backend] || PLAN_CATALOG.PRO;

      return {
        backend,
        name: plan.name,
        price: Number(plan.price[billing] ?? 0),
      };
    },
    [billing]
  );

  /**
   * ✅ Fetch clinics (paginated)
   * Endpoint: GET /api/tenants/all?page=1&limit=20&search=abc
   */
  useEffect(() => {
    const controller = new AbortController();

    const fetchClinics = async () => {
      try {
        setClinicsLoading(true);
        setClinicsError("");

        const res = await api.get("/tenants/all", {
          signal: controller.signal,
          params: {
            page: clinicPage,
            limit: clinicLimit,
            search: clinicSearch.trim() || undefined,
          },
        });

        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        const meta = res.data?.meta || {};

        setClinics(list);
        setClinicsMeta({
          total: Number(meta.total || 0),
          totalPages: Number(meta.totalPages || 1),
        });
      } catch (err) {
        if (err?.name === "CanceledError") return;

        setClinicsError(
          err?.response?.data?.message || err.message || "Failed to load clinics."
        );
        setClinics([]);
      } finally {
        setClinicsLoading(false);
      }
    };

    fetchClinics();
    return () => controller.abort();
  }, [api, clinicPage, clinicLimit, clinicSearch]);

  return (
    <div className="w-full bg-[#FBFBF9] text-[#1A1A1A] py-24 px-6 md:px-16 selection:bg-[#8DAA9D] selection:text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[#8DAA9D]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
              Clinics • Plans • Pricing
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-light tracking-tighter uppercase leading-[0.95]">
            Clinics{" "}
            <span className="italic font-serif opacity-50">Directory.</span>
          </h2>

          <p className="text-sm opacity-60">
            Total: {clinicsMeta.total.toLocaleString("en-IN")} clinics
          </p>

          {clinicsError && (
            <div className="text-[10px] uppercase tracking-widest font-bold text-red-600">
              {clinicsError}
            </div>
          )}
        </div>

        {/* BILLING TOGGLE */}
        <div className="flex items-center gap-6 bg-white border border-[#1A1A1A]/5 p-2 rounded-full">
          <span
            className={`text-[10px] uppercase font-bold tracking-widest ${
              billing === "monthly" ? "opacity-100" : "opacity-30"
            }`}
          >
            Monthly
          </span>

          <button
            onClick={() =>
              setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))
            }
            className="w-12 h-6 bg-[#1A1A1A]/5 rounded-full relative p-1 transition-colors hover:bg-[#1A1A1A]/10"
            aria-label="Toggle billing"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
              className={`w-4 h-4 rounded-full bg-[#1A1A1A] shadow-lg ${
                billing === "yearly" ? "ml-auto" : "ml-0"
              }`}
            />
          </button>

          <span
            className={`text-[10px] uppercase font-bold tracking-widest ${
              billing === "yearly" ? "opacity-100" : "opacity-30"
            }`}
          >
            Yearly
          </span>
        </div>
      </div>

      {/* SEARCH + TITLE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 flex items-center gap-2">
            <Building2 size={14} className="text-[#8DAA9D]" />
            All Clinics • Plan & Price
          </p>
        </div>

        <div className="relative w-full md:w-[360px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"
            size={16}
          />
          <input
            value={clinicSearch}
            onChange={(e) => {
              setClinicPage(1);
              setClinicSearch(e.target.value);
            }}
            placeholder="Search clinic name / reg id..."
            className="w-full border border-black/10 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-black"
          />
        </div>
      </div>

      {/* CLINICS LIST */}
      <div className="bg-white border border-black/10 rounded-2xl overflow-hidden">
        {clinicsLoading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-sm opacity-60">
            <Loader2 size={18} className="animate-spin" />
            Loading clinics...
          </div>
        ) : clinics.length === 0 ? (
          <div className="p-10 text-center text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">
            No clinics found
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {clinics.map((c) => {
              const planRaw = c.subscription?.plan || c.tier || "PRO";
              const statusRaw =
                c.subscription?.status ||
                c.subscriptionStatus ||
                "PENDING_VERIFICATION";

              const { name, price, backend } = getPlanDisplay(planRaw);
              const status = String(statusRaw).toUpperCase();

              return (
                <div
                  key={c._id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-lg font-medium">{c.name}</p>
                    <p className="text-sm opacity-60">
                      {c.location || c.address || "—"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-black/10 bg-black/5">
                        {backend}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          status === "ACTIVE"
                            ? "border-green-600/20 bg-green-600/10 text-green-700"
                            : "border-orange-600/20 bg-orange-600/10 text-orange-700"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">
                      {name} price ({billing})
                    </p>

                    {/* ✅ INR display */}
                    <p className="text-2xl font-light">
                      {formatINR.format(price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="mt-6 flex items-center justify-between">
        <button
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-60 hover:opacity-100 disabled:opacity-30"
          onClick={() => setClinicPage((p) => Math.max(1, p - 1))}
          disabled={clinicPage === 1 || clinicsLoading}
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <span className="text-[10px] uppercase tracking-[0.35em] font-bold opacity-40">
          Page {clinicPage} / {clinicsMeta.totalPages}
        </span>

        <button
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-60 hover:opacity-100 disabled:opacity-30"
          onClick={() =>
            setClinicPage((p) => Math.min(clinicsMeta.totalPages, p + 1))
          }
          disabled={clinicsLoading || clinicPage >= clinicsMeta.totalPages}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Subscriptions;