import { useEffect, useRef } from 'react';
import { ArrowRight, Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATIC_CLINICS = [
  { id: 1, name: "Apollo Health", location: "Kochi", specialty: ["Cardiology", "Diagnostics"], rate: 4.8, img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "Lakeshore Hospital", location: "Ernakulam", specialty: ["Neurology", "Surgery"], rate: 4.6, img: "https://images.unsplash.com/photo-1586773860418-d3b978ec017e?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "Aster Medcity", location: "Kochi", specialty: ["Pediatrics", "Wellness"], rate: 4.9, img: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "Care Clinic", location: "Trivandrum", specialty: ["Dental Care", "Ortho"], rate: 4.4, img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800" }
];

function TopClinics() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const amountToScroll = scrollRef.current.offsetWidth - window.innerWidth;

      gsap.to(scrollRef.current, {
        x: -amountToScroll - 200,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${amountToScroll}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="min-h-[150vh] bg-transparent overflow-hidden">
      <div className="h-screen flex flex-col justify-center relative">
        
        {/* Header Section */}
        <div className="px-8 sm:px-20 mb-12 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-[#8DAA9D]"></span>
            <span className="text-[10px] tracking-[0.5em] text-[#8DAA9D] uppercase font-bold">Featured Partners</span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-light text-[#2D302D] tracking-tighter leading-none">
            Premier <span className="italic font-serif">Institutions</span>.
          </h2>
        </div>

        {/* The Horizontal Track */}
        <div ref={scrollRef} className="flex gap-12 px-8 sm:px-20 w-fit items-center">
          {STATIC_CLINICS.map((clinic) => (
            <article 
              key={clinic.id}
              className="clinic-card group relative flex-shrink-0 w-[85vw] md:w-[420px] bg-white border border-neutral-100 p-6 transition-all duration-500 hover:border-[#8DAA9D]/30"
            >
              {/* Image Section */}
              <div className="relative aspect-[4/3] overflow-hidden mb-8 bg-neutral-100">
                <img 
                  src={clinic.img} 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  alt={clinic.name}
                />
                
                {/* Minimal Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1.5">
                  <Star size={12} className="fill-[#8DAA9D] text-[#8DAA9D]" />
                  <span className="text-[11px] font-medium text-[#2D302D]">{clinic.rate}</span>
                </div>
              </div>

              {/* Info Section */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-light text-[#2D302D] tracking-tight group-hover:text-[#8DAA9D] transition-colors">
                      {clinic.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[#2D302D]/30">
                       <MapPin size={12} />
                       <span className="text-[10px] uppercase tracking-widest">{clinic.location}</span>
                    </div>
                  </div>

                  {/* Specialty Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {clinic.specialty.map((s, i) => (
                      <span key={i} className="text-[9px] uppercase tracking-wider font-bold text-[#2D302D]/40 px-3 py-1 border border-neutral-100 rounded-full group-hover:border-[#8DAA9D]/20 transition-colors">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Modern Functional Button */}
                <button 
                  onClick={() => navigate(`/clinic/${clinic.id}`)}
                  className="w-full py-4 bg-transparent border border-[#2D302D]/10 text-[#2D302D] text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-500 hover:bg-[#2D302D] hover:text-white"
                >
                  Book Appointment
                </button>
              </div>
            </article>
          ))}

          {/* End Section: Minimalist Invitation */}
          <div className="flex-shrink-0 px-20">
            <button 
              onClick={() => navigate('/clinics')}
              className="text-left group"
            >
              <h4 className="text-4xl lg:text-6xl font-serif italic text-[#2D302D]/10 group-hover:text-[#8DAA9D] transition-all duration-700 leading-tight">
                See our full <br /> network.
              </h4>
              <div className="mt-8 flex items-center gap-4 text-[#2D302D]/40 group-hover:text-[#2D302D] transition-colors">
                 <span className="text-[10px] tracking-widest uppercase font-bold">Explore All</span>
                 <ArrowRight size={16} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TopClinics;

