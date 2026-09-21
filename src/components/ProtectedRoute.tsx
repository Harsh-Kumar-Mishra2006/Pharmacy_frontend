// src/components/ProtectedRoute.tsx
import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { type UserRole } from "../types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-orange"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role-appropriate landing pages
    const fallbacks: Record<UserRole, string> = {
      admin: "/admin/medicines",
      supplier: "/supplier/supplies",
      user: "/",
    };
    return <Navigate to={fallbacks[user.role] || "/"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
