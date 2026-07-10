import { sponsorInitials } from "@/components/info/sponsors-data";
import { cn } from "@/lib/utils";

// Real logo when available (white chip so both transparent- and
// solid-background source images read consistently in dark mode); falls
// back to a monogram chip, same treatment as the SocialsCard icon chips.
export function SponsorLogo({
  name,
  logoSrc,
  className,
}: {
  name: string;
  logoSrc?: string;
  className?: string;
}) {
  if (logoSrc) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt={`${name} logo`} className="h-full w-full object-contain p-1" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-green-700 font-bold text-white",
        className
      )}
    >
      {sponsorInitials(name)}
    </span>
  );
}
