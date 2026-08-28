import NavBar from "@/components/site/NavBar";
import Hero from "@/components/site/Hero";
import NewsSection from "@/components/site/NewsSection";
import MenuSection from "@/components/site/MenuSection";
import AboutSection from "@/components/site/AboutSection";
import GallerySection from "@/components/site/GallerySection";
import ContactSection, { resolveInstagramUrl } from "@/components/site/ContactSection";
import {
  getAboutEntries,
  getActiveAnnouncements,
  getGalleryPhotos,
  getMenu,
  getStoreSettings,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [menu, settings, announcements, about, gallery] = await Promise.all([
    getMenu(),
    getStoreSettings(),
    getActiveAnnouncements(),
    getAboutEntries(),
    getGalleryPhotos(),
  ]);

  const hasNews = announcements.length > 0;

  return (
    <main className="bg-wood text-foreground">
      <NavBar hasNews={hasNews} instagramUrl={resolveInstagramUrl(settings)} />
      <Hero hasNews={hasNews} />
      {hasNews && <NewsSection announcements={announcements} />}
      <MenuSection menu={menu} />
      <AboutSection entries={about} />
      <GallerySection photos={gallery} />
      <ContactSection settings={settings} />
      <footer className="bg-wood-dark px-6 py-8 text-center">
        <p className="font-display text-[16px] font-semibold text-[#f5d9c8]">
          © 2026 Miss Tea Tea Leuven
        </p>
        <p className="font-cn mt-1 text-[14px] text-[#f0c4ae]">
          美好的一天，从一杯奶茶开始 🧋
        </p>
      </footer>
    </main>
  );
}
