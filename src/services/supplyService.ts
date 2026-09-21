import Api from '../api/api';
import {
  type ApiResponse,
  type Supply,
  type CreateSupplyRequest,
  type UpdateSupplyRequest,
  type SupplyFilters,
  type SupplyStatistics,
  type SupplierSupplySummary,
} from '../types';

class SupplyService {
  // Supplier creates a supply
  public async createSupply(
    data: CreateSupplyRequest,
  ): Promise<ApiResponse<Supply>> {
    try {
      const response = await Api.post<Supply>('/supplies', data);
      return response;
    } catch (error: any) {
      console.error('Create supply error:', error);
      throw error;
    }
  }

  // List supplies (role-filtered by backend)
  public async getSupplies(
    filters?: SupplyFilters,
  ): Promise<ApiResponse<Supply[]> & { pagination?: any }> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }

      const url = `/supplies${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await Api.get<Supply[]>(url);
      return response;
    } catch (error: any) {
      console.error('Get supplies error:', error);
      throw error;
    }
  }

  // Get a single supply
  public async getSupplyById(id: string): Promise<ApiResponse<Supply>> {
    try {
      const response = await Api.get<Supply>(`/supplies/${id}`);
      return response;
    } catch (error: any) {
      console.error('Get supply error:', error);
      throw error;
    }
  }

  // Supplier updates own supply (pending only)
  public async updateSupply(
    id: string,
    data: UpdateSupplyRequest,
  ): Promise<ApiResponse<Supply>> {
    try {
      const response = await Api.put<Supply>(`/supplies/${id}`, data);
      return response;
    } catch (error: any) {
      console.error('Update supply error:', error);
      throw error;
    }
  }

  // Delete supply (Supplier for own pending, Admin any)
  public async deleteSupply(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await Api.delete<void>(`/supplies/${id}`);
      return response;
    } catch (error: any) {
      console.error('Delete supply error:', error);
      throw error;
    }
  }

  // Admin approves supply
  public async approveSupply(
    id: string,
    approval_notes?: string,
  ): Promise<ApiResponse<Supply>> {
    try {
      const response = await Api.put<Supply>(`/supplies/${id}/approve`, {
        approval_notes,
      });
      return response;
    } catch (error: any) {
      console.error('Approve supply error:', error);
      throw error;
    }
  }

  // Admin rejects supply
  public async rejectSupply(
    id: string,
    rejection_reason: string,
  ): Promise<ApiResponse<Supply>> {
    try {
      const response = await Api.put<Supply>(`/supplies/${id}/reject`, {
        rejection_reason,
      });
      return response;
    } catch (error: any) {
      console.error('Reject supply error:', error);
      throw error;
    }
  }

  // Admin marks supply received (stock intake)
  public async receiveSupply(id: string): Promise<ApiResponse<Supply>> {
    try {
      const response = await Api.put<Supply>(`/supplies/${id}/receive`, {});
      return response;
    } catch (error: any) {
      console.error('Receive supply error:', error);
      throw error;
    }
  }

  // Supplier summary for dashboard
  public async getSupplierSummary(): Promise<
    ApiResponse<SupplierSupplySummary>
  > {
    try {
      const response = await Api.get<SupplierSupplySummary>(
        '/supplies/supplier-summary',
      );
      return response;
    } catch (error: any) {
      console.error('Get supplier supply summary error:', error);
      throw error;
    }
  }

  // Admin: supplies for a specific supplier
  public async getSuppliesBySupplier(
    supplierId: string,
    status?: string,
  ): Promise<ApiResponse<Supply[]>> {
    try {
      const url = `/supplies/supplier/${supplierId}${
        status ? `?status=${status}` : ''
      }`;
      const response = await Api.get<Supply[]>(url);
      return response;
    } catch (error: any) {
      console.error('Get supplies by supplier error:', error);
      throw error;
    }
  }

  // Admin: supply statistics
  public async getSupplyStats(): Promise<ApiResponse<SupplyStatistics>> {
    try {
      const response = await Api.get<SupplyStatistics>('/supplies/statistics');
      return response;
    } catch (error: any) {
      console.error('Get supply stats error:', error);
      throw error;
    }
  }
}

export default new SupplyService();