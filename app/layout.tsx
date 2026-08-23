import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "Польская кириллица — транслитератор";
const description =
  "Контекстная транслитерация польского текста в самостоятельную кириллическую орфографию с юсами, мягкими рядами и историческим рж.";

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f4f1e9",
};

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Польская кириллица",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
