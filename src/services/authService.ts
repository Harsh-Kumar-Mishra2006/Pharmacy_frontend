// src/services/authService.ts
import Api from '../api/api';
import {
  type LoginRequest,
  type RegisterRequest,
  type UpdateProfileRequest,
  type ChangePasswordRequest,
  type AuthResponse,
  type ApiResponse,
  type User,
  type UserRole,
} from '../types';

class AuthService {
  public setAuthToken(token: string): void {
    Api.setAuthToken(token);
  }

  public removeAuthToken(): void {
    Api.removeAuthToken();
  }

  public async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await Api.post<AuthResponse['data']>(
        '/auth/register',
        userData
      );
      return response as AuthResponse;
    } catch (error: any) {
      console.error('Register service error:', error);
      throw error;
    }
  }

  public async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await Api.post<AuthResponse['data']>(
        '/auth/login',
        credentials
      );
      return response as AuthResponse;
    } catch (error: any) {
      console.error('Login service error:', error);
      throw error;
    }
  }

  public async getProfile(): Promise<ApiResponse<User>> {
    try {
      return await Api.get<User>('/auth/profile');
    } catch (error: any) {
      console.error('Get profile service error:', error);
      throw error;
    }
  }

  public async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    try {
      return await Api.put<User>('/auth/profile', data);
    } catch (error: any) {
      console.error('Update profile service error:', error);
      throw error;
    }
  }

  public async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      return await Api.put<void>('/auth/change-password', data);
    } catch (error: any) {
      console.error('Change password service error:', error);
      throw error;
    }
  }

  // ---------- Admin only ----------

  public async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      return await Api.get<User[]>('/auth/users');
    } catch (error: any) {
      console.error('Get all users service error:', error);
      throw error;
    }
  }

  public async getUsersByRole(role: UserRole): Promise<ApiResponse<User[]>> {
    try {
      return await Api.get<User[]>(`/auth/users/role/${role}`);
    } catch (error: any) {
      console.error('Get users by role service error:', error);
      throw error;
    }
  }

  public async updateUserRole(
    userId: string,
    role: UserRole
  ): Promise<ApiResponse<{ id: string; name: string; email: string; role: string }>> {
    try {
      return await Api.put<{ id: string; name: string; email: string; role: string }>(
        `/auth/users/${userId}/role`,
        { role }
      );
    } catch (error: any) {
      console.error('Update user role service error:', error);
      throw error;
    }
  }

  public async toggleUserStatus(
    userId: string
  ): Promise<ApiResponse<{ id: string; name: string; email: string; is_active: boolean }>> {
    try {
      return await Api.put<{ id: string; name: string; email: string; is_active: boolean }>(
        `/auth/users/${userId}/toggle-status`
      );
    } catch (error: any) {
      console.error('Toggle user status service error:', error);
      throw error;
    }
  }

  public async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await Api.delete<void>(`/auth/users/${userId}`);
    } catch (error: any) {
      console.error('Delete user service error:', error);
      throw error;
    }
  }

  public async searchUsers(searchTerm: string): Promise<ApiResponse<User[]>> {
    try {
      return await Api.get<User[]>(
        `/auth/users/search?q=${encodeURIComponent(searchTerm)}`
      );
    } catch (error: any) {
      console.error('Search users service error:', error);
      throw error;
    }
  }
}

export default new AuthService();