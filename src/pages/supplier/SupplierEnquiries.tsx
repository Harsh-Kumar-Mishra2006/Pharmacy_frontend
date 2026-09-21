// src/pages/supplier/SupplierEnquiries.tsx
import React, { useState, useEffect } from "react";
import { useEnquiry } from "../../contexts/EnquiryContext";
import {
  FaInbox,
  FaCheck,
  FaTimes,
  FaClock,
  FaSync,
  FaExclamationCircle,
  FaCheckCircle,
  FaDollarSign,
  FaBoxes,
} from "react-icons/fa";
import { type Enquiry } from "../../types";

const SupplierEnquiries: React.FC = () => {
  const {
    enquiries,
    isLoading,
    error,
    supplierSummary,
    getEnquiries,
    getSupplierSummary,
    acceptEnquiry,
    rejectEnquiry,
    clearError,
  } = useEnquiry();

  const [acceptModal, setAcceptModal] = useState<Enquiry | null>(null);
  const [rejectModal, setRejectModal] = useState<Enquiry | null>(null);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [expiry, setExpiry] = useState("");
  const [responseMsg, setResponseMsg] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    clearError();
    load();
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

  const load = async () => {
    await Promise.all([getEnquiries({ limit: 100 }), getSupplierSummary()]);
  };

  const handleAccept = async () => {
    if (!acceptModal) return;
    if (unitPrice <= 0) {
      setMessage({ type: "error", text: "Enter a valid unit price" });
      return;
    }
    setProcessing(true);
    try {
      await acceptEnquiry(acceptModal.id, {
        unit_price: unitPrice,
        notes: notes || undefined,
        expiry_date: expiry || undefined,
        response_message: responseMsg || undefined,
      });
      setMessage({
        type: "success",
        text: "Enquiry accepted — supply submitted to admin",
      });
      setAcceptModal(null);
      setUnitPrice(0);
      setNotes("");
      setExpiry("");
      setResponseMsg("");
      await load();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to accept" });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !responseMsg.trim()) return;
    setProcessing(true);
    try {
      await rejectEnquiry(rejectModal.id, {
        response_message: responseMsg.trim(),
      });
      setMessage({ type: "success", text: "Enquiry rejected" });
      setRejectModal(null);
      setResponseMsg("");
      await load();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to reject" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaInbox className="text-light-orange" /> Enquiry Inbox
            </h1>
            <p className="text-gray-600 mt-1">
              Medicine requests from the admin
            </p>
          </div>
          <button
            onClick={load}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
          >
            <FaSync className={isLoading ? "animate-spin" : ""} /> Refresh
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
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaExclamationCircle className="text-red-500" />
              )}
              <p
                className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-700"}`}
              >
                {message.text}
              </p>
            </div>
            <button onClick={() => setMessage(null)}>
              <FaTimes />
            </button>
          </div>
        )}

        {supplierSummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total"
              value={supplierSummary.total}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              label="Pending"
              value={supplierSummary.pending}
              color="from-yellow-500 to-yellow-600"
            />
            <StatCard
              label="Accepted"
              value={supplierSummary.accepted}
              color="from-green-500 to-green-600"
            />
            <StatCard
              label="Rejected"
              value={supplierSummary.rejected}
              color="from-red-500 to-red-600"
            />
          </div>
        )}

        {isLoading && enquiries.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-orange mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading enquiries...</p>
          </div>
        )}

        {!isLoading && enquiries.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaInbox className="text-3xl text-light-orange" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No enquiries yet
            </h3>
            <p className="text-gray-500">You'll see admin requests here.</p>
          </div>
        )}

        {!isLoading && enquiries.length > 0 && (
          <div className="space-y-4">
            {enquiries.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {e.medicine?.name || "Unknown Medicine"}
                      </h3>
                      <EnquiryStatusBadge status={e.status} />
                    </div>
                    {e.medicine?.generic_name && (
                      <p className="text-sm text-gray-500">
                        {e.medicine.generic_name}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <FaBoxes className="text-gray-400" />
                        Requested:{" "}
                        <span className="font-semibold">
                          {e.requested_quantity}
                        </span>
                      </span>
                      {e.target_unit_price && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <FaDollarSign className="text-gray-400" />
                          Target:{" "}
                          <span className="font-semibold">
                            ${Number(e.target_unit_price).toFixed(2)}
                          </span>
                        </span>
                      )}
                    </div>
                    {e.message && (
                      <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg italic">
                        "{e.message}"
                      </p>
                    )}
                    {e.response_message && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-semibold">Your response: </span>
                        {e.response_message}
                      </p>
                    )}
                  </div>

                  {e.status === "pending" && (
                    <div className="flex gap-2 md:flex-col">
                      <button
                        onClick={() => {
                          setAcceptModal(e);
                          setUnitPrice(
                            e.target_unit_price
                              ? Number(e.target_unit_price)
                              : 0,
                          );
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                      >
                        <FaCheck /> Accept
                      </button>
                      <button
                        onClick={() => {
                          setRejectModal(e);
                          setResponseMsg("");
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {acceptModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setAcceptModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Accept Enquiry
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Set the price at which you'll supply{" "}
              <span className="font-semibold">
                {acceptModal.requested_quantity}
              </span>{" "}
              units of{" "}
              <span className="font-semibold">
                {acceptModal.medicine?.name}
              </span>
              .
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) =>
                    setUnitPrice(parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total:{" "}
                  <span className="font-semibold">
                    ${(unitPrice * acceptModal.requested_quantity).toFixed(2)}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAcceptModal(null)}
                disabled={processing}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium disabled:opacity-50"
              >
                {processing ? "Submitting..." : "Accept & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setRejectModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Reject Enquiry
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Let the admin know why you can't fulfil this enquiry.
            </p>
            <textarea
              value={responseMsg}
              onChange={(e) => setResponseMsg(e.target.value)}
              rows={3}
              placeholder="Reason..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                disabled={processing}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !responseMsg.trim()}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium disabled:opacity-50"
              >
                {processing ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EnquiryStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const base =
    "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold";
  const map: Record<string, React.ReactElement> = {
    pending: (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>
        <FaClock /> Pending
      </span>
    ),
    accepted: (
      <span className={`${base} bg-green-100 text-green-700`}>
        <FaCheckCircle /> Accepted
      </span>
    ),
    rejected: (
      <span className={`${base} bg-red-100 text-red-700`}>
        <FaTimes /> Rejected
      </span>
    ),
    cancelled: (
      <span className={`${base} bg-gray-100 text-gray-700`}>
        <FaTimes /> Cancelled
      </span>
    ),
    fulfilled: (
      <span className={`${base} bg-blue-100 text-blue-700`}>
        <FaCheckCircle /> Fulfilled
      </span>
    ),
  };
  return (
    map[status] || (
      <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>
    )
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
    <div
      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3`}
    >
      <FaInbox />
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

export default SupplierEnquiries;
