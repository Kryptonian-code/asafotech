import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAdminMe, getAdminStatus, getAdminToken, loginAdmin, logoutAdmin, setAdminToken, bootstrapAdmin, type AdminUser } from "@/lib/api";

interface AdminAuthContextValue {
  admin: AdminUser | null;
  hasAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  bootstrap: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [hasAdmin, setHasAdmin] = useState(true);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const status = await getAdminStatus();
      setHasAdmin(status.hasAdmin);

      if (getAdminToken()) {
        const me = await getAdminMe();
        setAdmin(me.admin);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdminToken(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<AdminAuthContextValue>(() => ({
    admin,
    hasAdmin,
    loading,
    login: async (email, password) => {
      const response = await loginAdmin({ email, password });
      setAdminToken(response.token);
      setAdmin(response.admin);
      setHasAdmin(true);
    },
    bootstrap: async (fullName, email, password) => {
      const response = await bootstrapAdmin({ fullName, email, password });
      setAdminToken(response.token);
      setAdmin(response.admin);
      setHasAdmin(true);
    },
    logout: async () => {
      try {
        await logoutAdmin();
      } finally {
        setAdminToken(null);
        setAdmin(null);
      }
    },
    refresh,
  }), [admin, hasAdmin, loading]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }

  return context;
};
