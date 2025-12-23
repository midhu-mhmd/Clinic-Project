import { useEffect, useRef } from "react";
import gsap from "gsap";

const HowItWorks = () => {
  const screensRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(
      screensRef.current,
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.3,
      }
    );
  }, []);

  return (
    <section className="relative w-full  py-36 overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-225 bg-blue-200/40 blur-[160px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="max-w-xl mb-24">
          <p className="text-sm text-blue-600 font-medium">
            How HealthBook works
          </p>
          <h2 className="mt-4 text-5xl font-semibold text-gray-900 leading-tight">
            From symptoms to appointment <br /> in minutes
          </h2>
          <p className="mt-6 text-lg text-gray-500">
            A real product flow, not just features.
          </p>
        </div>

        {/* Screenshots */}
        <div className="relative flex flex-col md:flex-row items-center gap-20">
          
          {/* Screen 1 */}
          <div
            ref={(el) => (screensRef.current[0] = el)}
            className="relative w-[320px] md:w-90"
          >
            <p className="mb-4 text-sm text-gray-500">
              Step 01 — Describe symptoms
            </p>
            <div className="rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.15)]">
              <img
                src="/screens/ai-search.png"
                alt="AI search"
                className="w-full"
              />
            </div>
          </div>

          {/* Screen 2 (raised) */}
          <div
            ref={(el) => (screensRef.current[1] = el)}
            className="relative w-[320px] md:w-95 -mt-20"
          >
            <p className="mb-4 text-sm text-gray-500">
              Step 02 — Choose doctor
            </p>
            <div className="rounded-3xl overflow-hidden shadow-[0_60px_140px_rgba(0,0,0,0.18)]">
              <img
                src="/screens/doctor-list.png"
                alt="Doctor list"
                className="w-full"
              />
            </div>
          </div>

          {/* Screen 3 */}
          <div
            ref={(el) => (screensRef.current[2] = el)}
            className="relative w-[320px] md:w-90"
          >
            <p className="mb-4 text-sm text-gray-500">
              Step 03 — Book instantly
            </p>
            <div className="rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.15)]">
              <img
                src="/screens/booking.png"
                alt="Booking"
                className="w-full"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
