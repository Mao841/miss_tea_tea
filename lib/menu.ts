export type MenuItem = { en: string; zh: string };

export type MenuCategory = { nameEn: string; nameZh: string; items: MenuItem[] };

export const menu: MenuCategory[] = [
  {
    nameEn: "Milk Tea",
    nameZh: "奶茶",
    items: [
      { en: "Brown Sugar Boba Milk", zh: "黑糖珍珠奶茶" },
      { en: "Taro Milk Tea", zh: "香芋奶茶" },
      { en: "Matcha Latte", zh: "抹茶拿铁" },
    ],
  },
  {
    nameEn: "Fruit Tea",
    nameZh: "水果茶",
    items: [{ en: "Fruit Tea", zh: "新鲜水果茶" }],
  },
];
