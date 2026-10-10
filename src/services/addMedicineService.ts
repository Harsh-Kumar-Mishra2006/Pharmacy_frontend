import Api from '../api/api';
import {
  type AddMedicine,
  type AddMedicineContextType,
  type AddMedicineFilters,
  type AddMedicineListResponse,
  type AddMedicineOverviewResponse,
  type AddStockBatchRequest,
  type AdjustStockRequest,
  type CreateAddMedicineRequest,
  type StockAdjustment,
  type UpdateAddMedicineRequest,
} from '../types';

const BASE = '/add-medicines';

class AddMedicineService {
  // ---------------- MEDICINE CRUD ----------------

  /** Admin: add a medicine (multipart if images present) */
  public async addMedicine(data: CreateAddMedicineRequest): Promise<AddMedicine> {
    try {
      const hasImages = data.images && data.images.length > 0;

      let payload: FormData | Record<string, any>;

      if (hasImages) {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (k === 'images') return;
          fd.append(k, String(v));
        });
        data.images!.forEach((file) => fd.append('images', file));
        payload = fd;
      } else {
        // Strip File[] from JSON payload
        const { images, ...rest } = data;
        payload = rest;
      }

      const response = await Api.post<AddMedicine>(BASE, payload, {
        headers: hasImages ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      return response.data as AddMedicine;
    } catch (error) {
      console.error('Add medicine error:', error);
      throw error;
    }
  }

  /** Admin: update details only (stock is managed separately) */
  public async updateMedicine(
    id: string,
    data: UpdateAddMedicineRequest,
  ): Promise<AddMedicine> {
    try {
      const hasImages = data.images && data.images.length > 0;
      let payload: FormData | Record<string, any>;

      if (hasImages) {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (k === 'images') return;
          fd.append(k, String(v));
        });
        data.images!.forEach((file) => fd.append('images', file));
        payload = fd;
      } else {
        const { images, ...rest } = data;
        payload = rest;
      }

      const response = await Api.put<AddMedicine>(`${BASE}/${id}`, payload, {
        headers: hasImages ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      return response.data as AddMedicine;
    } catch (error) {
      console.error('Update medicine error:', error);
      throw error;
    }
  }

  /** Admin: delete a medicine + its batches + adjustments */
  public async deleteMedicine(id: string): Promise<void> {
    try {
      await Api.delete(`${BASE}/${id}`);
    } catch (error) {
      console.error('Delete medicine error:', error);
      throw error;
    }
  }

  // ---------------- LISTS ----------------

  public async getMedicines(
    filters?: AddMedicineFilters,
  ): Promise<AddMedicineListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            params.append(k, String(v));
          }
        });
      }
      const url = `${BASE}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await Api.get<AddMedicine[]>(url);
      return response as unknown as AddMedicineListResponse;
    } catch (error) {
      console.error('Get add-medicines error:', error);
      throw error;
    }
  }

  public async getMedicineById(id: string): Promise<AddMedicine> {
    try {
      const response = await Api.get<AddMedicine>(`${BASE}/${id}`);
      return response.data as AddMedicine;
    } catch (error) {
      console.error('Get add-medicine error:', error);
      throw error;
    }
  }

  public async getStockOverview(): Promise<AddMedicineOverviewResponse> {
    try {
      const response = await Api.get<AddMedicineOverviewResponse>(
        `${BASE}/overview`,
      );
      return response as unknown as AddMedicineOverviewResponse;
    } catch (error) {
      console.error('Get stock overview error:', error);
      throw error;
    }
  }

  public async getAdjustmentHistory(filters?: {
    medicine_id?: string;
    adjustment_type?: 'increase' | 'decrease';
    reason?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: StockAdjustment[];
    pagination?: any;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            params.append(k, String(v));
          }
        });
      }
      const url = `${BASE}/adjustments${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await Api.get<StockAdjustment[]>(url);
      return response as unknown as { data: StockAdjustment[]; pagination?: any };
    } catch (error) {
      console.error('Get adjustments error:', error);
      throw error;
    }
  }

  // ---------------- STOCK OPS ----------------

  public async addStockBatch(
    medicineId: string,
    data: AddStockBatchRequest,
  ): Promise<void> {
    try {
      await Api.post(`${BASE}/${medicineId}/batches`, data);
    } catch (error) {
      console.error('Add stock batch error:', error);
      throw error;
    }
  }

  public async adjustStock(
    medicineId: string,
    data: AdjustStockRequest,
  ): Promise<void> {
    try {
      await Api.post(`${BASE}/${medicineId}/adjust`, data);
    } catch (error) {
      console.error('Adjust stock error:', error);
      throw error;
    }
  }
}

export default new AddMedicineService();