import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseApi";
import { cn } from "@/lib/utils";
import ProfileIcon from "./ProfileIcon";

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
    "rounded-xl aspect-square overflow-hidden border-2 border-zinc-100 dark:border-white/5 shadow-sm relative bg-white dark:bg-zinc-900 transition-all duration-500",
    className
  );

  if (loading) {
    return <div className={cn(wrapperCls, "animate-pulse bg-muted-foreground/10")} />;
  }

  if (!imgSrc || errored) {
    return (
      <div className={cn(wrapperCls, "grid place-items-center group")}>
        <ProfileIcon size="100%" className="text-black/20 dark:text-white/20 group-hover:scale-110 transition-transform" />
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
