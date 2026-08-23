const drinks = [
  { en: "Brown Sugar Boba Milk", zh: "黑糖珍珠奶茶" },
  { en: "Taro Milk Tea", zh: "香芋奶茶" },
  { en: "Matcha Latte", zh: "抹茶拿铁" },
  { en: "Fruit Tea", zh: "新鲜水果茶" },
];

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      <section className="bg-gradient-to-b from-[#ffd6e7] to-[#fff7ef] px-5 py-12 text-center">
        <div className="text-[90px] leading-none">🐼🧋</div>
        <h1 className="mt-2.5 text-[45px] font-bold leading-tight">Miss Tea Tea</h1>
        <p className="mt-2.5 text-xl">Cute Asian Bubble Tea Shop in Leuven</p>
        <p className="mt-2.5 text-xl">
          🎓 KU Leuven 新生福利
          <br />
          学生证买一送一！
        </p>
        <a
          href="#menu"
          className="mt-5 inline-block rounded-full bg-[#8b4513] px-7 py-3.5 text-white no-underline hover:bg-[#7a3d11]"
        >
          View Menu
        </a>
      </section>

      <section className="mx-auto max-w-[900px] px-5 py-8">
        <h2 className="mb-4 text-2xl font-bold">🍹 Our Menu</h2>
        <div
          id="menu"
          className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5"
        >
          {drinks.map((drink) => (
            <div key={drink.en} className="rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
              <h3 className="text-lg font-bold">{drink.en}</h3>
              <p>{drink.zh}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-5 py-8">
        <h2 className="mb-4 text-2xl font-bold">📍 Visit Us</h2>
        <div className="rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
          <p>
            <strong>Miss Tea Tea</strong>
          </p>
          <p>
            Bondgenotenlaan 106
            <br />
            Leuven, Belgium
          </p>
          <p>
            Opening Hours:
            <br />
            Mon-Sun: 11:00 - 21:00
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-5 py-8">
        <h2 className="mb-4 text-2xl font-bold">✨ Follow Us</h2>
        <div className="rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
          <p>Instagram: @MissTeaTea</p>
          <p className="mt-5">Come enjoy your favorite bubble tea with friends!</p>
        </div>
      </section>

      <footer className="bg-[#4b2e20] p-5 text-center text-white">
        © 2026 Miss Tea Tea Leuven
      </footer>
    </main>
  );
}
