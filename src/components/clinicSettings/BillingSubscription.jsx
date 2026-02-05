import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CreditCard,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Loader2,
  Zap,
  RefreshCw,
} from "lucide-react";

/* ----------------------------- CONFIG ----------------------------- */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const getAuthToken = () => {
  // ✅ primary key
  const t = localStorage.getItem("authToken");
  if (t && t !== "null" && t !== "undefined") return t.replace(/['"]+/g, "").trim();

  // legacy fallback (optional)
  const legacy = localStorage.getItem("token");
  if (legacy && legacy !== "null" && legacy !== "undefined") {
    const clean = legacy.replace(/['"]+/g, "").trim();
    // migrate
    localStorage.setItem("authToken", clean);
    localStorage.removeItem("token");
    return clean;
  }

  return null;
};

/* ----------------------------- API CLIENT ----------------------------- */
const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ----------------------------- HELPERS ----------------------------- */
const safeDateStr = (d) => {
  const x = d ? new Date(d) : null;
  if (!x || Number.isNaN(x.getTime())) return "—";
  return x.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

const formatINR = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
};

const titleCase = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (t) => t.toUpperCase());

/* ----------------------------- COMPONENT ----------------------------- */
const BillingSubscription = () => {
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState(null);
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access denied. No valid token provided.");
        setTenant(null);
        setStats(null);
        setInvoices([]);
        return;
      }

      // ✅ Update this invoices route if your backend path differs
      const [profileRes, statsRes, invoiceRes] = await Promise.all([
        api.get("/api/tenants/profile", { signal }),
        api.get("/api/tenants/stats", { signal }),
        api.get("/api/payments/invoices?limit=20", { signal }),
      ]);

      setTenant(profileRes.data?.data ?? profileRes.data);
      setStats(statsRes.data?.data ?? statsRes.data);
      setInvoices(invoiceRes.data?.data ?? invoiceRes.data ?? []);
    } catch (err) {
      if (err?.name === "CanceledError") return;

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to sync billing records.";

      console.error("Billing Sync Error:", err);
      setError(msg);

      // if unauthorized -> clear bad token
      if (err?.response?.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const subscription = tenant?.subscription || {};
  const planName = useMemo(() => subscription?.plan || "PRO", [subscription?.plan]);
  const status = useMemo(
    () => String(subscription?.status || "PENDING_VERIFICATION").toUpperCase(),
    [subscription?.status],
  );
  const isActive = status === "ACTIVE";

  // If you store billingCycle in subscription
  const billingCycle = String(subscription?.billingCycle || "yearly").toLowerCase();

  // ✅ If you have Plan prices in DB, ideally fetch from backend.
  // For now keeping UI display simple.
  const displayPrice = useMemo(() => {
    // replace these with DB later if needed
    const priceMap = {
      PRO: { monthly: 499, yearly: 4999 },
      ENTERPRISE: { monthly: 1499, yearly: 14999 },
      PROFESSIONAL: { monthly: 0, yearly: 0 },
    };
    const p = priceMap[planName] || priceMap.PRO;
    return billingCycle === "monthly" ? p.monthly : p.yearly;
  }, [planName, billingCycle]);

  /* ENTITLEMENTS */
  const entitlements = useMemo(() => {
    const PLAN_LIMITS = {
      PRO: { doctors: 3, patients: 500, storageGB: 5 },
      ENTERPRISE: { doctors: 15, patients: 5000, storageGB: 50 },
      PROFESSIONAL: { doctors: -1, patients: -1, storageGB: -1 },
    };

    const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.PRO;

    return [
      {
        label: "Medical Faculty Slots",
        current: Number(stats?.totalDoctors || 0),
        total: limits.doctors,
      },
      {
        label: "Registered Patients",
        current: Number(stats?.totalPatients || 0),
        total: limits.patients,
      },
      {
        label: "Cloud Storage (MB)",
        current: Number(stats?.storageUsed || 0),
        total: limits.storageGB === -1 ? -1 : Number(limits.storageGB) * 1024,
      },
    ];
  }, [planName, stats]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[10px] uppercase tracking-[0.2em] text-gray-400">
        <Loader2 size={18} className="animate-spin mr-3" /> Synchronizing Ledger...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* ERROR BAR */}
      {error && (
        <div className="border border-red-100 bg-red-50 p-4 text-red-700 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest font-bold">{error}</span>
          <button
            className="ml-auto inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold underline"
            onClick={() => {
              const controller = new AbortController();
              fetchData(controller.signal);
            }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* 1) PLAN OVERVIEW */}
      <section className="bg-black text-white p-10 relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-14">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 mb-2">
                Current Tier
              </p>
              <h3 className="text-4xl font-serif italic tracking-tighter">
                {planName}
              </h3>
              <div className="flex items-center gap-3 mt-4">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? "bg-green-500" : "bg-amber-500 animate-pulse"
                  }`}
                />
                <p className="text-[10px] uppercase tracking-widest text-gray-400">
                  System Status: {titleCase(status.replace(/_/g, " "))}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-light tracking-tighter">
                {formatINR(displayPrice)}
              </p>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">
                Per {billingCycle === "monthly" ? "Month" : "Year"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-8">
            <Meta label="Member Since" value={safeDateStr(tenant?.createdAt)} />
            <Meta
              label="Billing Cycle"
              value={billingCycle === "monthly" ? "Monthly" : "Yearly"}
            />
            <Meta
              label="Next Billing"
              value={isActive ? "Auto-renew enabled" : "Awaiting verification"}
            />
          </div>

          <button
            type="button"
            className="group flex items-center gap-3 bg-white text-black px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
            onClick={() => console.log("Open subscription change modal")}
          >
            Modify Subscription{" "}
            <ArrowUpRight
              size={14}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
          </button>
        </div>
        <Zap className="absolute -right-12 -bottom-12 text-white/5 w-80 h-80 rotate-12" />
      </section>

      {/* 2) USAGE */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 border border-gray-100 bg-white p-8">
          <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 mb-8">
            <ShieldCheck size={16} className="text-gray-400" /> Resource Consumption
          </h4>
          <div className="space-y-8">
            {entitlements.map((m) => (
              <UsageMetric key={m.label} {...m} isActive={isActive} />
            ))}
          </div>
        </div>

        <div className="border border-gray-100 bg-gray-50/50 p-8 flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 mb-6">
              <CreditCard size={16} className="text-gray-400" /> Billing Contact
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed mb-1">
              Official Correspondent:
            </p>
            <p className="text-sm font-medium">{tenant?.name || "—"}</p>
            <p className="text-xs text-gray-400 mt-4 italic">
              {tenant?.address || "No address on file"}
            </p>
          </div>

          <div className="pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              className="text-[10px] uppercase tracking-widest font-bold text-black border-b border-black pb-1"
              onClick={() => console.log("Edit billing details")}
            >
              Edit Billing Details
            </button>
          </div>
        </div>
      </section>

      {/* 3) TRANSACTION HISTORY */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3">
            <Clock size={16} className="text-gray-400" /> Transaction Ledger
          </h4>
        </div>

        <div className="border border-gray-100 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100 bg-gray-50/50">
                <th className="p-4 text-[9px] uppercase tracking-[0.2em] text-gray-400">
                  Invoice
                </th>
                <th className="p-4 text-[9px] uppercase tracking-[0.2em] text-gray-400">
                  Date
                </th>
                <th className="p-4 text-[9px] uppercase tracking-[0.2em] text-gray-400">
                  Amount
                </th>
                <th className="p-4 text-right text-[9px] uppercase tracking-[0.2em] text-gray-400">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {invoices?.length ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="text-xs hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono text-gray-500">{inv.id}</td>
                    <td className="p-4">{safeDateStr(inv.date)}</td>
                    <td className="p-4 font-semibold">{formatINR(inv.amount)}</td>
                    <td className="p-4 text-right">
                      <span
                        className={`text-[8px] uppercase tracking-widest px-2 py-1 font-bold border ${
                          String(inv.status).toUpperCase() === "COMPLETED"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {String(inv.status).toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-[10px] uppercase tracking-widest text-gray-300 font-bold">
                    No invoices yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

/* --- SUBCOMPONENTS --- */
const Meta = ({ label, value }) => (
  <div>
    <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">{label}</p>
    <p className="text-xs font-medium uppercase">{value || "—"}</p>
  </div>
);

const UsageMetric = ({ label, current, total, isActive }) => {
  const isUnlimited = total === -1;

  let percentage = 0;
  if (isUnlimited) percentage = 100;
  else if (isActive && total > 0) percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] uppercase tracking-[0.1em]">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold">
          {isActive ? (isUnlimited ? "Unlimited" : `${current} / ${total}`) : "Locked"}
        </span>
      </div>
      <div className="h-[2px] w-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-black transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default BillingSubscription;
