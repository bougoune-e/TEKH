import { useEffect, useState } from "react";
import { Smartphone, Zap, Loader2 } from "lucide-react";
import { cn } from "@/core/api/utils";

interface DeviceImageProps {
  brand: string;
  model: string;
  className?: string;
  fallbackIcon?: "smartphone" | "zap";
}

export function DeviceImage({
  brand,
  model,
  className,
  fallbackIcon = "smartphone",
}: DeviceImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    if (!brand || !model) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setImgLoadError(false);
    setApiError(false);

    // Formate le modèle en slug (ex. "iPhone 14 Pro" -> "iphone-14-pro")
    const slug = model
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const baseApiUrl = (import.meta.env.VITE_PYTHON_API_URL as string || "http://127.0.0.1:8000")
      .trim()
      .replace(/\/$/, "");

    const requestUrl = `${baseApiUrl}/api/v1/catalog/image/${encodeURIComponent(brand.trim())}/${encodeURIComponent(slug)}`;

    fetch(requestUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Image API request failed");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setImageUrl(data.official_image_url || null);
          setFallbackUrl(data.fallback_image_url || null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn(`[DeviceImage] Failed to load image info for ${brand} ${model}:`, err.message);
        if (active) {
          setApiError(true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [brand, model]);

  const handleImageError = () => {
    if (!imgLoadError && fallbackUrl && imageUrl !== fallbackUrl) {
      // Tenter d'utiliser l'image de secours fournie par l'API
      setImageUrl(fallbackUrl);
      setImgLoadError(true);
    } else {
      // Si même le fallback échoue, on force l'erreur générale
      setApiError(true);
    }
  };

  const renderFallback = () => {
    const iconClass = "w-10 h-10 sm:w-12 sm:h-12 text-blue-600 dark:text-primary opacity-60 transition-transform group-hover:scale-110 duration-500";
    if (fallbackIcon === "zap") {
      return <Zap className={iconClass} fill="currentColor" />;
    }
    return <Smartphone className={iconClass} />;
  };

  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50 dark:from-white/10 dark:to-transparent overflow-hidden group",
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-[1px] z-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 dark:text-primary" />
        </div>
      )}

      {!loading && imageUrl && !apiError ? (
        <img
          src={imageUrl}
          alt={`${brand} ${model}`}
          onError={handleImageError}
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        renderFallback()
      )}
    </div>
  );
}
