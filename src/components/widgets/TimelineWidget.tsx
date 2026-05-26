import RemoteImage from "@/components/RemoteImage";
import EmptyBunniesPrompt from "@/components/EmptyBunniesPrompt";
import PhotoLightbox from "@/components/PhotoLightbox";
import { useMemo, useState } from "react";
import { useBunnies, useCurrentBunnyData } from "@/store/useStore";
import { Clock, ChevronRight, X } from "lucide-react";
import CategoryTag from "@/components/CategoryTag";

export default function TimelineWidget() {
  const bunnies = useBunnies();
  const data = useCurrentBunnyData();
  const [yearFilter, setYearFilter] = useState<string>("全部");

  const [detailEvent, setDetailEvent] = useState<
    import("@/api/types").TimelineEvent | null
  >(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  if (bunnies.length === 0) {
    return (
      <div className="bg-white rounded-[1.8rem] h-full border border-pink-200/30 shadow-polaroid">
        <EmptyBunniesPrompt compact title="暂无成长足迹" />
      </div>
    );
  }
  if (!data) return null;

  const { bunny, timelineEvents } = data;

  const years = useMemo(() => {
    const ySet = new Set<string>();
    timelineEvents.forEach((e) => ySet.add(e.date.split(".")[0]));
    return ["全部", ...Array.from(ySet).sort()];
  }, [timelineEvents]);

  const filteredEvents = useMemo(() => {
    if (yearFilter === "全部") return timelineEvents;
    return timelineEvents.filter((e) => e.date.startsWith(yearFilter));
  }, [timelineEvents, yearFilter]);

  return (
    <div className="bg-white rounded-[1.8rem] p-3 sm:p-4 h-full flex flex-col shadow-polaroid border border-pink-200/30 relative">
      <img src="/assets/cloud-bunny.png" alt="" className="absolute -top-3 left-4 w-9 h-9 object-contain z-10 animate-float" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-200/30 flex items-center justify-center">
            <Clock size={16} className="text-pink-400" />
          </div>
          <h3 className="text-[1.5rem] font-medium text-brown">成长足迹</h3>
        </div>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="h-7 px-2.5 rounded-full bg-[#FFF8F0] border border-pink-200 text-[1.1rem] text-brown focus:outline-none cursor-pointer shadow-soft"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {filteredEvents.length === 0 && (
          <div className="text-center py-8">
            <img src="/assets/bunny-cute.png" alt="" className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-[1.2rem] text-brown-mid">该年份暂无记录</p>
          </div>
        )}
        {filteredEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => setDetailEvent(event)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 group text-left border-2 hover:bg-[#FFF8F0] border-transparent hover:border-pink-200/30`}
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[0.8rem] overflow-hidden flex-shrink-0 border-2 border-pink-200/40 shadow-soft relative">
              <RemoteImage src={event.coverImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: event.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[1.3rem] font-medium text-brown truncate group-hover:text-pink-400 transition-colors">
                  {event.title}
                </p>
                <span className="text-[0.9rem] px-1.5 py-0.5 rounded-full bg-pink-200/20 text-pink-400 border border-pink-200/30">
                  {event.mood}
                </span>
              </div>
              <p className="text-[1.1rem] text-brown-mid">{event.date}</p>
            </div>
            <ChevronRight size={14} className="text-brown-mid flex-shrink-0 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>

      {/* ===== 朋友圈详情弹窗 ===== */}
      {detailEvent && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-start justify-center p-0 sm:p-4 overflow-y-auto bg-black/40"
          onClick={() => setDetailEvent(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl max-w-[60rem] w-full sm:mt-8 mb-0 sm:mb-8 max-h-[92dvh] overflow-y-auto shadow-card-hover relative pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-start gap-3 p-4 sm:p-5 pb-3 sticky top-0 bg-white z-10 border-b border-pink-100 sm:border-0">
              <RemoteImage src={bunny.avatar} alt={bunny.name} className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl object-cover border border-pink-200 flex-shrink-0" />
              <div className="flex-1 min-w-[8rem]">
                <p className="text-[1.5rem] sm:text-[1.6rem] font-medium text-brown">{bunny.name}</p>
                <p className="text-[1.15rem] sm:text-[1.2rem] text-brown-mid">{detailEvent.date}</p>
              </div>
              {detailEvent.mood && <CategoryTag type={detailEvent.mood} />}
              <div className="w-4 h-4 rounded-full border-2 border-white shadow flex-shrink-0" style={{ backgroundColor: detailEvent.color }} />
              <button
                type="button"
                onClick={() => setDetailEvent(null)}
                className="w-10 h-10 rounded-full bg-[#FFF8F0] border border-pink-200 flex items-center justify-center hover:bg-pink-200/30 ml-auto"
              >
                <X size={16} className="text-brown" />
              </button>
            </div>

            {/* 内容 */}
            <div className="px-4 sm:px-5 pb-5">
              <h3 className="text-[1.75rem] sm:text-[2rem] font-medium text-brown mb-2">{detailEvent.title}</h3>
              <p className="text-[1.4rem] sm:text-[1.5rem] text-brown/80 leading-relaxed whitespace-pre-line mb-4">{detailEvent.description}</p>

              {detailEvent.detailImages.length > 0 && (
                <div className={`grid ${detailEvent.detailImages.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"} gap-1.5 max-w-[50rem]`}>
                  {detailEvent.detailImages.map((img, i) => (
                    <div
                      key={i}
                      className={`relative rounded-xl overflow-hidden bg-[#FFF8F0] border border-pink-100 cursor-pointer group ${
                        detailEvent.detailImages.length === 1 ? "h-[40vh] sm:h-[32rem] max-h-[24rem]" : "aspect-square"
                      }`}
                      onClick={() => { setLightboxImages(detailEvent.detailImages); setLightboxIdx(i); }}
                    >
                      <RemoteImage src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PhotoLightbox
        open={lightboxImages.length > 0}
        items={lightboxImages.map((src) => ({ src }))}
        index={lightboxIdx}
        onClose={() => {
          setLightboxImages([]);
          setLightboxIdx(0);
        }}
        onIndexChange={setLightboxIdx}
      />
    </div>
  );
}
