// src/app/layout.tsx
import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";

export const metadata: Metadata = {
  title: "Printer Status Monitor",
  description: "Monitor printer status in real-time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
