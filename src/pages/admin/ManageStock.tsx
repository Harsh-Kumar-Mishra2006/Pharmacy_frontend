// src/pages/admin/ManageStock.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddMedicine } from "../../contexts/AddMedicineContext";
import {
  FaBoxes,
  FaPlus,
  FaMinus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaWarehouse,
} from "react-icons/fa";
import {
  type AddMedicineOverviewItem,
  type AdjustStockRequest,
  type UpdateAddMedicineRequest,
} from "../../types";

/* -------------------------------------------------------------- */
/* Small stat card                                               */
/* -------------------------------------------------------------- */
const StatCard: React.FC<{
  label: string;
  value: number | string;
  color?: string;
}> = ({ label, value, color = "" }) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
  </div>
);

/* -------------------------------------------------------------- */
/* Modal for add/remove stock                                    */
/* -------------------------------------------------------------- */
const StockActionModal: React.FC<{
  medicine: AddMedicineOverviewItem;
  mode: "add" | "remove";
  onClose: () => void;
  onDone: () => void;
}> = ({ medicine, mode, onClose, onDone }) => {
  const { addStockBatch, adjustStock, isLoading } = useAddMedicine();

  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("sale");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    const n = parseInt(qty, 10);
    if (!n || n <= 0) {
      setErr("Enter a quantity > 0");
      return;
    }

    try {
      if (mode === "add") {
        await addStockBatch(medicine.id, {
          quantity_received: n,
          batch_number: batchNumber || undefined,
          expiry_date: expiryDate || undefined,
          supplier_name: supplier || undefined,
          unit_cost: unitCost ? parseFloat(unitCost) : undefined,
          notes: notes || undefined,
        });
      } else {
        const payload: AdjustStockRequest = {
          quantity: n,
          adjustment_type: "decrease",
          reason,
          notes: notes || undefined,
        };
        await adjustStock(medicine.id, payload);
      }
      onDone();
    } catch (e: any) {
      setErr(e.message || "Failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {mode === "add" ? "Add Stock" : "Remove Stock"}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {medicine.name} — currently{" "}
          <span className="font-semibold">{medicine.total_available}</span>{" "}
          units
        </p>

        {err && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
              placeholder="e.g., 50"
            />
          </div>

          {mode === "add" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Batch #"
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                />
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Supplier name"
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                />
                <input
                  type="number"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  placeholder="Unit cost ₹"
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
                />
              </div>
            </>
          )}

          {mode === "remove" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
              >
                <option value="sale">Sale</option>
                <option value="damaged">Damaged</option>
                <option value="expired">Expired</option>
                <option value="returned">Returned</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-orange"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              mode === "add"
                ? "bg-light-orange hover:bg-pink"
                : "bg-red-500 hover:bg-red-600"
            } disabled:opacity-50`}
          >
            {isLoading
              ? "Saving…"
              : mode === "add"
                ? "Add Stock"
                : "Remove Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- */
/* Edit details modal                                            */
/* -------------------------------------------------------------- */
const EditModal: React.FC<{
  medicine: AddMedicineOverviewItem;
  onClose: () => void;
  onDone: () => void;
}> = ({ medicine, onClose, onDone }) => {
  const { getMedicineById, updateMedicine, isLoading } = useAddMedicine();

  const [form, setForm] = useState<UpdateAddMedicineRequest>({});
  const [err, setErr] = useState<string | null>(null);
  const [loadingFull, setLoadingFull] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const full = await getMedicineById(medicine.id);
        setForm({
          name: full.name,
          type: full.type,
          company: full.company,
          genre: full.genre,
          strength: full.strength || "",
          description: full.description || "",
          box_size: full.box_size,
          low_stock_threshold: full.low_stock_threshold,
          is_available: full.is_available,
        });
      } catch (e) {
        // ignore
      } finally {
        setLoadingFull(false);
      }
    })();
  }, [medicine.id]);

  const change = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const save = async () => {
    setErr(null);
    try {
      await updateMedicine(medicine.id, {
        ...form,
        box_size: form.box_size ? Number(form.box_size) : undefined,
        low_stock_threshold:
          form.low_stock_threshold !== undefined
            ? Number(form.low_stock_threshold)
            : undefined,
      });
      onDone();
    } catch (e: any) {
      setErr(e.message || "Failed to update");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Edit Details — {medicine.name}
        </h3>

        {err && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {err}
          </div>
        )}

        {loadingFull ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <div className="space-y-3">
            <input
              name="name"
              value={form.name || ""}
              onChange={change}
              placeholder="Name"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="type"
                value={form.type || ""}
                onChange={change}
                placeholder="Type"
                className="px-3 py-2 rounded-lg border border-gray-300"
              />
              <input
                name="company"
                value={form.company || ""}
                onChange={change}
                placeholder="Company"
                className="px-3 py-2 rounded-lg border border-gray-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="genre"
                value={form.genre || ""}
                onChange={change}
                placeholder="Genre"
                className="px-3 py-2 rounded-lg border border-gray-300"
              />
              <input
                name="strength"
                value={form.strength || ""}
                onChange={change}
                placeholder="Strength"
                className="px-3 py-2 rounded-lg border border-gray-300"
              />
            </div>
            <textarea
              name="description"
              value={form.description || ""}
              onChange={change}
              rows={2}
              placeholder="Description"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={1}
                name="box_size"
                value={form.box_size ?? ""}
                onChange={change}
                placeholder="Box size"
                className="px-3 py-2 rounded-lg border border-gray-300"
              />
              <input
                type="number"
                min={0}
                name="low_stock_threshold"
                value={form.low_stock_threshold ?? ""}
                onChange={change}
                placeholder="Low stock threshold"
                className="px-3 py-2 rounded-lg border border-gray-300"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_available"
                checked={!!form.is_available}
                onChange={change}
                className="w-4 h-4 rounded text-light-orange"
              />
              <span className="text-sm text-gray-700">Available for sale</span>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={isLoading || loadingFull}
            className="px-4 py-2 rounded-lg bg-light-orange text-white font-medium hover:bg-pink disabled:opacity-50"
          >
            {isLoading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- */
/* Main page                                                     */
/* -------------------------------------------------------------- */
const ManageStock: React.FC = () => {
  const navigate = useNavigate();
  const {
    overview,
    overviewSummary,
    getStockOverview,
    deleteMedicine,
    isLoading,
  } = useAddMedicine();

  const [search, setSearch] = useState("");
  const [action, setAction] = useState<{
    medicine: AddMedicineOverviewItem;
    mode: "add" | "remove";
  } | null>(null);
  const [editing, setEditing] = useState<AddMedicineOverviewItem | null>(null);

  useEffect(() => {
    getStockOverview().catch(() => undefined);
  }, []);

  const refresh = () => {
    getStockOverview().catch(() => undefined);
  };

  const filtered = overview.filter((m) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(s) ||
      m.company.toLowerCase().includes(s) ||
      m.genre.toLowerCase().includes(s) ||
      m.type.toLowerCase().includes(s)
    );
  });

  const onDelete = async (m: AddMedicineOverviewItem) => {
    if (
      !window.confirm(
        `Delete "${m.name}"? This will remove all batches and adjustment history.`,
      )
    )
      return;
    try {
      await deleteMedicine(m.id);
    } catch (e) {
      // Error already in context
    }
  };

  const statusBadge = (m: AddMedicineOverviewItem) => {
    if (m.is_out_of_stock)
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          <FaTimesCircle /> Out of Stock
        </span>
      );
    if (m.is_low_stock)
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          <FaExclamationTriangle /> Low
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
        <FaCheckCircle /> In Stock
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-light-orange to-pink rounded-xl flex items-center justify-center text-white text-xl">
              <FaWarehouse />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Stock Management
              </h1>
              <p className="text-gray-600">
                Manage medicines, batches, and adjustments.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/add-medicine-stock")}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Add Medicine & Stock
          </button>
        </div>

        {/* Summary cards */}
        {overviewSummary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatCard
              label="Medicines"
              value={overviewSummary.total_medicines}
            />
            <StatCard label="Total Units" value={overviewSummary.total_units} />
            <StatCard
              label="In Stock"
              value={overviewSummary.in_stock}
              color="text-green-600"
            />
            <StatCard
              label="Low Stock"
              value={overviewSummary.low_stock}
              color="text-amber-600"
            />
            <StatCard
              label="Out of Stock"
              value={overviewSummary.out_of_stock}
              color="text-red-600"
            />
            <StatCard
              label="Expiring Soon"
              value={overviewSummary.expiring_soon}
              color="text-orange-600"
            />
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex items-center gap-3">
          <FaSearch className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, genre, type…"
            className="flex-1 outline-none text-gray-700"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {isLoading && overview.length === 0 ? (
            <div className="p-12 text-center text-gray-500">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FaBoxes className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500">No medicines found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Medicine
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Company
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Box Size
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Available
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Boxes
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">
                          {m.name}
                        </div>
                        {m.strength && (
                          <div className="text-xs text-gray-500">
                            {m.strength}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {m.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {m.company}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {m.box_size}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-gray-800">
                          {m.total_available}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {m.number_of_boxes}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {statusBadge(m)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Add stock"
                            onClick={() =>
                              setAction({ medicine: m, mode: "add" })
                            }
                            className="w-8 h-8 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                          <button
                            title="Remove stock"
                            onClick={() =>
                              setAction({ medicine: m, mode: "remove" })
                            }
                            className="w-8 h-8 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <button
                            title="Edit details"
                            onClick={() => setEditing(m)}
                            className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center justify-center"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => onDelete(m)}
                            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {action && (
        <StockActionModal
          medicine={action.medicine}
          mode={action.mode}
          onClose={() => setAction(null)}
          onDone={() => {
            setAction(null);
            refresh();
          }}
        />
      )}

      {editing && (
        <EditModal
          medicine={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
};

export default ManageStock;
