// src/pages/supplier/AddMedicine.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMedicine } from "../../contexts/MedicineContext";
import {
  FaPills,
  FaTag,
  FaBoxes,
  FaDollarSign,
  FaCalendarAlt,
  FaImage,
  FaInfoCircle,
  FaExclamationCircle,
  FaCheck,
  FaPlus,
  FaTrash,
  FaArrowLeft,
} from "react-icons/fa";

import { type MedicineForm } from "../../types";

interface FormData {
  name: string;
  generic_name: string;
  brand_name: string;
  category: string;
  quantity: number;
  min_quantity_alert: number;
  max_quantity: number | "";
  unit_price: number;
  purchase_price: number | "";
  discount_percentage: number;
  expiry_date: string;
  images: string[];
  // Other details
  description: string;
  form: MedicineForm | "";
  strength: string;
  pack_size: string;
  unit: string;
  composition: string[];
  // Medical details
  usage: string;
  dosage: string;
  storage: string;
  manufacturer: string;
  country_of_origin: string;
  // Metadata
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
    quantity: 0,
    min_quantity_alert: 10,
    max_quantity: "",
    unit_price: 0,
    purchase_price: "",
    discount_percentage: 0,
    expiry_date: "",
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
    "basic" | "stock" | "details" | "medical"
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
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value === ""
              ? ""
              : parseFloat(value) || 0
            : value,
    }));
  };

  const handleAddComposition = () => {
    if (compositionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        composition: [...prev.composition, compositionInput.trim()],
      }));
      setCompositionInput("");
    }
  };

  const handleRemoveComposition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      composition: prev.composition.filter((_, i) => i !== index),
    }));
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageInput.trim()],
      }));
      setImageInput("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = (): string | null => {
    if (!formData.name || formData.name.trim().length < 2) {
      return "Medicine name is required (min 2 characters)";
    }
    if (!formData.category) {
      return "Category is required";
    }
    if (formData.quantity < 0) {
      return "Quantity cannot be negative";
    }
    if (formData.unit_price <= 0) {
      return "Unit price must be greater than 0";
    }
    if (
      formData.discount_percentage < 0 ||
      formData.discount_percentage > 100
    ) {
      return "Discount must be between 0 and 100";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const validationError = validate();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    try {
      await createMedicine({
        name: formData.name.trim(),
        generic_name: formData.generic_name.trim() || undefined,
        brand_name: formData.brand_name.trim() || undefined,
        category: formData.category,
        quantity: Number(formData.quantity),
        min_quantity_alert: Number(formData.min_quantity_alert),
        max_quantity:
          formData.max_quantity === ""
            ? undefined
            : Number(formData.max_quantity),
        unit_price: Number(formData.unit_price),
        purchase_price:
          formData.purchase_price === ""
            ? undefined
            : Number(formData.purchase_price),
        discount_percentage: Number(formData.discount_percentage),
        expiry_date: formData.expiry_date
          ? new Date(formData.expiry_date)
          : undefined,
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
          cold_chain_required: formData.cold_chain_required,
          hazardous: formData.hazardous,
        },
      });

      setMessage({
        type: "success",
        text: "Medicine added successfully! It is pending admin approval.",
      });

      // Reset form after short delay then navigate
      setTimeout(() => {
        navigate("/supplier/medicines");
      }, 1500);
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
    { id: "stock", label: "Stock & Pricing", icon: <FaBoxes /> },
    { id: "details", label: "Product Details", icon: <FaTag /> },
    { id: "medical", label: "Medical Info", icon: <FaInfoCircle /> },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/supplier/medicines")}
            className="flex items-center gap-2 text-gray-600 hover:text-light-orange transition-colors mb-4"
          >
            <FaArrowLeft />
            Back to My Medicines
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
                Fill in the details below. Your medicine will be reviewed by an
                admin before it's listed.
              </p>
            </div>
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
              <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
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

        {/* Section Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? "text-light-orange border-b-2 border-light-orange bg-light-orange/5"
                    : "text-gray-600 hover:text-light-orange hover:bg-gray-50"
                }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Basic Info Section */}
            {activeSection === "basic" && (
              <div className="space-y-6">
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Stock & Pricing Section */}
            {activeSection === "stock" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Quantity <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaBoxes className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        min={0}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Alert At
                    </label>
                    <input
                      type="number"
                      name="min_quantity_alert"
                      value={formData.min_quantity_alert}
                      onChange={handleChange}
                      min={0}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                      placeholder="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You'll be alerted when stock falls to or below this number
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Quantity (Optional)
                    </label>
                    <input
                      type="number"
                      name="max_quantity"
                      value={formData.max_quantity}
                      onChange={handleChange}
                      min={0}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                      placeholder="e.g., 1000"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="box">Box</option>
                      <option value="bottle">Bottle</option>
                      <option value="strip">Strip</option>
                      <option value="pack">Pack</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="mg">Milligram (mg)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price (Selling){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="unit_price"
                        value={formData.unit_price}
                        onChange={handleChange}
                        required
                        min={0}
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Price (Optional)
                    </label>
                    <div className="relative">
                      <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="purchase_price"
                        value={formData.purchase_price}
                        onChange={handleChange}
                        min={0}
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="discount_percentage"
                      value={formData.discount_percentage}
                      onChange={handleChange}
                      min={0}
                      max={100}
                      step="0.01"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Details Section */}
            {activeSection === "details" && (
              <div className="space-y-6">
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                      placeholder="Brief description of the medicine..."
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                    >
                      <option value="">Select form</option>
                      {FORMS.map((form) => (
                        <option key={form} value={form}>
                          {form.charAt(0).toUpperCase() + form.slice(1)}
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                      placeholder="e.g., 10 tablets per strip"
                    />
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
                          (e.preventDefault(), handleAddComposition())
                        }
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                        placeholder="e.g., Paracetamol 500mg"
                      />
                      <button
                        type="button"
                        onClick={handleAddComposition}
                        className="px-6 py-3 bg-light-orange text-white rounded-lg hover:bg-pink transition-colors"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    {formData.composition.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.composition.map((item, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-light-orange/10 text-light-orange rounded-full text-sm"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => handleRemoveComposition(index)}
                              className="text-light-orange hover:text-red-500"
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
                        <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="url"
                          value={imageInput}
                          onChange={(e) => setImageInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddImage())
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="px-6 py-3 bg-light-orange text-white rounded-lg hover:bg-pink transition-colors"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Medicine ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/150?text=Invalid";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Medical Info Section */}
            {activeSection === "medical" && (
              <div className="space-y-6">
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                      placeholder="e.g., 1 tablet every 6 hours"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Storage Instructions
                    </label>
                    <input
                      type="text"
                      name="storage"
                      value={formData.storage}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                      placeholder="e.g., ABC Pharma Ltd."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country of Origin
                    </label>
                    <input
                      type="text"
                      name="country_of_origin"
                      value={formData.country_of_origin}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
                      placeholder="e.g., India"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3 pt-4 border-t border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Special Handling
                    </h3>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        name="is_prescription_required"
                        checked={formData.is_prescription_required}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-300 text-light-orange focus:ring-light-orange"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          Prescription Required
                        </p>
                        <p className="text-sm text-gray-500">
                          Customers must have a valid prescription to purchase
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        name="cold_chain_required"
                        checked={formData.cold_chain_required}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-300 text-light-orange focus:ring-light-orange"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          Cold Chain Required
                        </p>
                        <p className="text-sm text-gray-500">
                          Must be stored and transported at low temperatures
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        name="hazardous"
                        checked={formData.hazardous}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-300 text-light-orange focus:ring-light-orange"
                      />
                      <div>
                        <p className="font-medium text-gray-800">Hazardous</p>
                        <p className="text-sm text-gray-500">
                          Requires special handling and disposal
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation & Submit */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <div className="flex gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeSection === section.id
                        ? "bg-light-orange w-8"
                        : "bg-gray-300"
                    }`}
                    aria-label={`Go to ${section.label}`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/supplier/medicines")}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    "Add Medicine"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Approval Process</p>
            <p>
              After submission, your medicine will be reviewed by an admin. You
              can track its status in the "My Medicines" page. You'll be
              notified once it's approved or if changes are needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMedicine;
