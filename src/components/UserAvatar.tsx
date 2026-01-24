import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseApi";

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

  const wrapperCls = `${sizeToClass[size]} rounded-full aspect-square overflow-hidden border border-gray-200/30 shadow-sm relative ${className}`;

  if (loading) {
    return <div className={`${wrapperCls} animate-pulse bg-muted`} />;
  }

  if (!imgSrc || errored) {
    return (
      <div className={`${wrapperCls} grid place-items-center bg-gray-200 dark:bg-gray-800`}>
        <img
          src="/default-avatar.png"
          alt={altText}
          className="h-full w-full object-cover"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = "none";
          }}
          loading="lazy"
          decoding="async"
        />
        <svg viewBox="0 0 64 64" className="absolute h-1/2 w-1/2 text-white/90" aria-hidden="true">
          <circle cx="32" cy="24" r="12" fill="currentColor" />
          <path d="M8,56c0-11,10-18,24-18s24,7,24,18" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={altText}
      className={`${wrapperCls} object-cover`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
    />
  );
}
