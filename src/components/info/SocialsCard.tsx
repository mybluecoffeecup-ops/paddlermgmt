import { Share2 } from "lucide-react";

import { Card, CardHeader } from "@/components/ui/Card";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "@/components/ui/SocialIcons";

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/austchampaddleclubsg/",
    icon: InstagramIcon,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/austchampaddleclubsg/",
    icon: FacebookIcon,
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@austchampaddleclubsg",
    icon: TiktokIcon,
  },
];

export function SocialsCard() {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader title="Socials" subtitle="Follow the crew" icon={<Share2 size={16} />} />
      <div className="flex flex-1 items-center justify-center gap-3 p-4">
        {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white transition-all hover:bg-green-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <Icon size={22} />
          </a>
        ))}
      </div>
    </Card>
  );
}
