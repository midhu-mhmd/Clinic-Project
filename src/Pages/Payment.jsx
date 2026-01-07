import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, Landmark, Check, Copy, ChevronRight } from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State Management
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // 'razorpay' | 'manual'
  const [manualStep, setManualStep] = useState(1); 
  const [transactionRef, setTransactionRef] = useState("");

  // Plan data from previous registration step
  const plan = location.state?.plan || "Professional";
  const price = location.state?.price || "129";
  const userEmail = location.state?.email || "user@example.com";

  // --- 1. RAZORPAY SCRIPT LOADER ---
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // --- 2. HANDLE RAZORPAY PAYMENT ---
  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // Step A: Create Order on Backend
      const { data: order } = await axios.post("http://localhost:5000/api/payments/create-order", {
        amount: price,
        plan: plan,
      });

      // Step B: Configure Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // 🔴 Replace with your actual Key ID from Dashboard
        amount: order.amount,
        currency: order.currency,
        name: "Sovereign Clinic",
        description: `${plan} Plan Subscription`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Step C: Verify Signature on Backend
            setLoading(true);
            await axios.post("http://localhost:5000/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: userEmail,
              plan: plan,
              amount: price
            });

            navigate("/clinic-login", { 
              state: { registered: true, paymentId: response.razorpay_payment_id, method: "razorpay" } 
            });
          } catch (err) {
            alert("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: "Dr. User",
          email: userEmail,
        },
        theme: { color: "#1a1a1a" },
        modal: {
          ondismiss: function() { setLoading(false); }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Error initializing payment. Check console for details.");
      setLoading(false);
    }
  };

  // --- 3. HANDLE MANUAL PAYMENT ---
  const handleManualPayment = async (e) => {
    e.preventDefault();
    if (!transactionRef) return alert("Please enter Transaction Reference ID");
    
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/payments/manual", {
        email: userEmail,
        amount: price,
        plan: plan,
        transactionRef: transactionRef
      });

      navigate("/clinic-login", { 
        state: { registered: true, method: "manual", status: "pending_verification" } 
      });
    } catch (error) {
      alert(error.response?.data?.message || "Manual submission failed");
      setLoading(false);
    }
  };

  // --- UI HELPERS ---
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  const tabBase = "flex-1 py-4 text-[10px] tracking-[0.2em] uppercase font-bold transition-all border-b-2 text-center cursor-pointer select-none";
  const activeTab = "border-black text-black";
  const inactiveTab = "border-transparent text-gray-300 hover:text-gray-500";

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans antialiased text-[#1a1a1a]">
      {/* LEFT SIDE: SUMMARY */}
      <div className="md:w-5/12 bg-[#F9F9F9] p-12 md:p-24 flex flex-col justify-between border-r border-gray-100">
        <div>
          <h2 className="text-[10px] tracking-[0.5em] text-gray-400 uppercase mb-12">Step 03 / Payment</h2>
          <h1 className="text-[5vw] md:text-[3.5vw] leading-[1.1] font-light tracking-tighter mb-12">
            Secure your <br /><span className="italic font-serif text-gray-400">subscription.</span>
          </h1>

          <div className="space-y-6 pt-12 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-[11px] tracking-widest uppercase text-gray-400 font-medium">Selected Plan</span>
              <span className="text-sm font-semibold uppercase">{plan}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[11px] tracking-widest uppercase text-gray-400 font-medium">Monthly Total</span>
              <span className="text-4xl font-light tracking-tighter">INR {price}.00</span>
            </div>
          </div>
        </div>
        <div className="mt-12 md:mt-0 text-[9px] tracking-widest uppercase opacity-40">
           {paymentMethod === 'razorpay' ? "SSL Encrypted / Razorpay" : "Awaiting Manual Verification"}
        </div>
      </div>

      {/* RIGHT SIDE: PAYMENT METHODS */}
      <div className="md:w-7/12 p-8 md:p-24 overflow-y-auto bg-white flex flex-col justify-center max-w-2xl mx-auto">
        
        {/* TAB TOGGLE */}
        <div className="flex mb-16 border-b border-gray-100">
            <div onClick={() => setPaymentMethod("razorpay")} className={`${tabBase} ${paymentMethod === "razorpay" ? activeTab : inactiveTab}`}>
                Online Payment
            </div>
            <div onClick={() => setPaymentMethod("manual")} className={`${tabBase} ${paymentMethod === "manual" ? activeTab : inactiveTab}`}>
                Manual Transfer
            </div>
        </div>

        {/* RAZORPAY VIEW */}
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
                        Secure redirect to Razorpay. Your clinical dashboard will be activated immediately upon successful transaction.
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

        {/* MANUAL VIEW */}
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
                                    <p className="text-xs text-gray-400 mt-1">Manual Approval (2-4 Hours)</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {[
                                    { label: "Account Name", value: "Sovereign Clinics Pvt Ltd" },
                                    { label: "Account Number", value: "987654321000" },
                                    { label: "IFSC Code", value: "HDFC0001234" },
                                    { label: "UPI ID", value: "sovereign@hdfcbank" }
                                ].map((item, idx) => (
                                    <div key={idx} className="group relative border-b border-gray-100 pb-2">
                                        <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1">{item.label}</label>
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
                                className="flex-2 bg-black text-white py-5 text-[10px] tracking-[0.3em] uppercase hover:bg-[#222] transition-all flex justify-center gap-4 items-center disabled:opacity-50"
                            >
                                {loading ? "Verifying..." : "Submit for Approval"}
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