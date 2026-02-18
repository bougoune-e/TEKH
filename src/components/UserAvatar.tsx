import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseApi";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  user?: any;
  src?: string;
  path?: string;
  size?: Size;
  className?: string;
  alt?: string;
};

const sizeToClass: Record<Size, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-24 w-24",
};

export default function UserAvatar({ user, src, path, size = "md", className = "", alt }: Props) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errored, setErrored] = useState<boolean>(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const metaUrl = useMemo(() => {
    const m = (user as any)?.user_metadata || {};
    return (m.avatar_url || m.picture || (user as any)?.avatar_url || null) as string | null;
  }, [user]);

  const altText = alt || (user?.email || "Avatar utilisateur");

  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      setLoading(true);
      setErrored(false);
      setImgSrc(null);
      if (src) {
        setImgSrc(src);
        setLoading(false);
        return;
      }
      const candidate = path || metaUrl;
      if (!candidate) {
        setErrored(true);
        setLoading(false);
        return;
      }
      try {
        if (/^https?:\/\//i.test(candidate)) {
          setImgSrc(candidate);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.storage.from("avatars").download(candidate);
        if (error || !data) throw error || new Error("download failed");
        const url = URL.createObjectURL(data);
        setObjectUrl(url);
        if (!cancelled) setImgSrc(url);
      } catch {
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    resolve();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, path, metaUrl]);

  const wrapperCls = cn(
    sizeToClass[size],
    "rounded-2xl aspect-square overflow-hidden border-2 border-black/10 dark:border-white/10 shadow-lg relative bg-white/50 dark:bg-white/5 backdrop-blur-sm transition-all duration-500",
    className
  );

  if (loading) {
    return <div className={cn(wrapperCls, "animate-pulse bg-muted-foreground/10")} />;
  }

  if (!imgSrc || errored) {
    return (
      <div className={cn(wrapperCls, "grid place-items-center bg-zinc-100 dark:bg-zinc-900 group")}>
        <svg viewBox="0 0 16 16" className="absolute h-1/2 w-1/2 text-black/20 dark:text-white/20 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" />
          <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative inline-block group">
      <img
        src={imgSrc}
        alt={altText}
        className={cn(wrapperCls, "object-cover group-hover:rotate-3 group-hover:scale-105 transition-all duration-500")}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setErrored(true)}
      />
    </div>
  );
}
