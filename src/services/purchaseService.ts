// src/services/purchaseService.ts
import Api from '../api/api';
import {
  type ApiResponse,
  type Purchase,
  type PurchaseRequest,
  type PurchaseCreateResponse,
  type PurchaseFilters,
  type PurchaseStatistics,
  type UploadScreenshotRequest,
  type VerifyPaymentRequest,
} from '../types';

class PurchaseService {
  // ============================================================
  // PUBLIC / CUSTOMER
  // ============================================================

  /**
   * Create a new purchase.
   * Backend returns { purchase, payment_qr } so the client can display
   * the static UPI QR code immediately.
   *
   * POST /api/purchases
   * Access: Public (optional auth — sends token if logged in)
   */
  public async createPurchase(
    data: PurchaseRequest
  ): Promise<ApiResponse<Purchase> & { payment_qr?: PurchaseCreateResponse['payment_qr'] }> {
    try {
      const response = await Api.post<Purchase>('/purchases', data);
      return response as ApiResponse<Purchase> & {
        payment_qr?: PurchaseCreateResponse['payment_qr'];
      };
    } catch (error: any) {
      console.error('Create purchase error:', error);
      throw error;
    }
  }

  /**
   * Upload payment screenshot to complete proof-of-payment.
   * Backend sets payment.status = 'paid' and purchase.status = 'confirmed'.
   *
   * POST /api/purchases/:id/upload-screenshot
   * Access: Public
   */
  public async uploadScreenshot(
    purchaseId: string,
    data: UploadScreenshotRequest
  ): Promise<ApiResponse<Purchase>> {
    try {
      return await Api.post<Purchase>(
        `/purchases/${purchaseId}/upload-screenshot`,
        data
      );
    } catch (error: any) {
      console.error('Upload screenshot error:', error);
      throw error;
    }
  }

  /**
   * Get a single purchase by ID.
   * Useful for a public "track order" page or guest checkout receipt.
   *
   * GET /api/purchases/:id
   * Access: Public
   */
  public async getPurchaseById(id: string): Promise<ApiResponse<Purchase>> {
    try {
      return await Api.get<Purchase>(`/purchases/${id}`);
    } catch (error: any) {
      console.error('Get purchase error:', error);
      throw error;
    }
  }

  // ============================================================
  // AUTHENTICATED CUSTOMER
  // ============================================================

  /**
   * Get all purchases belonging to the logged-in user.
   *
   * GET /api/purchases/my-purchases
   * Access: Private (any authenticated user)
   */
  public async getMyPurchases(): Promise<ApiResponse<Purchase[]>> {
    try {
      return await Api.get<Purchase[]>('/purchases/my-purchases');
    } catch (error: any) {
      console.error('Get my purchases error:', error);
      throw error;
    }
  }

  /**
   * Cancel a purchase (customer or admin).
   * Backend restores medicine stock if payment was already verified.
   *
   * PUT /api/purchases/:id/cancel
   * Access: Private
   */
  public async cancelPurchase(
    purchaseId: string,
    cancellation_reason?: string
  ): Promise<ApiResponse<Purchase>> {
    try {
      return await Api.put<Purchase>(`/purchases/${purchaseId}/cancel`, {
        cancellation_reason,
      });
    } catch (error: any) {
      console.error('Cancel purchase error:', error);
      throw error;
    }
  }

  // ============================================================
  // ADMIN
  // ============================================================

  /**
   * Get all purchases with optional filters + pagination.
   *
   * GET /api/purchases/admin/all?status=&payment_status=&start_date=&end_date=&page=&limit=
   * Access: Private/Admin
   */
  public async getAllPurchases(
    filters?: PurchaseFilters
  ): Promise<ApiResponse<Purchase[]>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      const url = `/purchases/admin/all${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      return await Api.get<Purchase[]>(url);
    } catch (error: any) {
      console.error('Get all purchases error:', error);
      throw error;
    }
  }

  /**
   * Get purchases awaiting payment verification (screenshot uploaded).
   *
   * GET /api/purchases/admin/pending-verifications
   * Access: Private/Admin
   */
  public async getPendingVerifications(): Promise<ApiResponse<Purchase[]>> {
    try {
      return await Api.get<Purchase[]>('/purchases/admin/pending-verifications');
    } catch (error: any) {
      console.error('Get pending verifications error:', error);
      throw error;
    }
  }

  /**
   * Verify a payment — sets status to verified and deducts medicine stock.
   *
   * PUT /api/purchases/admin/:id/verify-payment
   * Access: Private/Admin
   */
  public async verifyPayment(
    purchaseId: string,
    data: VerifyPaymentRequest
  ): Promise<ApiResponse<Purchase>> {
    try {
      return await Api.put<Purchase>(
        `/purchases/admin/${purchaseId}/verify-payment`,
        data
      );
    } catch (error: any) {
      console.error('Verify payment error:', error);
      throw error;
    }
  }

  /**
   * Get purchase & revenue statistics.
   *
   * GET /api/purchases/admin/statistics
   * Access: Private/Admin
   */
  public async getStatistics(): Promise<ApiResponse<PurchaseStatistics>> {
    try {
      return await Api.get<PurchaseStatistics>('/purchases/admin/statistics');
    } catch (error: any) {
      console.error('Get purchase stats error:', error);
      throw error;
    }
  }
}

export default new PurchaseService();