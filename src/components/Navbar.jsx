import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import * as THREE from "three";

const Navbar = () => {
  const mountRef = useRef(null);
  const navRef = useRef(null);
  const logoTextRef = useRef(null);
  const navigate = useNavigate();

  // --- RESTORED ORIGINAL AUTH LOGIC ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };
    window.addEventListener("authUpdate", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authUpdate", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.dispatchEvent(new Event("authUpdate"));
    setIsProfileOpen(false);
    navigate("/");
  };
  // ------------------------------------

  // GSAP: Entrance and Logo Interaction
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "expo.out" }
    );

    const logoHover = gsap.to(logoTextRef.current, {
      letterSpacing: "0.5em",
      duration: 0.7,
      paused: true,
      ease: "power2.out"
    });

    const el = document.querySelector(".logo-trigger");
    if (el) {
      el.addEventListener("mouseenter", () => logoHover.play());
      el.addEventListener("mouseleave", () => logoHover.reverse());
    }
  }, []);

  // Three.js: The Premium Octahedron Logo
  useEffect(() => {
    if (mountRef.current) mountRef.current.innerHTML = "";
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    camera.position.z = 2.5;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(42, 42);
    mountRef.current?.appendChild(renderer.domElement);

    const geometry = new THREE.OctahedronGeometry(0.8, 0); 
    const material = new THREE.MeshPhysicalMaterial({
      color: "#8DAA9D",
      roughness: 0.1,
      transmission: 1,
      thickness: 1.2,
      transparent: true,
      opacity: 0.9,
    });
    
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);
    
    // Tech wireframe overlay
    const wireframe = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: "#2D302D", wireframe: true, transparent: true, opacity: 0.15 })
    );
    scene.add(wireframe);

    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(2, 2, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    let frameId;
    const animate = () => {
      shape.rotation.y += 0.01;
      wireframe.rotation.y += 0.01;
      shape.rotation.x += 0.005;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-100 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-8 py-3 pointer-events-auto">
        
        {/* LOGO SECTION */}
        <div
          className="logo-trigger flex items-center gap-4 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div ref={mountRef} className="w-10 h-10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110" />
          <div className="flex flex-col leading-none">
            <span ref={logoTextRef} className="text-[13px] font-bold tracking-[0.3em] text-[#2D302D] uppercase transition-all">
              Sovereign
            </span>
            <span className="text-[9px] tracking-widest text-[#8DAA9D] font-medium mt-1 uppercase flex items-center gap-2">
              <span className="w-3 h-px bg-[#8DAA9D]/40" />
              Healthbook
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-10 text-[10px] uppercase tracking-[0.2em] font-bold text-[#2D302D]/50">
          {[
            { name: "Clinics", path: "/clinics" },
            { name: "Doctors", path: "/doctors" },
            { name: "Help", path: "/help" },
          ].map((item) => (
            <Link key={item.name} to={item.path} className="relative group transition-colors hover:text-[#2D302D]">
              {item.name}
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#8DAA9D] transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* AUTH ACTIONS */}
        <div className="flex items-center gap-6">
          {!isLoggedIn ? (
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/login")}
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2D302D]/40 hover:text-[#2D302D] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-[#FAF9F6] rounded-full bg-[#2D302D] hover:bg-[#8DAA9D] transition-all duration-500"
              >
                Join
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <button className="hidden sm:block text-[9px] uppercase tracking-[0.2em] font-bold text-[#8DAA9D] border border-[#8DAA9D]/30 px-5 py-2.5 rounded-full hover:bg-[#8DAA9D] hover:text-[#FAF9F6] transition-all duration-500">
                Book Appointment
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full border border-[#8DAA9D]/20 flex items-center justify-center bg-white shadow-sm group hover:border-[#8DAA9D] transition-all"
                >
                   <svg className="w-5 h-5 text-[#2D302D]/60 group-hover:text-[#8DAA9D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                </button>
                
                {/* RESTORED ORIGINAL DROPDOWN ITEMS */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-60 bg-[#FAF9F6] backdrop-blur-2xl border border-[#2D302D]/5 rounded-2xl shadow-2xl py-3 overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#2D302D]/5">
                      <p className="text-[9px] tracking-[0.2em] uppercase text-[#8DAA9D] font-bold">Account</p>
                      <p className="text-sm font-medium text-[#2D302D]">Alex Johnson</p>
                    </div>

                    <div className="py-2">
                      <Link to="/appointments" className="block px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#2D302D]/60 hover:bg-[#8DAA9D]/10 hover:text-[#2D302D]">
                        My Appointments
                      </Link>
                      <Link to="/clinic-registration" className="block px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#8DAA9D] hover:bg-[#8DAA9D]/10">
                        Register Clinic
                      </Link>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-red-400 hover:bg-red-50 transition-colors border-t border-[#2D302D]/5"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
