import LightboxImage from "@/components/site/LightboxImage";
import type { AboutEntry } from "@/lib/types";

// About 只有一份：文字 + 多张图片
export default function AboutSection({ entries }: { entries: AboutEntry[] }) {
  const entry = entries[0];

  return (
    <section id="about" className="section-anchor bg-wood px-6 py-16">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="font-display text-[40px] font-bold text-[#fff8ef]">About</h2>
        <p className="font-cn mt-1 text-[20px] text-wood-light">关于我们</p>

        {!entry ? (
          <p className="font-cn mt-8 rounded-[20px] bg-cream p-6 text-brown shadow-[0_6px_18px_rgba(75,46,32,0.28)]">
            关于我们的故事，敬请期待～
          </p>
        ) : (
          <article className="mt-8 flex flex-col gap-6 rounded-[20px] bg-cream p-6 shadow-[0_6px_18px_rgba(75,46,32,0.28)] sm:p-8 lg:flex-row lg:items-center">
            <div
              className={`grid w-full shrink-0 gap-3 lg:w-[360px] ${
                entry.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {entry.images.map((img, j) => (
                <LightboxImage
                  key={j}
                  src={img}
                  alt={`${entry.titleEn || "About Miss Tea Tea"} ${j + 1}`}
                  imgClassName={`rounded-xl ${entry.images.length > 1 ? "aspect-square" : "aspect-[4/3]"}`}
                />
              ))}
            </div>
            <div className="flex-1">
              {(entry.titleEn || entry.titleZh) && (
                <h3 className="font-display text-[26px] font-bold text-brown">
                  {entry.titleEn}{" "}
                  {entry.titleZh && (
                    <span className="font-cn text-[20px] font-normal">{entry.titleZh}</span>
                  )}
                </h3>
              )}
              {entry.bodyEn && (
                <p className="mt-3 whitespace-pre-line text-[16px] leading-relaxed text-brown">
                  {entry.bodyEn}
                </p>
              )}
              {entry.bodyZh && (
                <p className="font-cn mt-2 whitespace-pre-line text-[15px] leading-relaxed text-[#6b4a33]">
                  {entry.bodyZh}
                </p>
              )}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
