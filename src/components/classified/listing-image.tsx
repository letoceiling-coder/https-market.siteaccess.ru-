"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "cn";

/**
 * Card photo with three states.
 * - loading: a pulsing placeholder sits under the image and is covered once the photo paints;
 * - loaded: hover zoom;
 * - error: neutral placeholder with an icon.
 * The image is never hidden while loading, so a photo that finished before hydration cannot get stuck invisible.
 * The wrapper owns the aspect ratio, so every card keeps the same proportions.
 */
export function ListingImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span role="img" aria-label="Фото недоступно" className="absolute inset-0 grid place-content-center justify-items-center gap-1 text-[12px] text-[#767676]">
        <ImageOff className="size-6" aria-hidden="true" />
        Фото недоступно
      </span>
    );
  }

  return (
    <>
      <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-[#e6e4e2]" />
      <Image
        ref={(element) => {
          // Covers an error that happened before React attached onError.
          if (element?.complete && element.naturalWidth === 0) setFailed(true);
        }}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className={cn("object-cover transition duration-300 group-hover:scale-[1.04]", className)}
      />
    </>
  );
}
