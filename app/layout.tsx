import type { Metadata } from "next";
import { Baloo_2, ZCOOL_KuaiLe } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  display: "swap",
});

const kuaile = ZCOOL_KuaiLe({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kuaile",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Miss Tea Tea | Bubble Tea Leuven",
  description:
    "Cute Asian bubble tea shop in Leuven, Belgium. 奶茶店 · 学生证买一送一！Brown sugar boba milk, taro milk tea, matcha latte & fruit tea.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${baloo.variable} ${kuaile.variable}`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
