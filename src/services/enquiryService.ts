import Api from '../api/api';
import {
  type ApiResponse,
  type Enquiry,
  type CreateEnquiryRequest,
  type AcceptEnquiryRequest,
  type RejectEnquiryRequest,
  type EnquiryFilters,
  type EnquiryStatistics,
  type SupplierEnquirySummary,
} from '../types';

class EnquiryService {
  // Admin creates an enquiry
  public async createEnquiry(
    data: CreateEnquiryRequest,
  ): Promise<ApiResponse<Enquiry>> {
    try {
      const response = await Api.post<Enquiry>('/enquiries', data);
      return response;
    } catch (error: any) {
      console.error('Create enquiry error:', error);
      throw error;
    }
  }

  // List enquiries (role-filtered by backend)
  public async getEnquiries(
    filters?: EnquiryFilters,
  ): Promise<ApiResponse<Enquiry[]> & { pagination?: any }> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }

      const url = `/enquiries${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      const response = await Api.get<Enquiry[]>(url);
      return response;
    } catch (error: any) {
      console.error('Get enquiries error:', error);
      throw error;
    }
  }

  // Get one enquiry
  public async getEnquiryById(id: string): Promise<ApiResponse<Enquiry>> {
    try {
      const response = await Api.get<Enquiry>(`/enquiries/${id}`);
      return response;
    } catch (error: any) {
      console.error('Get enquiry error:', error);
      throw error;
    }
  }

  // Supplier accepts → creates a linked Supply
  public async acceptEnquiry(
    id: string,
    data: AcceptEnquiryRequest,
  ): Promise<ApiResponse<Enquiry>> {
    try {
      const response = await Api.put<Enquiry>(`/enquiries/${id}/accept`, data);
      return response;
    } catch (error: any) {
      console.error('Accept enquiry error:', error);
      throw error;
    }
  }

  // Supplier rejects enquiry
  public async rejectEnquiry(
    id: string,
    data: RejectEnquiryRequest,
  ): Promise<ApiResponse<Enquiry>> {
    try {
      const response = await Api.put<Enquiry>(`/enquiries/${id}/reject`, data);
      return response;
    } catch (error: any) {
      console.error('Reject enquiry error:', error);
      throw error;
    }
  }

  // Admin cancels a pending enquiry
  public async cancelEnquiry(id: string): Promise<ApiResponse<Enquiry>> {
    try {
      const response = await Api.put<Enquiry>(`/enquiries/${id}/cancel`, {});
      return response;
    } catch (error: any) {
      console.error('Cancel enquiry error:', error);
      throw error;
    }
  }

  // Supplier enquiry summary
  public async getSupplierSummary(): Promise<
    ApiResponse<SupplierEnquirySummary>
  > {
    try {
      const response = await Api.get<SupplierEnquirySummary>(
        '/enquiries/supplier-summary',
      );
      return response;
    } catch (error: any) {
      console.error('Get supplier enquiry summary error:', error);
      throw error;
    }
  }

  // Admin enquiry stats
  public async getEnquiryStats(): Promise<ApiResponse<EnquiryStatistics>> {
    try {
      const response = await Api.get<EnquiryStatistics>(
        '/enquiries/statistics',
      );
      return response;
    } catch (error: any) {
      console.error('Get enquiry stats error:', error);
      throw error;
    }
  }
}

export default new EnquiryService();