"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { id: "about", label: "关于我", delay: 0 },
  { id: "architecture", label: "建筑设计", delay: 0.08 },
  { id: "zine", label: "ZINE", delay: 0.16 },
  { id: "articles", label: "公众号图文", delay: 0.24 },
  { id: "contact", label: "联系方式", delay: 0.32 },
];

interface NavModulesProps {
  visible: boolean;
}

export function NavModules({ visible }: NavModulesProps) {
  return (
    <motion.nav
      className="flex flex-col items-center gap-4"
      animate={{
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      {NAV_ITEMS.map((item) => (
        <motion.div
          key={item.id}
          animate={{
            opacity: visible ? 1 : 0,
            y: visible ? 0 : 20,
          }}
          transition={{
            duration: 0.4,
            delay: visible ? item.delay : 0,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <Link
            href={`/${item.id}`}
            className="text-base md:text-lg tracking-[0.12em] text-stone-500 hover:text-stone-800 transition-colors duration-300"
          >
            {item.label}
          </Link>
        </motion.div>
      ))}
    </motion.nav>
  );
}
