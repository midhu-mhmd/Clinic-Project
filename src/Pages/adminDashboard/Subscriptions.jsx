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
  ArrowRight,
  MoreVertical,
  Calendar,
  RefreshCw,
  XCircle,
  Pause,
  Ticket,
  ShieldAlert,
  ChevronDown
} from "lucide-react";

const API_BASE_URL = "https://sovereigns.site/api";

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

  // Action / Modal State
  const [activeModal, setActiveModal] = useState(null); // { type: 'PLAN', clinicId: '...' }
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [overrideDetails, setOverrideDetails] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [newPlan, setNewPlan] = useState("PRO");
  const [newCycle, setNewCycle] = useState("MONTHLY");


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

  const handleClinicAction = useCallback(async (clinicId, type, data = {}) => {
    const clinic = clinics.find(c => c._id === clinicId);
    setSelectedClinic(clinic);

    if (type === 'PAUSE' || type === 'CANCEL_IMMEDIATE' || type === 'CANCEL_PERIOD') {
      // These could be handled directly if simple, or via modal
      if (type === 'PAUSE') {
        try {
          setActionLoading(true);
          await api.patch(`/tenants/subscription/pause/${clinicId}`);
          // Refresh list
          setClinics(prev => prev.map(c => c._id === clinicId ? { ...c, isPaused: !c.isPaused } : c));
        } catch (err) {
          alert(err.response?.data?.message || "Action failed");
        } finally {
          setActionLoading(false);
        }
        return;
      }
    }

    // Open modal for others
    setActiveModal({ type, clinicId });
    if (type === 'PLAN') setNewPlan(clinic.tier || 'PRO');
    if (type === 'CYCLE') setNewCycle(clinic.billingCycle || 'MONTHLY');
  }, [api, clinics]);

  const executeAction = async () => {
    if (!activeModal) return;
    const { type, clinicId } = activeModal;

    try {
      setActionLoading(true);
      let res;
      if (type === 'PLAN') {
        res = await api.patch(`/tenants/subscription/plan/${clinicId}`, { plan: newPlan });
      } else if (type === 'CANCEL') {
        res = await api.patch(`/tenants/subscription/cancel/${clinicId}`, { immediate: data.immediate });
      } else if (type === 'COUPON') {
        res = await api.patch(`/tenants/subscription/coupon/${clinicId}`, { couponCode });
      } else if (type === 'CYCLE') {
        res = await api.patch(`/tenants/subscription/cycle/${clinicId}`, { cycle: newCycle });
      } else if (type === 'OVERRIDE') {
        res = await api.post(`/tenants/subscription/override/${clinicId}`, { details: overrideDetails });
      }

      if (res?.data?.success) {
        // Refresh the whole list for simplicity or update locally
        setClinicPage(p => p); // Trigger useEffect
        setActiveModal(null);
        setOverrideDetails("");
        setCouponCode("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };


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
          <div className="col-span-3">Clinical Entity</div>
          <div className="col-span-1">Plan</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-center">Cycle</div>
          <div className="col-span-2 text-center">Next Renewal</div>
          <div className="col-span-1 text-center">Payment</div>
          <div className="col-span-1 text-right">Amount</div>
          <div className="col-span-1 text-right pr-2">Actions</div>
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
                  onAction={handleClinicAction}
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
        {/* MODALS */}
        <AnimatePresence>
          {activeModal && (
            <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                    {activeModal.type.replace('_', ' ')}: {selectedClinic?.name}
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-zinc-900">
                    <XCircle size={18} />
                  </button>
                </div>

                <div className="p-6">
                  {activeModal.type === 'PLAN' && (
                    <div className="space-y-4">
                      <p className="text-[11px] text-zinc-500">Select the new subscription tier for this entity.</p>
                      <select
                        value={newPlan}
                        onChange={(e) => setNewPlan(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-xs outline-none focus:border-zinc-900 transition-colors"
                      >
                        {Object.keys(PLAN_CATALOG).map(k => (
                          <option key={k} value={k}>{PLAN_CATALOG[k].name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeModal.type === 'CANCEL' && (
                    <div className="space-y-4 text-center">
                      <ShieldAlert size={32} className="mx-auto text-rose-500" />
                      <p className="text-[11px] text-zinc-600">How would you like to handle this cancellation?</p>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => executeAction({ immediate: true })}
                          className="w-full py-2 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-rose-100 transition-colors"
                        >
                          Cancel Immediately
                        </button>
                        <button
                          onClick={() => executeAction({ immediate: false })}
                          className="w-full py-2 border border-zinc-200 text-zinc-600 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-zinc-50 transition-colors"
                        >
                          Cancel at Period End
                        </button>
                      </div>
                    </div>
                  )}

                  {activeModal.type === 'OVERRIDE' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-amber-600">
                        <ShieldAlert size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Restricted Action</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 italic">This change will be logged in the system audit trail. Please provide detailed justification.</p>
                      <textarea
                        value={overrideDetails}
                        onChange={(e) => setOverrideDetails(e.target.value)}
                        placeholder="Log details (e.g., Manual refund issued, temporary extension granted)..."
                        className="w-full h-24 bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-xs outline-none focus:border-zinc-900 transition-colors resize-none"
                      />
                    </div>
                  )}

                  {activeModal.type === 'COUPON' && (
                    <div className="space-y-4">
                      <p className="text-[11px] text-zinc-500">Enter a manual discount or coupon code.</p>
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="SUMMER20, FREEMONTH, etc."
                        className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-xs outline-none focus:border-zinc-900 transition-colors"
                      />
                    </div>
                  )}

                  {activeModal.type === 'CYCLE' && (
                    <div className="space-y-4">
                      <p className="text-[11px] text-zinc-500">Toggle between Monthly and Annual billing cycles.</p>
                      <div className="flex border border-zinc-100 rounded overflow-hidden">
                        {['MONTHLY', 'ANNUAL'].map(c => (
                          <button
                            key={c}
                            onClick={() => setNewCycle(c)}
                            className={`flex-1 py-2 text-[10px] font-bold tracking-widest transition-colors ${newCycle === c ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-400 hover:bg-zinc-50'}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {activeModal.type !== 'CANCEL' && (
                  <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-2 border border-zinc-200 text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-white transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={executeAction}
                      disabled={actionLoading || (activeModal.type === 'OVERRIDE' && !overrideDetails)}
                      className="flex-1 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {actionLoading && <Loader2 size={12} className="animate-spin" />}
                      Finalize Change
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const ClinicRow = ({ clinic, idx, getPlanDisplay, formatINR, onAction }) => {
  const [showActions, setShowActions] = useState(false);
  const planRaw = clinic.tier || "PRO";
  const statusRaw = clinic.subscriptionStatus || "PENDING";
  const { name, price, backend } = getPlanDisplay(planRaw);
  const status = String(statusRaw).toUpperCase();

  const handleAction = (type, data = {}) => {
    setShowActions(false);
    onAction(clinic._id, type, data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
      className="grid grid-cols-12 items-center py-5 px-4 hover:bg-zinc-50 transition-colors group relative"
    >
      {/* Entity */}
      <div className="col-span-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-white transition-colors border border-zinc-200/50">
          <Building2 size={14} />
        </div>
        <div>
          <h3 className="text-[12px] font-semibold text-zinc-900 truncate max-w-[150px]">{clinic.name}</h3>
          <span className="text-[9px] text-zinc-400 font-mono">#{clinic._id.slice(-6).toUpperCase()}</span>
        </div>
      </div>

      {/* Plan */}
      <div className="col-span-1">
        <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-sm">
          {backend}
        </span>
      </div>

      {/* Status */}
      <div className="col-span-2 flex items-center justify-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${status === "ACTIVE" ? "bg-emerald-500" : status === "CANCELED" ? "bg-rose-500" : "bg-zinc-300"}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{status}</span>
      </div>

      {/* Cycle */}
      <div className="col-span-1 text-center">
        <span className="text-[10px] text-zinc-500 font-medium">
          {clinic.billingCycle === "ANNUAL" ? "Annual" : "Monthly"}
        </span>
      </div>

      {/* Next Renewal */}
      <div className="col-span-2 text-center">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-zinc-700 font-medium">
            {clinic.nextRenewalDate ? new Date(clinic.nextRenewalDate).toLocaleDateString() : "Not set"}
          </span>
          {clinic.cancelAtPeriodEnd && (
            <span className="text-[8px] text-rose-500 font-bold uppercase tracking-tighter">Cancels End of Period</span>
          )}
        </div>
      </div>

      {/* Payment */}
      <div className="col-span-1 flex justify-center">
        {clinic.paymentMethodStatus === "ON_FILE" ? (
          <div className="flex items-center gap-1 text-emerald-600">
            <CreditCard size={12} />
            <span className="text-[9px] font-bold">ON FILE</span>
          </div>
        ) : (
          <span className="text-[9px] font-bold text-rose-400">MISSING</span>
        )}
      </div>

      {/* Amount */}
      <div className="col-span-1 text-right">
        <span className="text-[12px] font-semibold text-zinc-900">
          {formatINR.format(clinic.price?.amount || price)}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex justify-end pr-2 relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <MoreVertical size={16} />
        </button>

        {showActions && (
          <div className="absolute right-0 top-10 w-48 bg-white border border-zinc-200 rounded shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <ActionItem icon={<RefreshCw size={12} />} label="Change Plan" onClick={() => handleAction('PLAN')} />
            <ActionItem icon={<Calendar size={12} />} label="Billing Cycle" onClick={() => handleAction('CYCLE')} />
            <ActionItem icon={<Ticket size={12} />} label="Apply Coupon" onClick={() => handleAction('COUPON')} />
            <div className="h-px bg-zinc-100 my-1" />
            <ActionItem icon={<Pause size={12} />} label={clinic.isPaused ? "Resume Sub" : "Pause Sub"} onClick={() => handleAction('PAUSE')} />
            <ActionItem icon={<XCircle size={12} />} label="Cancel Sub" onClick={() => handleAction('CANCEL')} className="text-rose-500" />
            <div className="h-px bg-zinc-100 my-1" />
            <ActionItem icon={<ShieldAlert size={12} />} label="Manual Override" onClick={() => handleAction('OVERRIDE')} className="text-amber-600 bg-amber-50/20" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ActionItem = ({ icon, label, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 text-[11px] font-medium hover:bg-zinc-50 transition-colors text-zinc-600 ${className}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Subscriptions;