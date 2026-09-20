// src/sections/AboutSection.tsx
import React from "react";
import { FaShieldAlt, FaHands, FaClock, FaAward } from "react-icons/fa";

const AboutSection: React.FC = () => {
  const features = [
    {
      icon: FaShieldAlt,
      title: "Quality Assurance",
      description:
        "All medicines are verified and sourced from licensed manufacturers.",
      color: "text-light-orange",
    },
    {
      icon: FaHands,
      title: "Expert Care",
      description:
        "Our pharmacists provide personalized guidance for your health needs.",
      color: "text-pink",
    },
    {
      icon: FaClock,
      title: "Timely Delivery",
      description:
        "Fast and reliable delivery service to ensure you never miss a dose.",
      color: "text-emerald",
    },
    {
      icon: FaAward,
      title: "Trusted Since 2020",
      description:
        "Building trust through transparency and quality healthcare services.",
      color: "text-sky-blue",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">About OurPharma</h2>
          <p className="section-subtitle">
            We are committed to making healthcare accessible and affordable for
            everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-light-orange/30 via-pink/30 to-sky-blue/30 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl">🏥</span>
                  <p className="text-gray-600 mt-2">Your Health Partner</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-light-orange to-pink rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Making Healthcare{" "}
                <span className="bg-gradient-to-r from-light-orange to-pink bg-clip-text text-transparent">
                  Simple & Accessible
                </span>
              </h3>
              <p className="text-gray-600 leading-relaxed">
                OurPharma is a modern pharmacy platform that connects patients
                with authentic medicines and expert healthcare guidance. We
                believe that everyone deserves access to quality healthcare
                without any hassle.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl card-hover"
                >
                  <feature.icon className={`text-2xl ${feature.color} mb-2`} />
                  <h4 className="font-semibold text-gray-800">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
