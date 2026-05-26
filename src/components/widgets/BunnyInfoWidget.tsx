import { useState } from "react";
import RemoteImage from "@/components/RemoteImage";
import EmptyBunniesPrompt from "@/components/EmptyBunniesPrompt";
import { useBunnies, useCurrentBunnyData } from "@/store/useStore";
import { Weight, Calendar, Rabbit, Info, Heart, Hash, MapPin, X } from "lucide-react";

export default function BunnyInfoWidget() {
  const bunnies = useBunnies();
  const data = useCurrentBunnyData();
  const [detailOpen, setDetailOpen] = useState(false);

  if (bunnies.length === 0) {
    return (
      <div className="bg-white rounded-[1.6rem] h-full border border-pink-200/30 shadow-polaroid">
        <EmptyBunniesPrompt compact title="还没有兔子档案" />
      </div>
    );
  }
  if (!data) return null;

  const { bunny, weightRecords, healthRecords } = data;
  const latestWeight =
    weightRecords.length > 0
      ? weightRecords[weightRecords.length - 1]?.weight
      : bunny.weight;
  const ageInMonths = Math.floor((Date.now() - new Date(bunny.birthDate).getTime()) / (30.44 * 24 * 60 * 60 * 1000));
  const ageText = ageInMonths >= 12 ? `${Math.floor(ageInMonths / 12)}岁` : `${ageInMonths}个月`;
  const latestHealth = healthRecords[healthRecords.length - 1];

  const detailItems = [
    { icon: Hash, label: "编号", value: bunny.id.toUpperCase() },
    { icon: Rabbit, label: "品种", value: bunny.breed },
    { icon: Calendar, label: "出生", value: bunny.birthDate },
    { icon: Weight, label: "体重", value: `${latestWeight}g` },
    { icon: Heart, label: "年龄", value: ageText },
    { icon: MapPin, label: "状态", value: latestHealth?.status || "正常" },
  ];

  return (
    <>
      {/* Polaroid card style */}
      <div className="bg-white rounded-[1.4rem] sm:rounded-[1.6rem] p-3 sm:p-4 h-full flex flex-col justify-center relative shadow-polaroid border border-pink-200/30">
        <img src="/assets/washi-tape.png" alt="" className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-5 sm:h-6 object-contain z-10 hidden sm:block" />

        {/* Info button */}
        <button
          onClick={() => setDetailOpen(true)}
          className="absolute top-5 right-3 w-8 h-8 rounded-full bg-cream-dark/40 hover:bg-pink-300/40 flex items-center justify-center transition-colors z-10 shadow-soft"
          title="详细信息"
        >
          <Info size={15} className="text-pink-400" />
        </button>

        {/* Avatar with polaroid frame feel */}
        <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3 pr-7 sm:pr-8">
          <div className="relative flex-shrink-0">
            <div className="w-[4.8rem] h-[4.8rem] sm:w-32 sm:h-32 rounded-xl sm:rounded-[1.2rem] bg-white p-1 sm:p-1.5 shadow-polaroid border border-pink-200/30">
              <RemoteImage src={bunny.avatar} alt={bunny.name} className="w-full h-full rounded-lg object-cover" />
            </div>
            <img src="/assets/bunny-cute.png" alt="" className="absolute -bottom-1 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 object-contain animate-float-slow" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[1.5rem] sm:text-[1.8rem] font-serif text-brown leading-tight truncate">{bunny.name}</h3>
            <p className="text-[1.05rem] sm:text-[1.1rem] text-brown-mid truncate">{bunny.breed}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className="bg-[#FFF8F0] rounded-lg sm:rounded-xl py-1.5 sm:py-2 px-1 text-center border border-pink-200/20 shadow-soft min-w-0">
            <Weight size={13} className="text-pink-400 mx-auto mb-0.5 sm:hidden" />
            <Weight size={14} className="text-pink-400 mx-auto mb-0.5 hidden sm:block" />
            <p className="text-[1.15rem] sm:text-[1.3rem] font-serif text-brown leading-tight truncate">{latestWeight}g</p>
            <p className="text-[0.8rem] sm:text-[0.85rem] text-brown-mid">体重</p>
          </div>
          <div className="bg-[#FFF8F0] rounded-lg sm:rounded-xl py-1.5 sm:py-2 px-1 text-center border border-pink-200/20 shadow-soft min-w-0">
            <Calendar size={13} className="text-pink-400 mx-auto mb-0.5 sm:hidden" />
            <Calendar size={14} className="text-pink-400 mx-auto mb-0.5 hidden sm:block" />
            <p className="text-[1.15rem] sm:text-[1.3rem] font-serif text-brown leading-tight truncate">{ageText}</p>
            <p className="text-[0.8rem] sm:text-[0.85rem] text-brown-mid">年龄</p>
          </div>
          <div className="bg-[#FFF8F0] rounded-lg sm:rounded-xl py-1.5 sm:py-2 px-1 text-center border border-pink-200/20 shadow-soft min-w-0">
            <Rabbit size={13} className="text-pink-400 mx-auto mb-0.5 sm:hidden" />
            <Rabbit size={14} className="text-pink-400 mx-auto mb-0.5 hidden sm:block" />
            <p className="text-[1.15rem] sm:text-[1.3rem] font-serif text-brown leading-tight truncate">{bunny.birthDate.slice(5)}</p>
            <p className="text-[0.8rem] sm:text-[0.85rem] text-brown-mid">生日</p>
          </div>
        </div>
      </div>

      {/* Cute detail modal */}
      {detailOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: "rgba(92, 64, 51, 0.2)" }} onClick={() => setDetailOpen(false)}>
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] max-w-[40rem] w-full max-h-[92dvh] overflow-y-auto shadow-card-hover p-4 sm:p-6 border-2 border-pink-200 relative pb-[env(safe-area-inset-bottom)]" onClick={(e) => e.stopPropagation()}>
            {/* Washi tape on modal */}
            <img src="/assets/washi-tape.png" alt="" className="absolute -top-3 left-8 w-24 h-7 object-contain z-10" />
            
            <div className="flex items-center justify-between mb-5 mt-3">
              <div className="flex items-center gap-2">
                <img src="/assets/bunny-avatar.png" alt="" className="w-8 h-8 object-contain" />
                <h3 className="text-[2.2rem] font-serif text-brown">详细信息</h3>
              </div>
              <button onClick={() => setDetailOpen(false)} className="w-9 h-9 rounded-full bg-cream-light border border-pink-200 flex items-center justify-center hover:bg-pink-200/30 transition-colors">
                <X size={16} className="text-brown" />
              </button>
            </div>

            <div className="space-y-2.5">
              {detailItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-[#FFF8F0] rounded-xl border border-pink-200/20 shadow-soft">
                    <div className="w-9 h-9 rounded-full bg-pink-200/30 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-pink-400" />
                    </div>
                    <span className="text-[1.2rem] text-brown-mid flex-shrink-0 w-14">{item.label}</span>
                    <span className="text-[1.4rem] font-medium text-brown">{item.value}</span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t-2 border-pink-200/20">
              <div className="text-center p-2 bg-pink-200/20 rounded-xl border border-pink-200/20 shadow-soft">
                <p className="text-[1.6rem] font-serif text-brown">{weightRecords.length}</p>
                <p className="text-[1rem] text-brown-mid">体重记录</p>
              </div>
              <div className="text-center p-2 bg-pink-200/20 rounded-xl border border-pink-200/20 shadow-soft">
                <p className="text-[1.6rem] font-serif text-brown">{healthRecords.length}</p>
                <p className="text-[1rem] text-brown-mid">健康记录</p>
              </div>
              <div className="text-center p-2 bg-pink-200/20 rounded-xl border border-pink-200/20 shadow-soft">
                <p className="text-[1.6rem] font-serif text-brown">{data.photos.length}</p>
                <p className="text-[1rem] text-brown-mid">照片</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
