import React from "react";
import HeroSection from "../components/hero/HeroSection.jsx";
import AiAssistantSection from "../components/aiExample/AiAssistantSection.jsx";
import WhyPatientsLoveUs from "../components/WhyPatientsLoveUs/WhyPatientsLoveUs.jsx";
import TopClinics from "../components/TopClinics/TopClinics.jsx";
import HowItWorks from "../components/HowItWorks/HowItWorks.jsx";
import SpecialistsSection from "../components/SpecialistsSection/SpecialistsSection.jsx";
import TrustShowcase from "../components/TrustShowcase/TrustShowcase.jsx";
import FinalCTA from "../components/FinalCTA/FinalCTA.jsx";

const Home = () => {
  return (
    <div className="bg-[#FAF9F6] overflow-hidden">
      <HeroSection />
      <AiAssistantSection />
      <WhyPatientsLoveUs />
      <TopClinics />
      <HowItWorks />
      <SpecialistsSection />
      <TrustShowcase />
      <FinalCTA />
    </div>
  );
};

export default Home;
