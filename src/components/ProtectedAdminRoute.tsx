import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

const ProtectedAdminRoute = ({ children }: { children: ReactNode }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
