import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";
import {
  type Enquiry,
  type CreateEnquiryRequest,
  type AcceptEnquiryRequest,
  type RejectEnquiryRequest,
  type EnquiryFilters,
  type EnquiryStatistics,
  type SupplierEnquirySummary,
} from "../types";
import EnquiryService from "../services/enquiryService";
import { useAuth } from "./AuthContext";

interface EnquiryContextType {
  enquiries: Enquiry[];
  selectedEnquiry: Enquiry | null;
  statistics: EnquiryStatistics | null;
  supplierSummary: SupplierEnquirySummary | null;
  isLoading: boolean;
  error: string | null;

  createEnquiry: (data: CreateEnquiryRequest) => Promise<Enquiry>;
  acceptEnquiry: (id: string, data: AcceptEnquiryRequest) => Promise<Enquiry>;
  rejectEnquiry: (id: string, data: RejectEnquiryRequest) => Promise<Enquiry>;
  cancelEnquiry: (id: string) => Promise<Enquiry>;

  getEnquiries: (filters?: EnquiryFilters) => Promise<void>;
  getEnquiryById: (id: string) => Promise<void>;
  getSupplierSummary: () => Promise<void>;
  getStatistics: () => Promise<void>;

  clearSelected: () => void;
  clearError: () => void;
}

const EnquiryContext = createContext<EnquiryContextType | undefined>(undefined);

export const EnquiryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [statistics, setStatistics] = useState<EnquiryStatistics | null>(null);
  const [supplierSummary, setSupplierSummary] =
    useState<SupplierEnquirySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    if (user?.role === "admin") {
      getStatistics();
      getEnquiries({ limit: 50 });
    } else if (user?.role === "supplier") {
      getSupplierSummary();
      getEnquiries({ limit: 50 });
    }
  }, [isAuthenticated, user?.role]);

  const getEnquiries = async (filters?: EnquiryFilters): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await EnquiryService.getEnquiries(filters);
      if (response.success && response.data) {
        setEnquiries(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.message || "Failed to fetch enquiries");
      }
    } catch (err: any) {
      console.error("Get enquiries error:", err);
      setError(err.message || "Failed to fetch enquiries");
      setEnquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnquiryById = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await EnquiryService.getEnquiryById(id);
      if (response.success && response.data) {
        setSelectedEnquiry(response.data);
      } else {
        throw new Error(response.message || "Enquiry not found");
      }
    } catch (err: any) {
      console.error("Get enquiry error:", err);
      setError(err.message || "Failed to fetch enquiry");
      setSelectedEnquiry(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createEnquiry = async (
    data: CreateEnquiryRequest,
  ): Promise<Enquiry> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await EnquiryService.createEnquiry(data);
      if (response.success && response.data) {
        const newEnquiry = response.data;
        setEnquiries((prev) => [newEnquiry, ...prev]);
        await getStatistics();
        return newEnquiry;
      }
      throw new Error(response.message || "Failed to create enquiry");
    } catch (err: any) {
      console.error("Create enquiry error:", err);
      setError(err.message || "Failed to create enquiry");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptEnquiry = async (
    id: string,
    data: AcceptEnquiryRequest,
  ): Promise<Enquiry> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await EnquiryService.acceptEnquiry(id, data);
      if (response.success && response.data) {
        const updated = response.data;
        setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
        if (selectedEnquiry?.id === id) setSelectedEnquiry(updated);
        await getSupplierSummary();
        return updated;
      }
      throw new Error(response.message || "Failed to accept enquiry");
    } catch (err: any) {
      console.error("Accept enquiry error:", err);
      setError(err.message || "Failed to accept enquiry");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectEnquiry = async (
    id: string,
    data: RejectEnquiryRequest,
  ): Promise<Enquiry> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await EnquiryService.rejectEnquiry(id, data);
      if (response.success && response.data) {
        const updated = response.data;
        setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
        if (selectedEnquiry?.id === id) setSelectedEnquiry(updated);
        await getSupplierSummary();
        return updated;
      }
      throw new Error(response.message || "Failed to reject enquiry");
    } catch (err: any) {
      console.error("Reject enquiry error:", err);
      setError(err.message || "Failed to reject enquiry");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEnquiry = async (id: string): Promise<Enquiry> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await EnquiryService.cancelEnquiry(id);
      if (response.success && response.data) {
        const updated = response.data;
        setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
        if (selectedEnquiry?.id === id) setSelectedEnquiry(updated);
        await getStatistics();
        return updated;
      }
      throw new Error(response.message || "Failed to cancel enquiry");
    } catch (err: any) {
      console.error("Cancel enquiry error:", err);
      setError(err.message || "Failed to cancel enquiry");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getSupplierSummary = async (): Promise<void> => {
    if (user?.role !== "supplier") return;
    try {
      const response = await EnquiryService.getSupplierSummary();
      if (response.success && response.data) {
        setSupplierSummary(response.data);
      }
    } catch (err: any) {
      console.error("Get supplier enquiry summary error:", err);
      setError(err.message || "Failed to fetch supplier enquiry summary");
    }
  };

  const getStatistics = async (): Promise<void> => {
    if (user?.role !== "admin") return;
    try {
      const response = await EnquiryService.getEnquiryStats();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (err: any) {
      console.error("Get enquiry stats error:", err);
      setError(err.message || "Failed to fetch enquiry stats");
    }
  };

  const clearSelected = (): void => setSelectedEnquiry(null);
  const clearError = (): void => setError(null);

  const value: EnquiryContextType = {
    enquiries,
    selectedEnquiry,
    statistics,
    supplierSummary,
    isLoading,
    error,
    createEnquiry,
    acceptEnquiry,
    rejectEnquiry,
    cancelEnquiry,
    getEnquiries,
    getEnquiryById,
    getSupplierSummary,
    getStatistics,
    clearSelected,
    clearError,
  };

  return (
    <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>
  );
};

export const useEnquiry = (): EnquiryContextType => {
  const context = useContext(EnquiryContext);
  if (context === undefined) {
    throw new Error("useEnquiry must be used within an EnquiryProvider");
  }
  return context;
};
