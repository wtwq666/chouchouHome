const typeStyles: Record<string, { border: string; bg: string; text: string }> = {
  主食: { border: "border-accent-green-400", bg: "bg-accent-green-200", text: "text-brown" },
  蔬菜: { border: "border-accent-orange-300", bg: "bg-accent-orange-300", text: "text-brown" },
  零食: { border: "border-pink-300", bg: "bg-pink-300", text: "text-brown" },
  水果: { border: "border-accent-purple-300", bg: "bg-accent-purple-300", text: "text-brown" },
  体检: { border: "border-accent-green-400", bg: "bg-transparent", text: "text-accent-green-400" },
  异常: { border: "border-pink-400", bg: "bg-transparent", text: "text-pink-400" },
  预防: { border: "border-accent-blue-400", bg: "bg-transparent", text: "text-accent-blue-400" },
  护理: { border: "border-accent-purple-400", bg: "bg-transparent", text: "text-accent-purple-400" },
  平静: { border: "border-accent-purple-300", bg: "bg-transparent", text: "text-accent-purple-300" },
  开心: { border: "border-pink-300", bg: "bg-transparent", text: "text-pink-300" },
  调皮: { border: "border-accent-orange-300", bg: "bg-transparent", text: "text-accent-orange-300" },
  疲惫: { border: "border-accent-blue-400", bg: "bg-transparent", text: "text-accent-blue-400" },
  感动: { border: "border-accent-purple-300", bg: "bg-transparent", text: "text-accent-purple-300" },
  紧张: { border: "border-accent-blue-400", bg: "bg-transparent", text: "text-accent-blue-400" },
  food: { border: "border-pink-soft", bg: "bg-pink-soft", text: "text-brown" },
  supplies: { border: "border-accent-purple-400", bg: "bg-accent-purple-400", text: "text-white" },
  medical: { border: "border-accent-green-400", bg: "bg-accent-green-400", text: "text-white" },
  other: { border: "border-accent-orange-400", bg: "bg-accent-orange-400", text: "text-white" },
};

interface CategoryTagProps {
  type: string;
  filled?: boolean;
}

export default function CategoryTag({ type, filled = false }: CategoryTagProps) {
  const style = typeStyles[type] || { border: "border-pink-soft", bg: "bg-transparent", text: "text-brown" };

  return (
    <span
      className={`inline-flex items-center h-7 px-2.5 rounded-full text-[1.1rem] font-normal border-2 ${style.border} ${style.text} ${filled ? style.bg : ""}`}
    >
      {type === "food" ? "食物" : type === "supplies" ? "用品" : type === "medical" ? "医疗" : type === "other" ? "其他" : type}
    </span>
  );
}
