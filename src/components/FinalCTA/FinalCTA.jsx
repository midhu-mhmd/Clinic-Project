import React from "react";

const FinalCTA = () => {
  return (
    <section className="relative h-64 flex items-center justify-center text-center px-4 overflow-hidden bg-[#FAF9F6]">
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-white/90" />

      <div className="relative z-10 max-w-md">
        <h1 className="font-inter text-3xl md:text-4xl font-bold mb-3 leading-tight text-gray-900">
          Smarter healthcare starts here.
        </h1>
        <p className="font-inter text-sm md:text-base font-normal mb-6 text-gray-700 leading-relaxed">
          Join thousands of patients who've found a better way to manage their
          health appointments.
        </p>
        <button className="bg-white text-gray-600 px-8 py-3 rounded-full font-inter text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-100">
          Talk to AI & Book Now
        </button>
      </div>
    </section>
  );
};

export default FinalCTA;
