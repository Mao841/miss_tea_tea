"use client";

// Home 首屏：原设计图直用（hero.jpg，已裁掉自带导航条）+ 公告气泡
// 响应式：超宽屏限宽 1680px 居中（两侧木色），避免 4K 屏上图片过大
export default function Hero({ hasNews }: { hasNews: boolean }) {
  return (
    <section id="home" className="section-anchor relative w-full overflow-hidden bg-wood">
      <div className="relative mx-auto w-full max-w-[1680px]">
        <img
          src="/design/hero.jpg"
          alt="Miss Tea Tea - Cute bubble tea shop in Leuven"
          draggable={false}
          fetchPriority="high"
          className="hero-img select-none"
          style={{ width: "100%", height: "auto", display: "block", maxWidth: "100%" }}
        />
        {hasNews && (
          <a href="#news" className="news-bubble">
            Here is a NEWS!
          </a>
        )}
      </div>
    </section>
  );
}
