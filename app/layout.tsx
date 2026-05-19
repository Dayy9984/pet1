import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pet Generate",
  description: "Generate pixel sprite sets from uploaded pet and character images."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
