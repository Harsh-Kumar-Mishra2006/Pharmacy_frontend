import Api from '../api/api';
import {
  type ApiResponse,
  type Medicine,
  type CreateMedicineRequest,
  type UpdateMedicineRequest,
  type UpdateQuantityRequest,
  type ApproveRejectRequest,
  type MedicineFilters,
  type MedicineStatistics,
  type SupplierSummary
} from '../types';

class MedicineService {
  // Create a new medicine (Supplier)
  public async createMedicine(data: CreateMedicineRequest): Promise<ApiResponse<Medicine>> {
    try {
      const response = await Api.post<Medicine>('/medicines', data);
      return response;
    } catch (error: any) {
      console.error('Create medicine error:', error);
      throw error;
    }
  }

  // Get all medicines with filters
  public async getMedicines(filters?: MedicineFilters): Promise<ApiResponse<Medicine[]> & { pagination?: any }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }

      const url = `/medicines${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await Api.get<Medicine[]>(url);
      return response;
    } catch (error: any) {
      console.error('Get medicines error:', error);
      throw error;
    }
  }

  // Get single medicine by ID
  public async getMedicineById(id: string): Promise<ApiResponse<Medicine>> {
    try {
      const response = await Api.get<Medicine>(`/medicines/${id}`);
      return response;
    } catch (error: any) {
      console.error('Get medicine error:', error);
      throw error;
    }
  }

  // Update medicine (Supplier/Owner)
  public async updateMedicine(id: string, data: UpdateMedicineRequest): Promise<ApiResponse<Medicine>> {
    try {
      const response = await Api.put<Medicine>(`/medicines/${id}`, data);
      return response;
    } catch (error: any) {
      console.error('Update medicine error:', error);
      throw error;
    }
  }

  // Update medicine quantity (Supplier)
  public async updateQuantity(id: string, data: UpdateQuantityRequest): Promise<ApiResponse<{
    id: string;
    name: string;
    previous_quantity: number;
    current_quantity: number;
    is_low_stock: boolean;
    is_out_of_stock: boolean;
  }>> {
    try {
      const response = await Api.patch<{
        id: string;
        name: string;
        previous_quantity: number;
        current_quantity: number;
        is_low_stock: boolean;
        is_out_of_stock: boolean;
      }>(`/medicines/${id}/quantity`, data);
      return response;
    } catch (error: any) {
      console.error('Update quantity error:', error);
      throw error;
    }
  }

  // Approve medicine (Admin)
  public async approveMedicine(id: string, data?: ApproveRejectRequest): Promise<ApiResponse<Medicine>> {
    try {
      const response = await Api.put<Medicine>(`/medicines/${id}/approve`, data || {});
      return response;
    } catch (error: any) {
      console.error('Approve medicine error:', error);
      throw error;
    }
  }

  // Reject medicine (Admin)
  public async rejectMedicine(id: string, data: { rejection_reason: string }): Promise<ApiResponse<Medicine>> {
    try {
      const response = await Api.put<Medicine>(`/medicines/${id}/reject`, data);
      return response;
    } catch (error: any) {
      console.error('Reject medicine error:', error);
      throw error;
    }
  }

  // Delete medicine (Admin)
  public async deleteMedicine(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await Api.delete<void>(`/medicines/${id}`);
      return response;
    } catch (error: any) {
      console.error('Delete medicine error:', error);
      throw error;
    }
  }

  // Get medicine statistics (Admin)
  public async getMedicineStats(): Promise<ApiResponse<MedicineStatistics>> {
    try {
      const response = await Api.get<MedicineStatistics>('/medicines/statistics');
      return response;
    } catch (error: any) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  // Get supplier summary (Supplier)
  public async getSupplierSummary(): Promise<ApiResponse<SupplierSummary>> {
    try {
      const response = await Api.get<SupplierSummary>('/medicines/supplier-summary');
      return response;
    } catch (error: any) {
      console.error('Get supplier summary error:', error);
      throw error;
    }
  }

  // Get medicines by supplier (Admin)
  public async getMedicinesBySupplier(supplierId: string, status?: string): Promise<ApiResponse<Medicine[]>> {
    try {
      const url = `/medicines/supplier/${supplierId}${status ? `?status=${status}` : ''}`;
      const response = await Api.get<Medicine[]>(url);
      return response;
    } catch (error: any) {
      console.error('Get medicines by supplier error:', error);
      throw error;
    }
  }

  // Search medicines (public)
  public async searchMedicines(searchTerm: string): Promise<ApiResponse<Medicine[]>> {
    try {
      const response = await Api.get<Medicine[]>(`/medicines?search=${encodeURIComponent(searchTerm)}`);
      return response;
    } catch (error: any) {
      console.error('Search medicines error:', error);
      throw error;
    }
  }

  // Get low stock medicines
  public async getLowStockMedicines(): Promise<ApiResponse<Medicine[]>> {
    try {
      const response = await Api.get<Medicine[]>('/medicines?low_stock=true&in_stock=true');
      return response;
    } catch (error: any) {
      console.error('Get low stock medicines error:', error);
      throw error;
    }
  }

  // Get out of stock medicines
  public async getOutOfStockMedicines(): Promise<ApiResponse<Medicine[]>> {
    try {
      const response = await Api.get<Medicine[]>('/medicines?in_stock=false');
      return response;
    } catch (error: any) {
      console.error('Get out of stock medicines error:', error);
      throw error;
    }
  }
}

export default new MedicineService();