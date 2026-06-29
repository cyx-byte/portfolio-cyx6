"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface PhotoUploaderProps {
  currentPhoto: string;
  onChange: (url: string) => void;
  aspectRatio?: number; // default 3/4
  previewClassName?: string; // e.g. "w-32 h-40" for 3:4, "w-40 h-50" for 4:5
}

/** Center a crop with given aspect ratio on the image */
function initialCrop(width: number, height: number, ratio: number): Crop {
  return centerCrop(
    makeAspectCrop(
      { unit: "%", width: 80 },
      ratio,
      width,
      height
    ),
    width,
    height
  );
}

/** Convert a pixel crop + image element into a Blob via canvas */
function cropImage(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export function PhotoUploader({ currentPhoto, onChange, aspectRatio = 3 / 4, previewClassName = "w-32 h-40" }: PhotoUploaderProps) {
  const [showCrop, setShowCrop] = useState(false);
  const [src, setSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(reader.result as string);
      setShowCrop(true);
      setCrop(undefined);
      setCompletedCrop(null);
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(initialCrop(width, height, aspectRatio));
  }, []);

  async function handleConfirmCrop() {
    if (!completedCrop || !imgRef.current) return;
    setUploading(true);
    try {
      const blob = await cropImage(imgRef.current, completedCrop);
      const formData = new FormData();
      formData.append("file", blob, "photo.jpg");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success && json.data?.url) {
        onChange(json.data.url);
      }
    } catch {
      // silently fail
    }
    setUploading(false);
    setShowCrop(false);
    setSrc("");
  }

  return (
    <>
      {/* Current photo + upload trigger */}
      <div className="flex items-center gap-4">
        <div className={`${previewClassName} bg-stone-100 flex items-center justify-center overflow-hidden`}>
          {currentPhoto ? (
            <img src={currentPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-stone-300 text-xs">无照片</span>
          )}
        </div>
        <label className="cursor-pointer px-4 py-2 text-xs border border-stone-300 rounded-md text-stone-600 hover:border-stone-400">
          上传照片
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onSelectFile}
          />
        </label>
      </div>

      {/* Crop modal */}
      {showCrop && src && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-8">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="font-serif text-lg text-stone-800 mb-4">
              裁剪照片 — 拖动调整范围
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              框内区域为展示区，框外被裁掉
            </p>

            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-h-[50vh]"
            >
              <img
                ref={imgRef}
                src={src}
                onLoad={onImageLoad}
                alt="裁剪预览"
                className="max-h-[50vh] object-contain"
              />
            </ReactCrop>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 border border-stone-200 rounded-md"
                onClick={() => { setShowCrop(false); setSrc(""); }}
              >
                取消
              </button>
              <button
                className="px-6 py-2 text-sm bg-stone-800 text-white rounded-md hover:bg-stone-700 disabled:opacity-40"
                onClick={handleConfirmCrop}
                disabled={uploading || !completedCrop}
              >
                {uploading ? "上传中..." : "确认裁剪"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
