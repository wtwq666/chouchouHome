import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/store/useStore";

export default function AppBootstrap({ children }: { children: React.ReactNode }) {
  const loadBootstrap = useStore((s) => s.loadBootstrap);
  const isLoading = useStore((s) => s.isLoading);
  const isHydrated = useStore((s) => s.isHydrated);
  const error = useStore((s) => s.error);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  if (isLoading && !isHydrated) {
    return (
      <div className="min-h-screen bg-[#FFF5E8] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-pink-200 border-t-pink-400 animate-spin" />
        <p className="text-[1.4rem] text-brown-mid font-medium">正在加载兔兔的家...</p>
      </div>
    );
  }

  if (error && !isHydrated) {
    const needBackend =
      error.includes("ECONNREFUSED") ||
      error.includes("Failed to fetch") ||
      error.includes("NetworkError");
    const needDbReset =
      error.includes("notes does not exist") ||
      error.includes("UndefinedColumn") ||
      error.includes("500");
    return (
      <div className="min-h-screen bg-[#FFF5E8] flex flex-col items-center justify-center gap-4 px-6 max-w-lg mx-auto">
        <p className="text-[1.5rem] text-brown text-center">加载失败：{error}</p>
        {needDbReset && (
          <p className="text-[1.25rem] text-brown-mid text-center leading-relaxed">
            数据库表结构过旧，请在 backend 目录执行：
            <code className="block mt-2 text-[1.1rem] bg-white/80 px-3 py-2 rounded-lg">
              python scripts/reset_and_seed.py
            </code>
            完成后重启 uvicorn，再点重试。
          </p>
        )}
        {needBackend && (
          <p className="text-[1.25rem] text-brown-mid text-center leading-relaxed">
            请先在后端目录启动 API：
            <code className="block mt-2 text-[1.1rem] bg-white/80 px-3 py-2 rounded-lg">
              uvicorn app.main:app --reload --port 8000
            </code>
            启动后点击重试。
          </p>
        )}
        <button
          type="button"
          onClick={() => void loadBootstrap()}
          className="h-11 px-8 rounded-full bg-brown text-white text-[1.3rem] hover:bg-brown-light transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
