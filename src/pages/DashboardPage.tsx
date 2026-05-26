import Banner from "@/components/Banner";
import BunnyInfoWidget from "@/components/widgets/BunnyInfoWidget";
import WeightWidget from "@/components/widgets/WeightWidget";
import PhotosWidget from "@/components/widgets/PhotosWidget";
import TimelineWidget from "@/components/widgets/TimelineWidget";
import HealthWidget from "@/components/widgets/HealthWidget";

export default function DashboardPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#FFF5E8] relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden sm:block">
        <img src="/assets/stickers.png" alt="" className="absolute top-[15%] left-[2%] w-12 h-12 object-contain opacity-20 animate-float-slow" />
        <img src="/assets/cloud-bunny.png" alt="" className="absolute top-[60%] left-[8%] w-14 h-14 object-contain opacity-15 animate-float" />
        <img src="/assets/paw-heart.png" alt="" className="absolute top-[30%] right-[3%] w-10 h-10 object-contain opacity-15 animate-wiggle" />
        <img src="/assets/bunny-cute.png" alt="" className="absolute bottom-[15%] right-[5%] w-12 h-12 object-contain opacity-15 animate-float-slow" />
      </div>

      <Banner />

      <main className="relative z-10 max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:gap-5 lg:h-[calc(100dvh-7rem)] lg:min-h-0">
          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0 lg:h-full">
            <div className="flex-shrink-0 min-h-[11rem] sm:min-h-[12rem] lg:h-[28%] lg:min-h-0">
              <BunnyInfoWidget />
            </div>
            <div className="min-h-[16rem] sm:min-h-[18rem] lg:flex-1 lg:min-h-0">
              <TimelineWidget />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4 min-h-0 lg:h-full">
            <div className="min-h-[14rem] sm:min-h-[16rem] lg:flex-[1.5] lg:min-h-0">
              <WeightWidget />
            </div>
            <div className="min-h-[12rem] sm:min-h-[14rem] lg:flex-1 lg:min-h-0">
              <HealthWidget />
            </div>
          </div>

          <div className="min-h-[22rem] sm:min-h-[24rem] lg:col-span-5 lg:h-full lg:min-h-0">
            <PhotosWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
