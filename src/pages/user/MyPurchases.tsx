// src/pages/MyPurchases.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePurchase } from "../../contexts/PurchaseContext";
import {
  FaShoppingCart,
  FaSync,
  FaEye,
  FaTimes,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaBoxOpen,
  FaExclamationCircle,
  FaBan,
  FaClipboardList,
} from "react-icons/fa";
import { type Purchase } from "../../types";

type StatusFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const MyPurchases: React.FC = () => {
  const { purchases, isLoading, error, getMyPurchases, cancelPurchase } =
    usePurchase();

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Purchase | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Purchase | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getMyPurchases();
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

  const filtered =
    filter === "all" ? purchases : purchases.filter((p) => p.status === filter);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsProcessing(true);
    try {
      await cancelPurchase(cancelTarget.id, cancelReason.trim() || undefined);
      setMessage({ type: "success", text: "Purchase cancelled successfully" });
      setCancelTarget(null);
      setCancelReason("");
      await getMyPurchases();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to cancel" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const base =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            <FaClock className="text-xs" /> Pending
          </span>
        );
      case "confirmed":
        return (
          <span className={`${base} bg-blue-100 text-blue-700`}>
            <FaCheckCircle className="text-xs" /> Confirmed
          </span>
        );
      case "processing":
        return (
          <span className={`${base} bg-purple-100 text-purple-700`}>
            <FaBoxOpen className="text-xs" /> Processing
          </span>
        );
      case "shipped":
        return (
          <span className={`${base} bg-indigo-100 text-indigo-700`}>
            <FaTruck className="text-xs" /> Shipped
          </span>
        );
      case "delivered":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            <FaCheckCircle className="text-xs" /> Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className={`${base} bg-red-100 text-red-700`}>
            <FaTimesCircle className="text-xs" /> Cancelled
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>
        );
    }
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const base =
      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium";
    switch (paymentStatus) {
      case "pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            Payment Pending
          </span>
        );
      case "paid":
        return (
          <span className={`${base} bg-blue-100 text-blue-700`}>Verifying</span>
        );
      case "verified":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            <FaCheckCircle className="text-xs" /> Paid
          </span>
        );
      case "failed":
        return (
          <span className={`${base} bg-red-100 text-red-700`}>Failed</span>
        );
      case "refunded":
        return (
          <span className={`${base} bg-gray-100 text-gray-700`}>Refunded</span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-700`}>
            {paymentStatus}
          </span>
        );
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canCancel = (p: Purchase) =>
    p.status === "pending" || p.status === "confirmed";

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaShoppingCart className="text-light-orange" />
              My Orders
            </h1>
            <p className="text-gray-600 mt-1">
              {purchases.length} {purchases.length === 1 ? "order" : "orders"}{" "}
              placed
            </p>
          </div>
          <button
            onClick={getMyPurchases}
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              "all",
              "pending",
              "confirmed",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ] as const
          ).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-light-orange text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClipboardList className="text-3xl text-light-orange" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {purchases.length === 0
                ? "No orders yet"
                : "No orders match this filter"}
            </h3>
            <p className="text-gray-500 mb-6">
              {purchases.length === 0
                ? "Browse medicines and place your first order."
                : "Try a different filter."}
            </p>
            {purchases.length === 0 && (
              <Link to="/medicines" className="btn-primary inline-block">
                Browse Medicines
              </Link>
            )}
          </div>
        )}

        {/* Orders List */}
        {!isLoading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-24 h-24 bg-gradient-to-br from-light-orange/10 to-pink/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {p.medicine?.images?.[0] ? (
                      <img
                        src={p.medicine.images[0]}
                        alt={p.medicine_name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-3xl">💊</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {getStatusBadge(p.status)}
                      {getPaymentBadge(p.payment_status)}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {p.medicine_name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      #{p.purchase_number}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Quantity</p>
                        <p className="font-semibold">{p.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-semibold">
                          ₹{Number(p.total_amount).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ordered</p>
                        <p className="font-semibold text-xs">
                          {formatDate(p.purchased_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment</p>
                        <p className="font-semibold text-xs capitalize">
                          {p.payment_status}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 md:w-32">
                    <button
                      onClick={() => setSelected(p)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
                    >
                      <FaEye className="text-xs" /> View
                    </button>
                    {canCancel(p) && (
                      <button
                        onClick={() => {
                          setCancelTarget(p);
                          setCancelReason("");
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium"
                      >
                        <FaBan className="text-xs" /> Cancel
                      </button>
                    )}
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
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
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
                {getStatusBadge(selected.status)}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <p className="font-semibold text-gray-800">
                  {selected.medicine_name}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Detail label="Quantity" value={String(selected.quantity)} />
                  <Detail
                    label="Unit Price"
                    value={`₹${Number(selected.medicine_price).toFixed(2)}`}
                  />
                  <Detail
                    label="Total"
                    value={`₹${Number(selected.total_amount).toFixed(2)}`}
                  />
                  <Detail
                    label="Ordered On"
                    value={formatDate(selected.purchased_at)}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Delivery Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <Detail label="Name" value={selected.customer_name} />
                  <Detail label="Email" value={selected.customer_email} />
                  <Detail label="Phone" value={selected.customer_phone} />
                  <Detail label="Address" value={selected.customer_address} />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Payment</h4>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Status</span>
                  {getPaymentBadge(selected.payment_status)}
                </div>
                {selected.transaction_id && (
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Txn: {selected.transaction_id}
                  </p>
                )}
                {selected.payment?.screenshot_url && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Payment Screenshot
                    </p>
                    <img
                      src={selected.payment.screenshot_url}
                      alt="Payment"
                      className="max-h-40 rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {selected.notes && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Notes</h4>
                  <p className="text-sm text-gray-700">{selected.notes}</p>
                </div>
              )}

              {selected.cancellation_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-700 mb-1">
                    Cancellation Reason
                  </p>
                  <p className="text-sm text-red-700">
                    {selected.cancellation_reason}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              {canCancel(selected) && (
                <button
                  onClick={() => {
                    setCancelTarget(selected);
                    setSelected(null);
                    setCancelReason("");
                  }}
                  className="flex-1 px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {cancelTarget && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setCancelTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBan className="text-red-600 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Cancel Order?
            </h2>
            <p className="text-gray-600 text-center mb-4">
              This will cancel order{" "}
              <span className="font-mono font-semibold">
                {cancelTarget.purchase_number}
              </span>
              .
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Why are you cancelling?"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium disabled:opacity-50"
              >
                {isProcessing ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800 text-sm break-words">{value}</p>
  </div>
);

export default MyPurchases;
