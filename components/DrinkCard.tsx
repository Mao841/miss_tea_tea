import type { MenuItem } from "@/lib/types";

export default function DrinkCard({ drink }: { drink: MenuItem }) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
      <h3 className="text-lg font-bold">{drink.en}</h3>
      <p>{drink.zh}</p>
    </div>
  );
}
