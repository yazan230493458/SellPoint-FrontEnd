"use client";

import type { ComponentProps } from "react";
import { useLocale, useTranslations } from "next-intl";
import { isRtlLocale } from "@/i18n/locales";
import { CommandIcon, HomeIcon, SparklesIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import type { Section } from "../types";
import AdminNavMain from "./AdminNavMain";
import AdminNavUser from "./AdminNavUser";

type AdminAppSidebarProps = Omit<ComponentProps<typeof Sidebar>, "onSelect"> & {
  section: Section;
  onSelect: (section: Section) => void;
};

const AdminAppSidebar = ({
  section,
  onSelect,
  ...props
}: AdminAppSidebarProps) => {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const side = isRtlLocale(locale) ? "right" : "left";

  return (
    <Sidebar collapsible="offcanvas" {...props} side={side}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">{t("brand")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain section={section} onSelect={onSelect} />
        <SidebarMenu className="mt-auto px-2 pb-2">
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />} tooltip={t("backHome")}>
              <HomeIcon />
              <span>{t("backHome")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/plans" />}
              tooltip={t("premiumMember")}
            >
              <SparklesIcon />
              <span>{t("premiumMember")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminAppSidebar;
