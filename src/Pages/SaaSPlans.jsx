import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Check, RefreshCw } from "lucide-react";

/**
 * Prefer environment-based base URL:
 * Vite: import.meta.env.VITE_API_BASE_URL
 * Example: VITE_API_BASE_URL=http://localhost:5000
 */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

const SaaSPlans = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlans = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/plans", { signal });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load plans.");
      }

      const list = Array.isArray(data.data) ? data.data : [];
      setPlans(list);
    } catch (err) {
      // If request was aborted, ignore
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

      console.error("Failed to fetch plans:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load plans. Please try again."
      );
    } finally {
      // Small UX delay (optional). Keep short.
      setTimeout(() => setLoading(false), 250);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPlans(controller.signal);
    return () => controller.abort();
  }, [fetchPlans]);

  // Sort once per plan update (fast + predictable)
  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => (a.tierLevel ?? 0) - (b.tierLevel ?? 0));
  }, [plans]);

  const onSelectPlan = useCallback(
    (plan) => {
      // because your backend deletes _id in toJSON transform,
      // prefer 'id' (virtual) and fallback to _id only if present
      const planId = plan.id || plan._id;
      if (!planId) {
        console.warn("Plan missing id/_id:", plan);
        return;
      }

      navigate("/payment", {
        state: {
          planId,
          planName: plan.name,
          price: plan.price?.monthly,
          currency: plan.price?.currency,
        },
      });
    },
    [navigate]
  );

  if (loading) return <PlanLoader />;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          const controller = new AbortController();
          fetchPlans(controller.signal);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1a1a1a] font-sans antialiased py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-16 md:mb-20 text-center md:text-left">
          <h2 className="text-[10px] tracking-[0.5em] text-gray-400 uppercase mb-6">
            Protocol selection / Step 02
          </h2>

          <h1 className="text-[40px] md:text-[56px] leading-[1] font-light tracking-tighter mb-4">
            Scalable infrastructure <br />
            <span className="italic font-serif text-gray-400">
              for modern medicine.
            </span>
          </h1>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {sortedPlans.map((plan) => {
            const key = plan.id || plan._id || `${plan.name}-${plan.tierLevel}`;

            // ✅ Recommended convention:
            // tierLevel 1 = PRO, 2 = ENTERPRISE (Most Popular), 3 = PROFESSIONAL (top tier)
            const isMostPopular = plan.tierLevel === 2;
            const isTopTier = plan.tierLevel === 3;

            const monthly = plan.price?.monthly ?? 0;
            const currency = plan.price?.currency || "USD";

            return (
              <div
                key={key}
                className={`relative flex flex-col p-8 lg:p-12 transition-all duration-500 border ${
                  isMostPopular
                    ? "bg-white border-black shadow-2xl scale-[1.03] z-10"
                    : "bg-white border-gray-100 hover:border-gray-300"
                }`}
              >
                {isMostPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white text-[8px] tracking-[0.3em] uppercase px-4 py-2">
                    Most Popular
                  </div>
                )}

                <div className="mb-10">
                  <h3 className="text-[11px] tracking-[0.4em] uppercase font-bold text-gray-400 mb-8">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-light tracking-tighter">
                      {formatMoney(monthly, currency)}
                    </span>
                    <span className="text-gray-400 text-[10px] uppercase tracking-widest">
                      / month
                    </span>
                  </div>

                  <p className="mt-6 text-gray-500 text-[13px] leading-relaxed min-h-[60px]">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="flex-grow">
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-6 text-gray-300">
                    Included Core
                  </p>

                  <ul className="space-y-5 mb-12">
                    {(plan.features || []).map((feature, idx) => (
                      <li
                        key={`${key}-f-${idx}`}
                        className="flex items-start text-[13px] font-light text-gray-600 group"
                      >
                        <Check
                          size={14}
                          className="mr-3 mt-0.5 text-black opacity-30 group-hover:opacity-100 transition-opacity"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limits + CTA */}
                <div className="mt-auto">
                  <div className="flex flex-wrap gap-2 mb-8">
                    <Pill>
                      {plan.limits?.maxDoctors === -1
                        ? "Unlimited"
                        : plan.limits?.maxDoctors ?? 0}{" "}
                      Doctors
                    </Pill>

                    <Pill>
                      {plan.limits?.maxStorageGB === -1
                        ? "Unlimited"
                        : plan.limits?.maxStorageGB ?? 0}
                      GB Storage
                    </Pill>

                    {/* Optional: show API access */}
                    {plan.limits?.allowAPI && <Pill>API Access</Pill>}
                    {plan.limits?.customBranding && <Pill>Branding</Pill>}
                  </div>

                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`group w-full py-5 text-[10px] tracking-[0.3em] uppercase transition-all duration-300 flex justify-between px-8 items-center border ${
                      isMostPopular
                        ? "bg-black text-white border-black hover:bg-zinc-800"
                        : "bg-transparent text-black border-gray-200 hover:border-black"
                    }`}
                  >
                    <span>{isTopTier ? "Configure" : "Initialize"}</span>
                    <ArrowRight
                      size={14}
                      className="transform group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-20 pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] text-gray-400 tracking-widest uppercase">
            Inquire about custom volume licensing or on-premise deployment.
          </p>
          <button className="text-[11px] font-bold tracking-widest uppercase border-b-2 border-black pb-1 hover:text-gray-400 hover:border-gray-400 transition-all">
            Contact Engineering
          </button>
        </div>
      </div>
    </div>
  );
};

const Pill = ({ children }) => (
  <div className="bg-gray-50 px-3 py-1.5 rounded-full text-[9px] uppercase tracking-tighter text-gray-500 border border-gray-100">
    {children}
  </div>
);

const PlanLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
    <div className="w-12 h-12 border-t-2 border-black rounded-full animate-spin" />
    <p className="text-[10px] uppercase tracking-[0.5em] text-gray-400">
      Synchronizing Tiers
    </p>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center space-y-4">
    <p className="text-sm text-gray-600 max-w-xl">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 hover:border-black transition-all text-xs uppercase tracking-widest"
    >
      <RefreshCw size={14} />
      Retry
    </button>
  </div>
);

function formatMoney(value, currency) {
  const num = Number(value || 0);

  // Basic currency formatting without heavy Intl overhead per render
  // If you want perfect locale formatting, use Intl.NumberFormat with memoization.
  const symbol =
    currency === "INR"
      ? "₹"
      : currency === "EUR"
      ? "€"
      : currency === "GBP"
      ? "£"
      : "$";

  return `${symbol}${num}`;
}

export default SaaSPlans;
