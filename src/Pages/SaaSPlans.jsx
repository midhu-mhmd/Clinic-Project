import React from "react";
import { useNavigate } from "react-router-dom";

const SaaSPlans = () => {
  const navigate = useNavigate();

  const plans = [
    {
      id: "standard",
      name: "Standard",
      price: "49",
      description: "Ideal for individual practices and small clinics.",
      features: [
        "Up to 3 Doctors",
        "1,000 Appointments/mo",
        "Basic AI Assistant",
        "Email Support",
      ],
      cta: "Select Standard",
      recommended: false,
    },
    {
      id: "professional",
      name: "Professional",
      price: "129",
      description: "Advanced tools for growing medical centers.",
      features: [
        "Unlimited Doctors",
        "Unlimited Appointments",
        "Custom AI Training",
        "24/7 Priority Support",
        "Advanced Analytics",
      ],
      cta: "Select Professional",
      recommended: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans antialiased py-20 px-8">
      <div className="max-w-300 mx-auto">
        {/* Header Section */}
        <header className="mb-24">
          <h2 className="text-[10px] tracking-[0.5em] text-gray-400 uppercase mb-8">
            Step 02 / Subscription
          </h2>
          <h1 className="text-[5vw] md:text-[4vw] leading-[1.1] font-light tracking-tighter">
            Choose a plan that <br />
            <span className="italic font-serif text-gray-400">
              fits your scale.
            </span>
          </h1>
        </header>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 gap-px bg-gray-100 border border-gray-100">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white p-12 md:p-20 flex flex-col justify-between group transition-all duration-700 hover:bg-[#fafafa]"
            >
              <div>
                <div className="flex justify-between items-start mb-12">
                  <h3 className="text-[12px] tracking-[0.3em] uppercase font-bold">
                    {plan.name}
                  </h3>
                  {plan.recommended && (
                    <span className="text-[9px] tracking-widest uppercase bg-black text-white px-3 py-1">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="mb-12">
                  <div className="flex items-baseline">
                    <span className="text-6xl font-light tracking-tighter">
                      ${plan.price}
                    </span>
                    <span className="text-gray-400 text-sm ml-2 uppercase tracking-widest">
                      / Month
                    </span>
                  </div>
                  <p className="mt-6 text-gray-500 font-light leading-relaxed max-w-60">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-16">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm font-light text-gray-600"
                    >
                      <span className="w-1.5 h-1.5 bg-black rounded-full mr-4 opacity-20"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() =>
                  navigate("/payment", {
                    state: { plan: plan.name, price: plan.price },
                  })
                }
                className={`w-full py-6 text-[10px] tracking-[0.4em] uppercase transition-all duration-500 flex justify-between px-10 items-center border ${
                  plan.recommended
                    ? "bg-black text-white border-black hover:bg-gray-800"
                    : "bg-transparent text-black border-gray-200 hover:border-black"
                }`}
              >
                <span>{plan.cta}</span>
                <span className="text-lg font-light transform group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <footer className="mt-16 flex flex-col md:flex-row justify-between items-center border-t border-gray-100 pt-12">
          <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-4 md:mb-0">
            Need a custom enterprise solution?
          </p>
          <button className="text-black text-[10px] tracking-widest uppercase font-bold border-b border-black pb-1 hover:opacity-50 transition-all">
            Contact Sales
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SaaSPlans;
