"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IoClose, IoMenu } from "react-icons/io5";
import {
  HiOutlineUser,
  HiOutlineTicket,
  HiOutlineCog,
  HiOutlineLogout,
} from "react-icons/hi";
import { MdOutlineFlight, MdFlightTakeoff } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import { RiCustomerService2Fill } from "react-icons/ri";
import { useUser } from "@/context/user";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import { Eyebrow } from "@/components/ui";
import { cn } from "@/lib/cn";

const memberLinks = [
  { name: "Profile", icon: HiOutlineUser, path: "/dashboard/profile" },
  { name: "Bookings", icon: HiOutlineTicket, path: "/dashboard/bookings" },
  { name: "Payments", icon: FaCreditCard, path: "/dashboard/payments" },
];

const adminLinks = [
  { name: "Airports", icon: MdOutlineFlight, path: "/dashboard/airports" },
  { name: "Flights", icon: MdFlightTakeoff, path: "/dashboard/flights" },
  {
    name: "All bookings",
    icon: HiOutlineTicket,
    path: "/dashboard/all-bookings",
  },
  {
    name: "All payments",
    icon: FaCreditCard,
    path: "/dashboard/all-payments",
  },
  {
    name: "Support inbox",
    icon: RiCustomerService2Fill,
    path: "/dashboard/support",
  },
  { name: "Settings", icon: HiOutlineCog, path: "/dashboard/settings" },
];

const initials = (name?: string) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "UF";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const NavItem = ({
    link,
  }: {
    link: { name: string; icon: React.ElementType; path: string };
  }) => {
    const active = pathname === link.path;
    return (
      <Link
        href={link.path}
        onClick={() => setIsOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-control px-3.5 py-2.5 text-sm transition-colors",
          active
            ? "bg-accent/12 text-accent-bright"
            : "text-muted hover:bg-white/4 hover:text-fg"
        )}
      >
        <link.icon size={18} />
        <span>{link.name}</span>
      </Link>
    );
  };

  const sidebar = (
    <>
      <div className="mb-3.5 flex items-center gap-3 border-b border-line-soft px-1.5 pb-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-linear-140 from-accent to-[#2A2440] font-display text-sm font-semibold">
          {initials(user?.fullName)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{user?.fullName}</div>
          <div className="mt-0.5 truncate font-mono text-[10px] text-faint">
            {user?.email}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {memberLinks.map((link) => (
          <NavItem key={link.path} link={link} />
        ))}
      </div>

      {user?.role === "Admin" && (
        <>
          <Eyebrow className="px-2 pt-5 pb-2.5">Admin</Eyebrow>
          <div className="flex flex-col gap-0.5">
            {adminLinks.map((link) => (
              <NavItem key={link.path} link={link} />
            ))}
          </div>
        </>
      )}

      <div className="mt-4 border-t border-line-soft pt-3.5">
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-control px-3.5 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger/10"
        >
          <HiOutlineLogout size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Navbar compact />

      <div className="grid items-start gap-5 px-4 py-8 pb-16 md:px-12 lg:grid-cols-[minmax(210px,256px)_minmax(0,1fr)]">
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-line-strong px-4 py-3 text-sm text-muted lg:hidden"
        >
          <IoMenu size={18} /> Dashboard menu
        </button>

        {/* Desktop sidebar */}
        <aside className="hidden rounded-card border border-line bg-panel p-4 lg:sticky lg:top-6 lg:block">
          {sidebar}
        </aside>

        {/* Mobile drawer */}
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-0 right-0 bottom-0 w-72 overflow-y-auto bg-panel p-4 scrollbar-slim">
              <button
                onClick={() => setIsOpen(false)}
                className="mb-4 ml-auto block cursor-pointer text-2xl text-dim"
                aria-label="Close menu"
              >
                <IoClose />
              </button>
              {sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0">{children}</main>
      </div>

      <Footer />
    </div>
  );
}
