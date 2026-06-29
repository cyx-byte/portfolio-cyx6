"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAdmin();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(password);
    if (!ok) {
      setError("密码错误");
    }
    setLoading(false);
  }

  // Show dashboard after login
  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-stone-50">
      <motion.div
        className="w-full max-w-sm mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h1 className="font-serif text-2xl tracking-[0.08em] text-center text-stone-800 mb-8">
          管理后台
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            className="w-full border border-stone-200 rounded-md px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-white"
            autoFocus
          />

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-stone-800 text-white text-sm tracking-[0.1em] rounded-md hover:bg-stone-700 disabled:opacity-40 transition-all"
          >
            {loading ? "验证中..." : "登录"}
          </button>
        </form>

        <p className="text-xs text-stone-300 text-center mt-8">
          默认密码: admin123
        </p>
      </motion.div>
    </div>
  );
}
