interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionTitle({ title, subtitle, centered = false, light = false }: SectionTitleProps) {
  return (
    <div className={`mb-16 ${centered ? "text-center" : ""}`}>
      <h2 className="text-[4.2rem] lg:text-[4.2rem] md:text-[3.2rem] sm:text-[2.4rem] font-serif font-normal text-charcoal leading-[1.15] tracking-[-0.02em]">
        {title}
      </h2>
      {centered && <div className="w-16 h-px bg-pink-soft mx-auto mt-6" />}
      {subtitle && (
        <p className={`text-[1.4rem] mt-4 ${light ? "text-white/70" : "text-gray-mid"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
