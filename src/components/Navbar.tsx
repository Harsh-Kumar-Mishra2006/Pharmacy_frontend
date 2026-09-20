// src/components/Navbar.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaPlus,
  FaTimes,
  FaPills,
  FaTachometerAlt,
  FaCapsules,
  FaShoppingCart,
  FaExclamationCircle,
} from "react-icons/fa";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  // Role-based links
  const getRoleLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case "admin":
        return [
          {
            path: "/medicines",
            label: "Medicines",
            icon: <FaCapsules />,
          },
          {
            path: "/admin/medicines/approval",
            label: "Approval",
            icon: <FaExclamationCircle />,
          },
          { path: "/admin/users", label: "Users", icon: <FaUser /> },
        ];
      case "supplier":
        return [
          {
            path: "/medicines",
            label: "Medicines",
            icon: <FaCapsules />,
          },
          {
            path: "/supplier/dashboard",
            label: "Dashboard",
            icon: <FaTachometerAlt />,
          },
          {
            path: "/supplier/medicines",
            label: "My Medicines",
            icon: <FaCapsules />,
          },
          {
            path: "/supplier/medicines/add",
            label: "Add Medicine",
            icon: <FaPlus />,
          },
        ];
      case "user":
        return [
          {
            path: "/medicines",
            label: "Medicines",
            icon: <FaCapsules />,
          },
        ];
      default:
        return [
          { path: "/my-orders", label: "My Orders", icon: <FaShoppingCart /> },
        ];
    }
  };

  const roleLinks = getRoleLinks();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isOpen
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold group"
          >
            <div className="relative">
              <FaPills className="text-3xl text-light-orange animate-pulse-slow" />
              <div className="absolute -inset-1 bg-gradient-to-r from-light-orange via-pink to-sky-blue rounded-full opacity-20 blur-md group-hover:opacity-40 transition-opacity"></div>
            </div>
            <span className="bg-gradient-to-r from-light-orange via-pink to-sky-blue bg-clip-text text-transparent">
              OurPharma
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors relative group ${
                  location.pathname === link.path
                    ? "text-light-orange"
                    : "text-gray-700 hover:text-light-orange"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-light-orange to-pink transition-all ${
                    location.pathname === link.path
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
            ))}

            {/* Role-based links */}
            {user &&
              roleLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 font-medium transition-colors ${
                    location.pathname === link.path
                      ? "text-light-orange"
                      : "text-gray-700 hover:text-light-orange"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-light-orange to-pink text-white hover:shadow-lg transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name?.split(" ")[0]}</span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <span className="mt-1 inline-block px-2 py-0.5 bg-light-orange/10 text-light-orange rounded-full text-xs font-semibold capitalize">
                        {user.role}
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser className="text-gray-400" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-red-50 transition-colors text-red-500"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-6 py-2 rounded-full border-2 border-light-orange text-light-orange hover:bg-light-orange hover:text-white transition-all font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-light-orange to-pink text-white hover:shadow-lg transition-all font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 space-y-2 border-t border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-light-orange/10 text-light-orange"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {user && roleLinks.length > 0 && (
              <>
                <div className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {user.role === "admin"
                    ? "Admin"
                    : user.role === "supplier"
                      ? "Supplier"
                      : "My Account"}
                </div>
                {roleLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                      location.pathname === link.path
                        ? "bg-light-orange/10 text-light-orange"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 font-medium transition-colors"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-3 pt-4 px-4">
                <Link
                  to="/login"
                  className="block w-full text-center px-6 py-3 rounded-full border-2 border-light-orange text-light-orange hover:bg-light-orange hover:text-white transition-all font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-6 py-3 rounded-full bg-gradient-to-r from-light-orange to-pink text-white hover:shadow-lg transition-all font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
