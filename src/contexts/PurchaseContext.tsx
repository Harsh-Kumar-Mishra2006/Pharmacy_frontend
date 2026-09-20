// src/contexts/PurchaseContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
} from "react";
import {
  type Purchase,
  type PurchaseRequest,
  type PurchaseCreateResponse,
  type PurchaseFilters,
  type PurchaseStatistics,
  type UploadScreenshotRequest,
  type VerifyPaymentRequest,
  type PurchaseContextType,
} from "../types";
import PurchaseService from "../services/purchaseService";

const PurchaseContext = createContext<PurchaseContextType | undefined>(
  undefined,
);

interface PurchaseProviderProps {
  children: ReactNode;
}

export const PurchaseProvider: React.FC<PurchaseProviderProps> = ({
  children,
}) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [pendingVerifications, setPendingVerifications] = useState<Purchase[]>(
    [],
  );
  const [statistics, setStatistics] = useState<PurchaseStatistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- Customer ----------

  const createPurchase = async (
    data: PurchaseRequest,
  ): Promise<PurchaseCreateResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await PurchaseService.createPurchase(data);

      if (response.success && response.data) {
        const purchase = response.data as Purchase;
        setPurchases((prev) => [purchase, ...prev]);
        setSelectedPurchase(purchase);

        return {
          purchase,
          payment_qr: response.payment_qr || {
            upi_id: "",
            amount: purchase.total_amount,
            reference: purchase.purchase_number,
          },
        };
      }
      throw new Error(response.message || "Failed to create purchase");
    } catch (err: any) {
      const message = err.message || "Failed to create purchase";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadScreenshot = async (
    purchaseId: string,
    data: UploadScreenshotRequest,
  ): Promise<Purchase> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await PurchaseService.uploadScreenshot(purchaseId, data);

      if (response.success && response.data) {
        const updated = response.data;
        setPurchases((prev) =>
          prev.map((p) => (p.id === purchaseId ? updated : p)),
        );
        if (selectedPurchase?.id === purchaseId) {
          setSelectedPurchase(updated);
        }
        return updated;
      }
      throw new Error(response.message || "Failed to upload screenshot");
    } catch (err: any) {
      const message = err.message || "Failed to upload screenshot";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPurchase = async (
    purchaseId: string,
    reason?: string,
  ): Promise<Purchase> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await PurchaseService.cancelPurchase(purchaseId, reason);

      if (response.success && response.data) {
        const updated = response.data;
        setPurchases((prev) =>
          prev.map((p) => (p.id === purchaseId ? updated : p)),
        );
        if (selectedPurchase?.id === purchaseId) {
          setSelectedPurchase(updated);
        }
        return updated;
      }
      throw new Error(response.message || "Failed to cancel purchase");
    } catch (err: any) {
      const message = err.message || "Failed to cancel purchase";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getMyPurchases = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await PurchaseService.getMyPurchases();
      if (response.success && response.data) {
        setPurchases(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.message || "Failed to fetch purchases");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch purchases");
      setPurchases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPurchaseById = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await PurchaseService.getPurchaseById(id);
      if (response.success && response.data) {
        setSelectedPurchase(response.data);
      } else {
        throw new Error(response.message || "Purchase not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch purchase");
      setSelectedPurchase(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Admin ----------

  const getAllPurchases = async (filters?: PurchaseFilters): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await PurchaseService.getAllPurchases(filters);
      if (response.success && response.data) {
        setPurchases(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.message || "Failed to fetch purchases");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch purchases");
      setPurchases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPendingVerifications = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await PurchaseService.getPendingVerifications();
      if (response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : [];
        setPendingVerifications(list);
        setPurchases(list);
      } else {
        throw new Error(
          response.message || "Failed to fetch pending verifications",
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch pending verifications");
      setPendingVerifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (
    purchaseId: string,
    data: VerifyPaymentRequest,
  ): Promise<Purchase> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await PurchaseService.verifyPayment(purchaseId, data);

      if (response.success && response.data) {
        const updated = response.data;
        setPurchases((prev) =>
          prev.map((p) => (p.id === purchaseId ? updated : p)),
        );
        setPendingVerifications((prev) =>
          prev.filter((p) => p.id !== purchaseId),
        );
        if (selectedPurchase?.id === purchaseId) {
          setSelectedPurchase(updated);
        }
        return updated;
      }
      throw new Error(response.message || "Failed to verify payment");
    } catch (err: any) {
      const message = err.message || "Failed to verify payment";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatistics = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await PurchaseService.getStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch statistics");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelected = () => setSelectedPurchase(null);
  const clearError = () => setError(null);

  const contextValue: PurchaseContextType = {
    purchases,
    selectedPurchase,
    pendingVerifications,
    statistics,
    isLoading,
    error,
    createPurchase,
    uploadScreenshot,
    verifyPayment,
    cancelPurchase,
    getMyPurchases,
    getPurchaseById,
    getAllPurchases,
    getPendingVerifications,
    getStatistics,
    clearSelected,
    clearError,
  };

  return (
    <PurchaseContext.Provider value={contextValue}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = (): PurchaseContextType => {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error("usePurchase must be used within a PurchaseProvider");
  }
  return context;
};
