import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Original image URL */
  src: string;
  alt: string;
  /** Widths for responsive srcSet (defaults to [400, 800, 1200]) */
  widths?: number[];
  /** Whether the image is above the fold (disables lazy loading) */
  priority?: boolean;
  /** Aspect ratio class e.g. "aspect-video", "aspect-[21/9]" */
  aspectRatio?: string;
  /** Fill parent container */
  fill?: boolean;
}

/**
 * Generates optimized image URLs. For Unsplash images, appends format/width params.
 * For other URLs, returns them as-is with width hints.
 */
function getOptimizedUrl(src: string, width: number, format: "webp" | "auto" = "webp"): string {
  if (!src) return src;

  try {
    const url = new URL(src);

    // Unsplash images support on-the-fly transforms
    if (url.hostname.includes("unsplash.com") || url.hostname.includes("images.unsplash.com")) {
      url.searchParams.set("w", String(width));
      url.searchParams.set("fm", format);
      url.searchParams.set("q", "80");
      url.searchParams.set("auto", "format");
      return url.toString();
    }

    // Supabase storage - just return as-is (no transform API on free tier)
    return src;
  } catch {
    // Not a valid URL (relative path, etc.)
    return src;
  }
}

function buildSrcSet(src: string, widths: number[]): string {
  return widths
    .map((w) => `${getOptimizedUrl(src, w)} ${w}w`)
    .join(", ");
}

function buildSizes(widths: number[]): string {
  // Responsive sizes matching common breakpoints
  const sorted = [...widths].sort((a, b) => a - b);
  if (sorted.length >= 3) {
    return `(max-width: 640px) ${sorted[0]}px, (max-width: 1024px) ${sorted[1]}px, ${sorted[2]}px`;
  }
  if (sorted.length >= 2) {
    return `(max-width: 640px) ${sorted[0]}px, ${sorted[1]}px`;
  }
  return `${sorted[0]}px`;
}

const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ src, alt, widths = [400, 800, 1200], priority = false, aspectRatio, fill, className, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
      return (
        <div
          className={cn(
            "bg-muted flex items-center justify-center",
            aspectRatio,
            fill && "w-full h-full",
            className
          )}
          aria-label={alt}
        >
          <span className="text-muted-foreground text-xs">No image</span>
        </div>
      );
    }

    const srcSet = buildSrcSet(src, widths);
    const sizes = buildSizes(widths);
    const optimizedSrc = getOptimizedUrl(src, widths[widths.length - 1]);

    return (
      <picture>
        {/* WebP source for browsers that support it */}
        <source
          srcSet={buildSrcSet(src, widths)}
          sizes={sizes}
          type="image/webp"
        />
        <img
          ref={ref}
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : undefined}
          onError={() => setHasError(true)}
          className={cn(
            fill && "w-full h-full object-cover",
            className
          )}
          {...props}
        />
      </picture>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export { OptimizedImage };
export type { OptimizedImageProps };
