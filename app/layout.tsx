import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miss Tea Tea | Bubble Tea Leuven",
  description:
    "Cute Asian bubble tea shop in Leuven, Belgium. 奶茶店 · 学生证买一送一！Brown sugar boba milk, taro milk tea, matcha latte & fruit tea.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
