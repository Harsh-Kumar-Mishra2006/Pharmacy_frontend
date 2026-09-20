// src/pages/About.tsx
import React from "react";
import { FaTrophy, FaUsers, FaGlobe, FaHeart } from "react-icons/fa";

const About: React.FC = () => {
  const stats = [
    { icon: FaTrophy, label: "Awards", value: "15+" },
    { icon: FaUsers, label: "Customers", value: "10K+" },
    { icon: FaGlobe, label: "Cities", value: "50+" },
    { icon: FaHeart, label: "Satisfaction", value: "98%" },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-light-orange/20 via-pink/20 to-sky-blue/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">About Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn more about OurPharma and our commitment to healthcare
            excellence.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-lg card-hover"
              >
                <stat.icon className="text-4xl text-light-orange mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-800">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed">
                To provide accessible, affordable, and quality healthcare
                services to everyone, leveraging technology to make pharmacy
                services convenient and reliable.
              </p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Our Vision
              </h2>
              <p className="text-gray-600 leading-relaxed">
                To become the most trusted pharmacy partner globally, setting
                new standards in healthcare delivery and patient care
                excellence.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
