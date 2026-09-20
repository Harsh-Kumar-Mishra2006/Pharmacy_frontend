// src/pages/admin/AdminPaymentVerification.tsx
import React, { useEffect, useState } from "react";
import { usePurchase } from "../../contexts/PurchaseContext";
import {
  FaShieldAlt,
  FaSync,
  FaCheckCircle,
  FaEye,
  FaTimes,
  FaClock,
  FaExclamationCircle,
  FaDollarSign,
  FaImage,
  FaClipboardList,
  FaUser,
  FaCheck,
} from "react-icons/fa";
import { type Purchase } from "../../types";

const AdminPaymentVerification: React.FC = () => {
  const {
    pendingVerifications,
    statistics,
    isLoading,
    error,
    getPendingVerifications,
    verifyPayment,
    getStatistics,
    clearError,
  } = usePurchase();

  const [selected, setSelected] = useState<Purchase | null>(null);
  const [verifyModal, setVerifyModal] = useState<Purchase | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadAll();
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

  const loadAll = async () => {
    clearError();
    await Promise.all([getPendingVerifications(), getStatistics()]);
  };

  const handleVerify = async () => {
    if (!verifyModal) return;
    setIsProcessing(true);
    try {
      await verifyPayment(verifyModal.id, {
        verification_notes: verificationNotes.trim() || undefined,
      });
      setMessage({
        type: "success",
        text: `Payment verified for ${verifyModal.purchase_number}`,
      });
      setVerifyModal(null);
      setVerificationNotes("");
      await loadAll();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to verify" });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = [
    {
      label: "Awaiting Verification",
      value: statistics?.pending_verification ?? 0,
      icon: <FaClock />,
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Total Purchases",
      value: statistics?.total_purchases ?? 0,
      icon: <FaClipboardList />,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Verified Payments",
      value: statistics?.verified_payments ?? 0,
      icon: <FaCheckCircle />,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Total Revenue",
      value: `₹${Number(statistics?.total_revenue || 0).toFixed(2)}`,
      icon: <FaDollarSign />,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaShieldAlt className="text-light-orange" />
              Payment Verification
            </h1>
            <p className="text-gray-600 mt-1">
              Review uploaded payment screenshots and verify orders
            </p>
          </div>
          <button
            onClick={loadAll}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            <FaSync className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}
              >
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800 truncate">
                {s.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Empty */}
        {!isLoading && pendingVerifications.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-3xl text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-500">
              No payments waiting for verification.
            </p>
          </div>
        )}

        {/* Pending List */}
        {!isLoading && pendingVerifications.length > 0 && (
          <div className="space-y-4">
            {pendingVerifications.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Screenshot */}
                  <div className="w-full lg:w-40 h-40 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {p.payment?.screenshot_url ? (
                      <img
                        src={p.payment.screenshot_url}
                        alt="Payment screenshot"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelected(p)}
                      />
                    ) : (
                      <FaImage className="text-3xl text-gray-400" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        <FaClock className="text-xs" />
                        Awaiting Verification
                      </span>
                    </div>

                    <p className="font-mono text-xs text-gray-500">
                      #{p.purchase_number}
                    </p>
                    <h3 className="font-bold text-gray-800 text-lg mt-1">
                      {p.medicine_name} × {p.quantity}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="font-semibold truncate">
                          {p.customer_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-semibold text-light-orange">
                          ₹{Number(p.total_amount).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment Method</p>
                        <p className="font-semibold capitalize">
                          {p.payment_method.replace("_", " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Uploaded</p>
                        <p className="font-semibold text-xs">
                          {formatDate(p.payment?.screenshot_uploaded_at)}
                        </p>
                      </div>
                    </div>

                    {p.transaction_id && (
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        Txn: {p.transaction_id}
                      </p>
                    )}

                    {p.customer_phone && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <FaUser className="text-xs" /> {p.customer_phone}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:w-36">
                    <button
                      onClick={() => setSelected(p)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
                    >
                      <FaEye className="text-xs" /> View
                    </button>
                    <button
                      onClick={() => {
                        setVerifyModal(p);
                        setVerificationNotes("");
                      }}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 text-sm font-medium"
                    >
                      <FaCheck className="text-xs" /> Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">
                Payment Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Order Number</p>
                  <p className="font-mono font-semibold">
                    {selected.purchase_number}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                  <FaClock className="text-xs" /> Awaiting Verification
                </span>
              </div>

              {/* Screenshot big */}
              {selected.payment?.screenshot_url && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Payment Screenshot
                  </p>
                  <img
                    src={selected.payment.screenshot_url}
                    alt="Payment proof"
                    className="w-full max-h-96 object-contain bg-gray-50 rounded-xl border border-gray-200"
                  />
                </div>
              )}

              {/* Customer */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Customer</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <Row label="Name" value={selected.customer_name} />
                  <Row label="Email" value={selected.customer_email} />
                  <Row label="Phone" value={selected.customer_phone} />
                  <Row label="Address" value={selected.customer_address} />
                </div>
              </div>

              {/* Order */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Order</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <Row label="Medicine" value={selected.medicine_name} />
                  <Row label="Quantity" value={String(selected.quantity)} />
                  <Row
                    label="Unit Price"
                    value={`₹${Number(selected.medicine_price).toFixed(2)}`}
                  />
                  <Row
                    label="Total"
                    value={`₹${Number(selected.total_amount).toFixed(2)}`}
                  />
                </div>
              </div>

              {/* Payment */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Payment Info
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <Row
                    label="Method"
                    value={selected.payment_method.replace("_", " ")}
                  />
                  <Row
                    label="Uploaded"
                    value={formatDate(selected.payment?.screenshot_uploaded_at)}
                  />
                  {selected.transaction_id && (
                    <Row
                      label="Transaction ID"
                      value={selected.transaction_id}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setVerifyModal(selected);
                  setSelected(null);
                  setVerificationNotes("");
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium"
              >
                <span className="flex items-center justify-center gap-2">
                  <FaCheckCircle /> Verify Payment
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify modal */}
      {verifyModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setVerifyModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Verify Payment?
            </h2>
            <p className="text-gray-600 text-center mb-2">
              Confirm payment for{" "}
              <span className="font-mono font-semibold">
                {verifyModal.purchase_number}
              </span>
              .
            </p>
            <div className="p-3 bg-light-orange/10 rounded-lg mb-4 text-center">
              <p className="text-xs text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-light-orange">
                ₹{Number(verifyModal.total_amount).toFixed(2)}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any verification notes..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setVerifyModal(null)}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium disabled:opacity-50"
              >
                {isProcessing ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800 text-sm break-words capitalize">
      {value}
    </p>
  </div>
);

export default AdminPaymentVerification;
