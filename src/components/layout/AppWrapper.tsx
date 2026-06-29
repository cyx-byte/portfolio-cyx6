"use client";

import type { ReactNode } from "react";
import { AdminProvider } from "@/components/admin/AdminProvider";
import { Navbar } from "./Navbar";

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
    </AdminProvider>
  );
}
