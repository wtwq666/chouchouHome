import RemoteImage from "@/components/RemoteImage";
import EmptyBunniesPrompt from "@/components/EmptyBunniesPrompt";
import PhotoLightbox from "@/components/PhotoLightbox";
import { useState, useMemo } from "react";
import { useAllPhotos, useAllPhotoTags, useBunnies, useStore } from "@/store/useStore";
import { Camera, ChevronLeft, ChevronRight, Tag } from "lucide-react";

export default function PhotosWidget() {
  const bunnies = useBunnies();
  const allPhotos = useAllPhotos();
  const allTags = useAllPhotoTags();
  const openLightbox = useStore((s) => s.openLightbox);
  const lightboxOpen = useStore((s) => s.lightboxOpen);
  const lightboxIndex = useStore((s) => s.lightboxIndex);
  const closeLightbox = useStore((s) => s.closeLightbox);

  const [page, setPage] = useState(0);
  const [activeTags, setActiveTags] = useState<string[]>(["全部"]);

  // 按标签筛选 + 去重（同一张照片可能在多个兔子下）
  const filteredPhotos = useMemo(() => {
    const seen = new Set<string>();
    const list = allPhotos.filter((p) => {
      // 去重：按 src 去重
      if (seen.has(p.src)) return false;
      seen.add(p.src);
      // 标签筛选：如果选了"全部"，显示所有；否则显示包含任意一个选中标签的照片
      if (activeTags.includes("全部")) return true;
      return (p.tags || []).some((t) => activeTags.includes(t));
    });
    return list;
  }, [allPhotos, activeTags]);

  const perPage = 9;
  const totalPages = Math.max(1, Math.ceil(filteredPhotos.length / perPage));
  const visiblePhotos = filteredPhotos.slice(page * perPage, (page + 1) * perPage);

  const lightboxItems = useMemo(
    () =>
      filteredPhotos.map((p) => ({
        src: p.src,
        description: p.description,
        subtitle: p.bunnyName,
        tags: p.tags,
      })),
    [filteredPhotos],
  );

  // 切换标签时重置页码
  const toggleTag = (tag: string) => {
    setPage(0);
    if (tag === "全部") {
      setActiveTags(["全部"]);
      return;
    }
    setActiveTags((prev) => {
      // 如果之前选了"全部"，取消全部，只选当前
      if (prev.includes("全部")) return [tag];
      // 如果已经选了当前，取消选择；如果没选，加上
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      // 如果全部取消了，回到"全部"
      return next.length === 0 ? ["全部"] : next;
    });
  };

  return (
    <div className="bg-white rounded-[1.8rem] p-3 sm:p-4 h-full flex flex-col shadow-polaroid border border-pink-200/30 relative">
      {/* Corner sticker */}
      <img src="/assets/bunny-cute.png" alt="" className="absolute -top-3 -right-2 w-10 h-10 object-contain z-10 animate-float-slow" />

      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-pink-200/30 flex items-center justify-center">
            <Camera size={16} className="text-pink-400" />
          </div>
          <h3 className="text-[1.5rem] font-medium text-brown">照片墙</h3>
          <span className="text-[1.1rem] text-brown-mid">({filteredPhotos.length}张)</span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(0, page - 1))} className="w-8 h-8 rounded-full bg-[#FFF8F0] border border-pink-200 flex items-center justify-center hover:bg-pink-200/30 transition-colors disabled:opacity-30 shadow-soft" disabled={page === 0}>
              <ChevronLeft size={14} className="text-brown" />
            </button>
            <span className="text-[1.1rem] text-brown-mid px-1">{page + 1}/{totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} className="w-8 h-8 rounded-full bg-[#FFF8F0] border border-pink-200 flex items-center justify-center hover:bg-pink-200/30 transition-colors disabled:opacity-30 shadow-soft" disabled={page === totalPages - 1}>
              <ChevronRight size={14} className="text-brown" />
            </button>
          </div>
        )}
      </div>

      {/* 标签筛选 */}
      <div className="flex items-center gap-1.5 mb-3 flex-shrink-0 flex-wrap">
        <Tag size={12} className="text-brown-mid mr-1" />
        <button
          onClick={() => toggleTag("全部")}
          className={`px-3 py-1 rounded-full text-[1.1rem] transition-all ${
            activeTags.includes("全部")
              ? "bg-brown text-white"
              : "bg-[#FFF8F0] text-brown-mid hover:text-brown border border-pink-200"
          }`}
        >
          全部
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full text-[1.1rem] transition-all ${
              activeTags.includes(tag)
                ? "bg-brown text-white"
                : "bg-[#FFF8F0] text-brown-mid hover:text-brown border border-pink-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {bunnies.length === 0 ? (
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <EmptyBunniesPrompt compact title="照片墙还是空的" />
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 flex-1 min-h-0">
        {Array.from({ length: perPage }).map((_, i) => {
          const photo = visiblePhotos[i];
          return (
            <div
              key={photo ? photo.id : `empty-${i}`}
              className={`relative rounded-[1rem] overflow-hidden ${
                photo ? "cursor-pointer group" : "bg-[#FFF8F0]/60"
              }`}
              style={{ aspectRatio: "1 / 1" }}
              onClick={() => photo && openLightbox(page * perPage + i)}
            >
              {photo ? (
                <>
                  {/* Polaroid frame feel */}
                  <div className="absolute inset-0 bg-white p-1.5 rounded-[1rem] shadow-polaroid">
                    <div className="w-full h-full rounded-[0.7rem] overflow-hidden relative">
                      <RemoteImage src={photo.src} alt={photo.description} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    </div>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-[6px] rounded-[0.7rem] bg-pink-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                  <span className="absolute bottom-2 left-2 right-2 text-[0.85rem] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate drop-shadow z-20">
                    {photo.description}
                  </span>
                  {/* Tags on hover */}
                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    {(photo.tags || []).map((t) => (
                      <span key={t} className="text-[0.75rem] px-1.5 py-0.5 rounded-full bg-white/80 text-brown backdrop-blur-sm">
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
      )}

      <PhotoLightbox
        open={lightboxOpen && lightboxItems.length > 0}
        items={lightboxItems}
        index={lightboxIndex}
        onClose={closeLightbox}
        onIndexChange={openLightbox}
      />
    </div>
  );
}
