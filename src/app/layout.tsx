import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import Providers from "@/context";
import ToastNotification from "@/components/common/toastNotification";
import Support from "@/components/support";
import MomentLocale from "@/components/common/momentLocale";
import { dirFor, isLocale, defaultLocale } from "@/i18n/config";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const resolved = await getLocale();
  const locale = isLocale(resolved) ? resolved : defaultLocale;

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <MomentLocale locale={locale} />
          <Providers>
            <ToastNotification />
            {children}
            <Support />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
