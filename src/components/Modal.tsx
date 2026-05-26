import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useStore } from "@/store/useStore";
import { X } from "lucide-react";

interface ModalProps {
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ children, title }: ModalProps) {
  const { closeModal } = useStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(panel, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [closeModal]);

  const handleClose = () => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    gsap.to(panel, { opacity: 0, scale: 0.95, duration: 0.2 });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      onComplete: closeModal,
    });
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(92, 64, 51, 0.2)" }}
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        className="bg-white rounded-t-[2rem] sm:rounded-[2rem] max-w-[48rem] w-full max-h-[min(92dvh,100%)] sm:max-h-[85vh] overflow-y-auto shadow-card-hover border-2 border-pink-200 relative pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <img src="/assets/washi-tape.png" alt="" className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-24 h-7 object-contain z-10 hidden sm:block" />
        
        <div className="flex items-center justify-between p-4 sm:p-6 pb-0 pt-5 sm:pt-7">
          {title && <h3 className="text-[1.75rem] sm:text-[2rem] font-serif text-brown pr-2">{title}</h3>}
          <button
            type="button"
            onClick={handleClose}
            className="ml-auto w-10 h-10 rounded-full bg-[#FFF8F0] border border-pink-200 flex items-center justify-center hover:bg-pink-200/30 transition-colors shadow-soft flex-shrink-0"
          >
            <X size={18} className="text-brown" />
          </button>
        </div>
        <div className="p-4 sm:p-6 pt-3 sm:pt-4">{children}</div>
      </div>
    </div>
  );
}
