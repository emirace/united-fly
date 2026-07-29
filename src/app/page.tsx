"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import IMAGES from "@/lib/images";
import { ping } from "@/services/image";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import SearchPanel from "@/components/home/searchPanel";
import { Button, Eyebrow, SectionHeading, StatusDot } from "@/components/ui";

const destinations = [
  {
    name: "Thailand",
    code: "BKK",
    image: IMAGES.thailand,
    rating: 4.3,
    info: "Next departure 26 Dec · 2 stops",
    price: "$689",
  },
  {
    name: "Hong Kong",
    code: "HKG",
    image: IMAGES.hong_kong,
    rating: 4.6,
    info: "Daily service · 1 stop",
    price: "$742",
  },
  {
    name: "Maldives",
    code: "MLE",
    image: IMAGES.maldives,
    rating: 4.3,
    info: "2 flights weekly · 1 stop",
    price: "$958",
  },
  {
    name: "Switzerland",
    code: "ZRH",
    image: IMAGES.switzerland,
    rating: 4.3,
    info: "Next available 2 Oct · direct",
    price: "$614",
    tag: "Filling fast",
  },
];

const steps = [
  {
    art: IMAGES.step1,
    n: "01",
    title: "Search live fares",
    copy: "Real seat inventory across 630 destinations — no bait pricing.",
  },
  {
    art: IMAGES.step2,
    n: "02",
    title: "Pick seat & fare",
    copy: "Compare cabins side by side and choose your seat on the map.",
  },
  {
    art: IMAGES.step3,
    n: "03",
    title: "Pay your way",
    copy: "Card, bank transfer, mobile money or crypto — ticket issued instantly.",
  },
];

const stats = [
  { value: "630+", label: "Destinations served" },
  { value: "24h", label: "Free seat hold, no card" },
  { value: "IATA", label: "Accredited & bonded" },
  { value: "4.7/5", label: "18,402 verified reviews" },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Warms the API connection on load, same as the previous app did.
    ping().catch(() => {});
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Navbar />

      {/* Hero ------------------------------------------------------- */}
      <section className="relative mx-4 flex min-h-[520px] flex-col justify-end overflow-hidden rounded-hero md:mx-6 md:min-h-[620px]">
        <Image
          src={IMAGES.hero}
          alt="Aircraft at dusk"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-ink/70 via-ink/30 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_12%_30%,rgba(110,91,245,0.28)_0%,transparent_70%)]" />

        <div className="relative px-6 pt-24 pb-20 md:px-14 md:pt-28 md:pb-28">
          <div className="mb-5 flex items-center gap-3">
            <StatusDot tone="success" pulse />
            <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
              On-time performance 94.2% · June 2026
            </span>
          </div>
          <h1 className="m-0 mb-5 max-w-[15ch] text-5xl leading-[0.94] font-semibold tracking-[-0.035em] text-balance md:text-7xl lg:text-[82px]">
            Ready when you are.
          </h1>
          <p className="m-0 max-w-[46ch] text-base leading-relaxed text-muted text-pretty md:text-[17px]">
            630 destinations, one fare screen, no hidden extras. Search live
            availability and hold your seat for 24 hours — free.
          </p>
        </div>
      </section>

      {/* Search panel ----------------------------------------------- */}
      <section className="relative z-10 -mt-12 px-4 md:-mt-16 md:px-12">
        <SearchPanel />
      </section>

      {/* Trust strip ------------------------------------------------ */}
      <section className="mx-4 mt-9 grid overflow-hidden rounded-card border border-line-soft hairline-grid sm:grid-cols-2 md:mx-12 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-panel px-6 py-5">
            <div className="font-display text-2xl font-semibold tracking-[-0.02em]">
              {stat.value}
            </div>
            <div className="mt-1 text-[13px] text-dim">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Popular destinations --------------------------------------- */}
      <section className="px-4 pt-20 md:px-12 md:pt-24">
        <SectionHeading
          eyebrow="Where people are going"
          title="Popular this season"
          action={
            <Link
              href="/listing"
              className="border-b border-accent-tint/40 pb-0.5 text-sm font-medium text-accent-tint transition-colors hover:text-accent-bright"
            >
              All 630 destinations
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination) => (
            <div
              key={destination.name}
              className="relative h-[400px] overflow-hidden rounded-card border border-line"
            >
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-b from-ink/10 to-ink/90" />

              <span className="absolute top-3.5 left-3.5 rounded-full bg-ink/60 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] backdrop-blur-sm">
                {destination.code}
              </span>
              {destination.tag && (
                <span className="absolute top-3.5 right-3.5 rounded-full border border-gold/40 bg-gold/15 px-2.5 py-1.5 text-[10px] tracking-[0.08em] text-gold uppercase">
                  {destination.tag}
                </span>
              )}

              <div className="absolute right-0 bottom-0 left-0 p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="m-0 font-display text-[22px] font-semibold tracking-[-0.02em]">
                    {destination.name}
                  </h3>
                  <span className="font-mono text-xs text-gold">
                    {destination.rating} ★
                  </span>
                </div>
                <p className="m-0 mt-1.5 mb-3.5 text-[13px] text-muted">
                  {destination.info}
                </p>
                <div className="flex items-center justify-between border-t border-line-strong pt-3.5">
                  <span className="text-[13px] text-dim">from</span>
                  <span className="font-display text-xl font-semibold">
                    {destination.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Three steps ------------------------------------------------ */}
      <section className="px-4 pt-20 md:px-12 md:pt-24">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] lg:gap-16">
          <div>
            <Eyebrow className="mb-3">Three steps</Eyebrow>
            <h2 className="m-0 mb-4 text-3xl leading-[1.02] font-semibold md:text-[40px]">
              Booked in under two minutes
            </h2>
            <p className="m-0 mb-6 text-[15px] leading-relaxed text-dim text-pretty">
              No account needed to search. Create one at checkout and your
              booking, boarding pass and refunds all live in one place.
            </p>
            <Button
              variant="outline"
              pill
              onClick={() => router.push("/listing")}
            >
              Start a search
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.n}
                className="rounded-card border border-line bg-panel p-6"
              >
                <div className="mb-5 flex h-[132px] items-center justify-center rounded-xl bg-plate">
                  <Image
                    src={step.art}
                    alt={step.title}
                    width={104}
                    height={104}
                    className="h-[104px] w-auto"
                  />
                </div>
                <div className="mb-2 font-mono text-[11px] text-accent">
                  {step.n}
                </div>
                <h3 className="m-0 mb-1.5 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="m-0 text-[13px] leading-relaxed text-dim">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA ------------------------------------------------ */}
      <section className="px-4 pt-20 md:px-12 md:pt-24">
        <div className="relative flex flex-wrap items-center justify-between gap-10 overflow-hidden rounded-panel border border-line bg-linear-120 from-[#14121F] to-panel p-8 md:p-14">
          <div className="absolute -top-32 -right-20 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(110,91,245,0.35)_0%,transparent_65%)]" />
          <div className="relative max-w-[52ch]">
            <h2 className="m-0 mb-3 text-3xl leading-[1.04] font-semibold md:text-[40px]">
              It&apos;s time to discover
            </h2>
            <p className="m-0 text-[15px] leading-relaxed text-dim text-pretty">
              Join MileClub and earn 2× miles on every route this quarter. Free
              changes, free seat selection, and priority support when plans move.
            </p>
          </div>
          <div className="relative flex shrink-0 gap-3">
            <Button
              variant="white"
              size="lg"
              pill
              onClick={() => router.push("/signup")}
            >
              Join MileClub
            </Button>
            <Button
              variant="outline"
              size="lg"
              pill
              onClick={() => router.push("/listing")}
            >
              Book a flight
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
