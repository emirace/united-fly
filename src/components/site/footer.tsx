import Image from "next/image";
import Link from "next/link";
import IMAGES from "@/lib/images";
import { Eyebrow } from "@/components/ui";

const columns = [
  {
    title: "Book",
    links: [
      { label: "Flight search", href: "/" },
      { label: "Popular routes", href: "/listing" },
      { label: "Group bookings", href: "/contact" },
      { label: "Route map", href: "/listing" },
    ],
  },
  {
    title: "Manage",
    links: [
      { label: "Track a booking", href: "/tracking" },
      { label: "My trips", href: "/dashboard/bookings" },
      { label: "Payments", href: "/dashboard/payments" },
      { label: "Profile", href: "/dashboard/profile" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/contact" },
      { label: "Privacy policy", href: "/contact" },
      { label: "Terms & conditions", href: "/contact" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const socials = ["f", "X", "in", "ig"];

export default function Footer() {
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
            IATA-accredited travel operator. Fares shown include taxes and
            carrier charges.
          </p>
          <div className="flex gap-2.5">
            {socials.map((social) => (
              <span
                key={social}
                className="flex size-8 items-center justify-center rounded-full border border-line-strong text-xs text-dim"
              >
                {social}
              </span>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-2.5">
            <Eyebrow className="mb-1.5">{column.title}</Eyebrow>
            {column.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] text-muted transition-colors hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line-soft pt-6 text-xs text-faint">
        <span>© 2026 United Fly Airlines. All rights reserved.</span>
        <span className="font-mono tracking-[0.1em]">
          LOS · LHR · JFK · DXB · ZRH · BKK
        </span>
      </div>
    </footer>
  );
}
