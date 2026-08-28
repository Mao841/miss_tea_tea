import LightboxImage from "@/components/site/LightboxImage";
import type { MenuCategory } from "@/lib/types";

export default function MenuSection({ menu }: { menu: MenuCategory[] }) {
  return (
    <section id="menu" className="section-anchor bg-wood px-6 py-16">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="font-display text-[40px] font-bold text-[#fff8ef]">Menu</h2>
        <p className="font-cn mt-1 text-[20px] text-wood-light">菜单</p>

        {menu.length === 0 && (
          <p className="font-cn mt-8 rounded-[20px] bg-cream p-6 text-brown shadow-[0_6px_18px_rgba(75,46,32,0.28)]">
            菜单正在准备中，敬请期待～
          </p>
        )}

        {menu.map((category) => (
          <div key={category.nameEn} className="mt-8">
            <h3 className="font-display text-[26px] font-bold text-[#fff8ef]">
              {category.nameEn}{" "}
              <span className="font-cn text-[20px] font-normal text-wood-light">
                {category.nameZh}
              </span>
            </h3>
            <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
              {category.items.map((drink) => (
                <article
                  key={drink.en}
                  className="flex flex-col rounded-[20px] bg-cream p-5 shadow-[0_6px_18px_rgba(75,46,32,0.28)]"
                >
                  {drink.image && (
                    <LightboxImage
                      src={drink.image}
                      alt={drink.en}
                      className="mb-3"
                      imgClassName="aspect-square rounded-xl"
                    />
                  )}
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-display text-[19px] font-bold text-brown">{drink.en}</h4>
                    {drink.price != null && (
                      <span className="font-display text-[17px] font-bold text-brown-deep">
                        €{drink.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="font-cn text-[15px] text-[#6b4a33]">{drink.zh}</p>
                  {(drink.descriptionEn || drink.descriptionZh) && (
                    <p className="mt-2 text-[14px] leading-relaxed text-[#6b4a33]">
                      {drink.descriptionEn}
                      {drink.descriptionEn && drink.descriptionZh && " · "}
                      {drink.descriptionZh && (
                        <span className="font-cn">{drink.descriptionZh}</span>
                      )}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
