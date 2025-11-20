import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4, Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

// Stanford primary typeface - for body text
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

// Stanford primary typeface - for headers and emphasis
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

// Stanford accent typeface - for technical layouts
const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sentinel - Academic Calendar Management",
  description: "Automated peace of mind for managing course syllabi and deadlines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${sourceSerif.variable} ${roboto.variable}`}>
      <body className={sourceSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
