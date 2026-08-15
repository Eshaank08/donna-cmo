"use client";

import * as React from "react";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  WrenchIcon,
  FolderOpenIcon,
  Building2Icon,
  KeyRoundIcon,
  MegaphoneIcon,
} from "lucide-react";

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Tools",
    url: "#",
    icon: <WrenchIcon />,
    isActive: true,
    items: [
      { title: "Reel analyzer", url: "/tools/reel-analyzer" },
      { title: "Reddit radar", url: "/tools/reddit-radar" },
      { title: "Carousel", url: "/tools/carousel" },
    ],
  },
  {
    title: "Output library",
    url: "/output",
    icon: <FolderOpenIcon />,
  },
  {
    title: "Brand profile",
    url: "/brand-profile",
    icon: <Building2Icon />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <MegaphoneIcon />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Donna CMO</span>
                <span className="truncate text-xs">local &amp; open source</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/settings" />}>
              <KeyRoundIcon />
              <span>Settings &amp; keys</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
