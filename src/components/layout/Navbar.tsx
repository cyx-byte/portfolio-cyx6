"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { id: "about", label: "关于我" },
  { id: "architecture", label: "建筑设计" },
  { id: "zine", label: "ZINE" },
  { id: "articles", label: "公众号图文" },
  { id: "contact", label: "联系方式" },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-stone-50/80 backdrop-blur-sm"
    >
      <div className={`max-w-[1400px] mx-auto px-8 h-16 flex items-center ${isHome ? "justify-end" : "justify-between"}`}>
        {!isHome && (
          <Link
            href="/"
            className="font-serif text-lg tracking-wide text-stone-800 hover:text-stone-500 transition-colors"
          >
            蔡宇翔
          </Link>
        )}
        <nav className="flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={`/${item.id}`}
              className={`text-sm tracking-wider transition-colors ${
                pathname.startsWith(`/${item.id}`)
                  ? "text-stone-800 font-medium"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
