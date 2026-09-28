// src/pages/user/MyPurchases.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePurchase } from "../../contexts/PurchaseContext";
import {
  FaShoppingCart,
  FaSync,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaClipboardList,
} from "react-icons/fa";
import { type Purchase } from "../../types";

const MyPurchases: React.FC = () => {
  const { purchases, isLoading, error, getMyPurchases } = usePurchase();

  const [selected, setSelected] = useState<Purchase | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  // Always-success badge — replaces all status badges
  const SuccessBadge = () => (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      <FaCheckCircle className="text-xs" /> Success
    </span>
  );

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
                className={`text-sm ${
                  message.type === "success" ? "text-green-700" : "text-red-700"
                }`}
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

        {/* Loading */}
        {isLoading && purchases.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-orange mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your orders…</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && purchases.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClipboardList className="text-3xl text-light-orange" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 mb-6">
              Browse medicines and place your first order.
            </p>
            <Link to="/medicines" className="btn-primary inline-block">
              Browse Medicines
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && purchases.length > 0 && (
          <div className="space-y-4">
            {purchases.map((p) => (
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
                      <SuccessBadge />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {p.medicine_name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      #{p.purchase_number}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-sm">
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
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 md:w-32">
                    <button
                      onClick={() => setSelected(p)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
                    >
                      <FaEye className="text-xs" /> View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details modal — no status, no cancel */}
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
                <SuccessBadge />
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

              {selected.disease && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Medical Info
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <Detail label="Disease" value={selected.disease} />
                    <Detail
                      label="Symptoms"
                      value={selected.symptoms || "N/A"}
                    />
                  </div>
                </div>
              )}

              {selected.prescription_notes && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Prescription Notes
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selected.prescription_notes}
                  </p>
                </div>
              )}

              {selected.delivery_instructions && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Delivery Instructions
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selected.delivery_instructions}
                  </p>
                </div>
              )}

              {selected.notes && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Notes</h4>
                  <p className="text-sm text-gray-700">{selected.notes}</p>
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
