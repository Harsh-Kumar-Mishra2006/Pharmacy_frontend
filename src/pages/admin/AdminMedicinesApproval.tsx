// src/pages/admin/AdminMedicineApprovals.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useMedicine } from "../../contexts/MedicineContext";
import {
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaTimes,
  FaCapsules,
  FaExclamationCircle,
  FaSync,
  FaCheck,
  FaBoxes,
  FaDollarSign,
  FaUser,
  FaInfoCircle,
  FaFlask,
  FaShieldAlt,
} from "react-icons/fa";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

const AdminMedicineApprovals: React.FC = () => {
  const {
    medicines,
    isLoading,
    error,
    statistics,
    getMedicines,
    approveMedicine,
    rejectMedicine,
    getStatistics,
    clearError,
  } = useMedicine();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);
  const [approveModal, setApproveModal] = useState<any | null>(null);
  const [rejectModal, setRejectModal] = useState<any | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load pending medicines on mount
  useEffect(() => {
    loadMedicines();
    getStatistics();
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

  const loadMedicines = async () => {
    clearError();
    const filters: any = { limit: 100 };
    if (statusFilter !== "all") filters.status = statusFilter;
    await getMedicines(filters);
  };

  // Reload when filter changes
  useEffect(() => {
    loadMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filteredMedicines = useMemo(() => {
    let result = [...medicines];
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(s) ||
          m.generic_name?.toLowerCase().includes(s) ||
          m.brand_name?.toLowerCase().includes(s) ||
          m.category.toLowerCase().includes(s) ||
          m.supplier?.name.toLowerCase().includes(s),
      );
    }
    return result;
  }, [medicines, searchTerm]);

  const handleApprove = async () => {
    if (!approveModal) return;
    setIsProcessing(true);
    try {
      await approveMedicine(approveModal.id, approvalNotes || undefined);
      setActionMessage({
        type: "success",
        text: `"${approveModal.name}" approved successfully`,
      });
      setApproveModal(null);
      setApprovalNotes("");
      await loadMedicines();
      await getStatistics();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to approve",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectionReason.trim()) return;
    setIsProcessing(true);
    try {
      await rejectMedicine(rejectModal.id, rejectionReason.trim());
      setActionMessage({
        type: "success",
        text: `"${rejectModal.name}" rejected`,
      });
      setRejectModal(null);
      setRejectionReason("");
      await loadMedicines();
      await getStatistics();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to reject",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const base =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "approved":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            <FaCheckCircle className="text-xs" /> Approved
          </span>
        );
      case "pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            <FaClock className="text-xs" /> Pending
          </span>
        );
      case "rejected":
        return (
          <span className={`${base} bg-red-100 text-red-700`}>
            <FaTimesCircle className="text-xs" /> Rejected
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>
        );
    }
  };

  const formatDate = (d?: string | Date | null) => {
    if (!d) return "N/A";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      label: "Rejected",
      value: statistics?.rejected ?? 0,
      icon: <FaTimesCircle />,
      color: "from-red-500 to-red-600",
    },
    {
      label: "Total",
      value: statistics?.total ?? 0,
      icon: <FaCapsules />,
      color: "from-blue-500 to-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaShieldAlt className="text-light-orange" />
              Medicine Approvals
            </h1>
            <p className="text-gray-600 mt-1">
              Review supplier submissions and approve or reject them
            </p>
          </div>
          <button
            onClick={loadMedicines}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            <FaSync className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Message */}
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
                <FaCheckCircle className="text-green-500 mt-0.5" />
              ) : (
                <FaExclamationCircle className="text-red-500 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  actionMessage.type === "success"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {actionMessage.text}
              </p>
            </div>
            <button
              onClick={() => setActionMessage(null)}
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
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, category, or supplier..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent appearance-none"
              >
                <option value="pending">Pending Only</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && medicines.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-orange mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading...</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredMedicines.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCapsules className="text-3xl text-light-orange" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No {statusFilter === "all" ? "" : statusFilter} medicines
            </h3>
            <p className="text-gray-500">Nothing to review right now.</p>
          </div>
        )}

        {/* Medicine Grid */}
        {!isLoading && filteredMedicines.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-36 bg-gradient-to-br from-light-orange/10 to-pink/10 relative">
                  {m.images && m.images[0] ? (
                    <img
                      src={m.images[0]}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaCapsules className="text-5xl text-light-orange/30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(m.status)}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-lg truncate">
                    {m.name}
                  </h3>
                  {m.generic_name && (
                    <p className="text-sm text-gray-500 truncate">
                      {m.generic_name}
                    </p>
                  )}
                  <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {m.category}
                  </span>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Stock</p>
                      <p className="font-semibold text-gray-800">
                        {m.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Price</p>
                      <p className="font-semibold text-gray-800">
                        ${Number(m.unit_price).toFixed(2)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <FaUser className="text-xs" /> Supplier
                      </p>
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {m.supplier?.name || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelectedMedicine(m)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <FaEye className="text-xs" /> View
                    </button>
                    {m.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            setApproveModal(m);
                            setApprovalNotes("");
                          }}
                          className="flex items-center justify-center px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => {
                            setRejectModal(m);
                            setRejectionReason("");
                          }}
                          className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Reject"
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== VIEW DETAILS MODAL ========== */}
      {selectedMedicine && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedicine(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">
                Medicine Details
              </h2>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  {selectedMedicine.images?.[0] ? (
                    <img
                      src={selectedMedicine.images[0]}
                      alt={selectedMedicine.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <FaCapsules className="text-4xl text-light-orange" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedMedicine.name}
                  </h3>
                  {selectedMedicine.generic_name && (
                    <p className="text-gray-500">
                      {selectedMedicine.generic_name}
                    </p>
                  )}
                  {selectedMedicine.brand_name && (
                    <p className="text-sm text-gray-500">
                      Brand: {selectedMedicine.brand_name}
                    </p>
                  )}
                  <div className="mt-2">
                    {getStatusBadge(selectedMedicine.status)}
                  </div>
                </div>
              </div>

              {/* Supplier */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-1">
                  Submitted By
                </p>
                <p className="font-medium text-gray-800">
                  {selectedMedicine.supplier?.name || "Unknown"}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedMedicine.supplier?.email}
                </p>
                {selectedMedicine.supplier?.phone && (
                  <p className="text-sm text-gray-600">
                    {selectedMedicine.supplier.phone}
                  </p>
                )}
              </div>

              {/* Basic Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-light-orange" /> Basic
                  Information
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <DetailItem
                    label="Category"
                    value={selectedMedicine.category}
                  />
                  <DetailItem
                    label="Form"
                    value={selectedMedicine.other_details?.form || "N/A"}
                  />
                  <DetailItem
                    label="Strength"
                    value={selectedMedicine.other_details?.strength || "N/A"}
                  />
                  <DetailItem
                    label="Pack Size"
                    value={selectedMedicine.other_details?.pack_size || "N/A"}
                  />
                  <DetailItem
                    label="Unit"
                    value={selectedMedicine.other_details?.unit || "N/A"}
                  />
                  <DetailItem
                    label="Product Code"
                    value={
                      selectedMedicine.other_details?.product_code || "N/A"
                    }
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaDollarSign className="text-light-orange" /> Pricing & Stock
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <DetailItem
                    label="Unit Price"
                    value={`$${Number(selectedMedicine.unit_price).toFixed(2)}`}
                  />
                  <DetailItem
                    label="Purchase Price"
                    value={
                      selectedMedicine.purchase_price
                        ? `$${Number(selectedMedicine.purchase_price).toFixed(2)}`
                        : "N/A"
                    }
                  />
                  <DetailItem
                    label="Discount"
                    value={`${selectedMedicine.discount_percentage || 0}%`}
                  />
                  <DetailItem
                    label="Quantity"
                    value={String(selectedMedicine.quantity)}
                  />
                  <DetailItem
                    label="Low Stock Alert"
                    value={String(selectedMedicine.min_quantity_alert)}
                  />
                  <DetailItem
                    label="Expiry"
                    value={formatDate(selectedMedicine.expiry_date)}
                  />
                </div>
              </div>

              {/* Medical Info */}
              {(selectedMedicine.medical_details?.usage ||
                selectedMedicine.medical_details?.dosage ||
                selectedMedicine.medical_details?.storage) && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaFlask className="text-light-orange" /> Medical
                    Information
                  </h4>
                  <div className="space-y-3">
                    {selectedMedicine.medical_details.usage && (
                      <LabeledText
                        label="Usage"
                        value={selectedMedicine.medical_details.usage}
                      />
                    )}
                    {selectedMedicine.medical_details.dosage && (
                      <LabeledText
                        label="Dosage"
                        value={selectedMedicine.medical_details.dosage}
                      />
                    )}
                    {selectedMedicine.medical_details.storage && (
                      <LabeledText
                        label="Storage"
                        value={selectedMedicine.medical_details.storage}
                      />
                    )}
                    {selectedMedicine.medical_details.manufacturer && (
                      <LabeledText
                        label="Manufacturer"
                        value={selectedMedicine.medical_details.manufacturer}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Composition */}
              {selectedMedicine.other_details?.composition?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Composition
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMedicine.other_details.composition.map(
                      (c: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {c}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Special Handling */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaBoxes className="text-light-orange" /> Special Handling
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Flag
                    active={selectedMedicine.metadata?.is_prescription_required}
                    label="Prescription Required"
                  />
                  <Flag
                    active={selectedMedicine.metadata?.cold_chain_required}
                    label="Cold Chain"
                  />
                  <Flag
                    active={selectedMedicine.metadata?.hazardous}
                    label="Hazardous"
                  />
                </div>
              </div>

              {/* Approval Notes */}
              {selectedMedicine.approval_notes && (
                <div
                  className={`p-4 rounded-lg ${
                    selectedMedicine.status === "rejected"
                      ? "bg-red-50 border border-red-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase mb-1">
                    {selectedMedicine.status === "rejected"
                      ? "Rejection Reason"
                      : "Approval Notes"}
                  </p>
                  <p className="text-sm">{selectedMedicine.approval_notes}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
              <button
                onClick={() => setSelectedMedicine(null)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              {selectedMedicine.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      setRejectModal(selectedMedicine);
                      setSelectedMedicine(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setApproveModal(selectedMedicine);
                      setSelectedMedicine(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== APPROVE MODAL ========== */}
      {approveModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setApproveModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Approve Medicine?
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Approving{" "}
              <span className="font-semibold">"{approveModal.name}"</span> will
              make it visible to customers immediately.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Notes (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent"
                placeholder="Any notes for the supplier..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setApproveModal(null)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium disabled:opacity-50"
              >
                {isProcessing ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== REJECT MODAL ========== */}
      {rejectModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setRejectModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimesCircle className="text-red-600 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Reject Medicine?
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Rejecting{" "}
              <span className="font-semibold">"{rejectModal.name}"</span>. The
              supplier will see your reason.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Explain why this medicine is being rejected..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium disabled:opacity-50"
              >
                {isProcessing ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Small helper components ----------

const DetailItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-800 text-sm">{value}</p>
  </div>
);

const LabeledText: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
    <p className="text-gray-800 text-sm whitespace-pre-wrap">{value}</p>
  </div>
);

const Flag: React.FC<{ active?: boolean; label: string }> = ({
  active,
  label,
}) => (
  <span
    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
      active ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
    }`}
  >
    {active ? (
      <FaCheckCircle className="text-xs" />
    ) : (
      <FaTimesCircle className="text-xs" />
    )}
    {label}
  </span>
);

export default AdminMedicineApprovals;
