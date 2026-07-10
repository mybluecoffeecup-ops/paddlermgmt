// `logoSrc` points into `public/sponsors/` (falls back to a monogram chip in
// the tile/drawer when unset — Hipstercity has no logo file yet).
export interface Sponsor {
  name: string;
  slug: string;
  summary: string;
  details: string[];
  website?: string;
  logoSrc?: string;
}

export const SPONSORS: Sponsor[] = [
  {
    name: "Lion Brewery",
    slug: "lion-brewery",
    summary: "15% off",
    details: ["15% off at Lion Brewery Co."],
    website: "https://lionbreweryco.com",
    logoSrc: "/sponsors/lion-brewery.webp",
  },
  {
    name: "The Muscle Lab",
    slug: "the-muscle-lab",
    summary: "15% off services",
    details: [
      "15% off all services — code AUSTCHAM2026 (excludes Nordic Dip à la carte).",
      "## 60-Minute Package Deal — code DFE4332F",
      "- 15 × 60min sessions shared among the team",
      "- $100 per 60min booking (~23% off retail price)",
      "- Strictly for current Austcham members only",
      "## How to book",
      "- Inform Lilian ahead of your intent to book",
      "- Book at themusclelabsg.com",
      "- At the final booking page, enter code DFE4332F",
      '- Once confirmed, pay $100 to AUSTCHAM UEN T19SS0248D, remark "MUSCLELAB" + appointment date',
      "- Send your payment screenshot to Lilian",
      "- Bonus: snap a photo with your therapist and share on IG, tagging APC & Muscle Lab",
    ],
    website: "https://www.themusclelabsg.com",
    logoSrc: "/sponsors/the-muscle-lab.jpeg",
  },
  {
    name: "Simply Active",
    slug: "simply-active",
    summary: "15% off",
    details: ["15% off — code AUSTCHAMPADDLE15."],
    website: "https://simplyactive.asia/",
    logoSrc: "/sponsors/simply-active.jpeg",
  },
  {
    name: "Pay2Home",
    slug: "pay2home",
    summary: "Free transfers",
    details: [
      "Free money transfers to Australia, Bangladesh, India, Indonesia, Malaysia, New Zealand, Philippines, Korea, Thailand & Vietnam — code PaddleFree.",
    ],
    website: "https://pay2home.com",
    logoSrc: "/sponsors/pay2home.png",
  },
  {
    name: "Siloso Beach Resort",
    slug: "siloso-beach-resort",
    summary: "20% off dining",
    details: ["20% off à la carte menu.", "Discounted continental breakfast at $15/pax."],
    logoSrc: "/sponsors/siloso-beach-resort.jpeg",
  },
  {
    name: "Sunday Shades",
    slug: "sunday-shades",
    summary: "10% off",
    details: ["10% off — code AUSTCHAM10."],
    website: "https://sundayshades.co/",
    logoSrc: "/sponsors/sunday-shades.jpeg",
  },
  {
    name: "Hipstercity",
    slug: "hipstercity",
    summary: "10% off",
    details: ["10% off — code PROMO10."],
    website: "https://hipstercity.rocks/",
  },
];

export function sponsorInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
