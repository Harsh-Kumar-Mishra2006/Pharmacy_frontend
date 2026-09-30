// src/pages/admin/AddSupplier.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaTruck,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaCheck,
  FaExclamationCircle,
  FaArrowLeft,
  FaPlus,
  FaInfoCircle,
} from "react-icons/fa";

interface FormState {
  // User credentials
  name: string;
  email: string;
  password: string;
  phone: string;

  // Business
  company_name: string;
  contact_person: string;
  gst_number: string;
  license_number: string;

  // Address
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  // Extra
  website: string;
  notes: string;
}

const INITIAL: FormState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  company_name: "",
  contact_person: "",
  gst_number: "",
  license_number: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  website: "",
  notes: "",
};

const AddSupplier: React.FC = () => {
  const navigate = useNavigate();
  const { createSupplier, isLoading } = useAuth();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!form.name.trim() || form.name.trim().length < 2)
      return "Supplier name is required (min 2 characters)";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email";
    if (!form.password.trim() || form.password.length < 6)
      return "Password must be at least 6 characters";
    if (!form.company_name.trim()) return "Company name is required";
    if (form.phone && !/^[0-9]{10}$/.test(form.phone))
      return "Phone must be exactly 10 digits";
    if (form.pincode && !/^[0-9]{4,6}$/.test(form.pincode))
      return "Pincode must be 4–6 digits";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const err = validate();
    if (err) {
      setMessage({ type: "error", text: err });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const res = await createSupplier({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        company_name: form.company_name.trim(),
        contact_person: form.contact_person.trim() || undefined,
        gst_number: form.gst_number.trim() || undefined,
        license_number: form.license_number.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        country: form.country.trim() || undefined,
        website: form.website.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });

      setMessage({
        type: "success",
        text: `Supplier "${res.user.name}" created successfully. They can now log in with ${res.user.email}.`,
      });
      setForm(INITIAL);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Optional: redirect after a short delay
      setTimeout(() => navigate("/admin/users"), 2000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to create supplier",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 text-gray-600 hover:text-light-orange transition-colors mb-4"
          >
            <FaArrowLeft /> Back to Users
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-light-orange to-pink rounded-xl flex items-center justify-center text-white text-xl">
              <FaTruck />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Add New Supplier
              </h1>
              <p className="text-gray-600">
                Create supplier account and login credentials in one step.
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
              className={`text-sm ${
                message.type === "success" ? "text-green-700" : "text-red-700"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-8"
        >
          {/* ============ Login Credentials ============ */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <FaLock className="text-light-orange" />
              <h2 className="text-lg font-bold text-gray-800">
                Login Credentials
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-4 flex items-start gap-2">
              <FaInfoCircle className="text-light-orange mt-0.5" />
              The supplier will use these details to log in. Share them securely
              with the supplier.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                icon={<FaUser />}
                required
                placeholder="e.g., Ravi Kumar"
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                icon={<FaEnvelope />}
                required
                placeholder="supplier@example.com"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-16 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-light-orange hover:underline"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <Field
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                icon={<FaPhone />}
                placeholder="10 digit phone"
                maxLength={10}
              />
            </div>
          </section>

          {/* ============ Business Details ============ */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <FaBuilding className="text-light-orange" />
              <h2 className="text-lg font-bold text-gray-800">
                Business Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Company Name"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                icon={<FaBuilding />}
                required
                placeholder="e.g., MedSupply Pvt Ltd"
              />
              <Field
                label="Contact Person"
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
                icon={<FaUser />}
                placeholder="Defaults to Full Name"
              />
              <Field
                label="GST Number"
                name="gst_number"
                value={form.gst_number}
                onChange={handleChange}
                placeholder="e.g., 27ABCDE1234F1Z5"
              />
              <Field
                label="License Number"
                name="license_number"
                value={form.license_number}
                onChange={handleChange}
                placeholder="e.g., DL-2024-00123"
              />
              <Field
                label="Website"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
          </section>

          {/* ============ Address ============ */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <FaMapMarkerAlt className="text-light-orange" />
              <h2 className="text-lg font-bold text-gray-800">Address</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                  placeholder="Street, building, landmark..."
                />
              </div>
              <Field
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g., Mumbai"
              />
              <Field
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="e.g., Maharashtra"
              />
              <Field
                label="Pincode"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="e.g., 400053"
              />
              <Field
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="e.g., India"
              />
            </div>
          </section>

          {/* ============ Notes ============ */}
          <section>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
              placeholder="Any internal notes about this supplier..."
            />
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 min-w-[180px] flex items-center justify-center gap-2"
            >
              <FaPlus />
              {isLoading ? "Creating..." : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------- Helper: reusable input field ----------

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}

const Field: React.FC<FieldProps> = ({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder,
  type = "text",
  required = false,
  maxLength,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`w-full ${
          icon ? "pl-10" : "pl-4"
        } pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent`}
      />
    </div>
  </div>
);

export default AddSupplier;
