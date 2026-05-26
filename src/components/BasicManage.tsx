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
  /** 在管理页内嵌时隐藏重复标题与添加按钮 */
  embedded?: boolean;
}

export default function BasicManage({ bunnies, onUpdate, onAddClick, embedded = false }: Props) {
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
      <p className="text-[1.25rem] text-brown-mid text-center py-8">
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
      {!embedded && (
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-9 h-9 rounded-xl bg-pink-200/30 flex items-center justify-center">
            <Rabbit size={18} className="text-pink-400" />
          </div>
          <h3 className="text-[1.6rem] sm:text-[2rem] font-serif text-brown">基本信息</h3>
          <button
            type="button"
            onClick={onAddClick}
            className="ml-auto h-9 px-4 rounded-full bg-pink-300 sm:bg-brown text-white text-[1.2rem] font-medium hover:opacity-90 transition-colors flex items-center gap-1 shadow-soft"
          >
            <Plus size={15} /> 添加
          </button>
        </div>
      )}

      <div className="mb-3 sm:mb-4">
        <p className="text-[1.1rem] text-brown-mid mb-2 sm:hidden">选择兔子</p>
        <div className="mobile-scroll-x flex items-center gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
          {bunnies.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSelectedId(b.id);
                setEditMode(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[1.15rem] transition-all border flex-shrink-0 ${
                b.id === selectedId
                  ? "bg-pink-300 text-white border-pink-300"
                  : "bg-white text-brown-mid border-pink-200"
              }`}
            >
              <RemoteImage src={b.avatar} alt={b.name} className="w-7 h-7 rounded-full object-cover" />
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-soft p-3 sm:p-5">
        <div className="flex flex-row items-start gap-3 sm:gap-4 mb-4">
          <AvatarUpload
            bunnyId={bunny.id}
            src={bunny.avatar}
            alt={bunny.name}
            className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 shrink-0"
          />
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[1.45rem] sm:text-[1.6rem] font-medium text-brown truncate">{bunny.name}</p>
            <p className="text-[1.1rem] sm:text-[1.2rem] text-brown-mid truncate">{bunny.breed}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => setEditMode(!editMode)}
                disabled={busy}
                className="h-8 px-3 rounded-full border border-pink-200 text-[1.15rem] text-brown-mid hover:text-brown hover:border-pink-400 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Pencil size={13} /> {editMode ? "取消" : "编辑"}
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={busy}
                className="h-8 px-3 rounded-full border border-red-200 text-[1.15rem] text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Trash2 size={13} /> 删除
              </button>
            </div>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 max-w-[50rem]">
            <p className="text-[1.1rem] text-brown-mid">点击头像可更换图片</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[1.1rem] text-brown-mid mb-1">名字</label>
                <input
                  name="name"
                  defaultValue={bunny.name}
                  required
                  className="w-full h-10 sm:h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-3 sm:px-4 text-[1.3rem] focus:border-pink-400 focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[1.1rem] text-brown-mid mb-1">品种</label>
                <input
                  name="breed"
                  defaultValue={bunny.breed}
                  required
                  className="w-full h-10 sm:h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-3 sm:px-4 text-[1.3rem] focus:border-pink-400 focus:outline-none focus:bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[1.1rem] text-brown-mid mb-1">出生日期</label>
                <input
                  name="birthDate"
                  type="date"
                  defaultValue={bunny.birthDate}
                  required
                  className="w-full h-10 sm:h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-3 sm:px-4 text-[1.3rem] focus:border-pink-400 focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[1.1rem] text-brown-mid mb-1">体重 (g)</label>
                <input
                  name="weight"
                  type="number"
                  defaultValue={bunny.weight}
                  className="w-full h-10 sm:h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-3 sm:px-4 text-[1.3rem] focus:border-pink-400 focus:outline-none focus:bg-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="h-9 px-5 rounded-full bg-pink-300 sm:bg-brown text-white text-[1.2rem] font-medium hover:opacity-90 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save size={14} /> {busy ? "保存中..." : "保存"}
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: "名字", value: bunny.name },
              { label: "品种", value: bunny.breed },
              { label: "出生日期", value: bunny.birthDate },
              { label: "当前体重", value: `${bunny.weight}g` },
              { label: "编号", value: bunny.id.toUpperCase(), mono: true },
            ].map((item) => (
              <div key={item.label} className="p-2.5 sm:p-3 bg-[#FFF8F0]/40 rounded-xl min-w-0">
                <p className="text-[1rem] text-brown-mid">{item.label}</p>
                <p
                  className={`text-[1.25rem] sm:text-[1.35rem] font-medium text-brown truncate ${item.mono ? "text-[0.95rem] sm:text-[1.1rem]" : ""}`}
                  title={item.value}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
