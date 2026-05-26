import { useEffect, useState } from "react";
import AvatarUpload from "@/components/AvatarUpload";
import RemoteImage from "@/components/RemoteImage";
import EmptyBunniesPrompt from "@/components/EmptyBunniesPrompt";
import { confirmAction } from "@/lib/confirm";
import { notifyError, notifySuccess } from "@/lib/notify";
import type { Bunny } from "@/store/useStore";
import { useStore } from "@/store/useStore";
import { Rabbit, Pencil, Save, Plus, Trash2 } from "lucide-react";

interface Props {
  bunnies: Bunny[];
  onUpdate: (id: string, b: Partial<Bunny>) => void | Promise<void>;
  onAddClick: () => void;
}

export default function BasicManage({ bunnies, onUpdate, onAddClick }: Props) {
  const deleteBunny = useStore((s) => s.deleteBunny);
  const [selectedId, setSelectedId] = useState<string>(bunnies[0]?.id || "");
  const [editMode, setEditMode] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (bunnies.length === 0) {
      setSelectedId("");
      return;
    }
    if (!bunnies.some((b) => b.id === selectedId)) {
      setSelectedId(bunnies[0].id);
      setEditMode(false);
    }
  }, [bunnies, selectedId]);

  if (bunnies.length === 0) {
    return <EmptyBunniesPrompt />;
  }

  const bunny = bunnies.find((b) => b.id === selectedId);
  if (!bunny) {
    return (
      <p className="text-[1.4rem] text-brown-mid text-center py-8">
        没有匹配的兔子，请调整搜索条件。
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await onUpdate(bunny.id, {
        name: fd.get("name") as string,
        breed: fd.get("breed") as string,
        birthDate: fd.get("birthDate") as string,
        weight: Number(fd.get("weight")),
      });
      setEditMode(false);
      notifySuccess("资料已保存");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    const msg = `确定删除「${bunny.name}」？\n其成长足迹、照片、体重与健康记录将一并删除，且无法恢复。`;
    if (!confirmAction(msg)) return;
    setBusy(true);
    try {
      await deleteBunny(bunny.id);
      notifySuccess(`已删除 ${bunny.name}`);
      setEditMode(false);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="w-10 h-10 rounded-xl bg-pink-200/30 flex items-center justify-center">
          <Rabbit size={20} className="text-pink-400" />
        </div>
        <h3 className="text-[2rem] font-serif text-brown">基本信息</h3>
        <button
          type="button"
          onClick={onAddClick}
          className="ml-auto h-10 px-5 rounded-full bg-brown text-white text-[1.3rem] font-medium hover:bg-brown-light transition-colors flex items-center gap-1.5 shadow-soft"
        >
          <Plus size={16} /> 添加兔子
        </button>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="text-[1.2rem] text-brown-mid">选择兔子：</span>
        {bunnies.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              setSelectedId(b.id);
              setEditMode(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[1.2rem] transition-all border ${
              b.id === selectedId
                ? "bg-brown text-white border-brown"
                : "bg-white text-brown-mid border-pink-200 hover:border-pink-soft"
            }`}
          >
            <RemoteImage src={b.avatar} alt={b.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
            {b.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-soft p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto">
            <AvatarUpload
              bunnyId={bunny.id}
              src={bunny.avatar}
              alt={bunny.name}
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 shrink-0"
            />
            <div className="text-center sm:text-left">
              <p className="text-[1.6rem] font-medium text-brown">{bunny.name}</p>
              <p className="text-[1.2rem] text-brown-mid">{bunny.breed}</p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2 flex-shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              disabled={busy}
              className="h-9 px-4 rounded-full border border-pink-200 text-[1.3rem] text-brown-mid hover:text-brown hover:border-pink-400 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Pencil size={14} /> {editMode ? "取消" : "编辑"}
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={busy}
              className="h-9 px-4 rounded-full border border-red-200 text-[1.3rem] text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 size={14} /> 删除
            </button>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-[50rem]">
            <p className="text-[1.2rem] text-brown-mid">点击上方头像可更换图片（上传至 OSS）</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[1.2rem] text-brown-mid mb-1">名字</label>
                <input
                  name="name"
                  defaultValue={bunny.name}
                  required
                  className="w-full h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-4 text-[1.4rem] focus:border-pink-400 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-[1.2rem] text-brown-mid mb-1">品种</label>
                <input
                  name="breed"
                  defaultValue={bunny.breed}
                  required
                  className="w-full h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-4 text-[1.4rem] focus:border-pink-400 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[1.2rem] text-brown-mid mb-1">出生日期</label>
                <input
                  name="birthDate"
                  type="date"
                  defaultValue={bunny.birthDate}
                  required
                  className="w-full h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-4 text-[1.4rem] focus:border-pink-400 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-[1.2rem] text-brown-mid mb-1">体重 (g)</label>
                <input
                  name="weight"
                  type="number"
                  defaultValue={bunny.weight}
                  className="w-full h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-4 text-[1.4rem] focus:border-pink-400 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="h-10 px-6 rounded-full bg-brown text-white text-[1.3rem] font-medium hover:bg-brown-light transition-colors flex items-center gap-1.5 shadow-soft disabled:opacity-50"
            >
              <Save size={14} /> {busy ? "保存中..." : "保存"}
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "名字", value: bunny.name },
              { label: "品种", value: bunny.breed },
              { label: "出生日期", value: bunny.birthDate },
              { label: "当前体重", value: `${bunny.weight}g` },
              { label: "编号", value: bunny.id.toUpperCase() },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-[#FFF8F0]/30 rounded-xl">
                <p className="text-[1.1rem] text-brown-mid">{item.label}</p>
                <p className="text-[1.5rem] font-medium text-brown">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
