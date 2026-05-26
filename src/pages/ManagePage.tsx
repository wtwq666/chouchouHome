import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Banner from "@/components/Banner";
import EmptyBunniesPrompt from "@/components/EmptyBunniesPrompt";
import { useBunnies, useStore } from "@/store/useStore";
import Modal from "@/components/Modal";
import TimelineManage from "@/components/TimelineManage";
import WeightManage from "@/components/WeightManage";
import HealthManage from "@/components/HealthManage";
import PhotosManage from "@/components/PhotosManage";
import BasicManage from "@/components/BasicManage";
import {
  Rabbit, Save, ArrowLeft, Image, Weight, HeartPulse,
  Info, Clock, Plus,
} from "lucide-react";
import { notifySuccess } from "@/lib/notify";

const tabs = [
  { key: "basic", label: "基本信息", icon: Rabbit },
  { key: "timeline", label: "成长足迹", icon: Clock },
  { key: "weight", label: "体重记录", icon: Weight },
  { key: "photos", label: "照片", icon: Image },
  { key: "health", label: "健康", icon: HeartPulse },
  { key: "detail", label: "详细信息", icon: Info },
];

export default function ManagePage() {
  const navigate = useNavigate();
  const bunnies = useBunnies();
  const currentBunnyId = useStore((s) => s.currentBunnyId);
  const modalType = useStore((s) => s.modalType);
  const openModal = useStore((s) => s.openModal);
  const closeModal = useStore((s) => s.closeModal);
  const addBunny = useStore((s) => s.addBunny);
  const updateBunny = useStore((s) => s.updateBunny);
  const [activeTab, setActiveTab] = useState("basic");
  const [editingBunny, setEditingBunny] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBunnies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return bunnies;
    return bunnies.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.breed.toLowerCase().includes(q) ||
        (b.notes ?? "").toLowerCase().includes(q),
    );
  }, [bunnies, searchQuery]);

  const handleAddBunny = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await addBunny({
        name: fd.get("name") as string,
        breed: fd.get("breed") as string,
        birthDate: fd.get("birthDate") as string,
        weight: Number(fd.get("weight")) || 300,
        avatar: "/assets/photo-11-baby.jpg",
      });
      closeModal();
      notifySuccess("新兔子已添加");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBunny = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBunny) return;
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await updateBunny(editingBunny, {
        name: fd.get("name") as string,
        breed: fd.get("breed") as string,
        birthDate: fd.get("birthDate") as string,
        weight: Number(fd.get("weight")) || 300,
      });
      setEditingBunny(null);
    } finally {
      setSubmitting(false);
    }
  };

  const bunnyBeingEdited = editingBunny ? bunnies.find((b) => b.id === editingBunny) : null;

  return (
    <div className="min-h-screen bg-cream">
      <Banner />
      <main className="max-w-[1000px] mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 flex-wrap">
          <button type="button" onClick={() => navigate("/")} className="w-10 h-10 rounded-full border border-pink-light flex items-center justify-center hover:bg-pink-soft/20 transition-colors flex-shrink-0">
            <ArrowLeft size={18} className="text-brown" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-[2.2rem] sm:text-[3rem] font-serif text-brown leading-tight">兔子管理</h2>
            <p className="text-[1.2rem] sm:text-[1.3rem] text-brown-mid">管理所有兔子的资料、成长记录、健康档案</p>
          </div>
          <button
            type="button"
            onClick={() => openModal("addBunny")}
            className="w-full sm:w-auto h-11 px-6 rounded-full bg-brown text-white text-[1.4rem] font-medium hover:bg-brown-light transition-colors flex items-center justify-center gap-2 shadow-soft"
          >
            <Plus size={18} /> 添加兔子
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-mid" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索兔子名字、品种或备注…"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-pink-light bg-white text-[1.3rem] text-brown placeholder:text-brown-mid/50 focus:border-pink-400 focus:outline-none"
          />
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-pink-light p-1 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[1.3rem] font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.key ? "bg-brown text-white" : "text-brown-mid hover:text-brown hover:bg-[#FFF8F0]/40"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {bunnies.length === 0 ? (
          <EmptyBunniesPrompt />
        ) : (
          <div>
            {activeTab === "basic" && (
              <BasicManage bunnies={filteredBunnies} onUpdate={updateBunny} onAddClick={() => openModal("addBunny")} />
            )}
            {activeTab === "timeline" && <TimelineManage bunnies={filteredBunnies} currentBunnyId={currentBunnyId} />}
            {activeTab === "weight" && <WeightManage bunnies={filteredBunnies} currentBunnyId={currentBunnyId} />}
            {activeTab === "photos" && <PhotosManage bunnies={filteredBunnies} currentBunnyId={currentBunnyId} />}
            {activeTab === "health" && <HealthManage bunnies={filteredBunnies} currentBunnyId={currentBunnyId} />}
            {activeTab === "detail" && (
              <BasicManage bunnies={filteredBunnies} onUpdate={updateBunny} onAddClick={() => openModal("addBunny")} />
            )}
          </div>
        )}

        {bunnies.length === 0 && (
          <p className="text-center text-[1.2rem] text-brown-mid mt-4">
            也可点击右上角
            <button type="button" onClick={() => openModal("addBunny")} className="text-pink-500 underline mx-1">
              直接在此添加
            </button>
          </p>
        )}
      </main>

      {modalType === "addBunny" && (
        <Modal title="添加新兔子">
          <form onSubmit={handleAddBunny} className="space-y-4">
            <div><label className="block text-[1.3rem] text-brown-mid mb-1">名字</label><input name="name" required placeholder="给兔子起个名字" className="w-full h-12 bg-transparent border border-pink-200 rounded-xl px-4 text-[1.5rem] placeholder:text-brown-mid/50 focus:border-pink-400 focus:outline-none" /></div>
            <div><label className="block text-[1.3rem] text-brown-mid mb-1">品种</label><input name="breed" required placeholder="如：荷兰侏儒兔" className="w-full h-12 bg-transparent border border-pink-200 rounded-xl px-4 text-[1.5rem] placeholder:text-brown-mid/50 focus:border-pink-400 focus:outline-none" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-[1.3rem] text-brown-mid mb-1">出生日期</label><input name="birthDate" type="date" required className="w-full h-12 bg-transparent border border-pink-200 rounded-xl px-4 text-[1.5rem] focus:border-pink-400 focus:outline-none" /></div>
              <div><label className="block text-[1.3rem] text-brown-mid mb-1">体重 (g)</label><input name="weight" type="number" placeholder="300" className="w-full h-12 bg-transparent border border-pink-200 rounded-xl px-4 text-[1.5rem] placeholder:text-brown-mid/50 focus:border-pink-400 focus:outline-none" /></div>
            </div>
            <button type="submit" disabled={submitting} className="w-full h-12 rounded-pill bg-brown text-white text-[1.4rem] font-medium hover:bg-brown-light transition-colors disabled:opacity-50">{submitting ? "添加中..." : "添加"}</button>
          </form>
        </Modal>
      )}

      {editingBunny && bunnyBeingEdited && (
        <Modal title={`编辑 ${bunnyBeingEdited.name}`}>
          <form onSubmit={handleEditBunny} className="space-y-4">
            <div><label className="block text-[1.3rem] text-brown-mid mb-1">名字</label><input name="name" defaultValue={bunnyBeingEdited.name} required className="w-full h-12 bg-transparent border border-pink-200 rounded-xl px-4 text-[1.5rem] focus:border-pink-400 focus:outline-none" /></div>
            <div><label className="block text-[1.3rem] text-brown-mid mb-1">品种</label><input name="breed" defaultValue={bunnyBeingEdited.breed} required className="w-full h-12 bg-transparent border border-pink-200 rounded-xl px-4 text-[1.5rem] focus:border-pink-400 focus:outline-none" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-[1.3rem] text-brown-mid mb-1">出生日期</label><input name="birthDate" type="date" defaultValue={bunnyBeingEdited.birthDate} required className="w-full h-12 bg-transparent border border-pink-200 rounded-xl px-4 text-[1.5rem] focus:border-pink-400 focus:outline-none" /></div>
              <div><label className="block text-[1.3rem] text-brown-mid mb-1">体重 (g)</label><input name="weight" type="number" defaultValue={bunnyBeingEdited.weight} className="w-full h-12 bg-transparent border border-pink-200 rounded-xl px-4 text-[1.5rem] focus:border-pink-400 focus:outline-none" /></div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditingBunny(null)} className="flex-1 h-12 rounded-pill border border-pink-light text-[1.4rem] text-brown hover:border-pink-soft transition-colors">取消</button>
              <button type="submit" disabled={submitting} className="flex-1 h-12 rounded-pill bg-brown text-white text-[1.4rem] font-medium hover:bg-brown-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"><Save size={16} /> {submitting ? "保存中..." : "保存"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
