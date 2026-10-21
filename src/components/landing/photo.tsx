"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Real photo in a blush frame. If the file is missing (photos are added
 * separately — docs/DESIGN.md §10) the frame simply stays a soft blush block.
 */
export function Photo({
  src,
  alt,
  sizes,
  className,
  imgClassName,
  priority = false,
  children,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-blush", className)}>
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className={cn("object-cover", imgClassName)}
        />
      )}
      {children}
    </div>
  );
}
