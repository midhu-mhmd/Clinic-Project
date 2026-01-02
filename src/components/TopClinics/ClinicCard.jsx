import { Star } from 'lucide-react';


export function ClinicCard({ clinic }) {
  return (
    <article className="group">
      <div className="relative aspect-4/3 bg-neutral-200 overflow-hidden mb-6">
        {clinic.image_url && (
          <img
            src={clinic.image_url}
            alt={clinic.name}
            className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
          />
        )}
        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-light backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 fill-current text-yellow-400" />
          <span className="tracking-tight">{clinic.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-light tracking-tight text-black mb-3">
            {clinic.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {clinic.specialties.map((specialty) => (
              <span
                key={specialty.id}
                className="text-xs font-normal tracking-wide text-neutral-600 px-3 py-1.5 border border-neutral-200 rounded-full"
              >
                {specialty.name}
              </span>
            ))}
          </div>
        </div>

        <button className="w-full py-3.5 text-sm font-normal tracking-wide text-black border border-neutral-300 rounded-none transition-all duration-300 hover:bg-black hover:text-white hover:border-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-4">
          Book Now
        </button>
      </div>
    </article>
  );
}