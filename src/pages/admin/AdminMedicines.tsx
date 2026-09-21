// src/pages/supplier/MyMedicines.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMedicine } from "../../contexts/MedicineContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaBoxes,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
  FaEye,
  FaSync,
  FaSort,
  FaDollarSign,
  FaCalendarAlt,
  FaCapsules,
  FaExclamationCircle,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import { type Medicine } from "../../types";

type StatusFilter = "all" | "approved" | "pending" | "rejected" | "inactive";
type SortField = "created_at" | "name" | "quantity" | "unit_price" | "status";

const MyMedicines: React.FC = () => {
  const { user } = useAuth();
  const {
    medicines,
    isLoading,
    error,
    supplierSummary,
    getMedicines,
    getSupplierSummary,
    updateQuantity,
    deleteMedicine,
    clearError,
  } = useMedicine();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null,
  );
  const [quantityModal, setQuantityModal] = useState<{
    medicine: Medicine;
    operation: "set" | "add" | "subtract";
    value: number;
  } | null>(null);
  const [deleteModal, setDeleteModal] = useState<Medicine | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial load
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      setActionMessage({ type: "error", text: error });
    }
  }, [error]);

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  const loadData = async () => {
    clearError();
    await Promise.all([getMedicines({ limit: 100 }), getSupplierSummary()]);
  };

  // Get unique categories from medicines
  const categories = useMemo(() => {
    const cats = new Set(medicines.map((m) => m.category));
    return Array.from(cats).sort();
  }, [medicines]);

  // Filter & sort medicines
  const filteredMedicines = useMemo(() => {
    let result = [...medicines];

    // Search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.generic_name?.toLowerCase().includes(search) ||
          m.brand_name?.toLowerCase().includes(search) ||
          m.category.toLowerCase().includes(search),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((m) => m.category === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "quantity":
          aVal = a.quantity;
          bVal = b.quantity;
          break;
        case "unit_price":
          aVal = Number(a.unit_price);
          bVal = Number(b.unit_price);
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "created_at":
        default:
          aVal = new Date(a.created_at || 0).getTime();
          bVal = new Date(b.created_at || 0).getTime();
          break;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    medicines,
    searchTerm,
    statusFilter,
    categoryFilter,
    sortField,
    sortOrder,
  ]);

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const base =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "approved":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            <FaCheckCircle className="text-xs" />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            <FaClock className="text-xs" />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className={`${base} bg-red-100 text-red-700`}>
            <FaTimesCircle className="text-xs" />
            Rejected
          </span>
        );
      case "inactive":
        return (
          <span className={`${base} bg-gray-100 text-gray-700`}>
            <FaTimesCircle className="text-xs" />
            Inactive
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>
        );
    }
  };

  // Stock status helper
  const getStockBadge = (medicine: Medicine) => {
    if (medicine.quantity === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Out of Stock
        </span>
      );
    }
    if (medicine.quantity <= medicine.min_quantity_alert) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          <FaExclamationTriangle className="text-xs" />
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        In Stock
      </span>
    );
  };

  // Format helpers
  const formatPrice = (price: number | string) => {
    return `$${Number(price).toFixed(2)}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle quantity update
  const handleQuantityUpdate = async () => {
    if (!quantityModal) return;
    const { medicine, operation, value } = quantityModal;

    if (value < 0) {
      setActionMessage({ type: "error", text: "Quantity cannot be negative" });
      return;
    }

    setIsProcessing(true);
    try {
      await updateQuantity(medicine.id, { quantity: value, operation });
      setActionMessage({
        type: "success",
        text: `Quantity updated successfully!`,
      });
      setQuantityModal(null);
      await loadData();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to update quantity",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteModal) return;

    setIsProcessing(true);
    try {
      await deleteMedicine(deleteModal.id);
      setActionMessage({
        type: "success",
        text: "Medicine deleted successfully",
      });
      setDeleteModal(null);
      await loadData();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to delete medicine",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats cards
  const stats = [
    {
      label: "Total",
      value: supplierSummary?.total ?? medicines.length,
      icon: <FaCapsules />,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Approved",
      value: supplierSummary?.approved ?? 0,
      icon: <FaCheckCircle />,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Pending",
      value: supplierSummary?.pending ?? 0,
      icon: <FaClock />,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "Rejected",
      value: supplierSummary?.rejected ?? 0,
      icon: <FaTimesCircle />,
      color: "from-red-500 to-red-600",
    },
    {
      label: "Low Stock",
      value: supplierSummary?.low_stock ?? 0,
      icon: <FaExclamationTriangle />,
      color: "from-orange-500 to-orange-600",
    },
    {
      label: "Out of Stock",
      value: supplierSummary?.out_of_stock ?? 0,
      icon: <FaExclamationCircle />,
      color: "from-red-600 to-red-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Medicines</h1>
            <p className="text-gray-600 mt-1">
              Manage your medicine inventory • Welcome, {user?.name}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <Link
              to="/supplier/medicines/add"
              className="btn-primary inline-flex items-center gap-2"
            >
              <FaPlus />
              Add Medicine
            </Link>
          </div>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start justify-between gap-3 ${
              actionMessage.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {actionMessage.type === "success" ? (
                <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}
              >
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, generic, brand, or category..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition appearance-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Category filter */}
            <div className="relative">
              <FaCapsules className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort controls */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <FaSort />
              Sort by:
            </span>
            {(
              [
                { field: "created_at", label: "Date" },
                { field: "name", label: "Name" },
                { field: "quantity", label: "Stock" },
                { field: "unit_price", label: "Price" },
                { field: "status", label: "Status" },
              ] as { field: SortField; label: string }[]
            ).map((option) => (
              <button
                key={option.field}
                onClick={() => {
                  if (sortField === option.field) {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortField(option.field);
                    setSortOrder("desc");
                  }
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  sortField === option.field
                    ? "bg-light-orange text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
                {sortField === option.field && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            ))}
            <span className="ml-auto text-sm text-gray-500">
              {filteredMedicines.length}{" "}
              {filteredMedicines.length === 1 ? "medicine" : "medicines"}
            </span>
          </div>
        </div>

        {/* Loading */}
        {isLoading && medicines.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-orange mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading medicines...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredMedicines.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCapsules className="text-3xl text-light-orange" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {medicines.length === 0
                ? "No medicines yet"
                : "No medicines match your filters"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {medicines.length === 0
                ? "Get started by adding your first medicine to the inventory."
                : "Try adjusting your search or filter criteria."}
            </p>
            {medicines.length === 0 ? (
              <Link
                to="/supplier/medicines/add"
                className="btn-primary inline-flex items-center gap-2"
              >
                <FaPlus />
                Add Your First Medicine
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="btn-primary inline-flex items-center gap-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Medicines Grid */}
        {!isLoading && filteredMedicines.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((medicine) => (
              <div
                key={medicine.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image / Header */}
                <div className="h-40 bg-gradient-to-br from-light-orange/10 to-pink/10 relative">
                  {medicine.images && medicine.images.length > 0 ? (
                    <img
                      src={medicine.images[0]}
                      alt={medicine.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaCapsules className="text-5xl text-light-orange/30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(medicine.status)}
                  </div>
                  <div className="absolute top-3 right-3">
                    {getStockBadge(medicine)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3
                      className="font-bold text-gray-800 text-lg truncate"
                      title={medicine.name}
                    >
                      {medicine.name}
                    </h3>
                    {medicine.generic_name && (
                      <p className="text-sm text-gray-500 truncate">
                        {medicine.generic_name}
                      </p>
                    )}
                    <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {medicine.category}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Stock</p>
                      <p className="font-semibold text-gray-800">
                        {medicine.quantity}{" "}
                        {medicine.other_details?.unit || "pcs"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Price</p>
                      <p className="font-semibold text-gray-800 flex items-center gap-0.5">
                        <FaDollarSign className="text-xs" />
                        {Number(medicine.unit_price).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Discount</p>
                      <p className="font-semibold text-gray-800">
                        {medicine.discount_percentage || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <FaCalendarAlt className="text-xs" />
                        Expiry
                      </p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(medicine.expiry_date)}
                      </p>
                    </div>
                  </div>

                  {/* Approval notes if rejected */}
                  {medicine.status === "rejected" &&
                    medicine.approval_notes && (
                      <div className="mb-4 p-2 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-xs text-red-700">
                          <span className="font-semibold">Reason: </span>
                          {medicine.approval_notes}
                        </p>
                      </div>
                    )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMedicine(medicine)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <FaEye className="text-xs" />
                      View
                    </button>
                    <button
                      onClick={() =>
                        setQuantityModal({
                          medicine,
                          operation: "set",
                          value: medicine.quantity,
                        })
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-light-orange/10 text-light-orange hover:bg-light-orange/20 transition-colors text-sm font-medium"
                    >
                      <FaBoxes className="text-xs" />
                      Stock
                    </button>
                    <Link
                      to={`/supplier/medicines/edit/${medicine.id}`}
                      className="flex items-center justify-center px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Edit"
                    >
                      <FaEdit className="text-xs" />
                    </Link>
                    <button
                      onClick={() => setDeleteModal(medicine)}
                      className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedMedicine && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedicine(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
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
                <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  {selectedMedicine.images && selectedMedicine.images[0] ? (
                    <img
                      src={selectedMedicine.images[0]}
                      alt={selectedMedicine.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <FaCapsules className="text-3xl text-light-orange" />
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
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(selectedMedicine.status)}
                    {getStockBadge(selectedMedicine)}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Category"
                  value={selectedMedicine.category}
                />
                <DetailItem
                  label="Brand"
                  value={selectedMedicine.brand_name || "N/A"}
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
                  label="Unit Price"
                  value={formatPrice(selectedMedicine.unit_price)}
                />
                <DetailItem
                  label="Purchase Price"
                  value={
                    selectedMedicine.purchase_price
                      ? formatPrice(selectedMedicine.purchase_price)
                      : "N/A"
                  }
                />
                <DetailItem
                  label="Discount"
                  value={`${selectedMedicine.discount_percentage || 0}%`}
                />
                <DetailItem
                  label="Stock"
                  value={`${selectedMedicine.quantity} ${
                    selectedMedicine.other_details?.unit || "pcs"
                  }`}
                />
                <DetailItem
                  label="Low Stock Alert"
                  value={String(selectedMedicine.min_quantity_alert)}
                />
                <DetailItem
                  label="Expiry Date"
                  value={formatDate(selectedMedicine.expiry_date)}
                />
              </div>

              {selectedMedicine.other_details?.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Description
                  </p>
                  <p className="text-gray-800 text-sm">
                    {selectedMedicine.other_details.description}
                  </p>
                </div>
              )}

              {selectedMedicine.medical_details?.usage && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Usage
                  </p>
                  <p className="text-gray-800 text-sm">
                    {selectedMedicine.medical_details.usage}
                  </p>
                </div>
              )}

              {selectedMedicine.medical_details?.dosage && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Dosage
                  </p>
                  <p className="text-gray-800 text-sm">
                    {selectedMedicine.medical_details.dosage}
                  </p>
                </div>
              )}

              {selectedMedicine.other_details?.composition &&
                selectedMedicine.other_details.composition.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                      Composition
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMedicine.other_details.composition.map(
                        (item, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {item}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Approval Notes */}
              {selectedMedicine.approval_notes && (
                <div
                  className={`p-4 rounded-lg ${
                    selectedMedicine.status === "rejected"
                      ? "bg-red-50 border border-red-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold mb-1 ${
                      selectedMedicine.status === "rejected"
                        ? "text-red-700"
                        : "text-blue-700"
                    }`}
                  >
                    {selectedMedicine.status === "rejected"
                      ? "Rejection Reason"
                      : "Approval Notes"}
                  </p>
                  <p
                    className={`text-sm ${
                      selectedMedicine.status === "rejected"
                        ? "text-red-700"
                        : "text-blue-700"
                    }`}
                  >
                    {selectedMedicine.approval_notes}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
              <button
                onClick={() => setSelectedMedicine(null)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              <Link
                to={`/supplier/medicines/edit/${selectedMedicine.id}`}
                className="flex-1 btn-primary text-center"
              >
                Edit Medicine
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Update Modal */}
      {quantityModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setQuantityModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Update Stock</h2>
              <button
                onClick={() => setQuantityModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Medicine</p>
              <p className="font-semibold text-gray-800">
                {quantityModal.medicine.name}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Current stock:{" "}
                <span className="font-semibold text-gray-800">
                  {quantityModal.medicine.quantity}
                </span>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["set", "add", "subtract"] as const).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() =>
                        setQuantityModal({ ...quantityModal, operation: op })
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        quantityModal.operation === op
                          ? "bg-light-orange text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantityModal.value}
                  onChange={(e) =>
                    setQuantityModal({
                      ...quantityModal,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  min={0}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange focus:border-transparent transition text-lg font-semibold"
                />
                {quantityModal.operation !== "set" && (
                  <p className="text-xs text-gray-500 mt-1">
                    New total:{" "}
                    {quantityModal.operation === "add"
                      ? quantityModal.medicine.quantity + quantityModal.value
                      : Math.max(
                          0,
                          quantityModal.medicine.quantity - quantityModal.value,
                        )}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setQuantityModal(null)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleQuantityUpdate}
                disabled={isProcessing}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  "Updating..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FaSave />
                    Update
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-red-600 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Delete Medicine?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                "{deleteModal.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
              >
                {isProcessing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Detail item component
const DetailItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-800 text-sm">{value}</p>
  </div>
);

export default MyMedicines;
