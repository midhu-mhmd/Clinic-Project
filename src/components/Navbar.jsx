import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import * as THREE from "three";
import { Bell } from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const Navbar = () => {
  const mountRef = useRef(null);
  const navRef = useRef(null);
  const logoTextRef = useRef(null);
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for click-outside detection
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [unreadCount, setUnreadCount] = useState(0);

  // --- FIXED: DEFENSIVE PARSING ---
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Failed to parse user data:", e);
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");

      // --- FIXED: DEFENSIVE PARSING IN LISTENER ---
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
        try {
          setUserData(JSON.parse(savedUser));
        } catch (e) {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    };

    window.addEventListener("authUpdate", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authUpdate", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    if (!isLoggedIn) { setUnreadCount(0); return; }
    const token = (localStorage.getItem("token") || localStorage.getItem("authToken") || "").replace(/['"]+/g, "").trim();
    if (!token) return;

    const fetchCount = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(data?.unreadCount ?? 0);
      } catch { /* silent */ }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // --- CLICK OUTSIDE DROPDOWN ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authUpdate"));
    setIsProfileOpen(false);
    navigate("/");
  };

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

  // Three.js: Octahedron Logo
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
      color: "#0F766E",
      roughness: 0.1,
      transmission: 1,
      thickness: 1.2,
      transparent: true,
      opacity: 0.9,
    });

    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);

    const wireframe = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: "#1E293B", wireframe: true, transparent: true, opacity: 0.15 })
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
    <nav ref={navRef} className="fixed top-0 left-0 w-full z-100 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-3">

        {/* LOGO SECTION */}
        <div className="logo-trigger flex items-center gap-4 cursor-pointer group" onClick={() => navigate("/")}>
          <div ref={mountRef} className="w-10 h-10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110" />
          <div className="flex flex-col leading-none">
            <span ref={logoTextRef} className="text-[13px] font-bold tracking-[0.3em] text-[#1E293B] uppercase transition-all">
              Sovereign
            </span>
            <span className="text-[9px] tracking-widest text-[#0F766E] font-medium mt-1 uppercase flex items-center gap-2">
              <span className="w-3 h-px bg-[#0F766E]/40" />
              HealthBook
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-10 text-[10px] uppercase tracking-[0.2em] font-bold text-[#1E293B]/50">
          {[{ name: "Find a Clinic", path: "/clinics" }, { name: "Our Doctors", path: "/doctors" }, { name: "Help Centre", path: "/help" }, { name: "Support", path: "/support" }].map((item) => (
            <Link key={item.name} to={item.path} className="relative group transition-colors hover:text-[#1E293B]">
              {item.name}
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#0F766E] transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* AUTH ACTIONS */}
        <div className="flex items-center gap-6">
          {!isLoggedIn ? (
            <div className="flex items-center gap-6">
              <button onClick={() => navigate("/login")} className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1E293B]/40 hover:text-[#1E293B] transition-colors">
                Sign In
              </button>
              <button onClick={() => navigate("/register")} className="px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-white rounded-full bg-[#0F766E] hover:bg-[#0F766E]/90 transition-all duration-500">
                Register
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <button onClick={() => navigate("/appointment/:id")} className="hidden sm:block text-[9px] uppercase tracking-[0.2em] font-bold text-[#0F766E] border border-[#0F766E]/30 px-5 py-2.5 rounded-full hover:bg-[#0F766E] hover:text-white transition-all duration-500">
                Book Appointment
              </button>

              <button
                onClick={() => navigate("/notifications")}
                className="relative w-10 h-10 rounded-full border border-[#0F766E]/20 flex items-center justify-center bg-white shadow-sm group hover:border-[#0F766E] transition-all"
                aria-label="Notifications"
              >
                <Bell size={18} className="text-[#1E293B]/60 group-hover:text-[#0F766E] transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#0F766E] rounded-full border-2 border-white text-[6px] text-white font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full border border-[#0F766E]/20 flex items-center justify-center bg-white shadow-sm group hover:border-[#0F766E] transition-all"
                >
                  <svg className="w-5 h-5 text-[#1E293B]/60 group-hover:text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl py-3 overflow-hidden z-110">
                    <div className="px-5 py-3 border-b border-slate-100">
                      <p className="text-[9px] tracking-[0.2em] uppercase text-[#0F766E] font-bold">My Account</p>
                      <p className="text-sm font-medium text-[#1E293B] truncate">
                        {userData?.name || "Patient"}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:bg-[#0F766E]/5 hover:text-[#1E293B]"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/appointments"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:bg-[#0F766E]/5 hover:text-[#1E293B]"
                      >
                        My Appointments
                      </Link>
                      <Link
                        to="/my-consultations"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:bg-[#0F766E]/5 hover:text-[#1E293B]"
                      >
                        My Consultations
                      </Link>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-red-400 hover:bg-red-50 transition-colors border-t border-slate-100"
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