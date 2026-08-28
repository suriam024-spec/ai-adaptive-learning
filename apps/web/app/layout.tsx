import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Adaptive Learning",
  description: "AI-powered adaptive learning platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
