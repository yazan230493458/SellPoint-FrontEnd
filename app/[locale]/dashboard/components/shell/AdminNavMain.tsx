"use client";

import { useTranslations } from "next-intl";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sectionIcons, sections, type Section } from "../types";

type AdminNavMainProps = {
  section: Section;
  onSelect: (section: Section) => void;
};

const AdminNavMain = ({ section, onSelect }: AdminNavMainProps) => {
  const t = useTranslations("Dashboard");

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("navGroup")}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {sections.map((item) => {
            const Icon = sectionIcons[item];
            const isActive = section === item;
            return (
              <SidebarMenuItem key={item}>
                <SidebarMenuButton
                  type="button"
                  isActive={isActive}
                  tooltip={t(item)}
                  onClick={() => onSelect(item)}
                >
                  <Icon />
                  <span>{t(item)}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default AdminNavMain;
