"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { SiteData } from "@/types";

interface AdminContextValue {
  isAdmin: boolean;
  data: SiteData | null;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  saveData: (data: SiteData) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  data: null,
  login: async () => false,
  logout: async () => {},
  refreshData: async () => {},
  saveData: async () => false,
});

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<SiteData | null>(null);

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (json.success) {
        setIsAdmin(true);
        // Load data
        const dataRes = await fetch("/api/content");
        const dataJson = await dataRes.json();
        if (dataJson.success) {
          setData(dataJson.data);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setIsAdmin(false);
    setData(null);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch {
      // silently fail
    }
  }, []);

  const saveData = useCallback(
    async (newData: SiteData): Promise<boolean> => {
      try {
        const res = await fetch("/api/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newData),
        });
        const json = await res.json();
        if (json.success) {
          setData(newData);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  return (
    <AdminContext.Provider
      value={{ isAdmin, data, login, logout, refreshData, saveData }}
    >
      {children}
    </AdminContext.Provider>
  );
}
