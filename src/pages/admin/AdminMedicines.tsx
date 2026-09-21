// src/pages/admin/AdminMedicines.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMedicine } from "../../contexts/MedicineContext";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaCapsules,
  FaEdit,
  FaTrash,
  FaEye,
  FaSync,
  FaTimes,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { type Medicine } from "../../types";

const AdminMedicines: React.FC = () => {
  const {
    medicines,
    isLoading,
    error,
    statistics,
    getMedicines,
    deleteMedicine,
    getStatistics,
    clearError,
  } = useMedicine();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selected, setSelected] = useState<Medicine | null>(null);
  const [deleteModal, setDeleteModal] = useState<Medicine | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    clearError();
    getMedicines({ limit: 100 });
    getStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) setMessage({ type: "error", text: error });
  }, [error]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

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
          m.brand_name?.toLowerCase().includes(s) ||
          m.category.toLowerCase().includes(s),
      );
    }
    if (categoryFilter !== "all")
      r = r.filter((m) => m.category === categoryFilter);
    return r;
  }, [medicines, searchTerm, categoryFilter]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setProcessing(true);
    try {
      await deleteMedicine(deleteModal.id);
      setMessage({ type: "success", text: "Medicine deleted" });
      setDeleteModal(null);
      await getMedicines({ limit: 100 });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Medicine Catalog
            </h1>
            <p className="text-gray-600 mt-1">
              Manage the medicines that suppliers can supply.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                getMedicines({ limit: 100 });
                getStatistics();
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} /> Refresh
            </button>
            <Link
              to="/admin/medicines/add"
              className="btn-primary inline-flex items-center gap-2"
            >
              <FaPlus /> Add Medicine
            </Link>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start justify-between ${
              message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {message.type === "success" ? (
                <FaCheckCircle className="text-green-500 mt-0.5" />
              ) : (
                <FaExclamationCircle className="text-red-500 mt-0.5" />
              )}
              <p
                className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-700"}`}
              >
                {message.text}
              </p>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-2xl font-bold text-gray-800">
                {statistics.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Medicines</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-2xl font-bold text-gray-800">
                {statistics.category_count}
              </p>
              <p className="text-xs text-gray-500 mt-1">Categories</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, generic, brand, or category..."
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
              No medicines yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by adding your first medicine to the catalog.
            </p>
            <Link
              to="/admin/medicines/add"
              className="btn-primary inline-flex items-center gap-2"
            >
              <FaPlus /> Add First Medicine
            </Link>
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
                      onError={(e) =>
                        ((e.target as HTMLImageElement).style.display = "none")
                      }
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
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelected(m)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
                    >
                      <FaEye className="text-xs" /> View
                    </button>
                    <Link
                      to={`/admin/medicines/edit/${m.id}`}
                      className="flex items-center justify-center px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      title="Edit"
                    >
                      <FaEdit className="text-xs" />
                    </Link>
                    <button
                      onClick={() => setDeleteModal(m)}
                      className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      title="Delete"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">
                Medicine Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  {selected.images?.[0] ? (
                    <img
                      src={selected.images[0]}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <FaCapsules className="text-3xl text-light-orange" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selected.name}
                  </h3>
                  {selected.generic_name && (
                    <p className="text-gray-500">{selected.generic_name}</p>
                  )}
                  <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {selected.category}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Detail label="Brand" value={selected.brand_name || "N/A"} />
                <Detail
                  label="Form"
                  value={selected.other_details?.form || "N/A"}
                />
                <Detail
                  label="Strength"
                  value={selected.other_details?.strength || "N/A"}
                />
                <Detail
                  label="Pack Size"
                  value={selected.other_details?.pack_size || "N/A"}
                />
                <Detail
                  label="Unit"
                  value={selected.other_details?.unit || "N/A"}
                />
                <Detail
                  label="Product Code"
                  value={selected.other_details?.product_code || "N/A"}
                />
              </div>
              {selected.other_details?.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-800">
                    {selected.other_details.description}
                  </p>
                </div>
              )}
              {selected.medical_details?.usage && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Usage
                  </p>
                  <p className="text-sm text-gray-800">
                    {selected.medical_details.usage}
                  </p>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <Link
                to={`/admin/medicines/edit/${selected.id}`}
                className="flex-1 btn-primary text-center"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-red-600 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Delete Medicine?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Delete <span className="font-semibold">"{deleteModal.name}"</span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={processing}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={processing}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium disabled:opacity-50"
              >
                {processing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-800 text-sm">{value}</p>
  </div>
);

export default AdminMedicines;
