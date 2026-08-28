import type { StoreSettings } from "@/lib/types";

const DEFAULT_INSTAGRAM_URL =
  "https://www.instagram.com/missteatea3000?igsi=ZTVkY2I5cTQzaHN6";

export function resolveInstagramUrl(settings: StoreSettings): string {
  const value = settings.instagram?.en ?? "";
  return value.startsWith("http") ? value : DEFAULT_INSTAGRAM_URL;
}

export default function ContactSection({ settings }: { settings: StoreSettings }) {
  const address = settings.address?.en ?? "Bondgenotenlaan 106, Leuven, Belgium";
  const addressZh = settings.address?.zh ?? "";
  const hours = settings.opening_hours?.en ?? "";
  const hoursZh = settings.opening_hours?.zh ?? "";
  const phone = settings.phone?.en ?? "";
  const instagram = settings.instagram?.en ?? "";
  const instagramUrl = resolveInstagramUrl(settings);
  const instagramHandle = instagram.startsWith("http") ? instagram : `@${instagram.replace(/^@/, "")}`;

  const rows = [
    { icon: "📍", title: "Address · 地址", en: address, zh: addressZh },
    { icon: "🕒", title: "Opening Hours · 营业时间", en: hours, zh: hoursZh },
    { icon: "📞", title: "Phone · 电话", en: phone, zh: "" },
  ].filter((row) => row.en || row.zh);

  return (
    <section id="contact" className="section-anchor bg-wood px-6 py-16">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="font-display text-[40px] font-bold text-[#fff8ef]">Contact</h2>
        <p className="font-cn mt-1 text-[20px] text-wood-light">联系我们</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.title}
              className="rounded-[20px] bg-cream p-6 shadow-[0_6px_18px_rgba(75,46,32,0.28)]"
            >
              <h3 className="font-display flex items-center gap-2 text-[20px] font-bold text-brown">
                <span>{row.icon}</span>
                {row.title}
              </h3>
              <p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed text-brown">
                {row.en}
              </p>
              {row.zh && (
                <p className="font-cn mt-1 text-[15px] text-[#6b4a33]">{row.zh}</p>
              )}
            </div>
          ))}

          <div className="rounded-[20px] bg-cream p-6 shadow-[0_6px_18px_rgba(75,46,32,0.28)]">
            <h3 className="font-display flex items-center gap-2 text-[20px] font-bold text-brown">
              <span>📸</span>
              Instagram
            </h3>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block break-all text-[16px] text-brown-deep underline underline-offset-4 hover:text-brown-dark"
            >
              {instagramHandle}
            </a>
            <p className="font-cn mt-2 text-[15px] text-[#6b4a33]">
              关注我们，第一时间获取新品与优惠信息
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
