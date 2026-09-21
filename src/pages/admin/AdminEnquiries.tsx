// src/pages/admin/AdminEnquiries.tsx
import React, { useState, useEffect, useMemo, type JSX } from "react";
import { useEnquiry } from "../../contexts/EnquiryContext";
import { useMedicine } from "../../contexts/MedicineContext";
import Api from "../../api/api";
import {
  FaPlus,
  FaInbox,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaTimesCircle,
  FaSync,
  FaExclamationCircle,
  FaUser,
  FaBoxes,
  FaDollarSign,
} from "react-icons/fa";
import { type User } from "../../types";

const AdminEnquiries: React.FC = () => {
  const {
    enquiries,
    isLoading,
    error,
    statistics,
    getEnquiries,
    createEnquiry,
    cancelEnquiry,
    getStatistics,
    clearError,
  } = useEnquiry();
  const { medicines, getMedicines } = useMedicine();

  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [createModal, setCreateModal] = useState(false);
  const [medicineId, setMedicineId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [quantity, setQuantity] = useState<number>(100);
  const [targetPrice, setTargetPrice] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    load();
    loadSuppliers();
    if (medicines.length === 0) getMedicines({ limit: 200 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (error) setActionMessage({ type: "error", text: error });
  }, [error]);
  useEffect(() => {
    if (actionMessage) {
      const t = setTimeout(() => setActionMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [actionMessage]);

  const load = async () => {
    clearError();
    const filters: any = { limit: 100 };
    if (statusFilter !== "all") filters.status = statusFilter;
    await Promise.all([getEnquiries(filters), getStatistics()]);
  };

  const loadSuppliers = async () => {
    try {
      const res = await Api.get<User[]>("/auth/suppliers");
      if (res.success && res.data) setSuppliers(res.data);
    } catch (err) {
      // Fallback: use role endpoint
      try {
        const res2 = await Api.get<User[]>("/auth/users/role/supplier");
        if (res2.success && res2.data) {
          setSuppliers(res2.data.filter((u) => u.is_active));
        }
      } catch {
        /* ignore */
      }
    }
  };

  const filtered = useMemo(() => {
    let r = [...enquiries];
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      r = r.filter(
        (e) =>
          e.medicine?.name?.toLowerCase().includes(s) ||
          e.supplier?.name?.toLowerCase().includes(s),
      );
    }
    return r;
  }, [enquiries, searchTerm]);

  const handleCreate = async () => {
    setActionMessage(null);
    if (!medicineId || !supplierId || quantity <= 0) {
      setActionMessage({
        type: "error",
        text: "Please fill all required fields",
      });
      return;
    }
    setProcessing(true);
    try {
      await createEnquiry({
        medicine_id: medicineId,
        supplier_id: supplierId,
        requested_quantity: quantity,
        target_unit_price: targetPrice === "" ? undefined : Number(targetPrice),
        message: message.trim() || undefined,
      });
      setActionMessage({ type: "success", text: "Enquiry sent to supplier" });
      setCreateModal(false);
      setMedicineId("");
      setSupplierId("");
      setQuantity(100);
      setTargetPrice("");
      setMessage("");
      await load();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to create enquiry",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this enquiry?")) return;
    try {
      await cancelEnquiry(id);
      setActionMessage({ type: "success", text: "Enquiry cancelled" });
      await load();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to cancel",
      });
    }
  };

  const statusBadge = (s: string) => {
    const base =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold";
    const map: Record<string, JSX.Element> = {
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
          <FaTimesCircle /> Rejected
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
      map[s] || <span className={`${base} bg-gray-100 text-gray-700`}>{s}</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaInbox className="text-light-orange" /> Enquiries
            </h1>
            <p className="text-gray-600 mt-1">
              Request medicines from suppliers
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={load}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={() => setCreateModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <FaPlus /> New Enquiry
            </button>
          </div>
        </div>

        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start justify-between ${
              actionMessage.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {actionMessage.type === "success" ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaExclamationCircle className="text-red-500" />
              )}
              <p
                className={`text-sm ${actionMessage.type === "success" ? "text-green-700" : "text-red-700"}`}
              >
                {actionMessage.text}
              </p>
            </div>
            <button onClick={() => setActionMessage(null)}>
              <FaTimes />
            </button>
          </div>
        )}

        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total", value: statistics.total },
              { label: "Pending", value: statistics.pending },
              { label: "Accepted", value: statistics.accepted },
              { label: "Rejected", value: statistics.rejected },
              { label: "Cancelled", value: statistics.cancelled },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
              >
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by medicine or supplier..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading && enquiries.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-orange mx-auto"></div>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaInbox className="text-3xl text-light-orange" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No enquiries
            </h3>
            <p className="text-gray-500 mb-6">
              Start by creating an enquiry for a supplier.
            </p>
            <button
              onClick={() => setCreateModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <FaPlus /> Create Enquiry
            </button>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {e.medicine?.name}
                      </h3>
                      {statusBadge(e.status)}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <FaUser className="text-xs" /> {e.supplier?.name} (
                      {e.supplier?.email})
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <FaBoxes /> Requested:{" "}
                        <span className="font-semibold">
                          {e.requested_quantity}
                        </span>
                      </span>
                      {e.target_unit_price && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <FaDollarSign /> Target:{" "}
                          <span className="font-semibold">
                            ${Number(e.target_unit_price).toFixed(2)}
                          </span>
                        </span>
                      )}
                    </div>
                    {e.message && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        "{e.message}"
                      </p>
                    )}
                    {e.response_message && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-semibold">Response: </span>
                        {e.response_message}
                      </p>
                    )}
                  </div>
                  {e.status === "pending" && (
                    <button
                      onClick={() => handleCancel(e.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium"
                    >
                      <FaTimes /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {createModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Create Enquiry
              </h2>
              <button onClick={() => setCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine *
                </label>
                <select
                  value={medicineId}
                  onChange={(e) => setMedicineId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                >
                  <option value="">Select medicine from catalog</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier *
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
                {suppliers.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    No active suppliers found.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Price
                  </label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) =>
                      setTargetPrice(
                        e.target.value === "" ? "" : parseFloat(e.target.value),
                      )
                    }
                    min={0}
                    step="0.01"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                  placeholder="Message to supplier..."
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCreateModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={processing}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {processing ? "Sending..." : "Send Enquiry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiries;
