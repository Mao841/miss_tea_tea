"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MessageModal from "@/components/site/MessageModal";

const links: { href: string; label: string }[] = [
  { href: "#home", label: "Home" },
  { href: "#news", label: "NEWS" },
  { href: "#menu", label: "Menu" },
  { href: "#about", label: "About" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

const visibleLinks = (hasNews: boolean) =>
  links.filter((link) => link.href !== "#news" || hasNews);

export default function NavBar({
  hasNews,
  instagramUrl,
}: {
  hasNews: boolean;
  instagramUrl: string;
}) {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = visibleLinks(hasNews);

  return (
    <>
      <header className="paper-bg sticky top-0 z-50 shadow-[0_2px_10px_rgba(75,46,32,0.08)]">
        <div className="relative mx-auto flex h-[70px] max-w-[1680px] items-center px-4 sm:px-10">
          {/* 商标：双击进入老板管理后台；光标保持默认样式（手机端也显示完整徽章+文字商标） */}
          <img
            src="/design/logo.png"
            alt="Miss Tea Tea"
            draggable={false}
            onDoubleClick={() => router.push("/admin")}
            className="h-[44px] w-auto shrink-0 cursor-default select-none max-[370px]:h-[36px] sm:h-[60px]"
          />

          {/* 桌面端导航 */}
          <nav className="font-display absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-[20px] font-semibold tracking-wide lg:flex">
            {navItems.map((link) => (
              <a key={link.href} href={link.href} className="text-brown no-underline hover:text-brown-deep">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="leading-none"
            >
              <img src="/design/icon-ig.svg" alt="Instagram" className="h-[26px] w-auto sm:h-[34.7px]" />
            </a>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              aria-label="给老板留言"
              className="cursor-pointer leading-none"
            >
              <img src="/design/icon-chat.svg" alt="留言" className="h-[26px] w-auto sm:h-[34.7px]" />
            </button>
            {/* 移动端汉堡菜单 */}
            <button
              type="button"
              aria-label="菜单"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-lg lg:hidden"
            >
              <span className={`h-[2.5px] w-6 rounded bg-brown transition-transform ${menuOpen ? "translate-y-[7.5px] rotate-45" : ""}`} />
              <span className={`h-[2.5px] w-6 rounded bg-brown transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-[2.5px] w-6 rounded bg-brown transition-transform ${menuOpen ? "-translate-y-[7.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* 移动端下拉菜单 */}
        {menuOpen && (
          <nav className="font-display paper-bg flex flex-col gap-1 border-t-2 border-[#f0dcc8] px-6 py-3 lg:hidden">
            {navItems.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-2 text-[18px] font-semibold text-brown no-underline hover:bg-[#f6d6c4]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <MessageModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
