import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";
import {
  type Medicine,
  type CreateMedicineRequest,
  type UpdateMedicineRequest,
  type UpdateQuantityRequest,
  type MedicineFilters,
  type MedicineStatistics,
  type SupplierSummary,
} from "../types";
import MedicineService from "../services/medicineService";
import { useAuth } from "./AuthContext";

interface MedicineContextType {
  medicines: Medicine[];
  selectedMedicine: Medicine | null;
  isLoading: boolean;
  error: string | null;
  statistics: MedicineStatistics | null;
  supplierSummary: SupplierSummary | null;
  getMedicines: (filters?: MedicineFilters) => Promise<void>;
  getMedicineById: (id: string) => Promise<void>;
  createMedicine: (data: CreateMedicineRequest) => Promise<Medicine>;
  updateMedicine: (id: string, data: UpdateMedicineRequest) => Promise<void>;
  updateQuantity: (id: string, data: UpdateQuantityRequest) => Promise<void>;
  approveMedicine: (id: string, notes?: string) => Promise<void>;
  rejectMedicine: (id: string, reason: string) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  getStatistics: () => Promise<void>;
  getSupplierSummary: () => Promise<void>;
  getMedicinesBySupplier: (
    supplierId: string,
    status?: string,
  ) => Promise<void>;
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
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<MedicineStatistics | null>(null);
  const [supplierSummary, setSupplierSummary] =
    useState<SupplierSummary | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Auto-load medicines based on user role
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "admin") {
        getStatistics();
        getMedicines({ limit: 50 });
      } else if (user?.role === "supplier") {
        getSupplierSummary();
        getMedicines({ limit: 50 });
      } else if (user?.role === "user") {
        getMedicines({
          status: "approved",
          is_available: true,
          limit: 50,
        });
      }
    }
  }, [isAuthenticated, user?.role]);

  // Get all medicines with filters
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

  // Create medicine
  const createMedicine = async (
    data: CreateMedicineRequest,
  ): Promise<Medicine> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.createMedicine(data);
      if (response.success && response.data) {
        // Add the new medicine to the list
        const newMedicine = response.data;
        setMedicines((prev) => [newMedicine, ...prev]);
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

  // Update medicine
  const updateMedicine = async (
    id: string,
    data: UpdateMedicineRequest,
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.updateMedicine(id, data);
      if (response.success && response.data) {
        const updatedMedicine = response.data;
        // Update in the list
        setMedicines((prev) =>
          prev.map((m) => (m.id === id ? updatedMedicine : m)),
        );
        if (selectedMedicine?.id === id) {
          setSelectedMedicine(updatedMedicine);
        }
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

  // Update quantity
  const updateQuantity = async (
    id: string,
    data: UpdateQuantityRequest,
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.updateQuantity(id, data);
      if (response.success && response.data) {
        // Update the quantity in the list
        const { current_quantity } = response.data;
        setMedicines((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  quantity: current_quantity,
                  // Update any other derived fields
                }
              : m,
          ),
        );
        if (selectedMedicine?.id === id) {
          setSelectedMedicine((prev) => ({
            ...prev!,
            quantity: current_quantity,
          }));
        }
        // Refresh supplier summary if supplier
        if (user?.role === "supplier") {
          await getSupplierSummary();
        }
      } else {
        throw new Error(response.message || "Failed to update quantity");
      }
    } catch (error: any) {
      console.error("Update quantity error:", error);
      setError(error.message || "Failed to update quantity");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Approve medicine (Admin)
  const approveMedicine = async (id: string, notes?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.approveMedicine(id, {
        approval_notes: notes,
      });
      if (response.success && response.data) {
        const updatedMedicine = response.data;
        setMedicines((prev) =>
          prev.map((m) => (m.id === id ? updatedMedicine : m)),
        );
        if (selectedMedicine?.id === id) {
          setSelectedMedicine(updatedMedicine);
        }
        // Refresh statistics
        await getStatistics();
      } else {
        throw new Error(response.message || "Failed to approve medicine");
      }
    } catch (error: any) {
      console.error("Approve medicine error:", error);
      setError(error.message || "Failed to approve medicine");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reject medicine (Admin)
  const rejectMedicine = async (id: string, reason: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.rejectMedicine(id, {
        rejection_reason: reason,
      });
      if (response.success && response.data) {
        const updatedMedicine = response.data;
        setMedicines((prev) =>
          prev.map((m) => (m.id === id ? updatedMedicine : m)),
        );
        if (selectedMedicine?.id === id) {
          setSelectedMedicine(updatedMedicine);
        }
        // Refresh statistics
        await getStatistics();
      } else {
        throw new Error(response.message || "Failed to reject medicine");
      }
    } catch (error: any) {
      console.error("Reject medicine error:", error);
      setError(error.message || "Failed to reject medicine");
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
        if (selectedMedicine?.id === id) {
          setSelectedMedicine(null);
        }
        // Refresh statistics
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

  // Get statistics (Admin)
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

  // Get supplier summary (Supplier)
  const getSupplierSummary = async (): Promise<void> => {
    if (user?.role !== "supplier") return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.getSupplierSummary();
      if (response.success && response.data) {
        setSupplierSummary(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch supplier summary");
      }
    } catch (error: any) {
      console.error("Get supplier summary error:", error);
      setError(error.message || "Failed to fetch supplier summary");
    } finally {
      setIsLoading(false);
    }
  };

  // Get medicines by supplier (Admin)
  const getMedicinesBySupplier = async (
    supplierId: string,
    status?: string,
  ): Promise<void> => {
    if (user?.role !== "admin") return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await MedicineService.getMedicinesBySupplier(
        supplierId,
        status,
      );
      if (response.success && response.data) {
        setMedicines(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(
          response.message || "Failed to fetch supplier medicines",
        );
      }
    } catch (error: any) {
      console.error("Get medicines by supplier error:", error);
      setError(error.message || "Failed to fetch supplier medicines");
    } finally {
      setIsLoading(false);
    }
  };

  // Search medicines
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

  // Clear selected medicine
  const clearSelected = (): void => {
    setSelectedMedicine(null);
  };

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  const contextValue: MedicineContextType = {
    medicines,
    selectedMedicine,
    isLoading,
    error,
    statistics,
    supplierSummary,
    getMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    updateQuantity,
    approveMedicine,
    rejectMedicine,
    deleteMedicine,
    getStatistics,
    getSupplierSummary,
    getMedicinesBySupplier,
    searchMedicines,
    clearSelected,
    clearError,
  };

  return (
    <MedicineContext.Provider value={contextValue}>
      {children}
    </MedicineContext.Provider>
  );
};

// Custom hook to use medicine context
export const useMedicine = (): MedicineContextType => {
  const context = useContext(MedicineContext);
  if (context === undefined) {
    throw new Error("useMedicine must be used within a MedicineProvider");
  }
  return context;
};
