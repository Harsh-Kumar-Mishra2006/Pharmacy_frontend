// src/pages/Medicines.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMedicine } from "../contexts/MedicineContext";
import { useAuth } from "../contexts/AuthContext";
import {
  FaSearch,
  FaFilter,
  FaCapsules,
  FaShoppingCart,
  FaEye,
  FaTimes,
  FaCheck,
  FaExclamationCircle,
  FaBoxes,
} from "react-icons/fa";

const Medicines: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    medicines,
    isLoading,
    error,
    getMedicines,
    getMedicineById,
    clearError,
  } = useMedicine();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "name" | "price_asc" | "price_desc" | "newest"
  >("newest");
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);
  const [purchaseModal, setPurchaseModal] = useState<any | null>(null);
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadMedicines();
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

  const loadMedicines = async () => {
    clearError();
    await getMedicines({ status: "approved", limit: 100 });
  };

  const categories = useMemo(() => {
    const s = new Set(medicines.map((m) => m.category));
    return Array.from(s).sort();
  }, [medicines]);

  const filtered = useMemo(() => {
    let result = [...medicines];

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(s) ||
          m.generic_name?.toLowerCase().includes(s) ||
          m.brand_name?.toLowerCase().includes(s),
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((m) => m.category === categoryFilter);
    }

    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price_asc":
        result.sort((a, b) => Number(a.unit_price) - Number(b.unit_price));
        break;
      case "price_desc":
        result.sort((a, b) => Number(b.unit_price) - Number(a.unit_price));
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime(),
        );
    }

    return result;
  }, [medicines, searchTerm, categoryFilter, sortBy]);

  const handleBuyClick = (medicine: any) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/medicines" } } });
      return;
    }
    if (user?.role !== "user") {
      setMessage({
        type: "error",
        text: "Only customers can purchase medicines.",
      });
      return;
    }
    setPurchaseModal(medicine);
    setPurchaseQty(1);
  };

  const confirmPurchase = async () => {
    if (!purchaseModal) return;

    if (purchaseQty < 1 || purchaseQty > purchaseModal.quantity) {
      setMessage({
        type: "error",
        text: `Quantity must be between 1 and ${purchaseModal.quantity}`,
      });
      return;
    }

    // Navigate to a dedicated purchase page (to be created)
    navigate("/purchase/checkout", {
      state: {
        medicine: purchaseModal,
        quantity: purchaseQty,
      },
    });
  };

  const formatDate = (d?: string | Date | null) => {
    if (!d) return "N/A";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaCapsules className="text-light-orange" />
            Browse Medicines
          </h1>
          <p className="text-gray-600 mt-1">
            {filtered.length} {filtered.length === 1 ? "medicine" : "medicines"}{" "}
            available
          </p>
        </div>

        {/* Message */}
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
                <FaCheck className="text-green-500 mt-0.5" />
              ) : (
                <FaExclamationCircle className="text-red-500 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-700" : "text-red-700"
                }`}
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

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicines..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent appearance-none"
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

          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Sort by:</span>
            {(
              [
                { value: "newest", label: "Newest" },
                { value: "name", label: "Name" },
                { value: "price_asc", label: "Price ↑" },
                { value: "price_desc", label: "Price ↓" },
              ] as const
            ).map((o) => (
              <button
                key={o.value}
                onClick={() => setSortBy(o.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  sortBy === o.value
                    ? "bg-light-orange text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && medicines.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-orange mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading medicines...</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCapsules className="text-3xl text-light-orange" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No medicines found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((m) => {
              const outOfStock = m.quantity === 0;
              const lowStock =
                m.quantity > 0 && m.quantity <= m.min_quantity_alert;
              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="h-44 bg-gradient-to-br from-light-orange/10 to-pink/10 relative">
                    {m.images?.[0] ? (
                      <img
                        src={m.images[0]}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaCapsules className="text-6xl text-light-orange/30" />
                      </div>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {lowStock && !outOfStock && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">
                        Only {m.quantity} left
                      </span>
                    )}
                    {m.discount_percentage && m.discount_percentage > 0 && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                        {m.discount_percentage}% OFF
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-800 text-base line-clamp-2 mb-1">
                      {m.name}
                    </h3>
                    {m.generic_name && (
                      <p className="text-xs text-gray-500 truncate">
                        {m.generic_name}
                      </p>
                    )}
                    <span className="inline-block self-start mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {m.category}
                    </span>

                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        {m.discount_percentage && m.discount_percentage > 0 ? (
                          <>
                            <p className="text-lg font-bold text-light-orange">
                              $
                              {(
                                Number(m.unit_price) *
                                (1 - m.discount_percentage / 100)
                              ).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400 line-through">
                              ${Number(m.unit_price).toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-light-orange">
                            ${Number(m.unit_price).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                          <FaBoxes className="text-xs" />
                          {m.quantity} in stock
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Exp: {formatDate(m.expiry_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          getMedicineById(m.id);
                          setSelectedMedicine(m);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                      >
                        <FaEye className="text-xs" /> View
                      </button>
                      <button
                        onClick={() => handleBuyClick(m)}
                        disabled={outOfStock}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                          outOfStock
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-light-orange to-pink hover:shadow-lg"
                        }`}
                      >
                        <FaShoppingCart className="text-xs" />
                        {outOfStock ? "Sold Out" : "Buy"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedMedicine && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedicine(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Medicine Details
              </h2>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  {selectedMedicine.images?.[0] ? (
                    <img
                      src={selectedMedicine.images[0]}
                      alt={selectedMedicine.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <FaCapsules className="text-4xl text-light-orange" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedMedicine.name}
                  </h3>
                  {selectedMedicine.generic_name && (
                    <p className="text-gray-500">
                      {selectedMedicine.generic_name}
                    </p>
                  )}
                  {selectedMedicine.brand_name && (
                    <p className="text-sm text-gray-500">
                      Brand: {selectedMedicine.brand_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-light-orange/10 to-pink/10 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    {selectedMedicine.discount_percentage > 0 ? (
                      <>
                        <p className="text-3xl font-bold text-light-orange">
                          $
                          {(
                            Number(selectedMedicine.unit_price) *
                            (1 - selectedMedicine.discount_percentage / 100)
                          ).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          ${Number(selectedMedicine.unit_price).toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <p className="text-3xl font-bold text-light-orange">
                        ${Number(selectedMedicine.unit_price).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      In Stock:{" "}
                      <span className="font-bold">
                        {selectedMedicine.quantity}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Expires: {formatDate(selectedMedicine.expiry_date)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Category" value={selectedMedicine.category} />
                <DetailRow
                  label="Form"
                  value={selectedMedicine.other_details?.form || "N/A"}
                />
                <DetailRow
                  label="Strength"
                  value={selectedMedicine.other_details?.strength || "N/A"}
                />
                <DetailRow
                  label="Pack Size"
                  value={selectedMedicine.other_details?.pack_size || "N/A"}
                />
                <DetailRow
                  label="Supplier"
                  value={selectedMedicine.supplier?.name || "N/A"}
                />
                <DetailRow
                  label="Prescription"
                  value={
                    selectedMedicine.metadata?.is_prescription_required
                      ? "Required"
                      : "Not Required"
                  }
                />
              </div>

              {selectedMedicine.other_details?.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-800">
                    {selectedMedicine.other_details.description}
                  </p>
                </div>
              )}

              {selectedMedicine.medical_details?.usage && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Usage
                  </p>
                  <p className="text-sm text-gray-800">
                    {selectedMedicine.medical_details.usage}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
              <button
                onClick={() => setSelectedMedicine(null)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleBuyClick(selectedMedicine);
                  setSelectedMedicine(null);
                }}
                disabled={selectedMedicine.quantity === 0}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-2">
                  <FaShoppingCart /> Buy Now
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Quantity Modal */}
      {purchaseModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPurchaseModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Purchase
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Medicine</p>
              <p className="font-semibold text-gray-800">
                {purchaseModal.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Price: ₹{Number(purchaseModal.unit_price).toFixed(2)} each
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={purchaseQty}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow empty string while typing, otherwise parse
                  setPurchaseQty(val === "" ? 0 : parseInt(val, 10));
                }}
                className={`w-full px-4 py-3 rounded-lg border text-lg font-semibold focus:ring-2 focus:border-transparent ${
                  purchaseQty > purchaseModal.quantity || purchaseQty < 1
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-light-orange"
                }`}
                placeholder="Enter quantity"
              />

              {/* Inline validation message */}
              {purchaseQty > purchaseModal.quantity && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <FaExclamationCircle className="text-xs" />
                  Maximum available quantity is {purchaseModal.quantity}
                </p>
              )}
              {purchaseQty < 1 && purchaseQty !== 0 && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <FaExclamationCircle className="text-xs" />
                  Quantity must be at least 1
                </p>
              )}
              {purchaseQty >= 1 && purchaseQty <= purchaseModal.quantity && (
                <p className="text-xs text-gray-500 mt-1">
                  Available: {purchaseModal.quantity}
                </p>
              )}
            </div>

            <div className="p-3 bg-light-orange/10 rounded-lg mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-light-orange text-lg">
                  ${(Number(purchaseModal.unit_price) * purchaseQty).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPurchaseModal(null)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button onClick={confirmPurchase} className="flex-1 btn-primary">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-800 text-sm">{value}</p>
  </div>
);

export default Medicines;
