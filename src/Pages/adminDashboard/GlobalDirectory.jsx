import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Search,
  Zap,
  Crosshair,
  Users,
  SlidersHorizontal,
} from "lucide-react";

// --- DYNAMIC DATA FETCHING LOGIC ---
const GlobalDirectory = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const containerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/doctors/directory",
          {
            signal: controller.signal,
          },
        );

        // --- LOGIC: Smart Normalization ---
        // This checks if data is in: response.data, response.data.doctors, or response.data.data
        const rawData = response.data;
        const extractedDoctors = Array.isArray(rawData)
          ? rawData
          : rawData.doctors || rawData.data || [];

        console.log("Synchronized Faculty Data:", extractedDoctors); // Debug this in console
        setFaculty(extractedDoctors);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Connection Interrupted:", err);
          // Fallback stays here so the UI doesn't break during dev
          setFaculty([
            {
              id: "01",
              name: "Dr. Julian Voss",
              specialty: "Neural Restoration",
              clinic: "Zenith Zurich",
              image:
                "https://images.unsplash.com/photo-1612349317150-e413f6a5b1f8?q=80&w=1000",
            },
            {
              id: "02",
              name: "Dr. Elena Thorne",
              specialty: "Cardiac Architecture",
              clinic: "Nova London",
              image:
                "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1000",
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
    return () => controller.abort();
  }, []);

  // --- DERIVED STATES & SEARCH ---
  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const matchesSearch =
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === "All" || f.specialty === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [faculty, searchQuery, activeFilter]);

  const specialties = useMemo(
    () => ["All", ...new Set(faculty.map((f) => f.specialty))],
    [faculty],
  );

  if (loading) return <DirectoryLoader />;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FBFBF9] text-[#1A1A1A] selection:bg-[#8DAA9D] selection:text-white pb-32"
    >
      {/* 01. NAVIGATION & METRICS OVERLAY */}
      <div className="sticky top-0 z-40 bg-[#FBFBF9]/80 backdrop-blur-xl border-b border-[#1A1A1A]/5 px-6 md:px-16 py-6 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users size={14} className="opacity-40" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
              {faculty.length} Faculty
            </span>
          </div>
          <div className="h-4 w-px bg-[#1A1A1A]/10 hidden md:block" />
          <div className="hidden md:flex gap-4">
            {specialties.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => setActiveFilter(s)}
                className={`text-[9px] uppercase tracking-widest font-bold transition-all ${activeFilter === s ? "text-[#8DAA9D]" : "opacity-30 hover:opacity-100"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SlidersHorizontal
            size={14}
            className="opacity-40 cursor-pointer hover:text-[#8DAA9D] transition-colors"
          />
        </div>
      </div>

      <main className="px-6 md:px-16 pt-24">
        {/* 02. HEADER */}
        <header className="mb-32 flex flex-col lg:flex-row justify-between items-end gap-12">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Zap size={14} className="text-[#8DAA9D] fill-[#8DAA9D]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40">
                System Protocol / Directory
              </span>
            </div>
            <h1 className="text-7xl md:text-9xl font-light tracking-tighter leading-[0.85] uppercase italic font-serif">
              Master <br />{" "}
              <span className="not-italic text-[#1A1A1A]/20">Archive.</span>
            </h1>
          </motion.div>

          <div className="w-full lg:max-w-md group pb-2 border-b border-[#1A1A1A]/10 focus-within:border-[#8DAA9D] transition-all">
            <div className="relative flex items-center">
              <Search className="opacity-20 mr-4" size={18} />
              <input
                type="text"
                placeholder="FIND SPECIALIST..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-4 text-[11px] font-bold uppercase tracking-[0.3em] outline-none placeholder:opacity-20"
              />
            </div>
          </div>
        </header>

        {/* 03. THE INTERACTIVE LIST */}
        {/* --- UPDATED LIST SECTION --- */}
        <div className="relative border-t border-[#1A1A1A]/10">
          <AnimatePresence mode="popLayout">
            {filteredFaculty.length > 0 ? (
              filteredFaculty.map((doc, index) => {
                /** * FIX: We create a stable key.
                 * We prioritize the database ID, but if that's missing,
                 * we use a combination of name and index to guarantee uniqueness.
                 */
                const stableKey =
                  doc._id ||
                  doc.id ||
                  `faculty-ref-${doc.name || "anon"}-${index}`;

                return <FacultyRow key={stableKey} doc={doc} index={index} />;
              })
            ) : (
              /* Fallback if no doctors are found after filtering */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-40 text-center opacity-20 text-[10px] uppercase tracking-[1em]"
              >
                No matching records found.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- COMPONENT: ROW INTERACTION ---
const FacultyRow = ({ doc, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative grid grid-cols-1 lg:grid-cols-12 items-center py-12 border-b border-[#1A1A1A]/10 cursor-pointer transition-all duration-700 hover:px-8"
    >
      {/* CINEMATIC FLOATING IMAGE */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute right-[20%] top-[-50%] w-56 h-72 z-20 pointer-events-none overflow-hidden hidden lg:block shadow-2xl"
          >
            <img
              src={doc.image}
              alt={doc.name}
              className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 border-[12px] border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="col-span-1 text-[10px] font-mono opacity-20 group-hover:opacity-100 group-hover:text-[#8DAA9D] transition-all">
        [{doc.id || `0${index + 1}`}]
      </div>

      <div className="col-span-5 relative z-10">
        <h2 className="text-4xl md:text-6xl font-light tracking-tighter uppercase leading-none group-hover:pl-4 transition-all duration-500">
          {doc.name}
        </h2>
        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
          <Crosshair size={10} className="text-[#8DAA9D]" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#8DAA9D]">
            {doc.clinic}
          </span>
        </div>
      </div>

      <div className="col-span-4 mt-8 lg:mt-0 relative z-10">
        <p className="text-[9px] uppercase tracking-[0.4em] font-bold opacity-30 mb-2">
          Technical Domain
        </p>
        <p className="text-lg md:text-xl font-medium tracking-tight group-hover:text-[#8DAA9D] transition-colors">
          {doc.specialty}
        </p>
      </div>

      <div className="col-span-2 flex justify-end relative z-10 mt-8 lg:mt-0">
        <div className="w-16 h-16 border border-[#1A1A1A]/10 rounded-full flex items-center justify-center transition-all duration-700 group-hover:bg-[#1A1A1A] group-hover:rotate-45">
          <ArrowUpRight
            size={24}
            className="group-hover:text-white transition-colors"
            strokeWidth={1}
          />
        </div>
      </div>
    </motion.div>
  );
};

// --- COMPONENT: LOADING STATE ---
const DirectoryLoader = () => (
  <div className="h-screen w-full bg-[#FBFBF9] flex flex-col items-center justify-center gap-6">
    <div className="w-12 h-[1px] bg-[#1A1A1A]/20 relative overflow-hidden">
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="absolute inset-0 bg-[#8DAA9D]"
      />
    </div>
    <span className="text-[9px] uppercase tracking-[0.5em] font-bold opacity-30">
      Decrypting Faculty Archive
    </span>
  </div>
);

export default GlobalDirectory;
