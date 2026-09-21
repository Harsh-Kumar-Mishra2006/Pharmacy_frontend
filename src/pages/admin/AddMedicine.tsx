// src/pages/admin/AddMedicine.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMedicine } from "../../contexts/MedicineContext";
import {
  FaPills,
  FaTag,
  FaImage,
  FaInfoCircle,
  FaExclamationCircle,
  FaCheck,
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaFlask,
} from "react-icons/fa";
import { type MedicineForm } from "../../types";

interface FormData {
  name: string;
  generic_name: string;
  brand_name: string;
  category: string;
  images: string[];
  description: string;
  form: MedicineForm | "";
  strength: string;
  pack_size: string;
  unit: string;
  composition: string[];
  usage: string;
  dosage: string;
  storage: string;
  manufacturer: string;
  country_of_origin: string;
  is_prescription_required: boolean;
  cold_chain_required: boolean;
  hazardous: boolean;
}

const CATEGORIES = [
  "Analgesic",
  "Antibiotic",
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

const FORMS = [
  "tablet",
  "capsule",
  "syrup",
  "injection",
  "ointment",
  "cream",
  "liquid",
  "powder",
  "drops",
  "inhaler",
  "other",
];

const AddMedicine: React.FC = () => {
  const navigate = useNavigate();
  const { createMedicine, isLoading } = useMedicine();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    generic_name: "",
    brand_name: "",
    category: "",
    images: [],
    description: "",
    form: "",
    strength: "",
    pack_size: "",
    unit: "pcs",
    composition: [],
    usage: "",
    dosage: "",
    storage: "",
    manufacturer: "",
    country_of_origin: "",
    is_prescription_required: false,
    cold_chain_required: false,
    hazardous: false,
  });

  const [compositionInput, setCompositionInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<
    "basic" | "details" | "medical"
  >("basic");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addComposition = () => {
    if (compositionInput.trim()) {
      setFormData((p) => ({
        ...p,
        composition: [...p.composition, compositionInput.trim()],
      }));
      setCompositionInput("");
    }
  };
  const removeComposition = (i: number) =>
    setFormData((p) => ({
      ...p,
      composition: p.composition.filter((_, idx) => idx !== i),
    }));

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData((p) => ({ ...p, images: [...p.images, imageInput.trim()] }));
      setImageInput("");
    }
  };
  const removeImage = (i: number) =>
    setFormData((p) => ({
      ...p,
      images: p.images.filter((_, idx) => idx !== i),
    }));

  const validate = (): string | null => {
    if (!formData.name || formData.name.trim().length < 2)
      return "Medicine name is required (min 2 characters)";
    if (!formData.category) return "Category is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const err = validate();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }
    try {
      await createMedicine({
        name: formData.name.trim(),
        generic_name: formData.generic_name.trim() || undefined,
        brand_name: formData.brand_name.trim() || undefined,
        category: formData.category,
        images: formData.images,
        other_details: {
          description: formData.description || undefined,
          form: formData.form || undefined,
          strength: formData.strength || undefined,
          pack_size: formData.pack_size || undefined,
          unit: formData.unit || undefined,
          composition: formData.composition,
        },
        medical_details: {
          usage: formData.usage || undefined,
          dosage: formData.dosage || undefined,
          storage: formData.storage || undefined,
          manufacturer: formData.manufacturer || undefined,
          country_of_origin: formData.country_of_origin || undefined,
        },
        metadata: {
          is_prescription_required: formData.is_prescription_required,
          is_controlled_substance: false,
          cold_chain_required: formData.cold_chain_required,
          hazardous: formData.hazardous,
          requires_medical_approval: false,
          reviews_count: 0,
        },
      });
      setMessage({
        type: "success",
        text: "Medicine added to catalog successfully!",
      });
      setTimeout(() => navigate("/admin/medicines"), 1200);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to add medicine",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const sections = [
    { id: "basic", label: "Basic Info", icon: <FaPills /> },
    { id: "details", label: "Product Details", icon: <FaTag /> },
    { id: "medical", label: "Medical Info", icon: <FaInfoCircle /> },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/medicines")}
            className="flex items-center gap-2 text-gray-600 hover:text-light-orange transition-colors mb-4"
          >
            <FaArrowLeft /> Back to Catalog
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-light-orange to-pink rounded-xl flex items-center justify-center text-white text-xl">
              <FaPlus />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Add New Medicine
              </h1>
              <p className="text-gray-600">
                Create the catalog entry. Suppliers will supply stock
                separately.
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
              <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <p
              className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-700"}`}
            >
              {message.text}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeSection === s.id
                    ? "text-light-orange border-b-2 border-light-orange bg-light-orange/5"
                    : "text-gray-600 hover:text-light-orange hover:bg-gray-50"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {activeSection === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                    placeholder="e.g., Paracetamol 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    name="generic_name"
                    value={formData.generic_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                    placeholder="e.g., Acetaminophen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    name="brand_name"
                    value={formData.brand_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                    placeholder="e.g., Tylenol"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeSection === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                    placeholder="Brief description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form
                  </label>
                  <select
                    name="form"
                    value={formData.form}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  >
                    <option value="">Select form</option>
                    {FORMS.map((f) => (
                      <option key={f} value={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strength
                  </label>
                  <input
                    type="text"
                    name="strength"
                    value={formData.strength}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pack Size
                  </label>
                  <input
                    type="text"
                    name="pack_size"
                    value={formData.pack_size}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                    placeholder="e.g., 10 tablets per strip"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  >
                    <option value="pcs">Pieces</option>
                    <option value="box">Box</option>
                    <option value="bottle">Bottle</option>
                    <option value="strip">Strip</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Composition
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={compositionInput}
                      onChange={(e) => setCompositionInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addComposition())
                      }
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                      placeholder="e.g., Paracetamol 500mg"
                    />
                    <button
                      type="button"
                      onClick={addComposition}
                      className="px-6 py-3 bg-light-orange text-white rounded-lg hover:bg-pink"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  {formData.composition.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.composition.map((c, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-light-orange/10 text-light-orange rounded-full text-sm"
                        >
                          {c}
                          <button
                            type="button"
                            onClick={() => removeComposition(i)}
                            className="hover:text-red-500"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URLs
                  </label>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addImage())
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-6 py-3 bg-light-orange text-white rounded-lg hover:bg-pink"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.images.map((url, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={url}
                            alt=""
                            className="w-full h-24 object-cover rounded-lg border"
                            onError={(e) =>
                              ((e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/150?text=Invalid")
                            }
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
              </div>
            )}

            {activeSection === "medical" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage
                  </label>
                  <textarea
                    name="usage"
                    value={formData.usage}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                    placeholder="How to use this medicine..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage
                  </label>
                  <textarea
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                    placeholder="e.g., 1 tablet every 6 hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage
                  </label>
                  <input
                    type="text"
                    name="storage"
                    value={formData.storage}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                    placeholder="e.g., Store below 25°C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                    placeholder="e.g., ABC Pharma Ltd."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    name="country_of_origin"
                    value={formData.country_of_origin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                    placeholder="e.g., India"
                  />
                </div>
                <div className="md:col-span-2 space-y-3 pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaFlask className="text-light-orange" /> Special Handling
                  </h3>
                  {(
                    [
                      [
                        "is_prescription_required",
                        "Prescription Required",
                        "Customers must have a valid prescription",
                      ],
                      [
                        "cold_chain_required",
                        "Cold Chain Required",
                        "Must be stored and transported at low temperatures",
                      ],
                      [
                        "hazardous",
                        "Hazardous",
                        "Requires special handling and disposal",
                      ],
                    ] as const
                  ).map(([name, label, hint]) => (
                    <label
                      key={name}
                      className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        name={name}
                        checked={(formData as any)[name]}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-300 text-light-orange focus:ring-light-orange"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{label}</p>
                        <p className="text-sm text-gray-500">{hint}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <div className="flex gap-2">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSection(s.id)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeSection === s.id
                        ? "bg-light-orange w-8"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/medicines")}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50 min-w-[150px]"
                >
                  {isLoading ? "Adding..." : "Add Medicine"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedicine;
