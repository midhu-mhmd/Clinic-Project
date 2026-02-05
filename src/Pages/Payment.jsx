import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, Landmark, Check, Copy, ChevronRight, AlertCircle } from "lucide-react";

/**
 * Prefer environment-based base URL:
 * Vite: VITE_API_BASE_URL=http://localhost:5000
 */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

/* =========================================================
   ✅ Auth helpers (PAYMENT TOKEN FIRST)
========================================================= */
const isValidToken = (t) => {
  if (!t) return false;
  if (t === "undefined" || t === "null") return false;
  if (typeof t !== "string") return false;
  return t.trim().length > 10;
};

const readTokenFromStorage = () => {
  // ✅ IMPORTANT: paymentToken is your flow token after OTP
  const pay = localStorage.getItem("paymentToken");
  if (isValidToken(pay)) return pay;

  // fallback
  const t1 = localStorage.getItem("token");
  if (isValidToken(t1)) return t1;

  const t2 = localStorage.getItem("authToken");
  if (isValidToken(t2)) return t2;

  try {
    const raw = localStorage.getItem("auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const t =
        parsed?.paymentToken ||
        parsed?.token ||
        parsed?.data?.paymentToken ||
        parsed?.data?.token;
      if (isValidToken(t)) return t;
    }
  } catch {}

  return null;
};

const buildAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

/* =========================================================
   Razorpay SDK loader
========================================================= */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/* =========================================================
   Plan code mapping
========================================================= */
const toPlanCode = (raw) => {
  const v = String(raw || "").trim().toUpperCase();
  if (v.includes("ENTER")) return "ENTERPRISE";
  if (v.includes("PROF")) return "PROFESSIONAL";
  return "PRO";
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [manualStep, setManualStep] = useState(1);
  const [transactionRef, setTransactionRef] = useState("");

  // ✅ Token can come from state or localStorage
  const tokenFromState =
    location.state?.paymentToken ||
    location.state?.token ||
    location.state?.data?.paymentToken ||
    location.state?.data?.token;

  const [token, setToken] = useState(() => tokenFromState || readTokenFromStorage());

  useEffect(() => {
    const t = tokenFromState || readTokenFromStorage();
    setToken(t);

    // Keep storage synced for stable navigation
    if (isValidToken(t)) {
      localStorage.setItem("paymentToken", t);
    }
  }, [tokenFromState]);

  // ✅ Plan from state OR fallback to localStorage
  const planNameFromState = location.state?.planName || location.state?.plan;
  const planNameFromStorage = localStorage.getItem("selectedPlan") || "PRO";
  const planName = planNameFromState || planNameFromStorage;

  const planCode = useMemo(() => toPlanCode(planName), [planName]);

  // ✅ price fallback
  const uiPriceFromState = location.state?.price;
  const uiPriceFromStorage = localStorage.getItem("selectedPrice");
  const uiPrice = uiPriceFromState ?? uiPriceFromStorage ?? "—";

  // store plan selection for refresh safety
  useEffect(() => {
    localStorage.setItem("selectedPlan", planCode);
    if (uiPrice !== "—") localStorage.setItem("selectedPrice", String(uiPrice));
  }, [planCode, uiPrice]);

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const ensurePaymentSession = useCallback(() => {
    const resolvedToken = token || readTokenFromStorage();

    if (!isValidToken(resolvedToken)) {
      setPageError("Session missing. Please verify OTP again and select plan.");
      return null;
    }
    return resolvedToken;
  }, [token]);

  /* =========================================================
     ✅ RAZORPAY
  ========================================================= */
  const handleRazorpayPayment = useCallback(async () => {
    setPageError("");

    const resolvedToken = ensurePaymentSession();
    if (!resolvedToken) {
      // go back to plan selection (or OTP page if you want)
      navigate("/plans", { replace: true });
      return;
    }

    const headers = buildAuthHeaders(resolvedToken);

    setLoading(true);
    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setPageError("Razorpay SDK failed to load. Please check internet and try again.");
        return;
      }

      const { data } = await api.post(
        "/api/payments/create-order",
        { planCode, billingCycle: "monthly" },
        { headers }
      );

      if (!data?.success) throw new Error(data?.message || "Order creation failed.");

      const { order, keyId, amountPaise, currency } = data.data;

      const options = {
        key: keyId,
        amount: amountPaise,
        currency: currency || "INR",
        name: "Sovereign Clinic",
        description: `${planCode} Subscription`,
        order_id: order.id,

        handler: async (response) => {
          try {
            setLoading(true);

            const verifyRes = await api.post(
              "/api/payments/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers }
            );

            if (!verifyRes.data?.success) {
              throw new Error(verifyRes.data?.message || "Payment verification failed.");
            }

            // ✅ Payment complete → your flow says LOGIN last
            navigate("/clinic-login", {
              replace: true,
              state: { paymentDone: true, planCode },
            });
          } catch (err) {
            console.error("Verify error:", err);
            setPageError(
              err?.response?.data?.message || err?.message || "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },

        theme: { color: "#1a1a1a" },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment init error:", err);
      setPageError(err?.response?.data?.message || err?.message || "Error initializing payment.");
    } finally {
      setLoading(false);
    }
  }, [ensurePaymentSession, navigate, planCode]);

  /* =========================================================
     ✅ MANUAL
  ========================================================= */
  const handleManualPayment = useCallback(
    async (e) => {
      e.preventDefault();
      setPageError("");

      const resolvedToken = ensurePaymentSession();
      if (!resolvedToken) {
        navigate("/plans", { replace: true });
        return;
      }

      if (!transactionRef.trim()) {
        setPageError("Transaction Reference (UTR) is required.");
        return;
      }

      const headers = buildAuthHeaders(resolvedToken);

      setLoading(true);
      try {
        const { data } = await api.post(
          "/api/payments/manual",
          {
            planCode,
            transactionRef: transactionRef.trim(),
            amountRupees: Number(uiPrice) || 0,
          },
          { headers }
        );

        if (!data?.success) throw new Error(data?.message || "Manual submission failed.");

        navigate("/clinic-login", {
          replace: true,
          state: { manualSubmitted: true, status: "PENDING" },
        });
      } catch (err) {
        console.error("Manual payment error:", err);
        setPageError(err?.response?.data?.message || err?.message || "Manual submission failed.");
      } finally {
        setLoading(false);
      }
    },
    [ensurePaymentSession, navigate, planCode, transactionRef, uiPrice]
  );

  const tabBase =
    "flex-1 py-4 text-[10px] tracking-[0.2em] uppercase font-bold transition-all border-b-2 text-center cursor-pointer select-none";
  const activeTab = "border-black text-black";
  const inactiveTab = "border-transparent text-gray-300 hover:text-gray-500";

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans antialiased text-[#1a1a1a]">
      {/* LEFT */}
      <div className="md:w-5/12 bg-[#F9F9F9] p-12 md:p-24 flex flex-col justify-between border-r border-gray-100">
        <div>
          <h2 className="text-[10px] tracking-[0.5em] text-gray-400 uppercase mb-12">
            Step 03 / Payment
          </h2>

          <h1 className="text-[5vw] md:text-[3.5vw] leading-[1.1] font-light tracking-tighter mb-12">
            Secure your <br />
            <span className="italic font-serif text-gray-400">subscription.</span>
          </h1>

          <div className="space-y-6 pt-12 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-[11px] tracking-widest uppercase text-gray-400 font-medium">
                Selected Plan
              </span>
              <span className="text-sm font-semibold uppercase">{planCode}</span>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-[11px] tracking-widest uppercase text-gray-400 font-medium">
                Monthly Total
              </span>
              <span className="text-4xl font-light tracking-tighter">INR {uiPrice}.00</span>
            </div>

            <p className="text-[10px] tracking-widest uppercase text-gray-400 leading-relaxed">
              Final amount is computed securely from the server plan configuration.
            </p>
          </div>
        </div>

        <div className="mt-12 md:mt-0 text-[9px] tracking-widest uppercase opacity-40">
          {paymentMethod === "razorpay" ? "SSL Encrypted / Razorpay" : "Awaiting Manual Verification"}
        </div>
      </div>

      {/* RIGHT */}
      <div className="md:w-7/12 p-8 md:p-24 overflow-y-auto bg-white flex flex-col justify-center max-w-2xl mx-auto">
        {pageError && (
          <div className="mb-10 p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] uppercase tracking-widest font-bold flex items-center gap-3">
            <AlertCircle size={14} /> {pageError}
          </div>
        )}

        <div className="flex mb-16 border-b border-gray-100">
          <div
            onClick={() => setPaymentMethod("razorpay")}
            className={`${tabBase} ${paymentMethod === "razorpay" ? activeTab : inactiveTab}`}
          >
            Online Payment
          </div>
          <div
            onClick={() => setPaymentMethod("manual")}
            className={`${tabBase} ${paymentMethod === "manual" ? activeTab : inactiveTab}`}
          >
            Manual Transfer
          </div>
        </div>

        {paymentMethod === "razorpay" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-gray-50 p-8 mb-12 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 text-blue-600">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider">Instant Activation</h4>
                  <p className="text-xs text-gray-400 mt-1">UPI, Cards, Netbanking & Wallets</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Subscription activates after payment verification.
              </p>
            </div>

            <button
              onClick={handleRazorpayPayment}
              disabled={loading}
              className="w-full bg-black text-white py-6 text-[10px] tracking-[0.4em] uppercase hover:bg-[#222] transition-all flex justify-between px-10 items-center group shadow-2xl disabled:opacity-50"
            >
              <span>{loading ? "Initializing..." : "Proceed to Pay"}</span>
              <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
            </button>
          </div>
        )}

        {paymentMethod === "manual" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {manualStep === 1 ? (
              <>
                <div className="bg-[#FAF9F6] p-8 mb-8 border border-gray-200/60">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 text-green-700">
                      <Landmark size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider">Direct Bank Transfer</h4>
                      <p className="text-xs text-gray-400 mt-1">Manual Approval (2–4 Hours)</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {[
                      { label: "Account Name", value: "Sovereign Clinics Pvt Ltd" },
                      { label: "Account Number", value: "987654321000" },
                      { label: "IFSC Code", value: "HDFC0001234" },
                      { label: "UPI ID", value: "sovereign@hdfcbank" },
                    ].map((item, idx) => (
                      <div key={idx} className="group relative border-b border-gray-100 pb-2">
                        <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1">
                          {item.label}
                        </label>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm">{item.value}</span>
                          <Copy
                            size={12}
                            className="text-gray-300 cursor-pointer hover:text-black"
                            onClick={() => copyToClipboard(item.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setManualStep(2)}
                  className="w-full border border-black text-black py-5 text-[10px] tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-500"
                >
                  I have sent the funds
                </button>
              </>
            ) : (
              <form onSubmit={handleManualPayment}>
                <div className="mb-8">
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Confirm Transaction</h4>
                  <div className="relative group mb-12">
                    <input
                      type="text"
                      required
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="peer w-full bg-transparent border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-black transition-colors placeholder-transparent font-mono"
                      placeholder="UTR / Transaction ID"
                    />
                    <label className="absolute left-0 top-3 text-gray-400 text-[10px] tracking-[0.2em] uppercase transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4">
                      Transaction Ref ID / UTR
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setManualStep(1)}
                    className="flex-1 border border-gray-200 text-gray-400 py-5 text-[10px] tracking-[0.2em] uppercase hover:text-black transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[1.2] bg-black text-white py-5 text-[10px] tracking-[0.3em] uppercase hover:bg-[#222] transition-all flex justify-center gap-4 items-center disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit for Approval"}
                    <Check size={14} />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <p className="mt-12 text-center text-gray-400 text-[9px] tracking-[0.2em] uppercase leading-loose">
          By proceeding, you agree to our <br />
          <span className="text-black cursor-pointer underline underline-offset-4">Terms of Service</span>
        </p>
      </div>
    </div>
  );
};

export default Payment;
