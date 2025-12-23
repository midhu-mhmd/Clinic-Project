import { useEffect, useRef } from "react";
import gsap from "gsap";

const features = [
  {
    title: "AI-guided care",
    desc: "Our AI understands symptoms and guides patients to the right specialist instantly.",
    color: "from-purple-400 to-purple-600",
    icon: "🧠",
  },
  {
    title: "Verified doctors",
    desc: "Every clinic and doctor is carefully verified for quality and trust.",
    color: "from-green-400 to-green-600",
    icon: "🩺",
  },
  {
    title: "Instant booking",
    desc: "Real-time availability lets you book appointments without waiting.",
    color: "from-blue-400 to-blue-600",
    icon: "📅",
  },
  {
    title: "Secure data",
    desc: "Medical records are encrypted and protected at all times.",
    color: "from-teal-400 to-teal-600",
    icon: "🔒",
  },
];

const WhyPatientsLoveUs = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 50 },
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
    <section className="w-full py-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="max-w-xl mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900">
            Why patients trust us
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Designed to make healthcare simpler, safer, and stress-free.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((item, index) => (
            <div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300"
            >
              {/* Gradient glow */}
              <div
                className={`absolute -top-20 -right-20 w-56 h-56 bg-linear-to-br ${item.color} opacity-20 blur-3xl`}
              />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl mb-6">
                  {item.icon}
                </div>

                <h3 className="text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-gray-500 leading-relaxed max-w-sm">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyPatientsLoveUs;
