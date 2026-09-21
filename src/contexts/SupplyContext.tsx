import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";
import {
  type Supply,
  type CreateSupplyRequest,
  type UpdateSupplyRequest,
  type SupplyFilters,
  type SupplyStatistics,
  type SupplierSupplySummary,
  type SupplyStatus,
} from "../types";
import SupplyService from "../services/supplyService";
import { useAuth } from "./AuthContext";

interface SupplyContextType {
  supplies: Supply[];
  selectedSupply: Supply | null;
  statistics: SupplyStatistics | null;
  supplierSummary: SupplierSupplySummary | null;
  isLoading: boolean;
  error: string | null;

  createSupply: (data: CreateSupplyRequest) => Promise<Supply>;
  updateSupply: (id: string, data: UpdateSupplyRequest) => Promise<void>;
  deleteSupply: (id: string) => Promise<void>;
  approveSupply: (id: string, notes?: string) => Promise<void>;
  rejectSupply: (id: string, reason: string) => Promise<void>;
  receiveSupply: (id: string) => Promise<void>;

  getSupplies: (filters?: SupplyFilters) => Promise<void>;
  getSupplyById: (id: string) => Promise<void>;
  getSupplierSummary: () => Promise<void>;
  getSuppliesBySupplier: (
    supplierId: string,
    status?: SupplyStatus,
  ) => Promise<void>;
  getStatistics: () => Promise<void>;

  clearSelected: () => void;
  clearError: () => void;
}

const SupplyContext = createContext<SupplyContextType | undefined>(undefined);

export const SupplyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [statistics, setStatistics] = useState<SupplyStatistics | null>(null);
  const [supplierSummary, setSupplierSummary] =
    useState<SupplierSupplySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    if (user?.role === "admin") {
      getStatistics();
      getSupplies({ limit: 50 });
    } else if (user?.role === "supplier") {
      getSupplierSummary();
      getSupplies({ limit: 50 });
    }
  }, [isAuthenticated, user?.role]);

  const getSupplies = async (filters?: SupplyFilters): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SupplyService.getSupplies(filters);
      if (response.success && response.data) {
        setSupplies(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.message || "Failed to fetch supplies");
      }
    } catch (err: any) {
      console.error("Get supplies error:", err);
      setError(err.message || "Failed to fetch supplies");
      setSupplies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSupplyById = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SupplyService.getSupplyById(id);
      if (response.success && response.data) {
        setSelectedSupply(response.data);
      } else {
        throw new Error(response.message || "Supply not found");
      }
    } catch (err: any) {
      console.error("Get supply error:", err);
      setError(err.message || "Failed to fetch supply");
      setSelectedSupply(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createSupply = async (data: CreateSupplyRequest): Promise<Supply> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SupplyService.createSupply(data);
      if (response.success && response.data) {
        const newSupply = response.data;
        setSupplies((prev) => [newSupply, ...prev]);
        if (user?.role === "supplier") await getSupplierSummary();
        return newSupply;
      }
      throw new Error(response.message || "Failed to create supply");
    } catch (err: any) {
      console.error("Create supply error:", err);
      setError(err.message || "Failed to create supply");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSupply = async (
    id: string,
    data: UpdateSupplyRequest,
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SupplyService.updateSupply(id, data);
      if (response.success && response.data) {
        const updated = response.data;
        setSupplies((prev) => prev.map((s) => (s.id === id ? updated : s)));
        if (selectedSupply?.id === id) setSelectedSupply(updated);
      } else {
        throw new Error(response.message || "Failed to update supply");
      }
    } catch (err: any) {
      console.error("Update supply error:", err);
      setError(err.message || "Failed to update supply");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSupply = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SupplyService.deleteSupply(id);
      if (response.success) {
        setSupplies((prev) => prev.filter((s) => s.id !== id));
        if (selectedSupply?.id === id) setSelectedSupply(null);
        if (user?.role === "supplier") await getSupplierSummary();
      } else {
        throw new Error(response.message || "Failed to delete supply");
      }
    } catch (err: any) {
      console.error("Delete supply error:", err);
      setError(err.message || "Failed to delete supply");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const approveSupply = async (id: string, notes?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SupplyService.approveSupply(id, notes);
      if (response.success && response.data) {
        const updated = response.data;
        setSupplies((prev) => prev.map((s) => (s.id === id ? updated : s)));
        if (selectedSupply?.id === id) setSelectedSupply(updated);
        await getStatistics();
      } else {
        throw new Error(response.message || "Failed to approve supply");
      }
    } catch (err: any) {
      console.error("Approve supply error:", err);
      setError(err.message || "Failed to approve supply");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectSupply = async (id: string, reason: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SupplyService.rejectSupply(id, reason);
      if (response.success && response.data) {
        const updated = response.data;
        setSupplies((prev) => prev.map((s) => (s.id === id ? updated : s)));
        if (selectedSupply?.id === id) setSelectedSupply(updated);
        await getStatistics();
      } else {
        throw new Error(response.message || "Failed to reject supply");
      }
    } catch (err: any) {
      console.error("Reject supply error:", err);
      setError(err.message || "Failed to reject supply");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const receiveSupply = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SupplyService.receiveSupply(id);
      if (response.success && response.data) {
        const updated = response.data;
        setSupplies((prev) => prev.map((s) => (s.id === id ? updated : s)));
        if (selectedSupply?.id === id) setSelectedSupply(updated);
        await getStatistics();
      } else {
        throw new Error(response.message || "Failed to receive supply");
      }
    } catch (err: any) {
      console.error("Receive supply error:", err);
      setError(err.message || "Failed to receive supply");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getSupplierSummary = async (): Promise<void> => {
    if (user?.role !== "supplier") return;
    try {
      const response = await SupplyService.getSupplierSummary();
      if (response.success && response.data) {
        setSupplierSummary(response.data);
      }
    } catch (err: any) {
      console.error("Get supplier summary error:", err);
      setError(err.message || "Failed to fetch supplier summary");
    }
  };

  const getSuppliesBySupplier = async (
    supplierId: string,
    status?: SupplyStatus,
  ): Promise<void> => {
    if (user?.role !== "admin") return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await SupplyService.getSuppliesBySupplier(
        supplierId,
        status,
      );
      if (response.success && response.data) {
        setSupplies(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.message || "Failed to fetch supplies");
      }
    } catch (err: any) {
      console.error("Get supplies by supplier error:", err);
      setError(err.message || "Failed to fetch supplies");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatistics = async (): Promise<void> => {
    if (user?.role !== "admin") return;
    try {
      const response = await SupplyService.getSupplyStats();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (err: any) {
      console.error("Get supply stats error:", err);
      setError(err.message || "Failed to fetch supply stats");
    }
  };

  const clearSelected = (): void => setSelectedSupply(null);
  const clearError = (): void => setError(null);

  const value: SupplyContextType = {
    supplies,
    selectedSupply,
    statistics,
    supplierSummary,
    isLoading,
    error,
    createSupply,
    updateSupply,
    deleteSupply,
    approveSupply,
    rejectSupply,
    receiveSupply,
    getSupplies,
    getSupplyById,
    getSupplierSummary,
    getSuppliesBySupplier,
    getStatistics,
    clearSelected,
    clearError,
  };

  return (
    <SupplyContext.Provider value={value}>{children}</SupplyContext.Provider>
  );
};

export const useSupply = (): SupplyContextType => {
  const context = useContext(SupplyContext);
  if (context === undefined) {
    throw new Error("useSupply must be used within a SupplyProvider");
  }
  return context;
};
