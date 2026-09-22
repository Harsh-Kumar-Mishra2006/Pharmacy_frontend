import Api from '../api/api';
import {
  type ApiResponse,
  type Medicine,
  type AvailableMedicine,
  type AvailableMedicineFilters,
  type CreateMedicineRequest,
  type UpdateMedicineRequest,
  type MedicineFilters,
  type MedicineStatistics,
} from '../types';


class MedicineService {
  // Create a new medicine (Admin only)
  public async createMedicine(
    data: CreateMedicineRequest,
  ): Promise<ApiResponse<Medicine>> {
    try {
      const response = await Api.post<Medicine>('/medicines', data);
      return response;
    } catch (error: any) {
      console.error('Create medicine error:', error);
      throw error;
    }
  }

  // Get all medicines with filters (any authenticated user)
  public async getMedicines(
    filters?: MedicineFilters,
  ): Promise<ApiResponse<Medicine[]> & { pagination?: any }> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }

      const url = `/medicines${
        params.toString() ? `?${params.toString()}` : ''
      }`;
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

  // Update medicine metadata (Admin only)
  public async updateMedicine(
    id: string,
    data: UpdateMedicineRequest,
  ): Promise<ApiResponse<Medicine>> {
    try {
      const response = await Api.put<Medicine>(`/medicines/${id}`, data);
      return response;
    } catch (error: any) {
      console.error('Update medicine error:', error);
      throw error;
    }
  }

  // Delete medicine (Admin only)
  public async deleteMedicine(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await Api.delete<void>(`/medicines/${id}`);
      return response;
    } catch (error: any) {
      console.error('Delete medicine error:', error);
      throw error;
    }
  }

  // Get catalog statistics (Admin only)
  public async getMedicineStats(): Promise<ApiResponse<MedicineStatistics>> {
    try {
      const response = await Api.get<MedicineStatistics>(
        '/medicines/statistics',
      );
      return response;
    } catch (error: any) {
      console.error('Get stats error:', error);
      throw error;
    }
  }
  

  // Search medicines (public/authenticated)
  public async searchMedicines(
    searchTerm: string,
  ): Promise<ApiResponse<Medicine[]>> {
    try {
      const response = await Api.get<Medicine[]>(
        `/medicines?search=${encodeURIComponent(searchTerm)}`,
      );
      return response;
    } catch (error: any) {
      console.error('Search medicines error:', error);
      throw error;
    }
  }

  // NEW: Get customer-visible medicines (catalog + approved supplies)
  public async getAvailableMedicines(
    filters?: AvailableMedicineFilters,
  ): Promise<ApiResponse<AvailableMedicine[]> & { pagination?: any }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      const url = `/medicines/available${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      return await Api.get<AvailableMedicine[]>(url);
    } catch (error: any) {
      console.error('Get available medicines error:', error);
      throw error;
    }
  }
}


export default new MedicineService();