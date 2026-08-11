import Image from "next/image";

import type { AboutImage } from "./aboutData";

type DynamicAboutImageProps = {
  image: AboutImage;
  reducedMotion: boolean;
};

export function DynamicAboutImage({
  image,
  reducedMotion,
}: DynamicAboutImageProps) {
  return (
    <figure className="dynamic-about-image">
      <Image
        key={image.src}
        className={reducedMotion ? "motion-reduced" : undefined}
        src={image.src}
        alt={image.alt}
        fill
        loading="eager"
        sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1100px) 48vw, 30vw"
        style={{ objectPosition: image.position }}
      />
      <figcaption>Life, learning &amp; building</figcaption>
    </figure>
  );
}
