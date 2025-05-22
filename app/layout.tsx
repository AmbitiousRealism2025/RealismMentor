import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as an example for a clean font
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Realism Mentor",
  description: "Decompose goals into actionable tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
