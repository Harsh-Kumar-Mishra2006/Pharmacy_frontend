import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";
import {
  type Medicine,
  type AvailableMedicine,
  type AvailableMedicineFilters,
  type CreateMedicineRequest,
  type UpdateMedicineRequest,
  type MedicineFilters,
  type MedicineStatistics,
} from "../types";
import MedicineService from "../services/medicineService";
import { useAuth } from "./AuthContext";

interface MedicineContextType {
  medicines: Medicine[];
  availableMedicines: AvailableMedicine[];
  selectedMedicine: Medicine | null;
  isLoading: boolean;
  error: string | null;
  statistics: MedicineStatistics | null;

  getMedicines: (filters?: MedicineFilters) => Promise<void>;
  getAvailableMedicines: (
    filters?: AvailableMedicineFilters,
  ) => Promise<AvailableMedicine[]>;
  getMedicineById: (id: string) => Promise<void>;
  createMedicine: (data: CreateMedicineRequest) => Promise<Medicine>;
  updateMedicine: (id: string, data: UpdateMedicineRequest) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  getStatistics: () => Promise<void>;
  searchMedicines: (searchTerm: string) => Promise<void>;

  clearSelected: () => void;
  clearError: () => void;
}

const MedicineContext = createContext<MedicineContextType | undefined>(
  undefined,
);

interface MedicineProviderProps {
  children: ReactNode;
}

export const MedicineProvider: React.FC<MedicineProviderProps> = ({
  children,
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<
    AvailableMedicine[]
  >([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<MedicineStatistics | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Auto-load catalogue on auth
  useEffect(() => {
    if (!isAuthenticated) return;

    if (user?.role === "admin") {
      getStatistics();
      getMedicines({ limit: 50 });
    } else if (user?.role === "supplier") {
      getMedicines({ limit: 50 });
    }
    // customers (user role) will call getAvailableMedicines from the page itself
  }, [isAuthenticated, user?.role]);

  // Get all medicines
  const getMedicines = async (filters?: MedicineFilters): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.getMedicines(filters);
      if (response.success && response.data) {
        setMedicines(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.message || "Failed to fetch medicines");
      }
    } catch (error: any) {
      console.error("Get medicines error:", error);
      setError(error.message || "Failed to fetch medicines");
      setMedicines([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get single medicine
  const getMedicineById = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.getMedicineById(id);
      if (response.success && response.data) {
        setSelectedMedicine(response.data);
      } else {
        throw new Error(response.message || "Medicine not found");
      }
    } catch (error: any) {
      console.error("Get medicine error:", error);
      setError(error.message || "Failed to fetch medicine");
      setSelectedMedicine(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Create medicine (Admin)
  const createMedicine = async (
    data: CreateMedicineRequest,
  ): Promise<Medicine> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.createMedicine(data);
      if (response.success && response.data) {
        const newMedicine = response.data;
        setMedicines((prev) => [newMedicine, ...prev]);
        await getStatistics();
        return newMedicine;
      } else {
        throw new Error(response.message || "Failed to create medicine");
      }
    } catch (error: any) {
      console.error("Create medicine error:", error);
      setError(error.message || "Failed to create medicine");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update medicine (Admin)
  const updateMedicine = async (
    id: string,
    data: UpdateMedicineRequest,
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.updateMedicine(id, data);
      if (response.success && response.data) {
        const updated = response.data;
        setMedicines((prev) => prev.map((m) => (m.id === id ? updated : m)));
        if (selectedMedicine?.id === id) setSelectedMedicine(updated);
      } else {
        throw new Error(response.message || "Failed to update medicine");
      }
    } catch (error: any) {
      console.error("Update medicine error:", error);
      setError(error.message || "Failed to update medicine");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete medicine (Admin)
  const deleteMedicine = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.deleteMedicine(id);
      if (response.success) {
        setMedicines((prev) => prev.filter((m) => m.id !== id));
        if (selectedMedicine?.id === id) setSelectedMedicine(null);
        await getStatistics();
      } else {
        throw new Error(response.message || "Failed to delete medicine");
      }
    } catch (error: any) {
      console.error("Delete medicine error:", error);
      setError(error.message || "Failed to delete medicine");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Statistics (Admin)
  const getStatistics = async (): Promise<void> => {
    if (user?.role !== "admin") return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.getMedicineStats();
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch statistics");
      }
    } catch (error: any) {
      console.error("Get statistics error:", error);
      setError(error.message || "Failed to fetch statistics");
    } finally {
      setIsLoading(false);
    }
  };

  // Search
  const searchMedicines = async (searchTerm: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.searchMedicines(searchTerm);
      if (response.success && response.data) {
        setMedicines(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.message || "No medicines found");
      }
    } catch (error: any) {
      console.error("Search medicines error:", error);
      setError(error.message || "Failed to search medicines");
    } finally {
      setIsLoading(false);
    }
  };

  // Get customer-visible medicines (catalog + approved supplies)
  const getAvailableMedicines = async (
    filters?: AvailableMedicineFilters,
  ): Promise<AvailableMedicine[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.getAvailableMedicines(filters);
      if (response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : [];
        setAvailableMedicines(list);
        return list;
      }
      throw new Error(
        response.message || "Failed to fetch available medicines",
      );
    } catch (err: any) {
      console.error("Get available medicines error:", err);
      setError(err.message || "Failed to fetch available medicines");
      setAvailableMedicines([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelected = (): void => setSelectedMedicine(null);
  const clearError = (): void => setError(null);

  const contextValue: MedicineContextType = {
    medicines,
    selectedMedicine,
    isLoading,
    error,
    statistics,
    getMedicines,
    availableMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    getStatistics,
    searchMedicines,
    getAvailableMedicines,
    clearSelected,
    clearError,
  };

  return (
    <MedicineContext.Provider value={contextValue}>
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicine = (): MedicineContextType => {
  const context = useContext(MedicineContext);
  if (context === undefined) {
    throw new Error("useMedicine must be used within a MedicineProvider");
  }
  return context;
};
