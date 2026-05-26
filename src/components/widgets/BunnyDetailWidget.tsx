import { useCurrentBunnyData } from "@/store/useStore";
import { Rabbit, Heart, Calendar, Weight, Hash, MapPin } from "lucide-react";

export default function BunnyDetailWidget() {
  const data = useCurrentBunnyData();
  if (!data) return null;
  const { bunny, weightRecords, healthRecords } = data;
  const latestWeight = weightRecords[weightRecords.length - 1]?.weight || bunny.weight;
  const ageInMonths = Math.floor((Date.now() - new Date(bunny.birthDate).getTime()) / (30.44 * 24 * 60 * 60 * 1000));
  const ageText = ageInMonths >= 12 ? `${Math.floor(ageInMonths / 12)}岁${ageInMonths % 12}个月` : `${ageInMonths}个月`;
  const latestHealth = healthRecords[healthRecords.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-pink-light p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Rabbit size={16} className="text-pink-soft" />
        <h3 className="text-[1.5rem] font-medium text-charcoal">详细信息</h3>
      </div>

      <div className="space-y-3 flex-1 overflow-auto">
        {/* Basic info rows */}
        <div className="flex items-center gap-3 p-2.5 bg-cream-dark/30 rounded-xl">
          <Hash size={14} className="text-pink-soft flex-shrink-0" />
          <span className="text-[1.2rem] text-gray-mid flex-shrink-0 w-16">编号</span>
          <span className="text-[1.3rem] text-charcoal font-medium">{bunny.id.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-cream-dark/30 rounded-xl">
          <Rabbit size={14} className="text-pink-soft flex-shrink-0" />
          <span className="text-[1.2rem] text-gray-mid flex-shrink-0 w-16">品种</span>
          <span className="text-[1.3rem] text-charcoal font-medium">{bunny.breed}</span>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-cream-dark/30 rounded-xl">
          <Calendar size={14} className="text-pink-soft flex-shrink-0" />
          <span className="text-[1.2rem] text-gray-mid flex-shrink-0 w-16">出生</span>
          <span className="text-[1.3rem] text-charcoal font-medium">{bunny.birthDate}</span>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-cream-dark/30 rounded-xl">
          <Weight size={14} className="text-pink-soft flex-shrink-0" />
          <span className="text-[1.2rem] text-gray-mid flex-shrink-0 w-16">体重</span>
          <span className="text-[1.3rem] text-charcoal font-medium">{latestWeight}g</span>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-cream-dark/30 rounded-xl">
          <Heart size={14} className="text-pink-soft flex-shrink-0" />
          <span className="text-[1.2rem] text-gray-mid flex-shrink-0 w-16">年龄</span>
          <span className="text-[1.3rem] text-charcoal font-medium">{ageText}</span>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-cream-dark/30 rounded-xl">
          <MapPin size={14} className="text-pink-soft flex-shrink-0" />
          <span className="text-[1.2rem] text-gray-mid flex-shrink-0 w-16">状态</span>
          <span className="text-[1.3rem] text-charcoal font-medium">{latestHealth?.status || "正常"}</span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center p-2 bg-pink-soft/10 rounded-xl">
            <p className="text-[1.6rem] font-serif text-charcoal">{weightRecords.length}</p>
            <p className="text-[1rem] text-gray-mid">体重记录</p>
          </div>
          <div className="text-center p-2 bg-pink-soft/10 rounded-xl">
            <p className="text-[1.6rem] font-serif text-charcoal">{healthRecords.length}</p>
            <p className="text-[1rem] text-gray-mid">健康记录</p>
          </div>
          <div className="text-center p-2 bg-pink-soft/10 rounded-xl">
            <p className="text-[1.6rem] font-serif text-charcoal">{data.photos.length}</p>
            <p className="text-[1rem] text-gray-mid">照片</p>
          </div>
        </div>
      </div>
    </div>
  );
}
