// src/sections/TestimonialsSection.tsx
import React, { useState } from "react";
import {
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
} from "react-icons/fa";

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular Customer",
      content:
        "OurPharma has been a lifesaver for my family. The delivery is always on time, and the medicines are always genuine. Their customer service is exceptional!",
      rating: 5,
      avatar: "👩",
    },
    {
      name: "Dr. Michael Chen",
      role: "Healthcare Professional",
      content:
        "I recommend OurPharma to all my patients. Their commitment to quality and patient care is unmatched. A reliable partner in healthcare.",
      rating: 5,
      avatar: "👨",
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Since 2021",
      content:
        "The convenience of having medicines delivered to my door with proper guidance is amazing. The pharmacists are knowledgeable and caring.",
      rating: 5,
      avatar: "👩",
    },
    {
      name: "David Kim",
      role: "Business Professional",
      content:
        "Managing my family's prescriptions has never been easier. OurPharma's app is user-friendly and their service is top-notch.",
      rating: 5,
      avatar: "👨",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-pink/10 text-pink rounded-full text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">
            Real stories from real people who trust OurPharma for their health
            needs.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="bg-gradient-to-br from-light-orange/5 via-pink/5 to-sky-blue/5 rounded-3xl p-8 md:p-12">
            <FaQuoteLeft className="text-4xl text-light-orange/30 mb-6" />

            <div className="flex flex-col items-center text-center">
              <div className="text-6xl mb-4">
                {testimonials[currentIndex].avatar}
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>

              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                "{testimonials[currentIndex].content}"
              </p>

              <div>
                <p className="font-bold text-gray-800">
                  {testimonials[currentIndex].name}
                </p>
                <p className="text-gray-500 text-sm">
                  {testimonials[currentIndex].role}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all hover:scale-105"
              >
                <FaChevronLeft className="text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all hover:scale-105"
              >
                <FaChevronRight className="text-gray-600" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-gradient-to-r from-light-orange to-pink"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
