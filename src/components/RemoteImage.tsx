import { useState } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
};

/** OSS 外链图：避免防盗链，加载失败时显示粉色占位 */
export default function RemoteImage({ src, alt = "", className = "", loading }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`bg-pink-100 flex items-center justify-center text-brown-mid/60 text-[1rem] ${className}`}
        title={failed ? `加载失败: ${src}` : "无图片"}
      >
        {alt || "图片"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
