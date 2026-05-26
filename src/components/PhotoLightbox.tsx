import { useEffect } from "react";
import { createPortal } from "react-dom";
import RemoteImage from "@/components/RemoteImage";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface PhotoLightboxItem {
  src: string;
  description?: string;
  subtitle?: string;
  tags?: string[];
}

interface Props {
  open: boolean;
  items: PhotoLightboxItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export default function PhotoLightbox({ open, items, index, onClose, onIndexChange }: Props) {
  const current = items[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
      if (e.key === "ArrowRight" && index < items.length - 1) onIndexChange(index + 1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, index, items.length, onClose, onIndexChange]);

  if (!open || !current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-2 sm:p-8 bg-black/35 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="浏览照片"
    >
      <div
        className="relative w-full max-w-[min(96vw,56rem)] max-h-[min(92dvh,100%)] flex flex-col bg-white rounded-[1.2rem] sm:rounded-[1.6rem] border-2 border-pink-200 shadow-card-hover overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-pink-100 bg-[#FFF8F0]/80 flex-shrink-0">
          <div className="min-w-0 pr-10">
            <p className="text-[1.4rem] font-medium text-brown truncate">
              {current.description || "照片"}
            </p>
            {(current.subtitle || items.length > 1) && (
              <p className="text-[1.15rem] text-brown-mid truncate">
                {current.subtitle}
                {items.length > 1 ? ` · ${index + 1} / ${items.length}` : ""}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white border-2 border-pink-200 flex items-center justify-center hover:bg-pink-50 hover:border-pink-300 transition-colors shadow-soft z-10"
            aria-label="关闭"
          >
            <X size={20} className="text-brown" />
          </button>
        </div>

        <div className="relative flex-1 min-h-0 flex items-center justify-center bg-[#FFF8F0]/30 p-3 sm:p-4">
          <RemoteImage
            src={current.src}
            alt={current.description || ""}
            className="max-w-full max-h-[min(55dvh,28rem)] sm:max-h-[min(70vh,32rem)] object-contain rounded-lg"
          />

          {index > 0 && (
            <button
              type="button"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 border border-pink-200 flex items-center justify-center hover:bg-pink-50 shadow-soft"
              onClick={() => onIndexChange(index - 1)}
              aria-label="上一张"
            >
              <ChevronLeft size={22} className="text-brown" />
            </button>
          )}
          {index < items.length - 1 && (
            <button
              type="button"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 border border-pink-200 flex items-center justify-center hover:bg-pink-50 shadow-soft"
              onClick={() => onIndexChange(index + 1)}
              aria-label="下一张"
            >
              <ChevronRight size={22} className="text-brown" />
            </button>
          )}
        </div>

        {(current.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 py-2 border-t border-pink-100 flex-shrink-0">
            {current.tags!.map((t) => (
              <span key={t} className="text-[1rem] px-2.5 py-0.5 rounded-full bg-pink-100 text-brown-mid">
                {t}
              </span>
            ))}
          </div>
        )}

        <p className="text-center text-[1.05rem] text-brown-mid/80 py-2 flex-shrink-0">
          点击照片外的区域关闭
        </p>
      </div>
    </div>,
    document.body,
  );
}
