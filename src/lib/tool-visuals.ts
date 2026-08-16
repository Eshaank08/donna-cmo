import {
  ClapperboardIcon,
  RadarIcon,
  ShieldCheckIcon,
  KanbanIcon,
  Mic2Icon,
  LayoutGridIcon,
  MegaphoneIcon,
  type LucideIcon,
} from "lucide-react";

export type ToolMeta = {
  slug: string;
  name: string;
  href: string;
  tagline: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

export const TOOLS: ToolMeta[] = [
  {
    slug: "reel-analyzer",
    name: "Reel analyzer",
    href: "/tools/reel-analyzer",
    tagline: "Learn from what's already working.",
    icon: ClapperboardIcon,
  },
  {
    slug: "reddit-radar",
    name: "Reddit radar",
    href: "/tools/reddit-radar",
    tagline: "Find the people already asking for you.",
    icon: RadarIcon,
  },
  {
    slug: "idea-gate",
    name: "Idea gate",
    href: "/tools/idea-gate",
    tagline: "Only make the ideas worth making.",
    icon: ShieldCheckIcon,
  },
  {
    slug: "ideation-board",
    name: "Ideation board",
    href: "/tools/ideation-board",
    tagline: "Watch every idea move from spark to posted.",
    icon: KanbanIcon,
  },
  {
    slug: "voice",
    name: "Voice",
    href: "/tools/voice",
    tagline: "Sound like you, not like an AI wrote it.",
    icon: Mic2Icon,
  },
  {
    slug: "carousel",
    name: "Carousel",
    href: "/tools/carousel",
    tagline: "Brandbook + topic → finished carousel slides.",
    icon: LayoutGridIcon,
    comingSoon: true,
  },
  {
    slug: "competitor-ads",
    name: "Competitor ads",
    href: "/tools/competitor-ads",
    tagline: "See what ads any competitor is running.",
    icon: MegaphoneIcon,
    comingSoon: true,
  },
];
