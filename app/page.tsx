import Link from "next/link";
import Image from "next/image";
import DrinkCard from "@/components/DrinkCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getActiveAnnouncements, getMenu, getStoreSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [menu, settings, announcements] = await Promise.all([
    getMenu(),
    getStoreSettings(),
    getActiveAnnouncements(),
  ]);

  const slogan = settings.hero_slogan?.en ?? "Cute Asian Bubble Tea Shop in Leuven";
  const address = settings.address?.en ?? "Bondgenotenlaan 106, Leuven, Belgium";
  const hours = settings.opening_hours?.en ?? "Mon-Sun: 11:00 - 21:00";
  const instagram = settings.instagram?.en ?? "@MissTeaTea";
  const promo = announcements[0];

  return (
    <main className="bg-background text-foreground">
      <Header />
      <section className="bg-gradient-to-b from-[#ffd6e7] to-[#fff7ef] px-5 py-12 text-center">
        <div className="text-[90px] leading-none">🐼🧋</div>
        <h1 className="mt-2.5 text-[45px] font-bold leading-tight">Miss Tea Tea</h1>
        <p className="mt-2.5 text-xl">{slogan}</p>
        {promo && (
          <div className="mt-2.5">
            {promo.image && (
              <Image
                src={promo.image}
                alt={promo.titleEn}
                width={400}
                height={400}
                className="mx-auto mb-3 aspect-square w-44 rounded-2xl object-cover shadow-[0_5px_15px_#ddd]"
              />
            )}
            <p className="text-xl">
              🎓 {promo.titleEn} · {promo.titleZh}
              <br />
              {promo.bodyEn} · {promo.bodyZh}
            </p>
          </div>
        )}
        <Link
          href="/menu"
          className="mt-5 inline-block rounded-full bg-[#8b4513] px-7 py-3.5 text-white no-underline hover:bg-[#7a3d11]"
        >
          View Menu
        </Link>
      </section>

      {menu.length > 0 && (
        <section className="mx-auto max-w-[900px] px-5 py-8">
          <h2 className="mb-4 text-2xl font-bold">🍹 Our Menu</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            {menu.flatMap((category) => category.items).map((drink) => (
              <DrinkCard key={drink.en} drink={drink} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[900px] px-5 py-8">
        <h2 className="mb-4 text-2xl font-bold">📍 Visit Us</h2>
        <div className="rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
          <p>
            <strong>Miss Tea Tea</strong>
          </p>
          <p>{address}</p>
          <p>
            Opening Hours:
            <br />
            {hours}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-5 py-8">
        <h2 className="mb-4 text-2xl font-bold">✨ Follow Us</h2>
        <div className="rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
          <p>Instagram: {instagram}</p>
          <p className="mt-5">Come enjoy your favorite bubble tea with friends!</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
