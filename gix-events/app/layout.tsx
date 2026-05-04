import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GIX Events",
  description: "Guest lectures, workshops, and career panels at GIX",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: "#DFDDE8" }}>{children}</body>
    </html>
  );
}
