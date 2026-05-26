import { useState, useMemo, useRef } from "react";
import RemoteImage from "@/components/RemoteImage";
import PhotoLightbox from "@/components/PhotoLightbox";
import { uploadImage } from "@/api";
import { confirmAction } from "@/lib/confirm";
import { dotToIsoDate, yearFromDate } from "@/api/date";
import { useAllPhotos, useAllPhotoTags, useStore } from "@/store/useStore";
import type { Bunny } from "@/store/useStore";
import { Camera, Plus, Save, Pencil, Trash2, X, Upload, Calendar, FileText, Tag } from "lucide-react";

interface Props {
  bunnies: Bunny[];
  currentBunnyId: string;
}

export default function PhotosManage({ bunnies, currentBunnyId }: Props) {
  const allPhotos = useAllPhotos();
  const allTags = useAllPhotoTags();
  const addPhoto = useStore((s) => s.addPhoto);
  const updatePhoto = useStore((s) => s.updatePhoto);
  const deletePhoto = useStore((s) => s.deletePhoto);
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

  const [tagFilter, setTagFilter] = useState<string>("全部");

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [postBunnyId, setPostBunnyId] = useState(currentBunnyId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number>(-1);

  const resetForm = () => {
    setDate(today);
    setDesc("");
    setImages([]);
    setSelectedTags([]);
    setEditingId(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadImage(file));
      }
      setImages((prev) => [...prev, ...urls]);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const filtered = useMemo(() => {
    const seen = new Set<string>();
    return allPhotos.filter((p) => {
      if (seen.has(p.src)) return false;
      seen.add(p.src);
      if (!bunnyFilter.includes("全部") && !bunnyFilter.includes(p.bunnyName)) return false;
      if (tagFilter !== "全部" && !(p.tags || []).includes(tagFilter)) return false;
      return true;
    });
  }, [allPhotos, bunnyFilter, tagFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return;
    const bunny = bunnies.find((b) => b.id === postBunnyId);
    const tags = selectedTags.filter(Boolean).length ? selectedTags.filter(Boolean) : bunny ? [bunny.name] : [];
    setBusy(true);
    try {
      for (let idx = 0; idx < images.length; idx++) {
        const img = images[idx];
        await addPhoto(postBunnyId, {
          src: img,
          date,
          description: desc + (images.length > 1 ? ` (${idx + 1}/${images.length})` : ""),
          year: yearFromDate(date),
          tags,
        });
      }
      resetForm();
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (photo: typeof filtered[0]) => {
    setEditingId(photo.id);
    setDate(dotToIsoDate(photo.date));
    setDesc(photo.description);
    setImages([photo.src]);
    setSelectedTags((photo.tags || []).length ? [...(photo.tags || [])] : []);
    setPostBunnyId(photo.bunnyId);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !images[0]) return;
    setBusy(true);
    try {
      await updatePhoto(editingId, {
        date,
        description: desc,
        year: yearFromDate(date),
        tags: selectedTags.filter(Boolean),
        src: images[0],
      });
      resetForm();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirmAction("确定删除这张照片？")) return;
    setBusy(true);
    try {
      await deletePhoto(id);
      if (lightboxIdx >= 0) setLightboxIdx(-1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-pink-200/30 flex items-center justify-center"><Camera size={20} className="text-pink-400" /></div>
        <h3 className="text-[2rem] font-serif text-brown">照片管理</h3>
        <span className="text-[1.2rem] text-brown-mid">({filtered.length} 张)</span>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[1.1rem] text-brown-mid">兔子：</span>
        <button onClick={() => toggleBunnyFilter("全部")} className={`px-3 py-1 rounded-full text-[1.1rem] transition-all ${bunnyFilter.includes("全部") ? "bg-brown text-white" : "bg-white text-brown-mid border border-pink-200"}`}>全部</button>
        {bunnies.map((b) => <button key={b.id} onClick={() => toggleBunnyFilter(b.name)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[1.1rem] transition-all ${bunnyFilter.includes(b.name) && !bunnyFilter.includes("全部") ? "bg-brown text-white" : "bg-white text-brown-mid border border-pink-200"}`}><RemoteImage src={b.avatar} alt={b.name} className="w-10 h-10 rounded-full object-cover" />{b.name}</button>)}
      </div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Tag size={12} className="text-brown-mid" />
        <button onClick={() => setTagFilter("全部")} className={`px-3 py-1 rounded-full text-[1.1rem] transition-all ${tagFilter === "全部" ? "bg-brown text-white" : "bg-white text-brown-mid border border-pink-200"}`}>全部</button>
        {allTags.map((t) => <button key={t} onClick={() => setTagFilter(t)} className={`px-3 py-1 rounded-full text-[1.1rem] transition-all ${tagFilter === t ? "bg-brown text-white" : "bg-white text-brown-mid border border-pink-200"}`}>{t}</button>)}
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-soft p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center">{editingId ? <Pencil size={13} className="text-pink-500" /> : <Plus size={14} className="text-pink-500" />}</div>
          <p className="text-[1.4rem] font-medium text-brown">{editingId ? "编辑照片" : "添加新照片"}</p>
          {!editingId && (
            <select value={postBunnyId} onChange={(e) => setPostBunnyId(e.target.value)} className="ml-auto text-[1.2rem] text-brown bg-[#FFF8F0] border border-pink-200 rounded-lg px-2 py-1 outline-none">
              {bunnies.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="flex items-center gap-1.5 text-[1.2rem] text-brown-mid mb-2"><Upload size={14} className="text-pink-400" /> 上传照片</label>
            {images.length === 0 ? (
              <button type="button" disabled={busy} onClick={() => fileInputRef.current?.click()} className="w-full h-32 rounded-xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center gap-2 hover:border-pink-400 hover:bg-pink-50 transition-colors disabled:opacity-50">
                <Upload size={28} className="text-pink-300" />
                <span className="text-[1.3rem] text-pink-300">点击上传照片</span>
                <span className="text-[1rem] text-brown-mid">支持多张上传</span>
              </button>
            ) : (
              <div>
                <div className="flex gap-2 flex-wrap mb-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-pink-200 bg-[#FFF8F0] group">
                      <RemoteImage src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} className="text-white" /></button>
                    </div>
                  ))}
                  <button type="button" disabled={busy} onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-pink-200 flex items-center justify-center hover:border-pink-400 hover:bg-pink-50 transition-colors disabled:opacity-50">
                    <Plus size={20} className="text-pink-300" />
                  </button>
                </div>
                <span className="text-[1.1rem] text-brown-mid">{images.length} 张</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="flex items-center gap-1.5 text-[1.2rem] text-brown-mid mb-1"><Calendar size={14} className="text-pink-400" /> 日期</label><input value={date} onChange={(e) => setDate(e.target.value)} type="date" required className="w-full h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-4 text-[1.3rem] text-brown focus:border-pink-400 focus:outline-none focus:bg-white transition-colors" /></div>
            <div><label className="flex items-center gap-1.5 text-[1.2rem] text-brown-mid mb-1"><FileText size={14} className="text-pink-400" /> 描述</label><input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="照片描述" className="w-full h-11 bg-[#FFF8F0]/50 border border-pink-200 rounded-xl px-4 text-[1.3rem] focus:border-pink-400 focus:outline-none focus:bg-white transition-colors" /></div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[1.2rem] text-brown-mid mb-1"><Tag size={14} className="text-pink-400" /> 标签</label>
            <div className="flex gap-2 flex-wrap">
              {allTags.map((t) => <button key={t} type="button" onClick={() => toggleTag(t)} className={`px-3 py-1 rounded-full text-[1.2rem] transition-all border ${selectedTags.includes(t) ? "bg-brown text-white border-brown" : "bg-white text-brown-mid border-pink-200 hover:border-pink-400"}`}>{t}</button>)}
              <input value={selectedTags.filter((t) => !allTags.includes(t)).join(", ")} onChange={(e) => { const c = e.target.value.split(",").map((s) => s.trim()).filter(Boolean); const base = selectedTags.filter((t) => allTags.includes(t)); setSelectedTags([...base, ...c]); }} placeholder="自定义标签" className="h-9 px-3 rounded-full bg-white border border-pink-200 text-[1.2rem] focus:border-pink-400 focus:outline-none min-w-[10rem]" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            {editingId && <button type="button" onClick={resetForm} className="h-10 px-5 rounded-full border border-pink-200 text-[1.3rem] text-brown-mid flex items-center gap-1"><X size={14} /> 取消</button>}
            {editingId ? (
              <button type="button" onClick={() => void handleSaveEdit()} disabled={busy} className="h-10 px-6 rounded-full bg-brown text-white text-[1.3rem] font-medium hover:bg-brown-light transition-colors flex items-center gap-1.5 shadow-soft disabled:opacity-50"><Save size={14} /> {busy ? "保存中..." : "保存修改"}</button>
            ) : (
              <button type="submit" disabled={busy || images.length === 0} className="h-10 px-6 rounded-full bg-brown text-white text-[1.3rem] font-medium hover:bg-brown-light transition-colors flex items-center gap-1.5 shadow-soft disabled:opacity-40"><Plus size={14} /> {busy ? "添加中..." : "添加照片"}</button>
            )}
          </div>
        </form>
      </div>

      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {filtered.map((photo, idx) => (
            <div key={photo.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-pink-200/40 bg-white shadow-soft cursor-pointer" onClick={() => setLightboxIdx(idx)}>
              <RemoteImage src={photo.src} alt={photo.description} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute top-2 left-2 flex gap-1 flex-wrap">{(photo.tags || []).map((t) => <span key={t} className="text-[0.7rem] px-1.5 py-0.5 rounded-full bg-white/85 text-brown shadow-sm">{t}</span>)}</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <p className="text-[0.9rem] text-white truncate">{photo.description}</p>
                <p className="text-[0.8rem] text-white/70">{photo.bunnyName} &middot; {photo.date}</p>
              </div>
              <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => startEdit(photo)} className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-soft"><Pencil size={11} className="text-brown" /></button>
                <button type="button" onClick={() => void handleDelete(photo.id)} disabled={busy} className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-soft disabled:opacity-50"><Trash2 size={11} className="text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-3"><Camera size={28} className="text-pink-300" /></div>
          <p className="text-[1.4rem] text-brown-mid">还没有照片，快添加一张吧~</p>
        </div>
      )}

      <PhotoLightbox
        open={lightboxIdx >= 0 && filtered.length > 0}
        items={filtered.map((p) => ({
          src: p.src,
          description: p.description,
          subtitle: `${p.bunnyName} · ${p.date}`,
          tags: p.tags,
        }))}
        index={Math.max(0, lightboxIdx)}
        onClose={() => setLightboxIdx(-1)}
        onIndexChange={setLightboxIdx}
      />
    </div>
  );
}
