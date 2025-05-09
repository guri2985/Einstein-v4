import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";

import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";
import NavBar from "@/components/NavBar";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Samuel Cunard ",
    template: `%s - HeyGen Interactive Avatar`,
  },
 
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} font-sans`}
    >
      <head />
      <body className={clsx("mainb")}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <main className="relative flex flex-col ">
           
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
