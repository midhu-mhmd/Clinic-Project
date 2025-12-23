import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import * as THREE from "three";

const Navbar = () => {
  const navRef = useRef(null);
const navigate = useNavigate();

  // GSAP animation
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
  }, []);

  // Three.js subtle orb
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(120, 120);

    const geometry = new THREE.SphereGeometry(0.8, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: "#3b82f6",
      roughness: 0.3,
      metalness: 0.4,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(2, 2, 2);
    scene.add(light);

    const animate = () => {
      sphere.rotation.y += 0.003;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 pointer-events-auto"
    >
      <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium tracking-tight text-gray-900">
            Health<span className="text-blue-600">Book</span>
          </span>
        </div>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-10 text-sm text-gray-600">
          {["Clinics", "Doctors", "Help"].map((item) => (
            <a
              key={item}
              href="#"
              className="relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button  onClick={() => navigate("/register")} className="text-sm text-gray-600 hover:text-gray-900 transition">
            Sign Up
          </button>

          <button className="relative px-5 py-2 text-sm text-white rounded-full bg-gray-900 overflow-hidden group">
            <span className="relative z-10">Book Now</span>
            <span className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

