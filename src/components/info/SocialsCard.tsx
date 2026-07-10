import { ExternalLink, Share2 } from "lucide-react";

import { Card, CardHeader } from "@/components/ui/Card";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "@/components/ui/SocialIcons";

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    handle: "@austchampaddleclub",
    href: "https://instagram.com/austchampaddleclub",
    icon: InstagramIcon,
  },
  {
    name: "Facebook",
    handle: "Group",
    href: "https://facebook.com/groups/austchampaddleclub",
    icon: FacebookIcon,
  },
  {
    name: "TikTok",
    handle: "@austchampaddleclubsg",
    href: "https://tiktok.com/@austchampaddleclubsg",
    icon: TiktokIcon,
  },
];

export function SocialsCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Socials" subtitle="Follow the crew" icon={<Share2 size={16} />} />
      <ul className="divide-y divide-slate-100 dark:divide-white/10">
        {SOCIAL_LINKS.map(({ name, handle, href, icon: Icon }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-inset dark:hover:bg-white/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{name}</p>
                <p className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {handle}
                </p>
              </span>
              <ExternalLink size={15} className="shrink-0 text-slate-400" />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
