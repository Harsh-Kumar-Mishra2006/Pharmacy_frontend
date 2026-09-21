// src/pages/supplier/CreateSupply.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMedicine } from "../../contexts/MedicineContext";
import { useSupply } from "../../contexts/SupplyContext";
import {
  FaTruck,
  FaBoxes,
  FaDollarSign,
  FaCalendarAlt,
  FaArrowLeft,
  FaCheck,
  FaExclamationCircle,
  FaCapsules,
} from "react-icons/fa";

const CreateSupply: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preMedId = params.get("medicineId") || "";

  const {
    medicines,
    getMedicines,
    isLoading: loadingMedicines,
  } = useMedicine();
  const { createSupply, isLoading } = useSupply();

  const [medicineId, setMedicineId] = useState(preMedId);
  const [quantity, setQuantity] = useState<number>(100);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (medicines.length === 0) getMedicines({ limit: 200 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedMed = medicines.find((m) => m.id === medicineId);
  const total = Number(quantity) * Number(unitPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!medicineId)
      return setMessage({ type: "error", text: "Please select a medicine" });
    if (quantity <= 0)
      return setMessage({
        type: "error",
        text: "Quantity must be greater than 0",
      });
    if (unitPrice <= 0)
      return setMessage({
        type: "error",
        text: "Unit price must be greater than 0",
      });

    try {
      await createSupply({
        medicine_id: medicineId,
        quantity,
        unit_price: unitPrice,
        notes: notes.trim() || undefined,
        expiry_date: expiryDate || undefined,
      });
      setMessage({
        type: "success",
        text: "Supply submitted! Pending admin approval.",
      });
      setTimeout(() => navigate("/supplier/supplies"), 1200);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to submit supply",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <button
            onClick={() => navigate("/supplier/catalog")}
            className="flex items-center gap-2 text-gray-600 hover:text-light-orange transition-colors mb-4"
          >
            <FaArrowLeft /> Back to Catalog
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-light-orange to-pink rounded-xl flex items-center justify-center text-white text-xl">
              <FaTruck />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Supply Medicine
              </h1>
              <p className="text-gray-600">
                Send stock to the admin. They'll approve it before it goes live.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <FaCheck className="text-green-500 mt-0.5" />
            ) : (
              <FaExclamationCircle className="text-red-500 mt-0.5" />
            )}
            <p
              className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-700"}`}
            >
              {message.text}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicine <span className="text-red-500">*</span>
            </label>
            <select
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              required
              disabled={loadingMedicines}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
            >
              <option value="">Select a medicine from catalog</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}{" "}
                  {m.other_details?.strength
                    ? `• ${m.other_details.strength}`
                    : ""}{" "}
                  — {m.category}
                </option>
              ))}
            </select>
          </div>

          {selectedMed && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0">
                {selectedMed.images?.[0] ? (
                  <img
                    src={selectedMed.images[0]}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <FaCapsules className="text-2xl text-light-orange/40" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {selectedMed.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedMed.category} •{" "}
                  {selectedMed.other_details?.form || "N/A"}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaBoxes className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  required
                  min={1}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) =>
                    setUnitPrice(parseFloat(e.target.value) || 0)
                  }
                  required
                  min={0}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date (Optional)
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes for Admin
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                placeholder="Any special notes about this supply..."
              />
            </div>
          </div>

          <div className="p-4 bg-light-orange/5 border border-light-orange/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Value</span>
              <span className="text-2xl font-bold text-light-orange">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/supplier/catalog")}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Supply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupply;
