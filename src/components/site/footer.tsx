"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import IMAGES from "@/lib/images";
import { Eyebrow } from "@/components/ui";
import LanguageSwitcher from "./languageSwitcher";

const columns = [
  {
    key: "book",
    links: [
      { key: "flightSearch", href: "/" },
      { key: "popularRoutes", href: "/listing" },
      { key: "groupBookings", href: "/contact" },
      { key: "routeMap", href: "/listing" },
    ],
  },
  {
    key: "manage",
    links: [
      { key: "trackBooking", href: "/tracking" },
      { key: "myTrips", href: "/dashboard/bookings" },
      { key: "payments", href: "/dashboard/payments" },
      { key: "profile", href: "/dashboard/profile" },
    ],
  },
  {
    key: "company",
    links: [
      { key: "about", href: "/contact" },
      { key: "privacy", href: "/contact" },
      { key: "terms", href: "/contact" },
      { key: "contact", href: "/contact" },
    ],
  },
] as const;

const socials = ["f", "X", "in", "ig"];

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-24 border-t border-line px-6 pt-12 pb-10 md:px-12">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Image
              src={IMAGES.logo}
              alt="United Fly Airlines"
              width={100}
              height={30}
              className="h-7 w-auto"
            />
            <span className="font-display text-[15px] font-semibold">
              United Fly Airlines
            </span>
          </div>
          <p className="m-0 mb-5 max-w-[34ch] text-[13px] leading-relaxed text-faint">
            {t("blurb")}
          </p>
          <div className="mb-6 flex gap-2.5">
            {socials.map((social) => (
              <span
                key={social}
                className="flex size-8 items-center justify-center rounded-full border border-line-strong text-xs text-dim"
              >
                {social}
              </span>
            ))}
          </div>
          <div className="max-w-[15rem]">
            <Eyebrow className="mb-2">{t("language")}</Eyebrow>
            <LanguageSwitcher variant="block" />
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.key} className="flex flex-col gap-2.5">
            <Eyebrow className="mb-1.5">{t(`${column.key}.title`)}</Eyebrow>
            {column.links.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="text-[13px] text-muted transition-colors hover:text-fg"
              >
                {t(`${column.key}.${link.key}`)}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line-soft pt-6 text-xs text-faint">
        <span>{t("copyright", { year: 2026 })}</span>
        <span className="font-mono tracking-[0.1em]">
          LOS · LHR · JFK · DXB · ZRH · BKK
        </span>
      </div>
    </footer>
  );
}
