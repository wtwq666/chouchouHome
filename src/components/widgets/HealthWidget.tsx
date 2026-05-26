import { useState } from "react";
import EmptyBunniesPrompt from "@/components/EmptyBunniesPrompt";
import { useBunnies, useCurrentBunnyData, useStore } from "@/store/useStore";
import CategoryTag from "@/components/CategoryTag";
import Modal from "@/components/Modal";
import { HeartPulse, Trash2 } from "lucide-react";

const typeMap: Record<string, string> = { checkup: "体检", abnormal: "异常", prevention: "预防", care: "护理" };

export default function HealthWidget() {
  const bunnies = useBunnies();
  const data = useCurrentBunnyData();
  const currentBunnyId = useStore((s) => s.currentBunnyId);
  const modalType = useStore((s) => s.modalType);
  const openModal = useStore((s) => s.openModal);
  const closeModal = useStore((s) => s.closeModal);
  const addHealthRecord = useStore((s) => s.addHealthRecord);
  const deleteHealthRecord = useStore((s) => s.deleteHealthRecord);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (bunnies.length === 0) {
    return (
      <div className="bg-white rounded-[1.8rem] h-full border border-pink-200/30 shadow-polaroid">
        <EmptyBunniesPrompt compact title="暂无健康记录" />
      </div>
    );
  }
  if (!data) return null;

  const records = data.healthRecords.slice(0, 5);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      await addHealthRecord(currentBunnyId, {
        date: fd.get("date") as string,
        type: fd.get("type") as "checkup" | "abnormal" | "prevention" | "care",
        description: fd.get("description") as string,
        status: fd.get("status") as string,
      });
      closeModal();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteHealthRecord(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-[1.4rem] sm:rounded-[1.8rem] p-3 sm:p-5 h-full flex flex-col shadow-polaroid border border-pink-200/30 relative">
      <img src="/assets/stickers.png" alt="" className="absolute -top-2 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 object-contain z-10 animate-pulse-soft hidden sm:block" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-200/30 flex items-center justify-center">
            <HeartPulse size={16} className="text-pink-400" />
          </div>
          <h3 className="text-[1.5rem] font-medium text-brown">健康档案</h3>
        </div>
        <button onClick={() => openModal("health")} className="text-[1.2rem] text-pink-400 hover:text-pink-500 transition-colors font-medium px-3 py-1 rounded-full hover:bg-pink-200/20">
          + 记录
        </button>
      </div>
      <div className="space-y-2 flex-1 overflow-auto">
        {records.map((r) => (
          <div key={r.id} className={`flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#FFF8F0] transition-all duration-300 group border border-transparent hover:border-pink-200/20 ${deletingId === r.id ? "opacity-0 -translate-x-4" : ""}`}>
            <span className="text-[1.1rem] text-brown-mid flex-shrink-0 w-20">{r.date}</span>
            <CategoryTag type={typeMap[r.type]} />
            <span className="text-[1.3rem] text-brown flex-1 truncate">{r.description}</span>
            <button type="button" onClick={() => void handleDelete(r.id)} disabled={busy} className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-[#FFF8F0] border border-pink-200 flex items-center justify-center flex-shrink-0 hover:bg-pink-200/30 shadow-soft disabled:opacity-50">
              <Trash2 size={12} className="text-brown-mid" />
            </button>
          </div>
        ))}
      </div>

      {modalType === "health" && (
        <Modal title="添加健康记录">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-[1.2rem] text-brown-mid mb-1">日期</label><input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} className="w-full h-12 bg-[#FFF8F0] border-2 border-pink-200 rounded-xl px-4 text-[1.4rem] text-brown focus:border-pink-400 focus:outline-none" /></div>
              <div><label className="block text-[1.2rem] text-brown-mid mb-1">类型</label><select name="type" required className="w-full h-12 bg-[#FFF8F0] border-2 border-pink-200 rounded-xl px-4 text-[1.4rem] text-brown focus:border-pink-400 focus:outline-none appearance-none">{Object.entries(typeMap).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            </div>
            <div><label className="block text-[1.2rem] text-brown-mid mb-1">描述</label><textarea name="description" required className="w-full h-20 bg-[#FFF8F0] border-2 border-pink-200 rounded-xl p-4 text-[1.4rem] text-brown focus:border-pink-400 focus:outline-none resize-y" /></div>
            <div><label className="block text-[1.2rem] text-brown-mid mb-1">状态</label><input name="status" type="text" required placeholder="如：正常" className="w-full h-12 bg-[#FFF8F0] border-2 border-pink-200 rounded-xl px-4 text-[1.4rem] text-brown placeholder:text-brown-mid/50 focus:border-pink-400 focus:outline-none" /></div>
            <button type="submit" disabled={busy} className="w-full h-12 rounded-full bg-brown text-[#FFF8F0] text-[1.4rem] font-medium hover:bg-brown-light transition-colors disabled:opacity-50">{busy ? "保存中..." : "保存"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
