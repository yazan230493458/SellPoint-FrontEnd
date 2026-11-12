"use client";

import { useLocale, useTranslations } from "next-intl";
import { isRtlLocale } from "@/i18n/locales";
import {
  BellIcon,
  CircleUserRoundIcon,
  EllipsisVerticalIcon,
  LogOutIcon,
  Settings2Icon,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "@/i18n/navigation";
import { apiRequest } from "@/lib/api";
import { isSafeImageSrc } from "@/lib/safe-href";
import { clearAllStores } from "@/store/clear-stores";
import { useUserStore } from "@/store/user.store";

const AdminNavUser = () => {
  const t = useTranslations("Dashboard");
  const tHeader = useTranslations("HomePage.header");
  const locale = useLocale();
  const { isMobile } = useSidebar();
  const router = useRouter();
  const menuSide = isRtlLocale(locale) ? "left" : "right";
  const user = useUserStore((state) => state.user);
  const account = user?.settings.account;
  const firstName = account?.firstName?.trim() ?? "";
  const lastName = account?.lastName?.trim() ?? "";
  const username = account?.username?.trim() ?? "";
  const email = account?.email?.trim() ?? "";
  const avatarUrl = account?.avatarUrl?.trim() ?? "";
  const displayName =
    firstName || lastName
      ? `${firstName}${lastName ? ` ${lastName}` : ""}`.trim()
      : username || tHeader("user");
  const initials = (displayName[0] ?? "A").toUpperCase();
  const safeAvatar = isSafeImageSrc(avatarUrl) ? avatarUrl : "";

  const logout = () => {
    void apiRequest("/api/log-out", { method: "POST", body: {} })
      .catch(() => undefined)
      .finally(() => {
        clearAllStores();
        router.push("/");
        window.location.reload();
      });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg grayscale">
              {safeAvatar ? <AvatarImage src={safeAvatar} alt={displayName} /> : null}
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs text-foreground/70">
                {email || (username ? `@${username}` : tHeader("user"))}
              </span>
            </div>
            <EllipsisVerticalIcon className="ms-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : menuSide}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                  <Avatar className="size-8">
                    {safeAvatar ? (
                      <AvatarImage src={safeAvatar} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {email || (username ? `@${username}` : tHeader("user"))}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    username ? `/profile/${username}` : "/settings/account",
                  )
                }
              >
                <CircleUserRoundIcon />
                {tHeader("profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings/general")}>
                <Settings2Icon />
                {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    username
                      ? `/my-notifications/${encodeURIComponent(username)}`
                      : "/settings/account",
                  )
                }
              >
                <BellIcon />
                {tHeader("myNotifications")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOutIcon />
              {tHeader("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default AdminNavUser;
