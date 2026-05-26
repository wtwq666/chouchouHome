import { useState, useMemo } from "react";
import RemoteImage from "@/components/RemoteImage";
import { useAllWeightRecords, useStore } from "@/store/useStore";
import type { Bunny } from "@/store/useStore";
import { todayIsoDate } from "@/api/date";
import { confirmAction } from "@/lib/confirm";
import { notifyError, notifySuccess } from "@/lib/notify";
import { Weight, Plus, Calendar, TrendingUp, Trash2, Pencil, X, Check } from "lucide-react";

interface Props {
  bunnies: Bunny[];
  currentBunnyId: string;
}

export default function WeightManage({ bunnies, currentBunnyId }: Props) {
  const allRecords = useAllWeightRecords();
  const addWeightRecord = useStore((s) => s.addWeightRecord);
  const updateWeightRecord = useStore((s) => s.updateWeightRecord);
  const deleteWeightRecord = useStore((s) => s.deleteWeightRecord);
  const [bunnyFilter, setBunnyFilter] = useState<string[]>(["全部"]);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editWeight, setEditWeight] = useState("");

  const toggleBunnyFilter = (name: string) => {
    setBunnyFilter((prev) => {
      if (name === "全部") return ["全部"];
      const withoutAll = prev.filter((p) => p !== "全部");
      if (withoutAll.includes(name)) {
        const next = withoutAll.filter((n) => n !== name);
        return next.length === 0 ? ["全部"] : next;
      }
      return [...withoutAll, name];
    });
  };

  const today = todayIsoDate();
  const [dateVal, setDateVal] = useState(today);
  const [weightVal, setWeightVal] = useState("");
  const [postBunnyId, setPostBunnyId] = useState(currentBunnyId);

  const filtered = useMemo(() => {
    let list = [...allRecords];
    if (!bunnyFilter.includes("全部")) list = list.filter((r) => bunnyFilter.includes(r.bunnyName));
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [allRecords, bunnyFilter]);

  const weightDateForInput = (date: string) => {
    if (/^\d{4}-\d{2}$/.test(date)) return `${date}-01`;
    return date.replace(/\./g, "-").slice(0, 10);
  };

  const weightDateFromInput = (iso: string) => iso.slice(0, 7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateVal || !weightVal) return;
    setBusy(true);
    try {
      await addWeightRecord(postBunnyId, {
        date: weightDateFromInput(dateVal),
        weight: Number(weightVal),
      });
      setDateVal(today);
      setWeightVal("");
      notifySuccess("体重已记录");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "记录失败");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (id: string, date: string, weight: number) => {
    setEditingId(id);
    setEditDate(weightDateForInput(date));
    setEditWeight(String(weight));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate("");
    setEditWeight("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editDate || !editWeight) return;
    setBusy(true);
    try {
      await updateWeightRecord(id, {
        date: weightDateFromInput(editDate),
        weight: Number(editWeight),
      });
      cancelEdit();
      notifySuccess("已更新");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirmAction("确定删除这条体重记录？")) return;
    setBusy(true);
    try {
      await deleteWeightRecord(id);
      if (editingId === id) cancelEdit();
      notifySuccess("已删除");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-pink-200/30 flex items-center justify-center"><Weight size={20} className="text-pink-400" /></div>
        <h3 className="text-[2rem] font-serif text-brown">体重记录</h3>
        <span className="text-[1.2rem] text-brown-mid">({filtered.length} 条)</span>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button onClick={() => toggleBunnyFilter("全部")} className={`px-4 py-1.5 rounded-full text-[1.2rem] transition-all ${bunnyFilter.includes("全部") ? "bg-brown text-white" : "bg-white text-brown-mid border border-pink-200 hover:border-pink-soft"}`}>全部</button>
        {bunnies.map((b) => (
          <button key={b.id} onClick={() => toggleBunnyFilter(b.name)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[1.2rem] transition-all ${bunnyFilter.includes(b.name) && !bunnyFilter.includes("全部") ? "bg-brown text-white" : "bg-white text-brown-mid border border-pink-200 hover:border-pink-soft"}`}>
            <RemoteImage src={b.avatar} alt={b.name} className="w-12 h-12 rounded-full object-cover" />
            {b.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-soft p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center"><Plus size={14} className="text-pink-500" /></div>
          <p className="text-[1.4rem] font-medium text-brown">记录新体重</p>
          <select value={postBunnyId} onChange={(e) => setPostBunnyId(e.target.value)} className="ml-auto text-[1.2rem] text-brown bg-[#FFF8F0] border border-pink-200 rounded-lg px-2 py-1 outline-none">
            {bunnies.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-end">
          <div className="w-full sm:flex-1 sm:min-w-[12rem]">
            <label className="flex items-center gap-1.5 text-[1.2rem] text-brown-mid mb-1.5"><Calendar size={14} className="text-pink-400" /> 日期</label>
            <input value={dateVal} onChange={(e) => setDateVal(e.target.value)} type="date" required className="w-full h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-4 text-[1.3rem] text-brown focus:border-pink-400 focus:outline-none focus:bg-white transition-colors" />
          </div>
          <div className="w-full sm:w-40">
            <label className="flex items-center gap-1.5 text-[1.2rem] text-brown-mid mb-1.5"><TrendingUp size={14} className="text-pink-400" /> 体重 (g)</label>
            <input value={weightVal} onChange={(e) => setWeightVal(e.target.value)} type="number" placeholder="0" required className="w-full h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-4 text-[1.3rem] focus:border-pink-400 focus:outline-none focus:bg-white transition-colors" />
          </div>
          <button type="submit" disabled={busy} className="w-full sm:w-auto h-11 px-6 rounded-full bg-brown text-white text-[1.3rem] font-medium hover:bg-brown-light transition-colors flex items-center justify-center gap-1.5 shadow-soft disabled:opacity-50"><Plus size={14} /> {busy ? "提交中..." : "记录"}</button>
        </form>
      </div>

      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((r, idx) => {
            const nextSameBunny = filtered.slice(idx + 1).find((x) => x.bunnyId === r.bunnyId);
            const diff = nextSameBunny ? r.weight - nextSameBunny.weight : 0;
            const isEditing = editingId === r.id;
            return (
              <div key={`${r.bunnyId}-${r.id}`} className="bg-white rounded-2xl border border-pink-100 shadow-soft p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <RemoteImage src={r.bunnyAvatar} alt={r.bunnyName} className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl object-cover border border-pink-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[1.3rem] font-medium text-brown">{r.bunnyName}</span>
                    {!isEditing && <span className="text-[1.1rem] text-brown-mid">{r.date}</span>}
                  </div>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2 items-end mt-2">
                      <input value={editDate} onChange={(e) => setEditDate(e.target.value)} type="date" className="h-10 px-3 border border-pink-200 rounded-lg text-[1.2rem]" />
                      <input value={editWeight} onChange={(e) => setEditWeight(e.target.value)} type="number" className="h-10 w-28 px-3 border border-pink-200 rounded-lg text-[1.2rem]" />
                      <button type="button" onClick={() => void handleSaveEdit(r.id)} disabled={busy} className="h-10 px-3 rounded-full bg-brown text-white flex items-center gap-1 text-[1.1rem] disabled:opacity-50"><Check size={14} /> 保存</button>
                      <button type="button" onClick={cancelEdit} className="h-10 px-3 rounded-full border border-pink-200 text-[1.1rem] text-brown-mid flex items-center gap-1"><X size={14} /> 取消</button>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-[2rem] font-serif text-brown">{r.weight}g</span>
                      {diff !== 0 && nextSameBunny && (
                        <span className={`text-[1.1rem] px-2 py-0.5 rounded-full ${diff > 0 ? "bg-green-50 text-green-600" : "bg-pink-50 text-pink-500"}`}>
                          {diff > 0 ? "+" : ""}{diff}g
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button type="button" onClick={() => startEdit(r.id, r.date, r.weight)} disabled={busy} className="w-8 h-8 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center hover:bg-pink-100 transition-colors disabled:opacity-50">
                      <Pencil size={13} className="text-brown-mid" />
                    </button>
                    <button type="button" onClick={() => void handleDelete(r.id)} disabled={busy} className="w-8 h-8 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50">
                      <Trash2 size={13} className="text-brown-mid" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-3"><Weight size={28} className="text-pink-300" /></div>
          <p className="text-[1.4rem] text-brown-mid">还没有体重记录，快添加一条吧~</p>
        </div>
      )}
    </div>
  );
}
