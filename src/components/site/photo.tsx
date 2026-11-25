import Image from "next/image";
import type { MediaAsset } from "@/domain/types";
import { cn } from "cn";

export function Photo({
  media,
  className,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, 100vw",
}: {
  media: MediaAsset;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}

export function PhotoCredit({ media }: { media: MediaAsset }) {
  if (!media.authorUrl) {
    return <p className="text-xs leading-5 text-muted-foreground">Фото сгенерировано нейросетью для тестового объявления.</p>;
  }
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      Фото:{" "}
      <a className="underline decoration-border underline-offset-4 hover:text-foreground" href={media.authorUrl}>
        {media.author}
      </a>
      ,{" "}
      <a className="underline decoration-border underline-offset-4 hover:text-foreground" href={media.licenseUrl}>
        {media.license}
      </a>
      . Иллюстрация, не объект HELP HOMES.
    </p>
  );
}
