import { useEffect, useRef } from "react";


const HeroSection = () => {
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const btnRef = useRef(null);

  return (
    <section className="relative h-screen w-full overflow-hidden">

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="max-w-5xl mx-auto px-6">
          <span className="inline-block mb-6 rounded-full border border-blue-200 bg-white px-4 py-1 text-sm text-blue-600">
            Trusted Healthcare Platform
          </span>

          <h1
            ref={titleRef}
            className="text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-[1.05] text-gray-900"
          >
            Find the right care. <br />
            <span className="bg-linear-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">
              Book with confidence.
            </span>
          </h1>

          <p
            ref={subRef}
            className="mt-6 max-w-xl text-lg text-gray-600"
          >
            Search clinics, consult our AI health assistant, and book appointments
            effortlessly — all in one place.
          </p>

          <div
            ref={btnRef}
            className="mt-10 flex items-center gap-4"
          >
            <button className="rounded-full bg-blue-600 px-8 py-4 text-white font-medium hover:bg-blue-700 transition">
              Find Clinics Near You
            </button>

            <button className="rounded-full border border-gray-300 px-8 py-4 font-medium text-gray-700 hover:bg-gray-100 transition">
              Chat with AI Assistant
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
