// src/pages/admin/AdminSupplyApprovals.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useSupply } from "../../contexts/SupplyContext";
import {
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaTimes,
  FaTruck,
  FaExclamationCircle,
  FaSync,
  FaCheck,
  FaBoxes,
  FaDollarSign,
  FaUser,
  FaShieldAlt,
} from "react-icons/fa";
import { type Supply, type SupplyStatus } from "../../types";

type StatusFilter = "pending" | "approved" | "rejected" | "received" | "all";

const AdminSupplyApprovals: React.FC = () => {
  const {
    supplies,
    isLoading,
    error,
    statistics,
    getSupplies,
    approveSupply,
    rejectSupply,
    receiveSupply,
    getStatistics,
    clearError,
  } = useSupply();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Supply | null>(null);
  const [approveModal, setApproveModal] = useState<Supply | null>(null);
  const [rejectModal, setRejectModal] = useState<Supply | null>(null);
  const [receiveModal, setReceiveModal] = useState<Supply | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

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
    const filters: any = { limit: 100 };
    if (statusFilter !== "all") filters.status = statusFilter;
    await Promise.all([getSupplies(filters), getStatistics()]);
  };

  const filtered = useMemo(() => {
    let r = [...supplies];
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      r = r.filter(
        (sp) =>
          sp.medicine?.name?.toLowerCase().includes(s) ||
          sp.medicine?.generic_name?.toLowerCase().includes(s) ||
          sp.supplier?.name?.toLowerCase().includes(s),
      );
    }
    return r;
  }, [supplies, searchTerm]);

  const handleApprove = async () => {
    if (!approveModal) return;
    setProcessing(true);
    try {
      await approveSupply(approveModal.id, approvalNotes || undefined);
      setMessage({ type: "success", text: "Supply approved" });
      setApproveModal(null);
      setApprovalNotes("");
      await load();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to approve" });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectionReason.trim()) return;
    setProcessing(true);
    try {
      await rejectSupply(rejectModal.id, rejectionReason.trim());
      setMessage({ type: "success", text: "Supply rejected" });
      setRejectModal(null);
      setRejectionReason("");
      await load();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to reject" });
    } finally {
      setProcessing(false);
    }
  };

  const handleReceive = async () => {
    if (!receiveModal) return;
    setProcessing(true);
    try {
      await receiveSupply(receiveModal.id);
      setMessage({ type: "success", text: "Supply marked as received" });
      setReceiveModal(null);
      await load();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to receive" });
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

  const stats = [
    {
      label: "Pending",
      value: statistics?.pending ?? 0,
      icon: <FaClock />,
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Approved",
      value: statistics?.approved ?? 0,
      icon: <FaCheckCircle />,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Received",
      value: statistics?.received ?? 0,
      icon: <FaCheckCircle />,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Rejected",
      value: statistics?.rejected ?? 0,
      icon: <FaTimesCircle />,
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaShieldAlt className="text-light-orange" /> Supply Approvals
            </h1>
            <p className="text-gray-600 mt-1">
              Review stock sent by suppliers and approve intake
            </p>
          </div>
          <button
            onClick={load}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
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
                placeholder="Search by medicine or supplier..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange appearance-none"
              >
                <option value="pending">Pending Only</option>
                <option value="approved">Approved</option>
                <option value="received">Received</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
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
              No {statusFilter === "all" ? "" : statusFilter} supplies
            </h3>
            <p className="text-gray-500">Nothing to review right now.</p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((sp) => (
              <div
                key={sp.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-36 bg-gradient-to-br from-light-orange/10 to-pink/10 relative">
                  {sp.medicine?.images?.[0] ? (
                    <img
                      src={sp.medicine.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaTruck className="text-5xl text-light-orange/30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(sp.status)}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-lg truncate">
                    {sp.medicine?.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <FaUser className="text-xs" />{" "}
                    {sp.supplier?.name || "Unknown"}
                  </div>

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
                      <p className="text-gray-500 text-xs">Total Value</p>
                      <p className="font-semibold text-light-orange">
                        ${Number(sp.total_price).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelected(sp)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
                    >
                      <FaEye className="text-xs" /> View
                    </button>
                    {sp.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            setApproveModal(sp);
                            setApprovalNotes("");
                          }}
                          className="flex items-center justify-center px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => {
                            setRejectModal(sp);
                            setRejectionReason("");
                          }}
                          className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          title="Reject"
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}
                    {sp.status === "approved" && (
                      <button
                        onClick={() => setReceiveModal(sp)}
                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium"
                        title="Receive"
                      >
                        <FaBoxes /> Receive
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
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">
                Supply Details
              </h2>
              <button onClick={() => setSelected(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-5">
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
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selected.medicine?.name}
                  </h3>
                  {selected.medicine?.generic_name && (
                    <p className="text-gray-500">
                      {selected.medicine.generic_name}
                    </p>
                  )}
                  <div className="mt-2">{getStatusBadge(selected.status)}</div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-1">
                  Supplier
                </p>
                <p className="font-medium text-gray-800">
                  {selected.supplier?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {selected.supplier?.email}
                </p>
                {selected.supplier?.phone && (
                  <p className="text-sm text-gray-600">
                    {selected.supplier.phone}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Detail label="Quantity" value={String(selected.quantity)} />
                <Detail
                  label="Unit Price"
                  value={`$${Number(selected.unit_price).toFixed(2)}`}
                />
                <Detail
                  label="Total Value"
                  value={`$${Number(selected.total_price).toFixed(2)}`}
                />
                <Detail
                  label="Expiry"
                  value={
                    selected.expiry_date
                      ? new Date(selected.expiry_date).toLocaleDateString()
                      : "N/A"
                  }
                />
                <Detail
                  label="Created"
                  value={new Date(selected.created_at!).toLocaleDateString()}
                />
              </div>

              {selected.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Supplier Notes</p>
                  <p className="text-sm text-gray-800">{selected.notes}</p>
                </div>
              )}

              {selected.approval_notes && (
                <div
                  className={`p-4 rounded-lg ${selected.status === "rejected" ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}
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

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              {selected.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      setRejectModal(selected);
                      setSelected(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setApproveModal(selected);
                      setSelected(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium"
                  >
                    Approve
                  </button>
                </>
              )}
              {selected.status === "approved" && (
                <button
                  onClick={() => {
                    setReceiveModal(selected);
                    setSelected(null);
                  }}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-medium"
                >
                  Mark Received
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {approveModal && (
        <Modal onClose={() => setApproveModal(null)}>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-600 text-xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
            Approve Supply?
          </h2>
          <p className="text-gray-600 text-center mb-4">
            {approveModal.quantity} units of{" "}
            <span className="font-semibold">{approveModal.medicine?.name}</span>{" "}
            from{" "}
            <span className="font-semibold">{approveModal.supplier?.name}</span>
          </p>
          <textarea
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            rows={3}
            placeholder="Notes (optional)"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setApproveModal(null)}
              disabled={processing}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={processing}
              className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium disabled:opacity-50"
            >
              {processing ? "Approving..." : "Approve"}
            </button>
          </div>
        </Modal>
      )}

      {rejectModal && (
        <Modal onClose={() => setRejectModal(null)}>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-red-600 text-xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
            Reject Supply?
          </h2>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            placeholder="Reason (required)"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setRejectModal(null)}
              disabled={processing}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
              className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium disabled:opacity-50"
            >
              {processing ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </Modal>
      )}

      {receiveModal && (
        <Modal onClose={() => setReceiveModal(null)}>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBoxes className="text-blue-600 text-xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
            Mark Supply Received?
          </h2>
          <p className="text-gray-600 text-center mb-4">
            Confirm you've received {receiveModal.quantity} units from{" "}
            {receiveModal.supplier?.name}.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setReceiveModal(null)}
              disabled={processing}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleReceive}
              disabled={processing}
              className="flex-1 px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-medium disabled:opacity-50"
            >
              {processing ? "Updating..." : "Confirm Received"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const Detail: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-800 text-sm">{value}</p>
  </div>
);

export default AdminSupplyApprovals;
