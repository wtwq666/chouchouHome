import { useNavigate } from "react-router-dom";
import { Plus, Rabbit } from "lucide-react";
import { useStore } from "@/store/useStore";

interface Props {
  /** 嵌入小组件时用 compact */
  compact?: boolean;
  title?: string;
  description?: string;
}

export default function EmptyBunniesPrompt({
  compact = false,
  title = "还没有小兔子",
  description = "添加第一只兔子后，就可以记录成长足迹、体重和照片啦~",
}: Props) {
  const navigate = useNavigate();
  const openModal = useStore((s) => s.openModal);

  const goAdd = () => {
    navigate("/manage");
    openModal("addBunny");
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8 px-4 h-full min-h-[12rem]">
        <Rabbit size={32} className="text-pink-300 mb-2" />
        <p className="text-[1.3rem] text-brown-mid mb-3">{title}</p>
        <button
          type="button"
          onClick={goAdd}
          className="h-9 px-5 rounded-full bg-brown text-white text-[1.2rem] hover:bg-brown-light transition-colors inline-flex items-center gap-1.5"
        >
          <Plus size={14} /> 添加兔子
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[1.8rem] border-2 border-dashed border-pink-200 p-10 text-center shadow-soft">
      <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
        <Rabbit size={36} className="text-pink-400" />
      </div>
      <h3 className="text-[2rem] font-serif text-brown mb-2">{title}</h3>
      <p className="text-[1.35rem] text-brown-mid max-w-[32rem] mx-auto mb-6 leading-relaxed">{description}</p>
      <button
        type="button"
        onClick={goAdd}
        className="h-12 px-8 rounded-full bg-brown text-white text-[1.4rem] font-medium hover:bg-brown-light transition-colors inline-flex items-center gap-2 shadow-soft"
      >
        <Plus size={18} /> 添加第一只兔子
      </button>
    </div>
  );
}
