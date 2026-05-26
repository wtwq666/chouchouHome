import { useMemo, useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, type TooltipItem,
} from "chart.js";
import EmptyBunniesPrompt from "@/components/EmptyBunniesPrompt";
import { useStore } from "@/store/useStore";
import { TrendingUp } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function WeightWidget() {
  const bunnies = useStore((s) => s.bunnies);
  const bunnyData = useStore((s) => s.bunnyData);
  const currentBunnyId = useStore((s) => s.currentBunnyId);
  const [viewBunnyId, setViewBunnyId] = useState(currentBunnyId);

  useEffect(() => {
    if (currentBunnyId) setViewBunnyId(currentBunnyId);
    else if (bunnies[0]) setViewBunnyId(bunnies[0].id);
  }, [currentBunnyId, bunnies]);

  if (bunnies.length === 0) {
    return (
      <div className="bg-white rounded-[1.8rem] h-full border border-pink-200/30 shadow-polaroid">
        <EmptyBunniesPrompt compact title="暂无体重曲线" />
      </div>
    );
  }

  const data = bunnyData[viewBunnyId] ?? bunnyData[bunnies[0]?.id ?? ""];
  if (!data) return null;

  const allWeights = data.weightRecords;

  const chartData = useMemo(() => ({
    labels: allWeights.map((r) => r.date),
    datasets: [{
      data: allWeights.map((r) => r.weight),
      borderColor: "#FFB7C5",
      backgroundColor: "rgba(255, 183, 197, 0.18)",
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#FFFFFF",
      pointBorderColor: "#FFB7C5",
      pointBorderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 8,
    }],
  }), [allWeights]);

  const current = allWeights[allWeights.length - 1]?.weight || 0;
  const prev = allWeights.length > 1 ? allWeights[allWeights.length - 2]?.weight : current;
  const change = current - (prev || current);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#FFFFFF",
        titleColor: "#5C4033",
        bodyColor: "#5C4033",
        borderColor: "#FFB7C5",
        borderWidth: 2,
        cornerRadius: 14,
        padding: 10,
        displayColors: false,
        callbacks: { label: (item: TooltipItem<"line">) => `${item.raw}g` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#A08472", font: { size: 10 }, maxTicksLimit: 8 }, border: { display: false } },
      y: { grid: { color: "#FFE4E1", lineWidth: 1 }, ticks: { color: "#A08472", font: { size: 10 }, callback: (v: string | number) => `${v}g` }, border: { display: false } },
    },
  };

  return (
    <div className="bg-white rounded-[1.8rem] p-4 sm:p-5 h-full flex flex-col shadow-polaroid border border-pink-200/30 relative">
      <img src="/assets/washi-tape.png" alt="" className="absolute -top-2 left-8 w-16 h-5 object-contain z-10" />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-pink-200/30 flex items-center justify-center">
            <TrendingUp size={16} className="text-pink-400" />
          </div>
          <h3 className="text-[1.5rem] font-medium text-brown">体重变化</h3>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className={`text-[1.2rem] font-medium px-3 py-1 rounded-full shadow-soft ${change >= 0 ? "bg-[#B8E0D0]/40 text-[#5C8C70]" : "bg-pink-200/40 text-pink-400"}`}>
            {change >= 0 ? "+" : ""}{change}g
          </span>
          <select
            value={viewBunnyId}
            onChange={(e) => setViewBunnyId(e.target.value)}
            className="h-9 sm:h-8 px-3 rounded-full bg-[#FFF8F0] border border-pink-200 text-[1.1rem] text-brown focus:outline-none cursor-pointer shadow-soft max-w-full sm:max-w-[10rem] truncate flex-1 sm:flex-none"
            title="选择兔子"
          >
            {bunnies.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1 min-h-[12rem] sm:min-h-[14rem] lg:min-h-0">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
