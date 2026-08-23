import type { Metadata } from "next";
import Link from "next/link";
import DrinkCard from "@/components/DrinkCard";
import Footer from "@/components/Footer";
import { menu } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Our Menu | Miss Tea Tea",
  description: "Full menu of Miss Tea Tea, bubble tea shop in Leuven, Belgium.",
};

export default function MenuPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="bg-gradient-to-b from-[#ffd6e7] to-[#fff7ef] px-5 py-10 text-center">
        <Link href="/" className="text-4xl no-underline">
          🐼🧋
        </Link>
        <h1 className="mt-2 text-4xl font-bold">Our Menu</h1>
        <p className="mt-2 text-xl">Cute Asian Bubble Tea Shop in Leuven</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-[#8b4513] px-6 py-2.5 text-white no-underline hover:bg-[#7a3d11]"
        >
          ← Back to Home
        </Link>
      </section>

      {menu.map((category) => (
        <section key={category.nameEn} className="mx-auto max-w-[900px] px-5 py-6">
          <h2 className="mb-4 text-2xl font-bold">
            {category.nameEn} <span className="text-lg font-normal">{category.nameZh}</span>
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            {category.items.map((drink) => (
              <DrinkCard key={drink.en} drink={drink} />
            ))}
          </div>
        </section>
      ))}

      <Footer />
    </main>
  );
}
