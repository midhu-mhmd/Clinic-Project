import { useEffect, useRef, useState } from "react";
import { ArrowRight, Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function TopClinics() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Dynamic Data - Fixed Endpoint
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        // MATCHED TO YOUR BACKEND ROUTE: /api/tenants/all
        const res = await axios.get("http://localhost:5000/api/tenants/all");
        
        // Ensure res.data is the array of formatted clinics from your controller
        const formattedData = res.data.data.map(clinic => ({
          id: clinic._id,
          name: clinic.name,
          // Safety check for address split
          location: clinic.location || "Access Private",
          specialty: clinic.tags || ["General Care"],
          rate: clinic.rate || 5.0,
          img: clinic.img // Controller already maps clinic.image to .img
        }));

        setClinics(formattedData);
      } catch (err) {
        console.error("Failed to fetch clinics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  // 2. GSAP Animation - Fixed Refresh logic
  useEffect(() => {
    if (loading || clinics.length === 0) return;

    // We use a small timeout to ensure the DOM has painted the new cards
    const timer = setTimeout(() => {
      let ctx = gsap.context(() => {
        const amountToScroll = scrollRef.current.offsetWidth - window.innerWidth;

        gsap.to(scrollRef.current, {
          x: -amountToScroll - 200,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: () => `+=${amountToScroll + 200}`, // Ensure smooth end
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }, containerRef);

      // Refresh ScrollTrigger because the layout changed from "Loading" to "Data"
      ScrollTrigger.refresh();

      return () => {
        ctx.revert();
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, clinics]);

  return (
    <section
      ref={containerRef}
      className="min-h-[150vh] bg-transparent overflow-hidden"
    >
      <div className="h-screen flex flex-col justify-center relative">
        {/* Header Section */}
        <div className="px-8 sm:px-20 mb-12 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-[#8DAA9D]"></span>
            <span className="text-[10px] tracking-[0.5em] text-[#8DAA9D] uppercase font-bold">
              Featured Partners
            </span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-light text-[#2D302D] tracking-tighter leading-none">
            Premier <span className="italic font-serif">Institutions</span>.
          </h2>
        </div>

        {/* The Horizontal Track */}
        <div
          ref={scrollRef}
          className="flex gap-12 px-8 sm:px-20 w-fit items-center"
        >
          {loading ? (
            <div className="flex gap-12">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="w-[85vw] md:w-[400px] h-[500px] bg-neutral-100 animate-pulse border border-neutral-200" />
               ))}
            </div>
          ) : (
            clinics.map((clinic) => (
              <article
                key={clinic.id}
                className="clinic-card group relative shrink-0 w-[85vw] md:w-[400px] bg-white border border-neutral-100 p-6 transition-all duration-500 hover:border-[#8DAA9D]/30"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden mb-8 bg-neutral-100">
                  <img
                    src={clinic.img}
                    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                    alt={clinic.name}
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800" }}
                  />

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1.5">
                    <Star size={12} className="fill-[#8DAA9D] text-[#8DAA9D]" />
                    <span className="text-[11px] font-medium text-[#2D302D]">
                      {clinic.rate}
                    </span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-light text-[#2D302D] tracking-tight group-hover:text-[#8DAA9D] transition-colors line-clamp-1">
                        {clinic.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[#2D302D]/30">
                        <MapPin size={12} />
                        <span className="text-[10px] uppercase tracking-widest">
                          {clinic.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {clinic.specialty.map((s, i) => (
                        <span
                          key={i}
                          className="text-[9px] uppercase tracking-wider font-bold text-[#2D302D]/40 px-3 py-1 border border-neutral-100 rounded-full group-hover:border-[#8DAA9D]/20 transition-colors"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/clinic/${clinic.id}`)}
                    className="w-full py-4 bg-transparent border border-[#2D302D]/10 text-[#2D302D] text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-500 hover:bg-[#2D302D] hover:text-white"
                  >
                    Book Appointment
                  </button>
                </div>
              </article>
            ))
          )}

          {!loading && (
            <div className="shrink-0 px-20">
              <button onClick={() => navigate("/clinics")} className="text-left group">
                <h4 className="text-4xl lg:text-6xl font-serif italic text-[#2D302D]/10 group-hover:text-[#8DAA9D] transition-all duration-700 leading-tight">
                  See our full <br /> network.
                </h4>
                <div className="mt-8 flex items-center gap-4 text-[#2D302D]/40 group-hover:text-[#2D302D] transition-colors">
                  <span className="text-[10px] tracking-widest uppercase font-bold">Explore All</span>
                  <ArrowRight size={16} />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TopClinics;