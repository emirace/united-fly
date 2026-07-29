import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import Providers from "@/context";
import ToastNotification from "@/components/common/toastNotification";
import Support from "@/components/support";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "United Fly Airlines",
  description:
    "630 destinations, one fare screen, no hidden extras. Search live availability and hold your seat for 24 hours — free.",
  icons: { icon: "/assets/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <ToastNotification />
          {children}
          <Support />
        </Providers>
      </body>
    </html>
  );
}
