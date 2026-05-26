import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RemoteImage from "@/components/RemoteImage";
import { useStore } from "@/store/useStore";
import { Home, Settings, ChevronDown, Plus } from "lucide-react";

const navLinks = [
  { label: "成长记录", shortLabel: "成长", href: "/" },
  { label: "兔子管理", shortLabel: "管理", href: "/manage" },
];

export default function Banner() {
  const navigate = useNavigate();
  const location = useLocation();
  const bunnies = useStore((s) => s.bunnies);
  const currentBunnyId = useStore((s) => s.currentBunnyId);
  const switchBunny = useStore((s) => s.switchBunny);
  const openModal = useStore((s) => s.openModal);
  const currentBunny = bunnies.find((b) => b.id === currentBunnyId);
  const isHome = !location.hash.includes("manage");

  const [bunnyMenuOpen, setBunnyMenuOpen] = useState(false);
  const bunnyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBunnyMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!bunnyMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (bunnyMenuRef.current && !bunnyMenuRef.current.contains(e.target as Node)) {
        setBunnyMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [bunnyMenuOpen]);

  const bunnyMenuClass =
    bunnyMenuOpen
      ? "opacity-100 visible pointer-events-auto"
      : "opacity-0 invisible pointer-events-none lg:opacity-0 lg:invisible lg:pointer-events-none lg:group-hover:opacity-100 lg:group-hover:visible lg:group-hover:pointer-events-auto";

  return (
    <header className="sticky top-0 z-[100] bg-[#FFF8F0]/95 backdrop-blur-xl rounded-b-2xl lg:rounded-b-[2rem] shadow-soft border-b-2 border-pink-300/30 pt-[env(safe-area-inset-top)]">
      <div className="h-1 w-full bg-pink-300/40 rounded-t-2xl lg:rounded-t-[2rem] hidden lg:block" />

      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-0 lg:h-16 flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        {/* 顶栏：Logo + 兔子切换 */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <img src="/assets/bunny-avatar.png" alt="" className="w-8 h-8 sm:w-11 sm:h-11 rounded-full object-contain" />
              <img src="/assets/paw-heart.png" alt="" className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-5 sm:h-5 object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[1.65rem] sm:text-[2.2rem] font-serif text-brown leading-tight truncate">
                臭臭的家
              </h1>
              <p className="hidden sm:block text-[1rem] text-brown-mid truncate">小兔成长相册 ♥</p>
            </div>
          </div>

          <div className="relative flex-shrink-0 group" ref={bunnyMenuRef}>
            {bunnies.length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  navigate("/manage");
                  openModal("addBunny");
                }}
                className="flex items-center gap-1.5 bg-brown text-white rounded-full pl-3 pr-4 py-2 text-[1.2rem] sm:text-[1.3rem] font-medium shadow-soft"
              >
                <Plus size={15} /> 添加
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setBunnyMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 bg-white/70 rounded-full pl-1 pr-2.5 py-0.5 sm:pl-1.5 sm:pr-3 sm:py-1 border-2 border-pink-200/50 shadow-soft max-w-[9.5rem] sm:max-w-none"
                  aria-expanded={bunnyMenuOpen}
                  aria-haspopup="listbox"
                >
                  {currentBunny ? (
                    <>
                      <RemoteImage
                        src={currentBunny.avatar}
                        alt={currentBunny.name}
                        className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-pink-300"
                      />
                      <span className="text-[1.15rem] sm:text-[1.4rem] font-medium text-brown truncate max-w-[4.5rem] sm:max-w-[8rem]">
                        {currentBunny.name}
                      </span>
                      <ChevronDown size={14} className={`text-pink-400 flex-shrink-0 transition-transform ${bunnyMenuOpen ? "rotate-180" : ""}`} />
                    </>
                  ) : (
                    <span className="text-[1.2rem] text-brown-mid px-2">选择兔子</span>
                  )}
                </button>
                <div
                  className={`absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-card border-2 border-pink-200/50 py-2 min-w-[min(100vw-1.5rem,18rem)] max-w-[calc(100vw-1.5rem)] max-h-[min(70vh,24rem)] overflow-y-auto z-50 transition-all duration-200 ${bunnyMenuClass}`}
                >
                  {bunnies.map((bunny) => (
                    <button
                      key={bunny.id}
                      type="button"
                      onClick={() => {
                        void switchBunny(bunny.id);
                        setBunnyMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-cream-warm transition-colors ${
                        bunny.id === currentBunnyId ? "bg-pink-300/10" : ""
                      }`}
                    >
                      <RemoteImage src={bunny.avatar} alt={bunny.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-pink-200" />
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-[1.35rem] font-medium text-brown truncate">{bunny.name}</p>
                        <p className="text-[1.05rem] text-brown-mid truncate">{bunny.breed} · {bunny.weight}g</p>
                      </div>
                      {bunny.id === currentBunnyId && (
                        <img src="/assets/paw-heart.png" alt="" className="w-5 h-5 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-pink-100 mt-1 pt-1 px-2 pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setBunnyMenuOpen(false);
                        navigate("/manage");
                        openModal("addBunny");
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[1.25rem] font-medium text-brown hover:bg-pink-100/50"
                    >
                      <Plus size={16} className="text-pink-500" />
                      添加新兔子
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-white/70 rounded-full p-0.5 sm:p-1 border-2 border-pink-200/50 shadow-soft w-full lg:w-auto">
          {navLinks.map((link) => {
            const active = (link.href === "/" && isHome) || (link.href === "/manage" && !isHome);
            return (
              <button
                key={link.href}
                type="button"
                onClick={() => navigate(link.href)}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-1 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-[1.15rem] sm:text-[1.3rem] font-medium transition-all ${
                  active ? "bg-pink-300 text-white shadow-tape" : "text-brown-mid hover:bg-pink-200/30 hover:text-brown"
                }`}
              >
                {link.href === "/" ? <Home size={16} /> : <Settings size={16} />}
                <span className="sm:hidden">{link.shortLabel}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
