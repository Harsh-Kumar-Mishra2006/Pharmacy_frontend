// src/pages/admin/MedicineStock.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useMedicine } from "../../contexts/MedicineContext";
import {
  FaBoxes,
  FaSearch,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaRupeeSign,
  FaCapsules,
  FaFilter,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import { type MedicineStockItem, type MedicineStockSummary } from "../../types";

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

const MedicineStock: React.FC = () => {
  const { getMedicineStock, isLoading, error, clearError } = useMedicine();

  const [items, setItems] = useState<MedicineStockItem[]>([]);
  const [summary, setSummary] = useState<MedicineStockSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [selected, setSelected] = useState<MedicineStockItem | null>(null);
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
    const res = await getMedicineStock();
    setItems(res.data);
    setSummary(res.summary);
  };

  const filtered = useMemo(() => {
    let result = [...items];

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(s) ||
          m.generic_name?.toLowerCase().includes(s) ||
          m.brand_name?.toLowerCase().includes(s) ||
          m.category.toLowerCase().includes(s),
      );
    }

    switch (filter) {
      case "in_stock":
        result = result.filter((m) => m.in_stock && !m.is_low_stock);
        break;
      case "low_stock":
        result = result.filter((m) => m.is_low_stock);
        break;
      case "out_of_stock":
        result = result.filter((m) => m.is_out_of_stock);
        break;
      default:
        break;
    }

    return result;
  }, [items, searchTerm, filter]);

  const summaryCards = [
    {
      label: "Total Medicines",
      value: summary?.total_medicines ?? 0,
      icon: <FaCapsules />,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "In Stock",
      value: summary?.in_stock ?? 0,
      icon: <FaCheckCircle />,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Low Stock",
      value: summary?.low_stock ?? 0,
      icon: <FaExclamationTriangle />,
      color: "from-orange-500 to-red-500",
    },
    {
      label: "Out of Stock",
      value: summary?.out_of_stock ?? 0,
      icon: <FaTimesCircle />,
      color: "from-red-500 to-red-600",
    },
  ];

  const money = (n: number) =>
    `₹${Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getStockBadge = (m: MedicineStockItem) => {
    const base =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold";

    if (m.is_out_of_stock)
      return (
        <span className={`${base} bg-red-100 text-red-700`}>
          <FaTimesCircle className="text-xs" /> Out of Stock
        </span>
      );

    if (m.is_low_stock)
      return (
        <span className={`${base} bg-orange-100 text-orange-700`}>
          <FaExclamationTriangle className="text-xs" /> Low:{" "}
          {m.available_quantity}
        </span>
      );

    return (
      <span className={`${base} bg-green-100 text-green-700`}>
        <FaCheckCircle className="text-xs" /> {m.available_quantity} in stock
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaBoxes className="text-light-orange" /> Medicine Stock
            </h1>
            <p className="text-gray-600 mt-1">
              Live stock across all approved suppliers
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
                <FaCheckCircle className="text-green-500 mt-0.5" />
              ) : (
                <FaTimesCircle className="text-red-500 mt-0.5" />
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

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((s) => (
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

        {/* Value + Units summary row */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-light-orange/10 to-pink/10 rounded-xl p-5 border border-light-orange/20">
              <div className="flex items-center gap-3 mb-2">
                <FaRupeeSign className="text-light-orange" />
                <p className="text-sm font-medium text-gray-700">
                  Total Stock Value
                </p>
              </div>
              <p className="text-2xl font-bold text-light-orange">
                {money(summary.total_stock_value)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Total Units Available
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {summary.total_units_available.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Total Units Sold
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {summary.total_units_sold.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, category..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as StockFilter)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange appearance-none"
              >
                <option value="all">All Items</option>
                <option value="in_stock">In Stock (healthy)</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && items.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-orange mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading stock…</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBoxes className="text-3xl text-light-orange" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No stock records
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter.
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && filtered.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Medicine
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      Available
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      Pending
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      Sold
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Stock Value
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-light-orange/10 to-pink/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {m.images?.[0] ? (
                              <img
                                src={m.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaCapsules className="text-light-orange" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate max-w-[200px]">
                              {m.name}
                            </p>
                            {m.generic_name && (
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {m.generic_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {m.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-gray-800">
                          {m.available_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {m.pending_quantity > 0 ? (
                          <span className="text-orange-600 font-medium">
                            {m.pending_quantity}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {m.verified_sold}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                        {money(m.min_price)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-light-orange">
                        {money(m.stock_value)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStockBadge(m)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelected(m)}
                          className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          title="View details"
                        >
                          <FaEye className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
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
              <h2 className="text-xl font-bold text-gray-800">Stock Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-light-orange/20 to-pink/20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {selected.images?.[0] ? (
                    <img
                      src={selected.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaCapsules className="text-3xl text-light-orange" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selected.name}
                  </h3>
                  {selected.generic_name && (
                    <p className="text-gray-500">{selected.generic_name}</p>
                  )}
                  <div className="mt-2">{getStockBadge(selected)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Detail
                  label="Available"
                  value={String(selected.available_quantity)}
                />
                <Detail
                  label="Pending"
                  value={String(selected.pending_quantity)}
                />
                <Detail
                  label="Received"
                  value={String(selected.received_quantity)}
                />
                <Detail
                  label="Supplies"
                  value={String(selected.supply_count)}
                />
                <Detail
                  label="Total Sold"
                  value={String(selected.verified_sold)}
                />
                <Detail label="Unit Price" value={money(selected.min_price)} />
              </div>

              <div className="p-4 bg-gradient-to-r from-light-orange/10 to-pink/10 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Stock Value
                  </span>
                  <span className="text-2xl font-bold text-light-orange">
                    {money(selected.stock_value)}
                  </span>
                </div>
              </div>

              {selected.verified_sold > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-1">
                    Sales Summary
                  </p>
                  <p className="text-sm text-gray-700">
                    {selected.verified_sold} units sold across{" "}
                    {selected.supply_count} supply batches.
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
              <button
                onClick={() => setSelected(null)}
                className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
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
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-800 text-sm">{value}</p>
  </div>
);

export default MedicineStock;
