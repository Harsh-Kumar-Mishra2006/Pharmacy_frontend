// src/pages/PurchaseCheckout.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePurchase } from "../../contexts/PurchaseContext";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaStethoscope,
  FaNotesMedical,
  FaShoppingCart,
  FaTimes,
  FaCheck,
  FaExclamationCircle,
  FaArrowLeft,
  FaUpload,
  FaImage,
  FaClipboardCheck,
} from "react-icons/fa";
import { type AvailableMedicine, type Purchase } from "../../types";

interface CheckoutState {
  medicine: AvailableMedicine;
  quantity: number;
}

const PurchaseCheckout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createPurchase, uploadScreenshot, isLoading } = usePurchase();

  const state = location.state as CheckoutState | null;

  // If someone lands here without a medicine, redirect
  useEffect(() => {
    if (!state?.medicine || !state?.quantity) {
      navigate("/medicines", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.medicine) return null;

  const { medicine, quantity } = state;

  // after
  const unitPrice = Number(medicine.min_price ?? 0);
  const totalAmount = unitPrice * quantity;

  // ---------- form ----------
  const [formData, setFormData] = useState({
    customer_name: user?.name || "",
    customer_email: user?.email || "",
    customer_phone: user?.phone || "",
    customer_address: user?.address || "",
    disease: "",
    symptoms: "",
    prescription_required: medicine.metadata?.is_prescription_required || false,
    prescription_notes: "",
    delivery_instructions: "",
    notes: "",
  });

  const [step, setStep] = useState<"form" | "payment">("form");
  const [createdPurchase, setCreatedPurchase] = useState<Purchase | null>(null);
  const [paymentQR, setPaymentQR] = useState<{
    upi_id: string;
    amount: number;
    reference: string;
  } | null>(null);

  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  /**
   * Converts the picked file to a base64 data URL and stores it in `screenshotUrl`.
   * Max file size: 5MB (base64 grows ~33%, so this is ~6.6MB in the payload).
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file" });
      return;
    }

    // Validate size — max 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setMessage({
        type: "error",
        text: "Image is too large. Maximum size is 5MB.",
      });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(file);
      });
      setScreenshotUrl(dataUrl);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to process image",
      });
    } finally {
      setIsUploading(false);
      // Reset the input value so the same file can be picked again
      e.target.value = "";
    }
  };

  const clearScreenshot = () => {
    setScreenshotUrl("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = (): string | null => {
    if (
      !formData.customer_name.trim() ||
      formData.customer_name.trim().length < 2
    )
      return "Full name is required (min 2 characters)";
    if (!formData.customer_email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email))
      return "Please enter a valid email";
    if (!formData.customer_phone.trim()) return "Phone number is required";
    if (!/^[0-9]{10}$/.test(formData.customer_phone))
      return "Phone number must be exactly 10 digits";
    if (!formData.customer_address.trim())
      return "Delivery address is required";
    if (formData.prescription_required && !formData.prescription_notes.trim())
      return "Prescription notes are required for this medicine";
    return null;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const err = validate();
    if (err) {
      setMessage({ type: "error", text: err });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const result = await createPurchase({
        medicine_id: medicine.id,
        quantity,
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_address: formData.customer_address.trim(),
        disease: formData.disease.trim() || undefined,
        symptoms: formData.symptoms.trim() || undefined,
        prescription_required: formData.prescription_required,
        prescription_notes: formData.prescription_notes.trim() || undefined,
        delivery_instructions:
          formData.delivery_instructions.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });

      setCreatedPurchase(result.purchase);
      setPaymentQR(result.payment_qr);
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to create order",
      });
    }
  };

  const handleUploadScreenshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdPurchase) return;
    setMessage(null);

    if (!screenshotUrl.trim()) {
      setMessage({
        type: "error",
        text: "Please paste the payment screenshot URL",
      });
      return;
    }

    try {
      await uploadScreenshot(createdPurchase.id, {
        screenshot_url: screenshotUrl.trim(),
        transaction_id: transactionId.trim() || undefined,
      });
      setMessage({
        type: "success",
        text: "Payment proof submitted! Waiting for admin verification.",
      });
      setTimeout(() => navigate("/my-purchases"), 1800);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to upload screenshot",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/medicines"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-light-orange mb-4 transition-colors"
          >
            <FaArrowLeft /> Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaShoppingCart className="text-light-orange" />
            {step === "form" ? "Checkout" : "Complete Payment"}
          </h1>
          <p className="text-gray-600 mt-1">
            {step === "form"
              ? "Enter your details to place the order"
              : "Scan the QR code and upload your payment proof"}
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <StepBadge
            active={step === "form"}
            done={step === "payment"}
            number={1}
            label="Details"
          />
          <div
            className={`h-0.5 w-16 ${
              step === "payment" ? "bg-light-orange" : "bg-gray-300"
            }`}
          />
          <StepBadge
            active={step === "payment"}
            done={false}
            number={2}
            label="Payment"
          />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2">
            {step === "form" ? (
              <form
                onSubmit={handleSubmitOrder}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6"
              >
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  Delivery Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Full Name"
                    icon={<FaUser />}
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                  <Field
                    label="Email"
                    icon={<FaEnvelope />}
                    name="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                  <Field
                    label="Phone"
                    icon={<FaPhone />}
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_phone: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      })
                    }
                    placeholder="10 digit phone"
                    required
                    maxLength={10}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="customer_address"
                        value={formData.customer_address}
                        onChange={handleChange}
                        rows={3}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                        placeholder="House, Street, City, ZIP"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Info */}
                <div className="pt-6 border-t border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaNotesMedical className="text-light-orange" />
                    Medical Information (Optional)
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Disease / Condition"
                      icon={<FaStethoscope />}
                      name="disease"
                      value={formData.disease}
                      onChange={handleChange}
                      placeholder="e.g., Common cold"
                    />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Symptoms
                      </label>
                      <textarea
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                        placeholder="Describe your symptoms..."
                      />
                    </div>
                  </div>
                </div>

                {/* Prescription */}
                {medicine.metadata?.is_prescription_required && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl space-y-4">
                    <div className="flex items-start gap-3">
                      <FaExclamationCircle className="text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-800">
                          Prescription Required
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          This medicine requires a valid prescription. Please
                          provide your doctor's notes.
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prescription Notes{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="prescription_notes"
                        value={formData.prescription_notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                        placeholder="Doctor's name, prescription details, etc."
                      />
                    </div>
                  </div>
                )}

                {/* Extra */}
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      name="delivery_instructions"
                      value={formData.delivery_instructions}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                      placeholder="e.g., Deliver before 5 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                      placeholder="Anything else you'd like to add?"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isLoading ? "Placing Order..." : "Place Order & Pay"}
                </button>
              </form>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaCheck className="text-green-600 text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Order Placed Successfully
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Order #:{" "}
                    <span className="font-mono font-semibold">
                      {createdPurchase?.purchase_number}
                    </span>
                  </p>
                </div>

                {/* QR display */}
                {paymentQR && (
                  <div className="p-6 bg-gradient-to-br from-light-orange/5 to-pink/5 rounded-2xl border border-light-orange/20">
                    <h3 className="text-center font-semibold text-gray-800 mb-4">
                      Scan to Pay
                    </h3>
                    <QRCodeDisplay
                      upiId={paymentQR.upi_id}
                      amount={paymentQR.amount}
                      reference={paymentQR.reference}
                    />
                  </div>
                )}

                {/* Upload screenshot */}
                <form onSubmit={handleUploadScreenshot} className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Upload Payment Proof
                  </h3>
                  <p className="text-sm text-gray-500">
                    After paying, paste the URL of your payment screenshot
                    below.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Screenshot <span className="text-red-500">*</span>
                    </label>

                    {/* Hidden file input */}
                    <input
                      id="screenshot-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Drop/click zone */}
                    {!screenshotUrl ? (
                      <label
                        htmlFor="screenshot-file"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-light-orange hover:bg-light-orange/5 transition-colors"
                      >
                        <FaImage className="text-4xl text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                          Click to upload screenshot
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, JPEG up to 5MB
                        </p>
                      </label>
                    ) : (
                      <div className="relative">
                        <img
                          src={screenshotUrl}
                          alt="Payment screenshot"
                          className="w-full max-h-72 object-contain bg-gray-50 rounded-xl border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={clearScreenshot}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          aria-label="Remove screenshot"
                        >
                          <FaTimes />
                        </button>
                        <label
                          htmlFor="screenshot-file"
                          className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 backdrop-blur text-gray-700 rounded-lg text-xs font-medium cursor-pointer hover:bg-white border border-gray-200"
                        >
                          Change
                        </label>
                      </div>
                    )}

                    {isUploading && (
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                        <svg
                          className="animate-spin h-3 w-3"
                          viewBox="0 0 24 24"
                        >
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Processing image...
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                      placeholder="UPI transaction reference"
                    />
                  </div>

                  {screenshotUrl && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Preview:</p>
                      <img
                        src={screenshotUrl}
                        alt="Payment screenshot"
                        className="max-h-64 mx-auto rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FaUpload />
                      {isLoading ? "Submitting..." : "Submit Payment Proof"}
                    </span>
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Your order will be confirmed once admin verifies the
                    payment.
                  </p>
                </form>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaClipboardCheck className="text-light-orange" />
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {medicine.images?.[0] ? (
                      <img
                        src={medicine.images[0]}
                        alt={medicine.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-xl">💊</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {medicine.name}
                    </p>
                    <p className="text-xs text-gray-500">{medicine.category}</p>
                    <p className="text-sm font-medium text-light-orange mt-1">
                      ${unitPrice.toFixed(2)} each
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <span className="text-2xl font-bold text-light-orange">
                    ${totalAmount.toFixed(2)}
                  </span>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-light-orange">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status pill after placing */}
                {createdPurchase && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 font-semibold mb-1">
                      Status
                    </p>
                    <p className="text-sm text-blue-800 capitalize">
                      Payment {createdPurchase.payment_status}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- helpers ----------

interface StepBadgeProps {
  active: boolean;
  done: boolean;
  number: number;
  label: string;
}

const StepBadge: React.FC<StepBadgeProps> = ({
  active,
  done,
  number,
  label,
}) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
        done
          ? "bg-green-500 text-white"
          : active
            ? "bg-light-orange text-white"
            : "bg-gray-200 text-gray-500"
      }`}
    >
      {done ? <FaCheck className="text-xs" /> : number}
    </div>
    <span
      className={`text-sm font-medium ${
        active || done ? "text-gray-800" : "text-gray-400"
      }`}
    >
      {label}
    </span>
  </div>
);

interface FieldProps {
  label: string;
  icon?: React.ReactNode;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}

const Field: React.FC<FieldProps> = ({
  label,
  icon,
  name,
  value,
  onChange,
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

export default PurchaseCheckout;
