"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAdmin } from "./AdminProvider";

interface EditableImageProps {
  src: string;
  onChange: (url: string) => void;
  className?: string;
  alt?: string;
}

export function EditableImage({
  src,
  onChange,
  className = "",
  alt = "",
}: EditableImageProps) {
  const { isAdmin } = useAdmin();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        onChange(json.data.url);
      }
    } catch {
      // silently fail
    } finally {
      setUploading(false);
      // Reset input so same file can be re-uploaded
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Existing content rendered by parent */}
      {/* Upload overlay */}
      {isAdmin && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          whileHover={{ opacity: 1 }}
          onClick={() => fileRef.current?.click()}
        >
          <span className="text-white text-sm bg-black/60 px-3 py-1.5 rounded-full">
            {uploading ? "上传中..." : src ? "更换图片" : "上传图片"}
          </span>
        </motion.div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
