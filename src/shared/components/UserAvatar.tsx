import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/core/api/supabaseApi";
import { cn } from "@/core/api/utils";

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

/** Première lettre pour le fallback (nom ou email) */
function getInitial(user: any): string {
  const m = (user as any)?.user_metadata || {};
  const name = m.full_name || m.name || "";
  if (name && name.trim()) return name.trim().charAt(0).toUpperCase();
  const email = (user as any)?.email || "";
  if (email) return email.charAt(0).toUpperCase();
  return "?";
}

export default function UserAvatar({ user, src, path, size = "md", className = "", alt }: Props) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errored, setErrored] = useState<boolean>(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const metaUrl = useMemo(() => {
    const m = (user as any)?.user_metadata || {};
    return (m.avatar_url || m.picture || m.photo_url || (user as any)?.avatar_url || null) as string | null;
  }, [user]);

  const initial = useMemo(() => getInitial(user), [user]);
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

  const baseSize = sizeToClass[size];
  const wrapperCls = cn(
    "aspect-square overflow-hidden rounded-full border-2 border-zinc-100 dark:border-white/5 shadow-sm relative bg-muted/30 transition-all duration-300",
    baseSize,
    className
  );

  if (loading) {
    return <div className={cn(wrapperCls, "animate-pulse")} aria-hidden />;
  }

  if (!imgSrc || errored) {
    return (
      <div
        className={cn(wrapperCls, "flex items-center justify-center text-foreground/80 font-black select-none")}
        style={{ fontSize: "40%" }}
        aria-label={altText}
      >
        {initial}
      </div>
    );
  }

  return (
    <div className={cn("relative inline-block rounded-full overflow-hidden", baseSize, className)}>
      <img
        src={imgSrc}
        alt={altText}
        className="w-full h-full min-w-0 min-h-0 object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setErrored(true)}
      />
    </div>
  );
}
