import { useState, useMemo } from "react";
import { useCurrentBunnyData } from "@/store/useStore";
import { X, ChevronLeft, ChevronRight, TrendingUp, HeartPulse } from "lucide-react";
import CategoryTag from "./CategoryTag";

/* ===== 朋友圈动态流 ===== */
export default function WeChatMoments() {
  const data = useCurrentBunnyData();
  const [detailEvent, setDetailEvent] = useState<typeof data.timelineEvents[0] | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [yearFilter, setYearFilter] = useState<string>("全部");

  if (!data) return null;

  const { bunny, timelineEvents, photos, weightRecords, healthRecords } = data;

  // 年份筛选
  const years = useMemo(() => {
    const ySet = new Set<string>();
    timelineEvents.forEach((e) => ySet.add(e.date.split(".")[0]));
    return ["全部", ...Array.from(ySet).sort().reverse()];
  }, [timelineEvents]);

  const filteredEvents = useMemo(() => {
    let list = [...timelineEvents];
    if (yearFilter !== "全部") {
      list = list.filter((e) => e.date.startsWith(yearFilter));
    }
    return list.reverse(); // 最新的在前面
  }, [timelineEvents, yearFilter]);

  // 打开详情（所有图片）
  const openDetail = (event: typeof timelineEvents[0]) => {
    setDetailEvent(event);
  };

  // 打开图片灯箱
  const openLightbox = (images: string[], idx: number) => {
    setLightboxImages(images);
    setLightboxIdx(idx);
  };
  const closeLightbox = () => setLightboxImages([]);

  return (
    <div className="min-h-screen">
      {/* ===== 朋友圈封面区 ===== */}
      <div className="relative w-full h-[28rem] overflow-hidden">
        {/* 封面大图 */}
        <img
          src={photos[0]?.src || bunny.avatar}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {/* 底部信息 */}
        <div className="absolute bottom-6 left-0 right-0 px-6 flex items-end justify-between">
          <div>
            <h2 className="text-[2.4rem] font-medium text-white drop-shadow-lg">{bunny.name}</h2>
            <p className="text-[1.3rem] text-white/80 drop-shadow">{bunny.breed} · {weightRecords[weightRecords.length - 1]?.weight}g</p>
          </div>
          {/* 头像 */}
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-white p-1 shadow-lg">
              <img src={bunny.avatar} alt={bunny.name} className="w-full h-full rounded-lg object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== 主体内容区 ===== */}
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 左侧：朋友圈动态流 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 年份筛选 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => setYearFilter(y)}
                  className={`px-4 py-1.5 rounded-full text-[1.2rem] whitespace-nowrap transition-all ${
                    yearFilter === y
                      ? "bg-brown text-white"
                      : "bg-white text-brown-mid hover:text-brown border border-pink-light"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            {/* 动态列表 */}
            {filteredEvents.length === 0 && (
              <div className="text-center py-16">
                <img src="/assets/bunny-cute.png" alt="" className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-[1.4rem] text-brown-mid">该年份暂无记录</p>
              </div>
            )}

            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl p-4 shadow-soft border border-pink-100">
                {/* 头部：头像 + 名字 + 日期 */}
                <div className="flex items-center gap-3 mb-3">
                  <img src={bunny.avatar} alt={bunny.name} className="w-11 h-11 rounded-lg object-cover border border-pink-200 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[1.5rem] font-medium text-brown">{bunny.name}</p>
                    <p className="text-[1.1rem] text-brown-mid">{event.date}</p>
                  </div>
                  {event.mood && <CategoryTag type={event.mood} />}
                  {event.color && (
                    <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: event.color }} />
                  )}
                </div>

                {/* 文字内容 */}
                <div className="mb-3">
                  <h4 className="text-[1.5rem] font-medium text-brown mb-1">{event.title}</h4>
                  <p className="text-[1.4rem] text-brown/80 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>

                {/* 九宫格图片 */}
                {event.detailImages.length > 0 && (
                  <div className="mb-3">
                    <PhotoGrid images={event.detailImages} onClick={(idx) => openLightbox(event.detailImages, idx)} />
                  </div>
                )}

                {/* 操作栏：查看详情 */}
                <button
                  onClick={() => openDetail(event)}
                  className="text-[1.2rem] text-brown-mid hover:text-pink-400 transition-colors flex items-center gap-1"
                >
                  查看详情
                </button>
              </div>
            ))}

            {/* 底部提示 */}
            {filteredEvents.length > 0 && (
              <div className="text-center py-6">
                <p className="text-[1.2rem] text-brown-mid">— 已经到底了 —</p>
              </div>
            )}
          </div>

          {/* 右侧：体重 + 健康 */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-soft border border-pink-100">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-pink-400" />
                <h3 className="text-[1.4rem] font-medium text-brown">体重变化</h3>
              </div>
              <WeightMiniChart weightRecords={weightRecords} />
            </div>
            <div className="bg-white rounded-xl p-4 shadow-soft border border-pink-100">
              <div className="flex items-center gap-2 mb-3">
                <HeartPulse size={16} className="text-pink-400" />
                <h3 className="text-[1.4rem] font-medium text-brown">健康档案</h3>
              </div>
              <HealthMiniList healthRecords={healthRecords} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== 详情弹窗 ===== */}
      {detailEvent && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center p-4 overflow-y-auto"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setDetailEvent(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-[60rem] w-full mt-8 mb-8 shadow-card-hover relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center gap-3 p-5 pb-3">
              <img src={bunny.avatar} alt={bunny.name} className="w-12 h-12 rounded-xl object-cover border border-pink-200" />
              <div className="flex-1">
                <p className="text-[1.6rem] font-medium text-brown">{bunny.name}</p>
                <p className="text-[1.2rem] text-brown-mid">{detailEvent.date}</p>
              </div>
              {detailEvent.mood && <CategoryTag type={detailEvent.mood} />}
              <button
                onClick={() => setDetailEvent(null)}
                className="w-9 h-9 rounded-full bg-[#FFF8F0] border border-pink-200 flex items-center justify-center hover:bg-pink-200/30"
              >
                <X size={16} className="text-brown" />
              </button>
            </div>

            {/* 内容 */}
            <div className="px-5 pb-4">
              <h3 className="text-[2rem] font-medium text-brown mb-2">{detailEvent.title}</h3>
              <p className="text-[1.5rem] text-brown/80 leading-relaxed whitespace-pre-line mb-4">{detailEvent.description}</p>

              {/* 大图展示 */}
              {detailEvent.detailImages.length > 0 && (
                <div className="space-y-3">
                  <PhotoGrid images={detailEvent.detailImages} onClick={(idx) => openLightbox(detailEvent.detailImages, idx)} large />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== 图片灯箱 ===== */}
      {lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center z-10" onClick={closeLightbox}>
            <X size={20} className="text-white" />
          </button>
          {lightboxIdx > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
          )}
          <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImages[lightboxIdx]}
              alt=""
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
          {lightboxIdx < lightboxImages.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          )}
          {/* 页码 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-[1.3rem] bg-black/40 px-4 py-1 rounded-full">
            {lightboxIdx + 1} / {lightboxImages.length}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== 九宫格图片组件 ===== */
function PhotoGrid({ images, onClick, large }: { images: string[]; onClick: (idx: number) => void; large?: boolean }) {
  const count = images.length;
  if (count === 0) return null;

  // 根据图片数量决定网格布局
  const getGridClass = () => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    if (count === 4) return "grid-cols-2";
    if (count === 5 || count === 6) return "grid-cols-3";
    return "grid-cols-3"; // 7-9张
  };

  const getImageClass = () => {
    if (count === 1) return large ? "h-[40rem]" : "h-[28rem]";
    return "aspect-square";
  };

  return (
    <div className={`grid ${getGridClass()} gap-1 ${large ? "max-w-[50rem]" : "max-w-[32rem]"}`}>
      {images.map((img, i) => (
        <div
          key={i}
          className={`${getImageClass()} overflow-hidden rounded-lg cursor-pointer bg-[#FFF8F0] relative group`}
          onClick={() => onClick(i)}
        >
          <img
            src={img}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

/* ===== 迷你体重图表 ===== */
function WeightMiniChart({ weightRecords }: { weightRecords: { date: string; weight: number }[] }) {
  if (weightRecords.length === 0) return <p className="text-[1.2rem] text-brown-mid">暂无数据</p>;

  const weights = weightRecords.map((r) => r.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const points = weightRecords.map((r, i) => {
    const x = (i / (weightRecords.length - 1 || 1)) * 100;
    const y = 100 - ((r.weight - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  const current = weightRecords[weightRecords.length - 1];
  const prev = weightRecords.length > 1 ? weightRecords[weightRecords.length - 2] : current;
  const change = current.weight - prev.weight;

  return (
    <div>
      {/* SVG 折线图 */}
      <svg viewBox="0 0 100 100" className="w-full h-[12rem]" preserveAspectRatio="none">
        {/* 填充区域 */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill="rgba(255, 183, 197, 0.15)"
        />
        {/* 折线 */}
        <polyline
          points={points}
          fill="none"
          stroke="#FFB7C5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 数据点 */}
        {weightRecords.map((r, i) => {
          const x = (i / (weightRecords.length - 1 || 1)) * 100;
          const y = 100 - ((r.weight - min) / range) * 80 - 10;
          return (
            <circle key={i} cx={x} cy={y} r="2" fill="#FFB7C5" stroke="white" strokeWidth="0.5" />
          );
        })}
      </svg>
      {/* 当前体重 */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[1.4rem] font-medium text-brown">{current.weight}g</span>
        <span className={`text-[1.2rem] ${change >= 0 ? "text-green-600" : "text-pink-400"}`}>
          {change >= 0 ? "+" : ""}{change}g
        </span>
      </div>
      <p className="text-[1.1rem] text-brown-mid">{current.date}</p>
    </div>
  );
}

/* ===== 迷你健康列表 ===== */
function HealthMiniList({ healthRecords }: { healthRecords: { id: string; date: string; type: string; description: string; status: string }[] }) {
  const typeMap: Record<string, string> = { checkup: "体检", abnormal: "异常", prevention: "预防", care: "护理" };
  if (healthRecords.length === 0) return <p className="text-[1.2rem] text-brown-mid">暂无记录</p>;

  return (
    <div className="space-y-2 max-h-[20rem] overflow-y-auto">
      {healthRecords.slice().reverse().slice(0, 5).map((r) => (
        <div key={r.id} className="flex items-center gap-2 py-2 px-3 bg-[#FFF8F0]/50 rounded-lg">
          <span className="text-[1.1rem] text-brown-mid flex-shrink-0">{r.date}</span>
          <CategoryTag type={typeMap[r.type]} />
          <span className="text-[1.2rem] text-brown truncate flex-1">{r.description}</span>
        </div>
      ))}
      {healthRecords.length > 5 && (
        <p className="text-center text-[1.1rem] text-brown-mid py-1">还有 {healthRecords.length - 5} 条记录...</p>
      )}
    </div>
  );
}
