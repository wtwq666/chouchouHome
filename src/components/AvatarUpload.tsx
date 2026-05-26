import { useRef, useState } from "react";
import RemoteImage from "@/components/RemoteImage";
import { notifyError, notifySuccess } from "@/lib/notify";
import { useStore } from "@/store/useStore";
import { Camera } from "lucide-react";

interface Props {
  bunnyId: string;
  src: string;
  alt?: string;
  className?: string;
  /** 显示在头像下方的提示文字 */
  hint?: string;
}

export default function AvatarUpload({ bunnyId, src, alt = "", className = "", hint = "更换头像" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadBunnyAvatar = useStore((s) => s.uploadBunnyAvatar);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) {
      notifyError("请选择图片文件");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notifyError("图片不能超过 10MB");
      return;
    }
    setBusy(true);
    try {
      await uploadBunnyAvatar(bunnyId, file);
      notifySuccess("头像已更新");
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className={`relative group rounded-xl overflow-hidden border border-pink-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 disabled:opacity-60 ${className}`}
        title={hint}
      >
        <RemoteImage src={src} alt={alt} className="w-full h-full object-cover" />
        <span className="absolute inset-0 bg-brown/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
          <Camera size={22} className="text-white" />
          <span className="text-[1rem] text-white font-medium">{busy ? "上传中…" : hint}</span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <p className="text-[1.1rem] text-brown-mid">{hint}</p>
    </div>
  );
}
