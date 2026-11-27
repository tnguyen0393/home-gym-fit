import Image from "next/image";
import type { ArtworkAsset } from "@/lib/artwork";

export function ArtworkImage({
  art,
  alt,
  className,
  priority = false,
}: {
  art: ArtworkAsset;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={art.src}
      alt={alt ?? art.alt}
      width={art.width}
      height={art.height}
      priority={priority}
      className={className}
    />
  );
}
