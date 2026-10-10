import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  type AddMedicine,
  type AddMedicineContextType,
  type AddMedicineFilters,
  type AddMedicineListResponse,
  type AddMedicineOverviewItem,
  type AddMedicineOverviewResponse,
  type AddMedicineOverviewSummary,
  type AddStockBatchRequest,
  type AdjustStockRequest,
  type CreateAddMedicineRequest,
  type StockAdjustment,
  type UpdateAddMedicineRequest,
} from "../types";
import AddMedicineService from "../services/addMedicineService";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";

const AddMedicineContext = createContext<AddMedicineContextType | undefined>(
  undefined,
);

interface Props {
  children: ReactNode;
}

export const AddMedicineProvider: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [medicines, setMedicines] = useState<AddMedicine[]>([]);
  const [overview, setOverview] = useState<AddMedicineOverviewItem[]>([]);
  const [overviewSummary, setOverviewSummary] =
    useState<AddMedicineOverviewSummary | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<AddMedicine | null>(
    null,
  );
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.role !== "admin") return;

    // Fire-and-forget; failures are surfaced via `error` state
    getStockOverview().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role]);

  // ---------------- CRUD ----------------

  const addMedicine = async (
    data: CreateAddMedicineRequest,
  ): Promise<AddMedicine> => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await AddMedicineService.addMedicine(data);
      setMedicines((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add medicine";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMedicine = async (
    id: string,
    data: UpdateAddMedicineRequest,
  ): Promise<AddMedicine> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await AddMedicineService.updateMedicine(id, data);
      setMedicines((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (selectedMedicine?.id === id) setSelectedMedicine(updated);
      setOverview((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                name: updated.name,
                type: updated.type,
                company: updated.company,
                genre: updated.genre,
                strength: updated.strength,
                box_size: updated.box_size,
                total_available: updated.total_available,
                number_of_boxes: updated.number_of_boxes,
                low_stock_threshold: updated.low_stock_threshold,
              }
            : m,
        ),
      );
      return updated;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update medicine";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedicine = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await AddMedicineService.deleteMedicine(id);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      setOverview((prev) => prev.filter((m) => m.id !== id));
      if (selectedMedicine?.id === id) setSelectedMedicine(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete medicine";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- LISTS ----------------

  const getMedicines = async (
    filters?: AddMedicineFilters,
  ): Promise<AddMedicineListResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AddMedicineService.getMedicines(filters);
      setMedicines(res.data || []);
      return res;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch medicines";
      setError(msg);
      setMedicines([]);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedicineById = async (id: string): Promise<AddMedicine> => {
    setIsLoading(true);
    setError(null);
    try {
      const m = await AddMedicineService.getMedicineById(id);
      setSelectedMedicine(m);
      return m;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch medicine";
      setError(msg);
      setSelectedMedicine(null);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getStockOverview = async (): Promise<AddMedicineOverviewResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AddMedicineService.getStockOverview();
      setOverview(res.data || []);
      setOverviewSummary(res.summary || null);
      return res;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch stock overview";
      setError(msg);
      setOverview([]);
      setOverviewSummary(null);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getAdjustmentHistory: AddMedicineContextType["getAdjustmentHistory"] =
    async (filters) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await AddMedicineService.getAdjustmentHistory(filters);
        setAdjustments(res.data || []);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch adjustments";
        setError(msg);
        setAdjustments([]);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    };

  // ---------------- STOCK OPS ----------------

  const addStockBatch = async (
    medicineId: string,
    data: AddStockBatchRequest,
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await AddMedicineService.addStockBatch(medicineId, data);
      // refresh selected + overview
      await Promise.all([
        getMedicineById(medicineId).catch(() => undefined),
        getStockOverview().catch(() => undefined),
      ]);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add stock batch";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const adjustStock = async (
    medicineId: string,
    data: AdjustStockRequest,
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await AddMedicineService.adjustStock(medicineId, data);
      await Promise.all([
        getMedicineById(medicineId).catch(() => undefined),
        getStockOverview().catch(() => undefined),
      ]);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to adjust stock";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- MISC ----------------

  const clearSelected = useCallback(() => setSelectedMedicine(null), []);
  const clearError = useCallback(() => setError(null), []);

  const value: AddMedicineContextType = {
    medicines,
    overview,
    overviewSummary,
    selectedMedicine,
    adjustments,
    isLoading,
    error,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    getMedicines,
    getMedicineById,
    getStockOverview,
    getAdjustmentHistory,
    addStockBatch,
    adjustStock,
    clearSelected,
    clearError,
  };

  return (
    <AddMedicineContext.Provider value={value}>
      {children}
    </AddMedicineContext.Provider>
  );
};

export const useAddMedicine = (): AddMedicineContextType => {
  const ctx = useContext(AddMedicineContext);
  if (!ctx) {
    throw new Error("useAddMedicine must be used within AddMedicineProvider");
  }
  return ctx;
};
