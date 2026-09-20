// src/pages/Home.tsx
import React from "react";
import Hero from "../sections/Hero";
import AboutSection from "../sections/AboutSection";
import ServicesSection from "../sections/ServicesSection";

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <AboutSection />
      <ServicesSection />
    </>
  );
};

export default Home;
