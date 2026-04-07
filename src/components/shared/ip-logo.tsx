"use client";

import Image from "next/image";

/** Known IP holders mapped to local logo files in public/images/ip-logos/ */
const IP_LOGOS: Record<string, string> = {
  marvel: "/images/ip-logos/marvel.svg",
  dc: "/images/ip-logos/dc.svg",
  "dc comics": "/images/ip-logos/dc.svg",
  "star wars": "/images/ip-logos/star-wars.svg",
  disney: "/images/ip-logos/disney.svg",
  "warner bros": "/images/ip-logos/warner-bros.svg",
  bandai: "/images/ip-logos/bandai.svg",
  hasbro: "/images/ip-logos/hasbro.svg",
};

interface IPLogoProps {
  /** IP holder/universe name, e.g. "Marvel", "DC Comics" */
  ip: string;
  /** Logo URL override from database (ip_roster.logo_url) */
  logoUrl?: string | null;
  /** Size in pixels (square) */
  size?: number;
  className?: string;
}

export function IPLogo({ ip, logoUrl, size = 24, className }: IPLogoProps) {
  // Try database URL first, then known logos map
  const src = logoUrl || IP_LOGOS[ip.toLowerCase()] || null;

  if (src) {
    return (
      <Image
        src={src}
        alt={ip}
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  }

  // Fallback: text badge
  const initials = ip
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold ${className ?? ""}`}
      style={{ width: size, height: size, minWidth: size }}
    >
      {initials}
    </span>
  );
}
