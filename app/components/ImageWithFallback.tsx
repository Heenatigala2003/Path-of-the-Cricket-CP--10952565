// @/components/ImageWithFallback.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export default function ImageWithFallback({
  src,
  alt,
  width = 100,
  height = 100,
  className = "",
  fallbackSrc = "/placeholder.jpg",
  priority = false
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc || fallbackSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => {
        console.warn(`Image failed to load: ${src}`);
        setImgSrc(fallbackSrc);
      }}
      priority={priority}
    />
  );
}