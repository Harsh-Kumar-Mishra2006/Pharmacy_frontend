// src/pages/admin/AddMedicineStock.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddMedicine } from "../../contexts/AddMedicineContext";
import {
  FaPills,
  FaBoxes,
  FaClipboardList,
  FaCheck,
  FaExclamationCircle,
  FaTrash,
  FaArrowLeft,
  FaFlask,
  FaWarehouse,
} from "react-icons/fa";
import { type CreateAddMedicineRequest } from "../../types";

type SectionId = "basic" | "stock" | "batch";

const TYPES = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Ointment",
  "Drops",
  "Cream",
  "Powder",
  "Other",
];

const GENRES = [
  "Antibiotic",
  "Analgesic",
  "Antiviral",
  "Antifungal",
  "Antihistamine",
  "Antiseptic",
  "Cardiovascular",
  "Dermatological",
  "Diabetes",
  "Gastrointestinal",
  "Respiratory",
  "Vitamin & Supplement",
  "Vaccine",
  "Other",
];

interface FormData {
  // Basic
  name: string;
  type: string;
  company: string;
  genre: string;
  strength: string;
  description: string;

  // Stock setup
  box_size: string;
  low_stock_threshold: string;

  // Initial batch (optional)
  initial_quantity: string;
  batch_number: string;
  expiry_date: string;
  supplier_name: string;
  unit_cost: string;
  notes: string;
}

const EMPTY: FormData = {
  name: "",
  type: "",
  company: "",
  genre: "",
  strength: "",
  description: "",
  box_size: "",
  low_stock_threshold: "10",
  initial_quantity: "",
  batch_number: "",
  expiry_date: "",
  supplier_name: "",
  unit_cost: "",
  notes: "",
};

const AddMedicineStock: React.FC = () => {
  const navigate = useNavigate();
  const { addMedicine, isLoading } = useAddMedicine();

  const [form, setForm] = useState<FormData>(EMPTY);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [active, setActive] = useState<SectionId>("basic");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const change = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= 10 * 1024 * 1024);
    if (valid.length !== files.length) {
      setMessage({ type: "error", text: "Each image must be under 10 MB." });
    }
    setImageFiles((prev) => [...prev, ...valid].slice(0, 5));
  };

  const removeImage = (i: number) =>
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));

  // -------- Validation --------
  const basicValid =
    form.name.trim().length >= 2 &&
    form.type.trim().length > 0 &&
    form.company.trim().length > 0 &&
    form.genre.trim().length > 0;

  const stockValid = parseInt(form.box_size || "0", 10) >= 1;

  const initialQty = parseInt(form.initial_quantity || "0", 10);
  const initialTotal = initialQty > 0 ? initialQty : 0;

  const batchSectionValid = true; // optional

  const status: Record<SectionId, boolean> = {
    basic: basicValid,
    stock: stockValid,
    batch: batchSectionValid,
  };

  const canGo = (target: SectionId): boolean => {
    if (target === "basic") return true;
    if (target === "stock") return basicValid;
    if (target === "batch") return basicValid && stockValid;
    return false;
  };

  const go = (target: SectionId) => {
    if (!canGo(target)) {
      setMessage({
        type: "error",
        text:
          target === "stock"
            ? "Complete the Basic Info section first."
            : "Complete the Basic Info & Stock Setup first.",
      });
      return;
    }
    setMessage(null);
    setActive(target);
  };

  const canSubmit = basicValid && stockValid;

  const validate = (): string | null => {
    if (!form.name || form.name.trim().length < 2)
      return "Medicine name is required (min 2 characters)";
    if (!form.type) return "Type is required";
    if (!form.company) return "Company is required";
    if (!form.genre) return "Genre is required";
    if (!form.box_size || parseInt(form.box_size, 10) < 1)
      return "Box size must be at least 1";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const err = validate();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }

    const payload: CreateAddMedicineRequest = {
      name: form.name.trim(),
      type: form.type,
      company: form.company.trim(),
      genre: form.genre,
      strength: form.strength.trim() || undefined,
      description: form.description.trim() || undefined,
      box_size: parseInt(form.box_size, 10),
      low_stock_threshold: parseInt(form.low_stock_threshold, 10) || 10,
      initial_quantity: initialQty > 0 ? initialQty : undefined,
      batch_number: form.batch_number || undefined,
      expiry_date: form.expiry_date || undefined,
      supplier_name: form.supplier_name || undefined,
      unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : undefined,
      notes: form.notes || undefined,
      images: imageFiles.length > 0 ? imageFiles : undefined,
    };

    try {
      await addMedicine(payload);
      setMessage({ type: "success", text: "Medicine added successfully!" });
      setTimeout(() => navigate("/admin/stock"), 1000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to add medicine",
      });
    }
  };

  const sections = [
    { id: "basic", label: "Basic Info", icon: <FaPills /> },
    { id: "stock", label: "Stock Setup", icon: <FaBoxes /> },
    {
      id: "batch",
      label: "Initial Batch (Optional)",
      icon: <FaClipboardList />,
    },
  ] as const;

  const completedCount = [basicValid, stockValid, batchSectionValid].filter(
    Boolean,
  ).length;
  const progress = Math.round((completedCount / 3) * 100);

  const previewBoxes = useMemo(() => {
    const boxSize = parseInt(form.box_size || "0", 10);
    if (initialQty > 0 && boxSize > 0) {
      return Math.floor(initialQty / boxSize);
    }
    return 0;
  }, [initialQty, form.box_size]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/stock")}
            className="flex items-center gap-2 text-gray-600 hover:text-light-orange transition-colors mb-4"
          >
            <FaArrowLeft /> Back to Stock
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-light-orange to-pink rounded-xl flex items-center justify-center text-white text-xl">
              <FaWarehouse />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Add Medicine & Stock
              </h1>
              <p className="text-gray-600">
                Register a medicine and optionally add the first stock batch.
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Setup Progress
            </span>
            <span className="text-sm font-semibold text-light-orange">
              {completedCount}/3 sections
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-light-orange to-pink transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Message */}
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
              className={`text-sm ${
                message.type === "success" ? "text-green-700" : "text-red-700"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100">
            {sections.map((s) => {
              const done = status[s.id];
              const locked = !canGo(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(s.id)}
                  disabled={locked}
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                    active === s.id
                      ? "text-light-orange border-b-2 border-light-orange bg-light-orange/5"
                      : locked
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:text-light-orange hover:bg-gray-50"
                  }`}
                >
                  {done ? <FaCheck className="text-green-500" /> : s.icon}
                  {s.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="p-8">
            {/* ---------- BASIC ---------- */}
            {active === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={change}
                    required
                    minLength={2}
                    maxLength={200}
                    placeholder="e.g., Paracetamol 500mg"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={change}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  >
                    <option value="">Select type</option>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={change}
                    required
                    placeholder="e.g., Cipla Ltd."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="genre"
                    value={form.genre}
                    onChange={change}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  >
                    <option value="">Select genre</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strength
                  </label>
                  <input
                    name="strength"
                    value={form.strength}
                    onChange={change}
                    placeholder="e.g., 500mg"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={change}
                    rows={3}
                    placeholder="Brief description of the medicine…"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => go("stock")}
                    disabled={!basicValid}
                    className="btn-primary disabled:opacity-50"
                  >
                    Next: Stock Setup
                  </button>
                </div>
              </div>
            )}

            {/* ---------- STOCK ---------- */}
            {active === "stock" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units per Box <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    name="box_size"
                    value={form.box_size}
                    onChange={change}
                    required
                    placeholder="e.g., 10"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How many units come in one box/strip.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Alert At
                  </label>
                  <input
                    type="number"
                    min={0}
                    name="low_stock_threshold"
                    value={form.low_stock_threshold}
                    onChange={change}
                    placeholder="10"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Show warning when total units fall below this.
                  </p>
                </div>

                <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Stock is managed separately. You can
                    add a batch of stock now, or leave it empty and add stock
                    later from the Stock page.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Images (optional, max 5 × 10 MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImages}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                  {imageFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {imageFiles.map((file, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 flex justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => go("basic")}
                    className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => go("batch")}
                    disabled={!stockValid}
                    className="btn-primary disabled:opacity-50"
                  >
                    Next: Initial Batch
                  </button>
                </div>
              </div>
            )}

            {/* ---------- INITIAL BATCH ---------- */}
            {active === "batch" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <p className="text-sm text-amber-800 flex items-start gap-2">
                    <FaFlask className="mt-0.5" />
                    <span>
                      <strong>Optional.</strong> Fill these fields if you
                      already have stock on hand. Leave blank to add stock
                      later.
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units Received
                  </label>
                  <input
                    type="number"
                    min={0}
                    name="initial_quantity"
                    value={form.initial_quantity}
                    onChange={change}
                    placeholder="e.g., 100"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Number
                  </label>
                  <input
                    name="batch_number"
                    value={form.batch_number}
                    onChange={change}
                    placeholder="e.g., BT-2024-A1"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={form.expiry_date}
                    onChange={change}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name
                  </label>
                  <input
                    name="supplier_name"
                    value={form.supplier_name}
                    onChange={change}
                    placeholder="e.g., MedPlus Distributors"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    name="unit_cost"
                    value={form.unit_cost}
                    onChange={change}
                    placeholder="e.g., 2.50"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={change}
                    rows={2}
                    placeholder="Any additional info…"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                </div>

                {initialQty > 0 && (
                  <div className="md:col-span-2 bg-green-50 border border-green-200 p-4 rounded-xl">
                    <p className="text-sm text-green-800">
                      <strong>Total units to add:</strong> {initialTotal}
                      {previewBoxes > 0 && (
                        <span className="ml-2 text-green-700">
                          ≈ {previewBoxes} box{previewBoxes !== 1 ? "es" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div className="md:col-span-2 flex justify-start pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => go("stock")}
                    className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <div className="flex gap-2">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => go(s.id)}
                    disabled={!canGo(s.id)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      active === s.id
                        ? "bg-light-orange w-8"
                        : status[s.id]
                          ? "bg-green-400"
                          : "bg-gray-300"
                    } ${!canGo(s.id) ? "cursor-not-allowed opacity-50" : ""}`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/stock")}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                {active === "batch" && (
                  <button
                    type="submit"
                    disabled={isLoading || !canSubmit}
                    className="btn-primary disabled:opacity-50 min-w-[150px]"
                  >
                    {isLoading ? "Saving…" : "Add Medicine"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineStock;
