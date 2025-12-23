import { useEffect, useRef } from "react";
import gsap from "gsap";

const AiAssistantSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current.children,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.15,
      }
    );
  }, []);

  return (
    <section className="w-full py-24">
      <div
        ref={sectionRef}
        className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
      >
        {/* LEFT CONTENT */}
        <div>
          <span className="inline-block mb-4 px-4 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
            AI Health Assistant
          </span>

          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
            Not sure which <br /> doctor to visit?
          </h2>

          <p className="mt-6 text-lg text-gray-500 max-w-md">
            Describe your symptoms and our AI will guide you to the right
            specialist or clinic — quickly and confidently.
          </p>

          <button className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
            Start AI Chat
          </button>
        </div>

        {/* RIGHT CHAT CARD */}
        <div className="relative">
          <div className="rounded-3xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 max-w-md ml-auto">
            {/* User Message */}
            <div className="flex justify-end mb-4">
              <div className="bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded-2xl">
                I have throat pain and fever
              </div>
            </div>

            {/* AI Reply */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                AI
              </div>

              <div className="bg-blue-50 text-gray-800 text-sm px-4 py-3 rounded-2xl max-w-[240px]">
                You may consult an <strong>ENT specialist</strong>.  
                Would you like me to find clinics near you?
              </div>
            </div>

            {/* Input fake */}
            <div className="mt-6 flex items-center gap-3 border border-gray-200 rounded-full px-4 py-3 text-sm text-gray-400">
              Describe your symptoms...
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiAssistantSection;
