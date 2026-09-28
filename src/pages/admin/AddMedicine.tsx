// src/pages/admin/AddMedicine.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMedicine } from "../../contexts/MedicineContext";
import {
  FaPills,
  FaTag,
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

type SectionId = "basic" | "details" | "medical";

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
  // const [imageInput, setImageInput] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("basic");

  const [_visitedSections, setVisitedSections] = useState<Set<SectionId>>(
    new Set(["basic"]),
  );

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= 10 * 1024 * 1024);
    if (valid.length !== files.length) {
      setMessage({ type: "error", text: "Each image must be under 10 MB." });
    }
    setImageFiles((prev) => [...prev, ...valid].slice(0, 5));
  };

  const removeImageFile = (i: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
  };
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

  // const addImage = () => {
  //   if (imageInput.trim()) {
  //     setFormData((p) => ({ ...p, images: [...p.images, imageInput.trim()] }));
  //     setImageInput("");
  //   }
  // };
  // const removeImage = (i: number) =>
  //   setFormData((p) => ({
  //     ...p,
  //     images: p.images.filter((_, idx) => idx !== i),
  //   }));

  // ---------- Per-section validation ----------
  const basicValid =
    formData.name.trim().length >= 2 && formData.category.trim().length > 0;

  const detailsValid = useMemo(() => {
    return (
      formData.form.trim().length > 0 &&
      formData.strength.trim().length > 0 &&
      formData.pack_size.trim().length > 0 &&
      formData.unit.trim().length > 0
    );
  }, [formData.form, formData.strength, formData.pack_size, formData.unit]);

  const medicalValid = useMemo(() => {
    return (
      formData.usage.trim().length > 0 && formData.dosage.trim().length > 0
    );
  }, [formData.usage, formData.dosage]);

  const sectionStatus: Record<SectionId, boolean> = {
    basic: basicValid,
    details: detailsValid,
    medical: medicalValid,
  };

  // Only basic + details need to be valid to REACH the medical page.
  // On the medical page, we show the submit button (disabled until medicalValid).
  const canSubmit = basicValid && detailsValid && medicalValid;

  const canNavigateTo = (target: SectionId): boolean => {
    if (target === "basic") return true;
    if (target === "details") return basicValid;
    if (target === "medical") return basicValid && detailsValid;
    return false;
  };

  const goToSection = (target: SectionId) => {
    if (!canNavigateTo(target)) {
      setMessage({
        type: "error",
        text:
          target === "details"
            ? "Please complete the Basic Info section first."
            : "Please complete the Product Details section first.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setMessage(null);
    setActiveSection(target);
    setVisitedSections((prev) => new Set(prev).add(target));
  };

  const validate = (): string | null => {
    if (!formData.name || formData.name.trim().length < 2)
      return "Medicine name is required (min 2 characters)";
    if (!formData.category) return "Category is required";
    if (!formData.form) return "Form is required in Product Details";
    if (!formData.strength) return "Strength is required in Product Details";
    if (!formData.pack_size) return "Pack size is required in Product Details";
    if (!formData.usage) return "Usage is required in Medical Info";
    if (!formData.dosage) return "Dosage is required in Medical Info";
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
      const fd = new FormData();
      fd.append("name", formData.name.trim());
      if (formData.generic_name)
        fd.append("generic_name", formData.generic_name.trim());
      if (formData.brand_name)
        fd.append("brand_name", formData.brand_name.trim());
      fd.append("category", formData.category);

      fd.append(
        "medical_details",
        JSON.stringify({
          usage: formData.usage || undefined,
          dosage: formData.dosage || undefined,
          storage: formData.storage || undefined,
          manufacturer: formData.manufacturer || undefined,
          country_of_origin: formData.country_of_origin || undefined,
        }),
      );

      fd.append(
        "other_details",
        JSON.stringify({
          description: formData.description || undefined,
          form: formData.form || undefined,
          strength: formData.strength || undefined,
          pack_size: formData.pack_size || undefined,
          unit: formData.unit || undefined,
          composition: formData.composition,
        }),
      );

      fd.append(
        "metadata",
        JSON.stringify({
          is_prescription_required: formData.is_prescription_required,
          is_controlled_substance: false,
          cold_chain_required: formData.cold_chain_required,
          hazardous: formData.hazardous,
          requires_medical_approval: false,
          reviews_count: 0,
        }),
      );

      imageFiles.forEach((f) => fd.append("images", f));

      await createMedicine(fd as any); // see service update below
      setMessage({ type: "success", text: "Medicine added successfully!" });
      setTimeout(() => navigate("/admin/medicines"), 1200);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to add medicine",
      });
    }
  };

  const sections = [
    { id: "basic", label: "Basic Info", icon: <FaPills /> },
    { id: "details", label: "Product Details", icon: <FaTag /> },
    { id: "medical", label: "Medical Info", icon: <FaInfoCircle /> },
  ] as const;

  const completedCount = [basicValid, detailsValid, medicalValid].filter(
    Boolean,
  ).length;
  const progressPercent = Math.round((completedCount / 3) * 100);

  // Show submit button on the third (medical) page — always visible,
  // but disabled until all validations pass.
  const showSubmitButton = activeSection === "medical";

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

        {/* Progress bar */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Setup Progress
            </span>
            <span className="text-sm font-semibold text-light-orange">
              {completedCount}/3 sections completed
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-light-orange to-pink transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
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
            {sections.map((s) => {
              const done = sectionStatus[s.id];
              const locked = !canNavigateTo(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToSection(s.id)}
                  disabled={locked}
                  title={
                    locked ? "Complete the previous section first" : undefined
                  }
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                    activeSection === s.id
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

                <div className="md:col-span-2 flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => goToSection("details")}
                    disabled={!basicValid}
                    className="btn-primary disabled:opacity-50"
                  >
                    Next: Product Details
                  </button>
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
                    Form <span className="text-red-500">*</span>
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
                    Strength <span className="text-red-500">*</span>
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
                    Pack Size <span className="text-red-500">*</span>
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
                    Unit <span className="text-red-500">*</span>
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
                    Medicine Images (max 5, 10 MB each)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFiles}
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
                            onClick={() => removeImageFile(i)}
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
                    onClick={() => goToSection("basic")}
                    className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => goToSection("medical")}
                    disabled={!detailsValid}
                    className="btn-primary disabled:opacity-50"
                  >
                    Next: Medical Info
                  </button>
                </div>
              </div>
            )}

            {activeSection === "medical" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage <span className="text-red-500">*</span>
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
                    Dosage <span className="text-red-500">*</span>
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

                <div className="md:col-span-2 flex justify-start pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => goToSection("details")}
                    className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <div className="flex gap-2">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goToSection(s.id)}
                    disabled={!canNavigateTo(s.id)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeSection === s.id
                        ? "bg-light-orange w-8"
                        : sectionStatus[s.id]
                          ? "bg-green-400"
                          : "bg-gray-300"
                    } ${!canNavigateTo(s.id) ? "cursor-not-allowed opacity-50" : ""}`}
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

                {/* Submit button appears on Medical Info page — always visible,
                    disabled until all sections are valid */}
                {showSubmitButton && (
                  <button
                    type="submit"
                    disabled={isLoading || !canSubmit}
                    title={
                      !canSubmit
                        ? "Fill all required fields in every section to enable"
                        : undefined
                    }
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                  >
                    {isLoading ? "Adding..." : "Add Medicine"}
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

export default AddMedicine;
