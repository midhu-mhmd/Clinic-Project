import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Get plan details from the previous step
  const plan = location.state?.plan || "Professional";
  const price = location.state?.price || "129";

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate Payment Gateway (Stripe/Razorpay)
    setTimeout(() => {
      setLoading(false);
      // On success, navigate to final login or success state
      navigate("/login", { state: { registered: true } });
    }, 2000);
  };

  const inputGroupStyle = "relative group mb-8";
  const inputStyle = "peer w-full bg-transparent border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-black transition-colors duration-500 placeholder-transparent font-light";
  const labelStyle = "absolute left-0 top-3 text-gray-400 text-[10px] tracking-[0.2em] uppercase transition-all duration-500 pointer-events-none peer-focus:-top-4 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4";

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans antialiased text-[#1a1a1a]">
      
      {/* Left Side: Order Summary */}
      <div className="md:w-5/12 bg-[#F9F9F9] p-12 md:p-24 flex flex-col justify-between border-r border-gray-100">
        <div>
          <h2 className="text-[10px] tracking-[0.5em] text-gray-400 uppercase mb-12">Step 03 / Payment</h2>
          <h1 className="text-[5vw] md:text-[3.5vw] leading-[1.1] font-light tracking-tighter mb-12">
            Secure your <br />
            <span className="italic font-serif text-gray-400">subscription.</span>
          </h1>
          
          <div className="space-y-6 pt-12 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-[11px] tracking-widest uppercase text-gray-400 font-medium">Selected Plan</span>
              <span className="text-sm font-semibold uppercase">{plan}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[11px] tracking-widest uppercase text-gray-400 font-medium">Monthly Total</span>
              <span className="text-4xl font-light tracking-tighter">${price}.00</span>
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-0 flex items-center gap-4 opacity-40">
           {/* Security Badges */}
           <div className="text-[9px] tracking-widest uppercase">Encrypted / SSL / Secure</div>
        </div>
      </div>

      {/* Right Side: Credit Card Form */}
      <div className="md:w-7/12 p-12 md:p-24 overflow-y-auto bg-white flex items-center justify-center">
        <div className="max-w-md w-full">
          <form onSubmit={handlePayment}>
            <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold mb-12 border-b border-gray-100 pb-4">
              Payment Details
            </h3>

            <div className={inputGroupStyle}>
              <input type="text" id="cardName" placeholder=" " required className={inputStyle} />
              <label htmlFor="cardName" className={labelStyle}>Cardholder Name</label>
            </div>

            <div className={inputGroupStyle}>
              <input type="text" id="cardNumber" placeholder=" " required className={inputStyle} />
              <label htmlFor="cardNumber" className={labelStyle}>Card Number</label>
            </div>

            <div className="grid grid-cols-2 gap-12">
              <div className={inputGroupStyle}>
                <input type="text" id="expiry" placeholder=" " required className={inputStyle} />
                <label htmlFor="expiry" className={labelStyle}>Expiry (MM/YY)</label>
              </div>
              <div className={inputGroupStyle}>
                <input type="text" id="cvc" placeholder=" " required className={inputStyle} />
                <label htmlFor="cvc" className={labelStyle}>CVC</label>
              </div>
            </div>

            <div className="pt-12">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white py-6 text-[10px] tracking-[0.4em] uppercase hover:bg-[#222] transition-all flex justify-between px-10 items-center group shadow-2xl"
              >
                <span>{loading ? "Authenticating..." : `Pay $${price}.00`}</span>
                <span className="group-hover:translate-x-2 transition-transform duration-500 text-xl font-light">→</span>
              </button>
              
              <p className="mt-8 text-center text-gray-400 text-[9px] tracking-widest uppercase leading-loose">
                By clicking pay, you agree to our <br/>
                <span className="text-black cursor-pointer hover:underline">Terms of Service</span> and <span className="text-black cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;