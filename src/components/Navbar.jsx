import { useEffect, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import * as THREE from "three";

const Navbar = () => {
  const mountRef = useRef(null);
  const navRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // State to manage profile dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Get authentication state from localStorage or context
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check localStorage on initial render
    const storedAuth = localStorage.getItem("isLoggedIn");
    return storedAuth ? JSON.parse(storedAuth) : false;
  });

  // GSAP animation
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
  }, []);

  // Sync login state with localStorage
  useEffect(() => {
    localStorage.setItem("isLoggedIn", JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  // Three.js subtle orb - ALWAYS SHOW regardless of login state
  useEffect(() => {
    // Early return if ref isn't available
    if (!mountRef.current) return;

    // Clear existing content
    mountRef.current.innerHTML = "";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(35, 35);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(0.8, 1);
    const material = new THREE.MeshStandardMaterial({
      color: "#a3b18a",
      wireframe: true,
    });

    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);

    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    let frameId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      
      shape.rotation.y += 0.002;
      shape.rotation.x += 0.001;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    
    animate();

    // Cleanup function
    return () => {
      isMounted = false;
      if (frameId) cancelAnimationFrame(frameId);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
  }, []); // Empty dependency array - runs once on mount

  // Handle sign out
  const handleSignOut = () => {
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userData");
    navigate("/"); // Redirect to home after sign out
  };

  // Handle login (you would call this from your login component)
  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
    // You might also store user data
    // localStorage.setItem("userData", JSON.stringify(user));
  };

  // Reset dropdown when route changes
  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  return (
    <nav ref={navRef} className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo Section - ALWAYS VISIBLE */}
        <div
          className="flex items-center gap-1.5 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          {/* Three.js Container */}
          <div
            ref={mountRef}
            className="w-[35px] h-[35px] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          />

          {/* Logo Text */}
          <span className="text-[15px] font-light tracking-[0.2em] text-slate-500 uppercase flex items-center">
            Health
            <span className="font-semibold text-slate-400 ml-1">Book</span>
          </span>
        </div>

        {/* Navigation Links - Show different links based on auth state */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          {isLoggedIn ? (
            // Links for logged in users
            [
              { name: "Dashboard", path: "/dashboard" },
              { name: "Clinics", path: "/clinics" },
              { name: "Doctors", path: "/doctors" },
              { name: "Appointments", path: "/appointments" },
            ].map((item) => (
              <Link key={item.name} to={item.path} className="relative group">
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))
          ) : (
            // Links for non-logged in users
            [
              { name: "Clinics", path: "/clinics" },
              { name: "Doctors", path: "/doctors" },
              { name: "Pricing", path: "/pricing" },
              { name: "Help", path: "/help" },
            ].map((item) => (
              <Link key={item.name} to={item.path} className="relative group">
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))
          )}
        </div>

        {/* Actions / Profile Section */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2 text-sm text-white rounded-full bg-gray-900 hover:bg-gray-800 transition"
              >
                Get Started
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate("/book-appointment")}
                className="hidden sm:block text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
              >
                Book Now
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                  aria-label="Profile menu"
                  aria-expanded={isProfileOpen}
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
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Alex Johnson
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>

                      <Link
                        to="/appointments"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        My Appointments
                      </Link>

                      <Link
                        to="/register-clinic"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                        </svg>
                        Clinic Owner?
                      </Link>

                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
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
