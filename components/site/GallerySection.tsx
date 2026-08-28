import LightboxImage from "@/components/site/LightboxImage";
import type { GalleryPhoto } from "@/lib/types";

export default function GallerySection({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <section id="gallery" className="section-anchor bg-wood px-6 py-16">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="font-display text-[40px] font-bold text-[#fff8ef]">Gallery</h2>
        <p className="font-cn mt-1 text-[20px] text-wood-light">照片墙</p>

        {photos.length === 0 ? (
          <p className="font-cn mt-8 rounded-[20px] bg-cream p-6 text-brown shadow-[0_6px_18px_rgba(75,46,32,0.28)]">
            照片正在整理中，敬请期待～
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
            {photos.map((photo, i) => (
              <figure
                key={i}
                className="overflow-hidden rounded-[20px] bg-cream shadow-[0_6px_18px_rgba(75,46,32,0.28)]"
              >
                <LightboxImage
                  src={photo.image}
                  alt={photo.captionEn || `Gallery photo ${i + 1}`}
                  imgClassName="aspect-square rounded-none"
                />
                {(photo.captionEn || photo.captionZh) && (
                  <figcaption className="px-4 py-3 text-[14px] text-brown">
                    {photo.captionEn}
                    {photo.captionEn && photo.captionZh && " · "}
                    {photo.captionZh && <span className="font-cn">{photo.captionZh}</span>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
