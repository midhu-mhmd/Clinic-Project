import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import * as THREE from "three";

const Navbar = () => {
  const mountRef = useRef(null);
  const navRef = useRef(null);
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 1. Initialize State securely
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  // 2. THE CRITICAL FIX: Listen for the custom event
  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    // Listen for custom event (internal) and storage event (cross-tab)
    window.addEventListener("authUpdate", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authUpdate", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // GSAP Animation
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
  }, []);

  // Three.js Logic
  useEffect(() => {
    if (mountRef.current) mountRef.current.innerHTML = "";
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
    camera.position.z = 3;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(35, 35);
    mountRef.current?.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(0.8, 1);
    const material = new THREE.MeshStandardMaterial({
      color: "#a3b18a",
      wireframe: true,
    });
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(2, 2, 2);
    scene.add(light);

    let frameId;
    const animate = () => {
      shape.rotation.y += 0.002;
      shape.rotation.x += 0.001;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.dispatchEvent(new Event("authUpdate")); // Notifies itself to update
    setIsProfileOpen(false);
    navigate("/");
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-1.5 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div
            ref={mountRef}
            className="w-8.75 h-8.75 flex items-center justify-center opacity-80"
          />
          <span className="text-[15px] font-light tracking-[0.2em] text-slate-500 uppercase">
            Health
            <span className="font-semibold text-slate-400 ml-1">Book</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm text-gray-600">
          {[
            { name: "Clinics", path: "/clinics" },
            { name: "Doctors", path: "/doctors" },
            { name: "Help", path: "/help" },
          ].map((item) => (
            <Link key={item.name} to={item.path} className="relative group">
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2 text-sm text-white rounded-full bg-gray-900"
              >
                Get Started
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <button className="hidden sm:block text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                Book Now
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 rounded-full bg-gray-100 border flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900">
                        Alex Johnson
                      </p>
                    </div>

                    <Link
                      to="/appointments"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Appointments
                    </Link>

                    {/* New Option Added Here */}
                    <Link
                      to="/clinic-owner-register"
                      className="block px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                    >
                      Are you a clinic owner?
                    </Link>

                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
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
