import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const ProtectedCustomerRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useCustomerAuth();

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!user) {
    return <Navigate to="/account/login" replace />;
  }

  return children;
};

export default ProtectedCustomerRoute;
