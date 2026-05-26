import { useState, useMemo } from "react";
import RemoteImage from "@/components/RemoteImage";
import { dotToIsoDate } from "@/api/date";
import { confirmAction } from "@/lib/confirm";
import { useAllHealthRecords, useStore } from "@/store/useStore";
import type { Bunny, HealthRecord } from "@/store/useStore";
import { HeartPulse, Plus, Save, Pencil, Trash2, X, Calendar, FileText, Activity } from "lucide-react";
import CategoryTag from "./CategoryTag";

const typeOptions = [
  { value: "checkup", label: "体检", color: "bg-green-50 text-green-600 border-green-200" },
  { value: "abnormal", label: "异常", color: "bg-red-50 text-red-500 border-red-200" },
  { value: "prevention", label: "预防", color: "bg-blue-50 text-blue-500 border-blue-200" },
  { value: "care", label: "护理", color: "bg-pink-50 text-pink-500 border-pink-200" },
];

const typeMap: Record<string, string> = { checkup: "体检", abnormal: "异常", prevention: "预防", care: "护理" };

interface Props {
  bunnies: Bunny[];
  currentBunnyId: string;
}

export default function HealthManage({ bunnies, currentBunnyId }: Props) {
  const allRecords = useAllHealthRecords();
  const addHealthRecord = useStore((s) => s.addHealthRecord);
  const updateHealthRecord = useStore((s) => s.updateHealthRecord);
  const deleteHealthRecord = useStore((s) => s.deleteHealthRecord);
  const [bunnyFilter, setBunnyFilter] = useState<string[]>(["全部"]);
  const [busy, setBusy] = useState(false);

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

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [type, setType] = useState("checkup");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [postBunnyId, setPostBunnyId] = useState(currentBunnyId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState("checkup");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const filtered = useMemo(() => {
    let list = [...allRecords];
    if (!bunnyFilter.includes("全部")) list = list.filter((r) => bunnyFilter.includes(r.bunnyName));
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [allRecords, bunnyFilter]);

  const resetForm = () => {
    setDate(today);
    setType("checkup");
    setDescription("");
    setStatus("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description || !status) return;
    setBusy(true);
    try {
      await addHealthRecord(postBunnyId, {
        date,
        type: type as HealthRecord["type"],
        description,
        status,
      });
      resetForm();
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (r: typeof filtered[0]) => {
    setEditingId(r.id);
    setEditDate(dotToIsoDate(r.date));
    setEditType(r.type);
    setEditDesc(r.description);
    setEditStatus(r.status);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setBusy(true);
    try {
      await updateHealthRecord(editingId, {
        date: editDate,
        type: editType as HealthRecord["type"],
        description: editDesc,
        status: editStatus,
      });
      resetForm();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirmAction("确定删除这条健康记录？")) return;
    setBusy(true);
    try {
      await deleteHealthRecord(id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-pink-200/30 flex items-center justify-center"><HeartPulse size={20} className="text-pink-400" /></div>
        <h3 className="text-[2rem] font-serif text-brown">健康记录</h3>
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
          <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center">{editingId ? <Pencil size={13} className="text-pink-500" /> : <Plus size={14} className="text-pink-500" />}</div>
          <p className="text-[1.4rem] font-medium text-brown">{editingId ? "编辑记录" : "添加新记录"}</p>
          {!editingId && (
            <select value={postBunnyId} onChange={(e) => setPostBunnyId(e.target.value)} className="ml-auto text-[1.2rem] text-brown bg-[#FFF8F0] border border-pink-200 rounded-lg px-2 py-1 outline-none">
              {bunnies.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
        </div>
        <form
          onSubmit={editingId ? (e) => { e.preventDefault(); void handleSaveEdit(); } : handleSubmit}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[1.2rem] text-brown-mid mb-1"><Calendar size={14} className="text-pink-400" /> 日期</label>
              <input value={editingId ? editDate : date} onChange={(e) => editingId ? setEditDate(e.target.value) : setDate(e.target.value)} type="date" className="w-full h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-4 text-[1.3rem] text-brown focus:border-pink-400 focus:outline-none focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[1.2rem] text-brown-mid mb-1"><Activity size={14} className="text-pink-400" /> 类型</label>
              <div className="flex gap-2 flex-wrap">
                {typeOptions.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => editingId ? setEditType(opt.value) : setType(opt.value)} className={`px-3 py-1.5 rounded-full text-[1.1rem] transition-all border ${(editingId ? editType : type) === opt.value ? opt.color + " font-medium" : "bg-[#FFF8F0] text-brown-mid border-pink-200 hover:border-pink-400"}`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[1.2rem] text-brown-mid mb-1"><FileText size={14} className="text-pink-400" /> 状态</label>
              <input value={editingId ? editStatus : status} onChange={(e) => editingId ? setEditStatus(e.target.value) : setStatus(e.target.value)} placeholder="如 正常 / 已恢复" className="w-full h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-4 text-[1.3rem] focus:border-pink-400 focus:outline-none focus:bg-white transition-colors" />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[1.2rem] text-brown-mid mb-1"><FileText size={14} className="text-pink-400" /> 描述</label>
            <input value={editingId ? editDesc : description} onChange={(e) => editingId ? setEditDesc(e.target.value) : setDescription(e.target.value)} placeholder="记录具体内容..." className="w-full h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-4 text-[1.3rem] focus:border-pink-400 focus:outline-none focus:bg-white transition-colors" />
          </div>
          <div className="flex gap-3 pt-1">
            {editingId && <button type="button" onClick={resetForm} className="h-10 px-5 rounded-full border border-pink-200 text-[1.3rem] text-brown-mid hover:text-brown flex items-center gap-1"><X size={14} /> 取消</button>}
            <button type="submit" disabled={busy} className="h-10 px-6 rounded-full bg-brown text-white text-[1.3rem] font-medium hover:bg-brown-light transition-colors flex items-center gap-1.5 shadow-soft disabled:opacity-50">
              {editingId ? <Save size={14} /> : <Plus size={14} />}
              {busy ? "处理中..." : editingId ? "保存" : "添加"}
            </button>
          </div>
        </form>
      </div>

      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={`${r.bunnyId}-${r.id}`} className="bg-white rounded-2xl border border-pink-100 shadow-soft p-4 flex items-start gap-3 group">
              <RemoteImage src={r.bunnyAvatar} alt={r.bunnyName} className="w-28 h-28 rounded-xl object-cover border border-pink-200 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[1.2rem] font-medium text-brown">{r.bunnyName}</span>
                  <span className="text-[1.1rem] text-brown-mid">{r.date}</span>
                  <CategoryTag type={typeMap[r.type]} />
                  <span className="text-[1.1rem] px-2 py-0.5 rounded-full bg-[#FFF8F0] text-brown-mid border border-pink-100">{r.status}</span>
                </div>
                <p className="text-[1.4rem] text-brown leading-relaxed">{r.description}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => startEdit(r)} className="w-8 h-8 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center hover:bg-pink-100"><Pencil size={12} className="text-brown" /></button>
                <button type="button" onClick={() => void handleDelete(r.id)} disabled={busy} className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 disabled:opacity-50"><Trash2 size={12} className="text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-3"><HeartPulse size={28} className="text-pink-300" /></div>
          <p className="text-[1.4rem] text-brown-mid">还没有健康记录，快添加一条吧~</p>
        </div>
      )}
    </div>
  );
}
