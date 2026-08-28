import LightboxImage from "@/components/site/LightboxImage";
import type { Announcement } from "@/lib/types";

export default function NewsSection({ announcements }: { announcements: Announcement[] }) {
  return (
    <section id="news" className="section-anchor bg-wood px-6 py-16">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="font-display text-[40px] font-bold text-[#fff8ef]">NEWS</h2>
        <p className="font-cn mt-1 text-[20px] text-wood-light">最新公告</p>
        <div className="mt-8 flex flex-col gap-6">
          {announcements.map((a, i) => (
            <article
              key={i}
              className="flex flex-col gap-5 rounded-[20px] bg-cream p-6 shadow-[0_6px_18px_rgba(75,46,32,0.28)] sm:flex-row"
            >
              {a.image && (
                <LightboxImage
                  src={a.image}
                  alt={a.titleEn}
                  className="w-full sm:w-56"
                  imgClassName="aspect-square rounded-xl"
                />
              )}
              <div>
                <h3 className="font-display text-[24px] font-bold text-brown">
                  {a.titleEn} · <span className="font-cn text-[20px]">{a.titleZh}</span>
                </h3>
                <p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed text-brown">
                  {a.bodyEn}
                </p>
                {a.bodyZh && (
                  <p className="font-cn mt-2 whitespace-pre-line text-[15px] leading-relaxed text-[#6b4a33]">
                    {a.bodyZh}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
