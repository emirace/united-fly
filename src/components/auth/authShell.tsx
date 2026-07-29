import Image from "next/image";
import Link from "next/link";
import IMAGES from "@/lib/images";

/**
 * Split-screen frame shared by sign in and sign up: photography and pitch on
 * the left, the form on the right.
 */
export default function AuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={IMAGES.hero}
          alt="Aircraft"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-160 from-ink/55 to-ink/90" />

        <div className="relative flex h-full flex-col justify-between p-11">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={IMAGES.logo}
              alt="United Fly Airlines"
              width={110}
              height={32}
              className="h-8 w-auto"
            />
            <span className="font-display text-[15px] font-semibold">
              United Fly Airlines
            </span>
          </Link>

          <div>
            <h2 className="m-0 mb-3.5 max-w-[22ch] text-[40px] leading-[1.06] font-semibold">
              Every trip, boarding pass and receipt in one place.
            </h2>
            <p className="m-0 max-w-[42ch] text-[15px] leading-relaxed text-muted">
              MileClub members get 2× miles, free seat selection and priority
              support.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[400px]">
          <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
            <Image
              src={IMAGES.logo}
              alt="United Fly Airlines"
              width={110}
              height={32}
              className="h-8 w-auto"
            />
            <span className="font-display text-[15px] font-semibold">
              United Fly
            </span>
          </Link>

          {children}

          <p className="mt-7 text-center text-xs text-faint">
            © 2026 United Fly Airlines
          </p>
        </div>
      </div>
    </div>
  );
}
