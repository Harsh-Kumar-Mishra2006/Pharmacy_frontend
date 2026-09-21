// src/pages/supplier/SupplierCatalog.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMedicine } from "../../contexts/MedicineContext";
import {
  FaSearch,
  FaFilter,
  FaCapsules,
  FaSync,
  FaTruck,
} from "react-icons/fa";

const SupplierCatalog: React.FC = () => {
  const { medicines, isLoading, getMedicines } = useMedicine();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    getMedicines({ limit: 200 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const s = new Set(medicines.map((m) => m.category));
    return Array.from(s).sort();
  }, [medicines]);

  const filtered = useMemo(() => {
    let r = [...medicines];
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      r = r.filter(
        (m) =>
          m.name.toLowerCase().includes(s) ||
          m.generic_name?.toLowerCase().includes(s) ||
          m.category.toLowerCase().includes(s),
      );
    }
    if (categoryFilter !== "all")
      r = r.filter((m) => m.category === categoryFilter);
    return r;
  }, [medicines, searchTerm, categoryFilter]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Medicine Catalog
            </h1>
            <p className="text-gray-600 mt-1">
              Browse available medicines and send stock to the admin.
            </p>
          </div>
          <button
            onClick={() => getMedicines({ limit: 200 })}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            <FaSync className={isLoading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicines..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading && medicines.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-orange mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading catalog...</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCapsules className="text-3xl text-light-orange" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No medicines in catalog
            </h3>
            <p className="text-gray-500">
              Check back once the admin adds medicines.
            </p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gradient-to-br from-light-orange/10 to-pink/10 relative">
                  {m.images?.[0] ? (
                    <img
                      src={m.images[0]}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaCapsules className="text-5xl text-light-orange/30" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-lg truncate">
                    {m.name}
                  </h3>
                  {m.generic_name && (
                    <p className="text-sm text-gray-500 truncate">
                      {m.generic_name}
                    </p>
                  )}
                  <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {m.category}
                  </span>
                  <p className="text-xs text-gray-500 mt-3">
                    Strength: {m.other_details?.strength || "N/A"} • Form:{" "}
                    {m.other_details?.form || "N/A"}
                  </p>
                  <Link
                    to={`/supplier/supplies/create?medicineId=${m.id}`}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 btn-primary"
                  >
                    <FaTruck /> Supply This
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierCatalog;
