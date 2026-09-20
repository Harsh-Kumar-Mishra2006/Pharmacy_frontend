// src/sections/Hero.tsx (Alternative with background image)
import React from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaTruck, FaHeartbeat } from "react-icons/fa";
import heroImage from "../assets/HeroImage.jpeg";

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden pt-20">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`, // Adjust path
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      </div>

      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-light-orange/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-blue/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span className="w-2 h-2 bg-emerald rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">
                Trusted by 10,000+ customers
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-gray-800">Your Health,</span>
              <br />
              <span className="bg-gradient-to-r from-light-orange via-pink to-sky-blue bg-clip-text text-transparent animate-gradient bg-[length:200%]">
                Our Priority
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-lg">
              Get authentic medicines delivered to your doorstep with expert
              guidance and care. Your trusted pharmacy partner.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="btn-primary flex items-center gap-2"
              >
                Get Started
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                to="/about"
                className="btn-secondary flex items-center gap-2"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-light-orange">10K+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-3xl font-bold text-pink">500+</div>
                <div className="text-sm text-gray-600">Medicine Brands</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-blue">98%</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image with Floating Icons */}
          <div className="relative animate-float">
            <div className="relative">
              {/* Main Image */}
              <div className="aspect-square rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl">
                <img
                  src={heroImage} // Adjust path
                  alt="OurPharma - Your Trusted Pharmacy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Icon Cards */}
              <div
                className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald/20 rounded-full flex items-center justify-center">
                    <FaTruck className="text-emerald text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold">Free Delivery</div>
                    <div className="text-sm text-gray-500">Within 24hrs</div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 animate-float"
                style={{ animationDelay: "2s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink/20 rounded-full flex items-center justify-center">
                    <FaShieldAlt className="text-pink text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold">100% Genuine</div>
                    <div className="text-sm text-gray-500">FDA Approved</div>
                  </div>
                </div>
              </div>

              <div
                className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-white rounded-xl shadow-xl p-4 animate-float"
                style={{ animationDelay: "3s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sky-blue/20 rounded-full flex items-center justify-center">
                    <FaHeartbeat className="text-sky-blue text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold">24/7 Support</div>
                    <div className="text-sm text-gray-500">
                      Always Available
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 60L60 70C120 80 240 100 360 95C480 90 600 60 720 55C840 50 960 70 1080 75C1200 80 1320 70 1380 65L1440 60V120H0V60Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
