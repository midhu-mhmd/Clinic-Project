import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ClinicCard } from './ClinicCard.jsx';
import { useNavigate } from 'react-router-dom';

/* ===============================
   STATIC CLINICS (TEST DATA)
================================ */
const STATIC_CLINICS = [
  {
    id: 1,
    name: "Apollo Health Center",
    rating: 4.8,
    location: "Kochi, Kerala",
    image: "/images/clinic1.jpg",
    specialties: [
      { id: 1, name: "Cardiology" },
      { id: 2, name: "General Medicine" }
    ]
  },
  {
    id: 2,
    name: "Lakeshore Hospital",
    rating: 4.6,
    location: "Ernakulam",
    image: "/images/clinic2.jpg",
    specialties: [
      { id: 3, name: "Orthopedics" },
      { id: 4, name: "Neurology" }
    ]
  },
  {
    id: 3,
    name: "Aster Medcity",
    rating: 4.9,
    location: "Kochi",
    image: "/images/clinic3.jpg",
    specialties: [
      { id: 5, name: "Pediatrics" },
      { id: 6, name: "Dermatology" }
    ]
  },
  {
    id: 4,
    name: "Care Clinic",
    rating: 4.4,
    location: "Trivandrum",
    image: "/images/clinic4.jpg",
    specialties: [
      { id: 7, name: "ENT" },
      { id: 8, name: "Dental" }
    ]
  }
];

function TopClinics() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     MOCK FETCH (TEST MODE)
  ================================ */
  useEffect(() => {
    // simulate API delay
    setTimeout(() => {
      setClinics(STATIC_CLINICS);
      setLoading(false);
    }, 1200);
  }, []);

  return (
    <section className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-8 py-16 md:py-24">

        {/* HEADER */}
        <header className="mb-20 border-b pb-12 border-black/10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-extralight tracking-tight text-black">
                Explore Top Clinics
              </h1>
              <p className="mt-4 text-neutral-500 font-light">
                Highly rated healthcare facilities near you.
              </p>
            </div>

            <button onClick={() => navigate('/clinics')} className="hidden md:flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-6 animate-pulse">
                <div className="aspect-[4/3] bg-neutral-200 rounded-xl" />
                <div className="space-y-3">
                  <div className="h-5 bg-neutral-200 w-3/4 rounded" />
                  <div className="h-6 bg-neutral-200 w-full rounded" />
                  <div className="h-10 bg-neutral-200 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {clinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        )}

        {/* MOBILE CTA */}
        <div className="mt-24 pt-16 border-t border-black/10 text-center md:hidden">
          <button className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition">
            View All Clinics
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}

export default TopClinics;


