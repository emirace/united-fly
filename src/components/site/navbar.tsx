"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IoMenuOutline, IoClose } from "react-icons/io5";
import {
  HiOutlineUser,
  HiOutlineTicket,
  HiOutlineLogout,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import IMAGES from "@/lib/images";
import { useUser } from "@/context/user";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";

const navLinks = [
  { path: "/", label: "Book" },
  { path: "/tracking", label: "Track flight" },
  { path: "/dashboard/bookings", label: "My trips" },
  { path: "/contact", label: "Help" },
];

const accountLinks = [
  { name: "Profile", icon: HiOutlineUser, path: "/dashboard/profile" },
  { name: "Bookings", icon: HiOutlineTicket, path: "/dashboard/bookings" },
  { name: "Track", icon: HiOutlineLocationMarker, path: "/tracking" },
];

const initials = (name?: string) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "UF";

export default function Navbar({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <nav
      className={cn(
        "relative z-20 flex items-center gap-10 px-6 py-5 md:px-12",
        compact && "border-b border-line-soft py-4"
      )}
    >
      <Link href="/" className="flex shrink-0 items-center gap-3">
        <Image
          src={IMAGES.logo}
          alt="United Fly Airlines"
          width={120}
          height={34}
          className="h-8 w-auto"
          priority
        />
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-semibold tracking-[-0.01em]">
            United Fly
          </span>
          <span className="mt-[3px] font-mono text-[9px] tracking-[0.22em] text-dim uppercase">
            Airlines
          </span>
        </span>
      </Link>

      <div className="hidden items-center gap-7 text-sm font-medium lg:flex">
        {navLinks.map(({ path, label }) => {
          const active =
            path === "/" ? pathname === "/" : !!pathname?.startsWith(path);
          return (
            <Link
              key={path}
              href={path}
              className={cn(
                "transition-colors hover:text-fg",
                active ? "text-white" : "text-dim"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-line-strong px-3.5 py-2 text-[13px] text-dim xl:flex">
          <span className="font-mono text-[11px] tracking-[0.1em]">USD</span>
          <span className="h-3 w-px bg-white/15" />
          <span>EN</span>
        </div>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="flex cursor-pointer items-center gap-3"
              aria-label="Account menu"
            >
              <span className="hidden text-[13px] text-dim md:inline">
                {user.fullName}
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-linear-140 from-accent to-[#2A2440] font-display text-[13px] font-semibold">
                {initials(user.fullName)}
              </span>
            </button>

            {openMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenMenu(false)}
                />
                <div className="absolute top-full right-0 z-50 mt-2 w-52 rounded-card border border-line bg-raised p-2 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)]">
                  {accountLinks.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      onClick={() => setOpenMenu(false)}
                      className="flex items-center gap-3 rounded-control px-3 py-2.5 text-sm text-muted transition-colors hover:bg-accent/10 hover:text-accent-bright"
                    >
                      <link.icon size={18} />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      logout();
                      setOpenMenu(false);
                      router.push("/login");
                    }}
                    className="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
                  >
                    <HiOutlineLogout size={18} />
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="hidden items-center gap-3 sm:flex">
            <Button
              variant="outline"
              size="sm"
              pill
              onClick={() => router.push("/login")}
            >
              Sign in
            </Button>
            <Button size="sm" pill onClick={() => router.push("/signup")}>
              Join MileClub
            </Button>
          </div>
        )}

        <button
          className="cursor-pointer text-3xl text-fg lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          {isOpen ? <IoClose /> : <IoMenuOutline />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full right-4 left-4 z-50 rounded-card border border-line bg-raised p-3 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)] lg:hidden">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              href={path}
              onClick={() => setIsOpen(false)}
              className="block rounded-control px-3 py-2.5 text-sm text-muted transition-colors hover:bg-accent/10 hover:text-accent-bright"
            >
              {label}
            </Link>
          ))}
          {!user && (
            <div className="mt-2 flex gap-2 border-t border-line-soft pt-3 sm:hidden">
              <Button
                variant="outline"
                size="sm"
                pill
                className="flex-1"
                onClick={() => router.push("/login")}
              >
                Sign in
              </Button>
              <Button
                size="sm"
                pill
                className="flex-1"
                onClick={() => router.push("/signup")}
              >
                Join
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
