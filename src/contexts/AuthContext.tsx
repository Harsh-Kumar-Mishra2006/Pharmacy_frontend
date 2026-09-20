// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import {
  type AuthContextType,
  type User,
  type RegisterRequest,
  type UpdateProfileRequest,
} from "../types";
import AuthService from "../services/authService";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken"),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state — auto-syncs
  const isAuthenticated = !!token && !!user;

  // ---------- Init from localStorage ----------
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("userData");

      if (storedToken && storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          AuthService.setAuthToken(storedToken);
        } catch (err) {
          console.error("Error initializing auth:", err);
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearError = () => setError(null);

  // ---------- Login ----------
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.login({ email, password });

      if (response.success && response.data) {
        const d = response.data;
        const userObj: User = {
          id: d.id,
          name: d.name,
          email: d.email,
          role: d.role,
          phone: d.phone,
          address: d.address,
          is_active: true,
        };

        localStorage.setItem("authToken", d.token);
        localStorage.setItem("userData", JSON.stringify(userObj));

        setToken(d.token);
        setUser(userObj);
        AuthService.setAuthToken(d.token);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err: any) {
      const message = err.message || "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Register ----------
  const register = async (userData: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.register(userData);

      if (response.success && response.data) {
        const d = response.data;
        const userObj: User = {
          id: d.id,
          name: d.name,
          email: d.email,
          role: d.role,
          phone: d.phone,
          address: d.address,
          is_active: true,
        };

        localStorage.setItem("authToken", d.token);
        localStorage.setItem("userData", JSON.stringify(userObj));

        setToken(d.token);
        setUser(userObj);
        AuthService.setAuthToken(d.token);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (err: any) {
      const message = err.message || "Registration failed";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Logout ----------
  const logout = (): void => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setToken(null);
    setUser(null);
    setError(null);
    AuthService.removeAuthToken();
  };

  // ---------- Get profile ----------
  const getProfile = async (): Promise<void> => {
    if (!token) throw new Error("Not authenticated");

    try {
      const response = await AuthService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem("userData", JSON.stringify(response.data));
      } else {
        throw new Error(response.message || "Failed to fetch profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile");
      throw err;
    }
  };

  // ---------- Update profile ----------
  const updateProfile = async (data: UpdateProfileRequest): Promise<void> => {
    if (!token) throw new Error("Not authenticated");

    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.updateProfile(data);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem("userData", JSON.stringify(response.data));
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err: any) {
      const message = err.message || "Failed to update profile";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Change password ----------
  // ✅ Signature matches Profile.tsx: (currentPassword, newPassword)
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    if (!token) throw new Error("Not authenticated");

    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.changePassword({
        currentPassword,
        newPassword,
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (err: any) {
      const message = err.message || "Failed to change password";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
