import { useState, useMemo, useRef } from "react";
import RemoteImage from "@/components/RemoteImage";
import { uploadImage } from "@/api";
import { dotToIsoDate } from "@/api/date";
import { confirmAction } from "@/lib/confirm";
import { useAllTimelineEvents, useStore } from "@/store/useStore";
import type { Bunny } from "@/store/useStore";
import { Clock, Save, Pencil, Trash2, X, ImagePlus } from "lucide-react";
import CategoryTag from "./CategoryTag";
import Modal from "./Modal";

const moodOptions = ["平静", "开心", "调皮", "疲惫", "感动", "其他"];
const colorOptions = [
  { label: "粉色", value: "#F5C6C8" },
  { label: "橙色", value: "#F0C4A8" },
  { label: "绿色", value: "#8CBFA5" },
  { label: "蓝色", value: "#8CAED8" },
  { label: "紫色", value: "#B8A5CF" },
];

interface Props {
  bunnies: Bunny[];
  currentBunnyId: string;
}

export default function TimelineManage({ bunnies, currentBunnyId }: Props) {
  const allEvents = useAllTimelineEvents();
  const addTimelineEvent = useStore((s) => s.addTimelineEvent);
  const updateTimelineEvent = useStore((s) => s.updateTimelineEvent);
  const deleteTimelineEvent = useStore((s) => s.deleteTimelineEvent);
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [postText, setPostText] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postDate, setPostDate] = useState(today);
  const [postMood, setPostMood] = useState("平静");
  const [postColor, setPostColor] = useState("#F5C6C8");
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postBunnyId, setPostBunnyId] = useState(currentBunnyId);

  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState(today);
  const [editMood, setEditMood] = useState("平静");
  const [editColor, setEditColor] = useState("#F5C6C8");
  const [editImages, setEditImages] = useState<string[]>([]);

  const [detailEvent, setDetailEvent] = useState<typeof allEvents[0] | null>(null);
  const [uploadTarget, setUploadTarget] = useState<"post" | "edit">("post");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadImage(file));
      }
      if (uploadTarget === "edit") {
        setEditImages((prev) => [...prev, ...urls].slice(0, 9));
      } else {
        setPostImages((prev) => [...prev, ...urls].slice(0, 9));
      }
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const filtered = useMemo(() => {
    let list = [...allEvents];
    if (!bunnyFilter.includes("全部")) {
      list = list.filter((e) => bunnyFilter.includes(e.bunnyName));
    }
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [allEvents, bunnyFilter]);

  const getGridCols = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    return "grid-cols-3";
  };

  const handlePost = async () => {
    if (!postText.trim() && postImages.length === 0) return;
    const bunny = bunnies.find((b) => b.id === postBunnyId);
    if (!bunny) return;
    const images = postImages.map((s) => s.trim()).filter(Boolean);
    setBusy(true);
    try {
      await addTimelineEvent(postBunnyId, {
        date: postDate,
        title: postTitle || "日常记录",
        coverImage: images[0] || bunny.avatar,
        description: postText,
        detailImages: images,
        mood: postMood,
        color: postColor,
      });
      setPostText("");
      setPostTitle("");
      setPostDate(today);
      setPostMood("平静");
      setPostColor("#F5C6C8");
      setPostImages([]);
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (evt: typeof allEvents[0]) => {
    setEditing(evt.id);
    setEditText(evt.description);
    setEditTitle(evt.title);
    setEditDate(dotToIsoDate(evt.date));
    setEditMood(evt.mood || "平静");
    setEditColor(evt.color || "#F5C6C8");
    setEditImages(evt.detailImages.length ? [...evt.detailImages] : []);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const images = editImages.map((s) => s.trim()).filter(Boolean);
    setBusy(true);
    try {
      await updateTimelineEvent(editing, {
        date: editDate,
        title: editTitle,
        description: editText,
        detailImages: images,
        mood: editMood,
        color: editColor,
        coverImage: images[0],
      });
      setEditing(null);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirmAction("确定删除这条成长足迹？")) return;
    setBusy(true);
    try {
      await deleteTimelineEvent(id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-pink-200/30 flex items-center justify-center"><Clock size={20} className="text-pink-400" /></div>
        <h3 className="text-[2rem] font-serif text-brown">成长足迹</h3>
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

      <div className="bg-white rounded-2xl border border-pink-100 shadow-soft mb-6 overflow-hidden">
        <div className="flex items-center gap-3 p-4 pb-2">
          <RemoteImage src={bunnies.find((b) => b.id === postBunnyId)?.avatar || ""} alt="" className="w-28 h-28 rounded-xl object-cover border border-pink-200" />
          <div className="flex-1">
            <select value={postBunnyId} onChange={(e) => setPostBunnyId(e.target.value)} className="text-[1.4rem] font-medium text-brown bg-transparent border-none outline-none cursor-pointer">
              {bunnies.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <p className="text-[1.1rem] text-brown-mid">发布新动态</p>
          </div>
        </div>
        <div className="px-4 pb-2">
          <input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="写一个标题..." className="w-full text-[1.5rem] font-medium text-brown placeholder:text-brown-mid/40 border-none outline-none bg-transparent" />
        </div>
        <div className="px-4 pb-3">
          <textarea value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="记录兔兔的成长瞬间..." rows={3} className="w-full text-[1.4rem] text-brown/90 placeholder:text-brown-mid/40 border-none outline-none bg-transparent resize-none leading-relaxed" />
        </div>
        {postImages.length > 0 && (
          <div className="px-4 pb-3">
            <div className={`grid ${getGridCols(postImages.length)} gap-2 max-w-[30rem]`}>
              {postImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#FFF8F0] border border-pink-100 group">
                  <RemoteImage src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setPostImages(postImages.filter((_, idx) => idx !== i))} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} className="text-white" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="px-4 pb-3">
          {postImages.length < 9 && (
            <button type="button" disabled={busy} onClick={() => { setUploadTarget("post"); fileInputRef.current?.click(); }} className="w-16 h-16 rounded-xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center gap-0.5 hover:border-pink-400 hover:bg-pink-50 transition-colors disabled:opacity-50">
              <ImagePlus size={16} className="text-pink-300" /><span className="text-[0.9rem] text-pink-300">添加</span>
            </button>
          )}
          <span className="text-[1.1rem] text-brown-mid ml-2">{postImages.length}/9</span>
        </div>
        <div className="px-4 py-3 border-t border-pink-100 flex flex-wrap items-center gap-3">
          <input value={postDate} onChange={(e) => setPostDate(e.target.value)} type="date" className="h-9 px-3 rounded-lg bg-[#FFF8F0] border border-pink-200 text-[1.2rem] text-brown focus:border-pink-400 focus:outline-none" />
          <select value={postMood} onChange={(e) => setPostMood(e.target.value)} className="h-9 px-3 rounded-lg bg-[#FFF8F0] border border-pink-200 text-[1.2rem] text-brown focus:border-pink-400 focus:outline-none appearance-none">{moodOptions.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          <div className="flex items-center gap-1.5">
            {colorOptions.map((c) => <button key={c.value} type="button" onClick={() => setPostColor(c.value)} className={`w-6 h-6 rounded-full border-2 transition-all ${postColor === c.value ? "border-brown scale-110" : "border-white shadow-sm"}`} style={{ backgroundColor: c.value }} title={c.label} />)}
          </div>
          <button type="button" onClick={() => void handlePost()} disabled={busy || (!postText.trim() && postImages.length === 0)} className="ml-auto h-9 px-6 rounded-full bg-brown text-white text-[1.3rem] font-medium hover:bg-brown-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{busy ? "发布中..." : "发布"}</button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((event) => (
          <div key={`${event.bunnyId}-${event.id}`} className="bg-white rounded-2xl border border-pink-100 shadow-soft p-4">
            <div className="flex items-center gap-3 mb-3">
              <RemoteImage src={event.bunnyAvatar} alt={event.bunnyName} className="w-28 h-28 rounded-xl object-cover border border-pink-200" />
              <div className="flex-1">
                <p className="text-[1.4rem] font-medium text-brown">{event.bunnyName}</p>
                <p className="text-[1.1rem] text-brown-mid">{event.date}</p>
              </div>
              {event.mood && <CategoryTag type={event.mood} />}
              <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: event.color }} />
            </div>
            <h4 className="text-[1.5rem] font-medium text-brown mb-1">{event.title}</h4>
            <p className="text-[1.4rem] text-brown/80 leading-relaxed whitespace-pre-line mb-3">{event.description}</p>
            {event.detailImages.length > 0 && (
              <div className="mb-3">
                <div className={`grid ${getGridCols(event.detailImages.length)} gap-1.5 max-w-[28rem]`}>
                  {event.detailImages.map((img, i) => (
                    <div key={i} className={`relative rounded-xl overflow-hidden bg-[#FFF8F0] border border-pink-100 ${event.detailImages.length === 1 ? "h-[20rem]" : "aspect-square"}`}>
                      <RemoteImage src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2 border-t border-pink-50">
              <button type="button" onClick={() => setDetailEvent(event)} className="h-8 px-4 rounded-full border border-pink-200 text-[1.2rem] text-brown-mid hover:text-brown hover:border-pink-400 transition-colors">查看详情</button>
              <button type="button" onClick={() => openEdit(event)} className="h-8 px-4 rounded-full border border-pink-200 text-[1.2rem] text-brown-mid hover:text-brown hover:border-pink-400 transition-colors flex items-center gap-1"><Pencil size={12} /> 编辑</button>
              <button type="button" onClick={() => void handleDelete(event.id)} disabled={busy} className="h-8 px-4 rounded-full border border-pink-200 text-[1.2rem] text-brown-mid hover:text-red-500 hover:border-red-300 transition-colors flex items-center gap-1 disabled:opacity-50"><Trash2 size={12} /> 删除</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-3"><Clock size={28} className="text-pink-300" /></div>
          <p className="text-[1.4rem] text-brown-mid">还没有成长足迹，快发布一条吧~</p>
        </div>
      )}

      {detailEvent && (
        <Modal title="">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RemoteImage src={detailEvent.bunnyAvatar} alt="" className="w-16 h-16 rounded-xl object-cover border border-pink-200" />
              <div><p className="text-[1.5rem] font-medium text-brown">{detailEvent.bunnyName}</p><p className="text-[1.2rem] text-brown-mid">{detailEvent.date}</p></div>
              {detailEvent.mood && <CategoryTag type={detailEvent.mood} />}
            </div>
            <h3 className="text-[2rem] font-medium text-brown">{detailEvent.title}</h3>
            <p className="text-[1.5rem] text-brown/80 leading-relaxed whitespace-pre-line">{detailEvent.description}</p>
            {detailEvent.detailImages.length > 0 && (
              <div className={`grid ${getGridCols(detailEvent.detailImages.length)} gap-2`}>
                {detailEvent.detailImages.map((img, i) => (
                  <div key={i} className={`relative rounded-xl overflow-hidden bg-[#FFF8F0] border border-pink-100 ${detailEvent.detailImages.length === 1 ? "h-[28rem]" : "aspect-square"}`}>
                    <RemoteImage src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setDetailEvent(null)} className="w-full h-10 rounded-lg border border-pink-light text-[1.3rem] text-brown">关闭</button>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal title="编辑动态">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block text-[1.2rem] text-brown-mid mb-1">日期</label><input value={editDate} onChange={(e) => setEditDate(e.target.value)} type="date" className="w-full h-10 bg-transparent border border-pink-200 rounded-lg px-3 text-[1.4rem] text-brown focus:border-pink-400 focus:outline-none" /></div>
              <div><label className="block text-[1.2rem] text-brown-mid mb-1">标题</label><input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full h-10 bg-transparent border border-pink-200 rounded-lg px-3 text-[1.4rem] focus:border-pink-400 focus:outline-none" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block text-[1.2rem] text-brown-mid mb-1">心情</label><select value={editMood} onChange={(e) => setEditMood(e.target.value)} className="w-full h-10 bg-transparent border border-pink-200 rounded-lg px-3 text-[1.4rem] focus:border-pink-400 focus:outline-none appearance-none">{moodOptions.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
              <div><label className="block text-[1.2rem] text-brown-mid mb-1">主题色</label><div className="flex gap-2 h-10 items-center">{colorOptions.map((c) => <button key={c.value} type="button" onClick={() => setEditColor(c.value)} className={`w-6 h-6 rounded-full border-2 transition-all ${editColor === c.value ? "border-brown scale-110" : "border-white shadow-sm"}`} style={{ backgroundColor: c.value }} title={c.label} />)}</div></div>
            </div>
            <div><label className="block text-[1.2rem] text-brown-mid mb-1">描述</label><textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} className="w-full bg-transparent border border-pink-200 rounded-lg p-3 text-[1.4rem] resize-y focus:border-pink-400 focus:outline-none" /></div>
            <div>
              <label className="block text-[1.2rem] text-brown-mid mb-1">配图</label>
              {editImages.length > 0 && <div className={`grid ${getGridCols(editImages.length)} gap-2 max-w-[24rem] mb-2`}>
                {editImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#FFF8F0] border border-pink-100 group">
                    <RemoteImage src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setEditImages(editImages.filter((_, idx) => idx !== i))} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} className="text-white" /></button>
                  </div>
                ))}
              </div>}
              {editImages.length < 9 && <button type="button" disabled={busy} onClick={() => { setUploadTarget("edit"); fileInputRef.current?.click(); }} className="w-14 h-14 rounded-xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center hover:border-pink-400 hover:bg-pink-50 transition-colors disabled:opacity-50"><ImagePlus size={14} className="text-pink-300" /></button>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 h-10 rounded-lg border border-pink-light text-[1.3rem] text-brown">取消</button>
              <button type="button" onClick={() => void handleSaveEdit()} disabled={busy} className="flex-1 h-10 rounded-lg bg-brown text-white text-[1.3rem] font-medium flex items-center justify-center gap-1 disabled:opacity-50"><Save size={14} /> {busy ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
