"use client";
import React, { useState } from "react";
import Slogan from "../ui/Slogan";
import { useAsideStore } from "@/store/aside.store";
import {
  UserRound,
  House,
  Component,
  Settings,
  Store,
  ListOrdered,
  LayoutDashboard,
  MessageCircle,
  Bell,
  Gem,
} from "lucide-react";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import Button from "../ui/Button";
import CategoriesSidePanel from "@/app/[locale]/components/ui/CategoriesSidePanel";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/store/user.store";
import { useHydrated } from "@/lib/use-hydrated";
import { usePathname, useRouter } from "@/i18n/navigation";
import { features } from "@/app/[locale]/features";

const Aside = () => {
  const t = useTranslations("HomePage.aside");
  const { isOpen, openAside, closeAside } = useAsideStore();
  const { user, isAuthenticated } = useUserStore();
  const isAllowed = user?.role === "ADMIN" || user?.role === "OWNER";
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const username = user?.settings.account.username?.trim() ?? "";
  const personalHref = (section: "my-chat" | "my-notifications") => {
    if (!hydrated || !isAuthenticated) return "/log-in";
    if (!username) return "/settings/account";
    return `/${section}/${encodeURIComponent(username)}`;
  };
  const chatHref = personalHref("my-chat");
  const notificationsHref = personalHref("my-notifications");
  const settingsHref = "/settings";
  const showProfile = hydrated && isAuthenticated;

  const profileMenuItems = [
    {
      id: "profile",
      label: "profile",
      href: "/settings/account",
      icon: UserRound,
    },
    ...(features.stores
      ? [{ id: "stores", label: "myStores", href: "/my-stores", icon: Store }]
      : []),
    { id: "ads", label: "myAds", href: "/my-ads", icon: ListOrdered },
    { id: "chat", label: "myChat", href: chatHref, icon: MessageCircle },
    {
      id: "notifications",
      label: "myNotifications",
      href: notificationsHref,
      icon: Bell,
    },
    { id: "settings", label: "settings", href: settingsHref, icon: Settings },
  ];

  const navLinks = [
    { id: 1, label: "Home", href: "/", icon: House },
    { id: 2, label: "Categories", href: "/search", icon: Component },
    { id: 3, label: "Contact Us", href: "/", icon: UserRound },
    ...(isAllowed
      ? [
          {
            id: 4,
            label: "dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
          },
        ]
      : []),
  ];

  return (
    <aside
      onMouseEnter={openAside}
      onMouseLeave={() => {
        closeAside();
        setIsDropdownOpen(false);
      }}
      className={`${
        isOpen ? "md:w-64" : "md:w-20"
      } hidden md:fixed md:z-50 md:flex md:inset-s-5 md:inset-y-5 md:rounded-2xl md:transition-all md:duration-300 md:bg-zinc-100 md:dark:bg-zinc-800 md:text-zinc-900 md:dark:text-zinc-100 md:border md:border-zinc-200 md:dark:border-zinc-700/30 md:flex-col md:justify-between md:p-2.5`}
    >
      <div>
        <div className="size-11 min-w-11 md:size-15 md:min-w-15 flex justify-center items-center">
          <Slogan
            className="size-full flex justify-center items-center"
            text={false}
          />
        </div>
        <div className="flex flex-col gap-2.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isCategories = item.label === "Categories";
            const active = isCategories
              ? isCategoriesOpen ||
                pathname === "/search" ||
                pathname.startsWith("/search/")
              : item.label === "Home"
                ? pathname === "/"
                : false;
            const itemClassName = `flex h-12 w-full items-center rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 md:h-15 dark:focus-visible:ring-zinc-400 ${
              active
                ? "bg-zinc-200 text-zinc-950 dark:bg-zinc-700 dark:text-zinc-50"
                : "hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60"
            }`;
            const labelClassName = `${
              isOpen
                ? "max-w-[calc(100%-60px)] w-full opacity-100"
                : "w-0 opacity-0"
            } h-full overflow-hidden flex justify-center items-center whitespace-nowrap transition-all duration-300`;

            if (isCategories) {
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-expanded={isCategoriesOpen}
                  aria-controls="aside-categories-panel"
                  aria-label={t("Categories")}
                  onClick={() => {
                    setIsCategoriesOpen((prev) => !prev);
                    setIsDropdownOpen(false);
                  }}
                  className={itemClassName}
                >
                  <div className="size-11 min-w-11 md:size-15 md:min-w-15 flex justify-center items-center">
                    <Icon className="size-6" />
                  </div>
                  <div className={labelClassName}>{t(item.label)}</div>
                </button>
              );
            }

            return (
              <BaseLink
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={itemClassName}
              >
                <div className="size-11 min-w-11 md:size-15 md:min-w-15 flex justify-center items-center">
                  <Icon className="size-6" />
                </div>
                <div className={labelClassName}>{t(item.label)}</div>
              </BaseLink>
            );
          })}
        </div>
      </div>

      <div className="relative flex w-full flex-col gap-2">
        {showProfile ? (
          <>
            {isDropdownOpen && isOpen && (
              <div className="absolute w-70 -bottom-5 inset-s-[calc(100%+1rem)] mb-2 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl flex flex-col gap-1 z-50">
                {profileMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <BaseLink
                      key={item.id}
                      href={item.href}
                      onClick={(event) => {
                        setIsDropdownOpen(false);
                        if (
                          item.id === "settings" &&
                          window.matchMedia("(min-width: 1024px)").matches
                        ) {
                          event.preventDefault();
                          router.push("/settings/general");
                        }
                      }}
                      className="flex h-10 items-center px-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors gap-3"
                    >
                      <Icon className="size-4 text-zinc-500 dark:text-zinc-400" />
                      <span className="text-xs font-medium truncate">
                        {t(item.label)}
                      </span>
                    </BaseLink>
                  );
                })}
              </div>
            )}
            <Button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              className="flex h-12 w-full items-center rounded-xl px-0 py-0 hover:bg-zinc-200/50 md:h-15 dark:hover:bg-zinc-700/50"
            >
              <div className="size-11 min-w-11 md:size-15 md:min-w-15 flex justify-center items-center">
                <UserRound className="size-6" />
              </div>
              <div
                className={`${
                  isOpen ? "w-full opacity-100" : "w-0 opacity-0"
                } overflow-hidden flex justify-center items-center whitespace-nowrap transition-all duration-300 gap-5`}
              >
                <span className="text-sm font-medium">{t("profile")}</span>
              </div>
            </Button>
          </>
        ) : null}
        <BaseLink
          href="/plans"
          aria-label={t("premium")}
          className="overflow-hidden h-12 w-full flex rounded-xl border border-amber-700/40 bg-amber-50 p-0 text-amber-950 hover:bg-amber-100 md:h-15 dark:border-amber-200/35 dark:bg-amber-950/60 dark:text-amber-50 dark:hover:bg-amber-900/70"
        >
          <div className="flex size-11 min-w-11 items-center justify-center md:size-15 md:min-w-15">
            <Gem
              className="size-5 text-amber-700 dark:text-amber-200"
              aria-hidden
            />
          </div>
          <span
            className={`${
              isOpen
                ? "max-w-[calc(100%-60px)] w-full opacity-100"
                : "w-0 opacity-0"
            } h-full flex items-center justify-center overflow-hidden text-sm font-semibold whitespace-nowrap transition-all duration-300`}
          >
            {t("premium")}
          </span>
        </BaseLink>
      </div>

      <CategoriesSidePanel
        open={isCategoriesOpen}
        onOpenChange={setIsCategoriesOpen}
      />
    </aside>
  );
};

export default Aside;
