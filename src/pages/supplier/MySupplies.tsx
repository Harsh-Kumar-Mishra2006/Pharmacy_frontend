// src/pages/supplier/MySupplies.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSupply } from "../../contexts/SupplyContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTruck,
  FaEye,
  FaSync,
  FaTimes,
  FaExclamationCircle,
  FaDollarSign,
  FaTrash,
} from "react-icons/fa";
import { type Supply, type SupplyStatus } from "../../types";

const MySupplies: React.FC = () => {
  const { user } = useAuth();
  const {
    supplies,
    isLoading,
    error,
    supplierSummary,
    getSupplies,
    getSupplierSummary,
    deleteSupply,
    clearError,
  } = useSupply();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SupplyStatus>("all");
  const [selected, setSelected] = useState<Supply | null>(null);
  const [deleteModal, setDeleteModal] = useState<Supply | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
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
    clearError();
    await Promise.all([getSupplies({ limit: 100 }), getSupplierSummary()]);
  };

  const filtered = useMemo(() => {
    let r = [...supplies];
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      r = r.filter(
        (sp) =>
          sp.medicine?.name?.toLowerCase().includes(s) ||
          sp.medicine?.generic_name?.toLowerCase().includes(s) ||
          sp.medicine?.category?.toLowerCase().includes(s),
      );
    }
    if (statusFilter !== "all")
      r = r.filter((sp) => sp.status === statusFilter);
    return r;
  }, [supplies, searchTerm, statusFilter]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setProcessing(true);
    try {
      await deleteSupply(deleteModal.id);
      setMessage({ type: "success", text: "Supply deleted" });
      setDeleteModal(null);
      await load();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete" });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: SupplyStatus) => {
    const base =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold";
    const map: Record<SupplyStatus, React.ReactElement> = {
      approved: (
        <span className={`${base} bg-green-100 text-green-700`}>
          <FaCheckCircle /> Approved
        </span>
      ),
      pending: (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>
          <FaClock /> Pending
        </span>
      ),
      rejected: (
        <span className={`${base} bg-red-100 text-red-700`}>
          <FaTimesCircle /> Rejected
        </span>
      ),
      received: (
        <span className={`${base} bg-blue-100 text-blue-700`}>
          <FaCheckCircle /> Received
        </span>
      ),
    };
    return map[status];
  };

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  const stats = [
    {
      label: "Total",
      value: supplierSummary?.total ?? 0,
      icon: <FaTruck />,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Pending",
      value: supplierSummary?.pending ?? 0,
      icon: <FaClock />,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "Approved",
      value: supplierSummary?.approved ?? 0,
      icon: <FaCheckCircle />,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Rejected",
      value: supplierSummary?.rejected ?? 0,
      icon: <FaTimesCircle />,
      color: "from-red-500 to-red-600",
    },
    {
      label: "Received",
      value: supplierSummary?.received ?? 0,
      icon: <FaCheckCircle />,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Supplies</h1>
            <p className="text-gray-600 mt-1">
              Track supplies you've sent to the admin • {user?.name}
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
            <Link
              to="/supplier/supplies/create"
              className="btn-primary inline-flex items-center gap-2"
            >
              <FaPlus /> New Supply
            </Link>
          </div>
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
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}
              >
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by medicine name or category..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="received">Received</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading && supplies.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-orange mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading supplies...</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTruck className="text-3xl text-light-orange" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No supplies yet
            </h3>
            <p className="text-gray-500 mb-6">
              Pick a medicine from the catalog and send stock to the admin.
            </p>
            <Link
              to="/supplier/catalog"
              className="btn-primary inline-flex items-center gap-2"
            >
              <FaPlus /> Browse Catalog
            </Link>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((sp) => (
              <div
                key={sp.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-32 bg-gradient-to-br from-light-orange/10 to-pink/10 relative">
                  {sp.medicine?.images?.[0] ? (
                    <img
                      src={sp.medicine.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaTruck className="text-4xl text-light-orange/30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(sp.status)}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-lg truncate">
                    {sp.medicine?.name || "Medicine"}
                  </h3>
                  {sp.medicine?.generic_name && (
                    <p className="text-sm text-gray-500 truncate">
                      {sp.medicine.generic_name}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Quantity</p>
                      <p className="font-semibold text-gray-800">
                        {sp.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Unit Price</p>
                      <p className="font-semibold text-gray-800 flex items-center gap-0.5">
                        <FaDollarSign className="text-xs" />
                        {Number(sp.unit_price).toFixed(2)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Total</p>
                      <p className="font-semibold text-light-orange">
                        ${Number(sp.total_price).toFixed(2)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Created</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {formatDate(sp.created_at)}
                      </p>
                    </div>
                  </div>

                  {sp.status === "rejected" && sp.approval_notes && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-xs text-red-700">
                        <span className="font-semibold">Reason: </span>
                        {sp.approval_notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelected(sp)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
                    >
                      <FaEye className="text-xs" /> View
                    </button>
                    {sp.status === "pending" && (
                      <button
                        onClick={() => setDeleteModal(sp)}
                        className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Supply Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  {selected.medicine?.images?.[0] ? (
                    <img
                      src={selected.medicine.images[0]}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <FaTruck className="text-3xl text-light-orange" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">
                    {selected.medicine?.name}
                  </h3>
                  {selected.medicine?.generic_name && (
                    <p className="text-sm text-gray-500">
                      {selected.medicine.generic_name}
                    </p>
                  )}
                  <div className="mt-2">{getStatusBadge(selected.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Quantity" value={String(selected.quantity)} />
                <Detail
                  label="Unit Price"
                  value={`$${Number(selected.unit_price).toFixed(2)}`}
                />
                <Detail
                  label="Total"
                  value={`$${Number(selected.total_price).toFixed(2)}`}
                />
                <Detail
                  label="Expiry"
                  value={formatDate(selected.expiry_date)}
                />
              </div>
              {selected.notes && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-gray-800">{selected.notes}</p>
                </div>
              )}
              {selected.approval_notes && (
                <div
                  className={`p-3 rounded-lg ${selected.status === "rejected" ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}
                >
                  <p className="text-xs font-semibold uppercase mb-1">
                    {selected.status === "rejected"
                      ? "Rejection Reason"
                      : "Admin Notes"}
                  </p>
                  <p className="text-sm">{selected.approval_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-red-600 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Delete Supply?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              This supply of{" "}
              <span className="font-semibold">{deleteModal.quantity}</span>{" "}
              units will be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={processing}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={processing}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium disabled:opacity-50"
              >
                {processing ? "Deleting..." : "Delete"}
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
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-800 text-sm">{value}</p>
  </div>
);

export default MySupplies;
