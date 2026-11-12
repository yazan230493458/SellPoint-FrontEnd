"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import BaseButton from "./BaseButton";
import Button from "./Button";
import { cn } from "cn";
import { useTranslations } from "next-intl";
import Dropdown from "../ui/Dropdown";
import { apiRequest } from "@/lib/api";
import { useUserStore } from "@/store/user.store";
import { useRouter } from "@/i18n/navigation";
import {
  CirclePlus,
  ChevronDown,
  List,
  LogOut,
  Bell,
  UserRound,
  Settings,
  Gem,
  MessagesCircle,
  LayoutGrid,
  Users,
  MessageSquare,
  Calendar,
  Megaphone,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import LanguageSwitcher from "@/app/[locale]/components/ui/LanguageSwitcher";
import AccountSwitcher from "@/app/[locale]/components/ui/AccountSwitcher";
import CategoriesMenu from "@/app/[locale]/components/ui/CategoriesMenu";
import { isSafeImageSrc } from "@/lib/safe-href";
import { useHydrated } from "@/lib/use-hydrated";
import { clearAllStores } from "@/store/clear-stores";
import { features } from "@/app/[locale]/features";

export const communityItems = [
  {
    id: 1,
    titleKey: "communityList.forums",
    href: "/search",
    icon: MessageSquare,
  },
  {
    id: 2,
    titleKey: "communityList.groups",
    href: "/search",
    icon: Users,
  },
  {
    id: 3,
    titleKey: "communityList.events",
    href: "/search",
    icon: Calendar,
  },
  {
    id: 4,
    titleKey: "communityList.announcements",
    href: "/search",
    icon: Megaphone,
  },
  {
    id: 5,
    titleKey: "communityList.support",
    href: "/search",
    icon: HelpCircle,
  },
  {
    id: 6,
    titleKey: "communityList.stories",
    href: "/search",
    icon: Sparkles,
  },
];

export const authButtons = [
  { href: "/log-in", mobileIcon: UserRound, titleKey: "login" },
  {
    href: "/registration",
    mobileIcon: CirclePlus,
    titleKey: "registration",
  },
];

export const actionButtons = [
  { href: "/create-ad", titleKey: "createAdd" },
  { href: "/create-store", titleKey: "createStore" },
];

const getUserAccount = (
  user: {
    settings?: {
      account?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        username?: string;
        avatarUrl?: string;
      };
    };
  } | null,
) => {
  return user?.settings?.account || {};
};

const Navbar = () => {
  const t = useTranslations("HomePage.header");
  const { user, isAuthenticated } = useUserStore();
  const hydrated = useHydrated();
  const showAccount = hydrated && isAuthenticated;

  const categoriesButtonRef = useRef<HTMLAnchorElement | null>(null);
  const categoriesMenuRef = useRef<HTMLDivElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const [isOpenCategories, setIsOpenCategories] = useState(false);
  const [isOpenProfile, setIsOpenProfile] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleClickOutSide = (event: MouseEvent) => {
      const target = event.target as Node | null;

      if (
        isOpenCategories &&
        categoriesButtonRef.current &&
        categoriesMenuRef.current &&
        !categoriesButtonRef.current.contains(target as Node) &&
        !categoriesMenuRef.current.contains(target as Node)
      ) {
        setIsOpenCategories(false);
      }

      if (
        isOpenProfile &&
        profileButtonRef.current &&
        profileMenuRef.current &&
        !profileButtonRef.current.contains(target as Node) &&
        !profileMenuRef.current.contains(target as Node)
      ) {
        setIsOpenProfile(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpenCategories(false);
      setIsOpenProfile(false);
    };

    window.addEventListener("click", handleClickOutSide, true);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleClickOutSide, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpenCategories, isOpenProfile]);

  const userAccount = getUserAccount(user);

  const firstName =
    typeof userAccount.firstName === "string" ? userAccount.firstName : "";
  const lastName =
    typeof userAccount.lastName === "string" ? userAccount.lastName : "";
  const email = typeof userAccount.email === "string" ? userAccount.email : "";
  const username =
    typeof userAccount.username === "string" ? userAccount.username : "";
  const avatarUrl = isSafeImageSrc(userAccount.avatarUrl)
    ? userAccount.avatarUrl
    : undefined;
  const avatarAlt = firstName || t("user");
  const renderAvatar = () =>
    avatarUrl ? (
      avatarUrl.startsWith("data:") ? (
        <div
          role="img"
          aria-label={avatarAlt}
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${avatarUrl})` }}
        />
      ) : (
        <Image
          src={avatarUrl}
          alt={avatarAlt}
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      )
    ) : null;

  const role = useUserStore((state) => state.user?.role);
  const profileMenuItems: {
    href: string;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    titleKey: string;
  }[] = [
    { href: `/profile/${username}`, icon: UserRound, titleKey: "profile" },
    { href: "/my-stores", icon: List, titleKey: "myStores" },
    { href: "/my-ads", icon: List, titleKey: "myAds" },
    {
      href: username
        ? `/my-chat/${encodeURIComponent(username)}`
        : "/settings/account",
      icon: MessagesCircle,
      titleKey: "myChat",
    },
    {
      href: username
        ? `/my-notifications/${encodeURIComponent(username)}`
        : "/settings/account",
      icon: Bell,
      titleKey: "myNotifications",
    },
    ...(role === "ADMIN" || role === "OWNER"
      ? [{ href: "/dashboard", icon: LayoutGrid, titleKey: "Dashboard" }]
      : []),
    { href: "/settings", icon: Settings, titleKey: "settings" },
    { href: "/plans", icon: Gem, titleKey: "premium" },
  ];

  return (
    <nav className="h-full flex justify-end items-center min-w-0 w-full text-zinc-900 dark:text-zinc-100">
      <ul className="hidden xl:flex h-full items-center relative gap-5 pe-5">
        <li>
          <BaseLink href="/">{t("Home")}</BaseLink>
        </li>
        <li className="relative">
          <BaseLink
            ref={categoriesButtonRef}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              setIsOpenCategories((prev) => !prev);
              setIsOpenProfile(false);
            }}
            href="#"
            className="flex items-center gap-2.5 h-full px-3 py-2 text-zinc-900 dark:text-zinc-100"
            tabIndex={0}
            role="button"
            aria-haspopup="true"
            aria-expanded={isOpenCategories}
            aria-controls="categories-dropdown"
          >
            <span>{t("Categories")}</span>
            <ChevronDown
              className={cn(
                "text-xl transition-transform duration-200",
                isOpenCategories && "rotate-180",
              )}
              aria-hidden
            />
          </BaseLink>
          <Dropdown
            ref={categoriesMenuRef}
            className={cn(
              isOpenCategories
                ? "top-[calc(100%+40px)] opacity-100 pointer-events-auto scale-100"
                : "top-[calc(100%+20px)] opacity-0 pointer-events-none scale-95",
              "absolute ltr:-right-4 rtl:-left-4 w-[min(46rem,calc(100vw-1.5rem))] max-h-[min(32rem,75vh)] overflow-y-auto p-4 sm:p-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-700/20 shadow-2xl backdrop-blur-xl rounded-2xl transition-all duration-200 z-50 origin-top",
            )}
            id="categories-dropdown"
          >
            <CategoriesMenu
              enabled
              onNavigate={() => setIsOpenCategories(false)}
            />
          </Dropdown>
        </li>
        <li>
          {(user?.role === "OWNER" || user?.role === "ADMIN") && (
            <>
              <BaseLink href="/dashboard">{t("Dashboard")}</BaseLink>
            </>
          )}
        </li>
        <li>
          <BaseLink href="/contact">{t("Contact Us")}</BaseLink>
        </li>
      </ul>
      <div className="h-full min-w-0 flex items-center gap-1 sm:gap-2 md:gap-3 relative">
        <LanguageSwitcher />
        {showAccount &&
          actionButtons.map((btn) => {
            if (btn.href === "/create-store" && !features.stores) {
              return null;
            }

            return (
              <BaseLink
                key={btn.href}
                href={btn.href}
                aria-label={t(btn.titleKey)}
                className="min-w-max px-2 py-3 flex items-center gap-2 rounded-lg text-white bg-black dark:bg-white dark:text-black"
              >
                <CirclePlus className="text-xl" aria-hidden />
                <span className="hidden sm:inline">{t(btn.titleKey)}</span>
              </BaseLink>
            );
          })}

        {showAccount ? (
          <div className="relative">
            <Button
              type="button"
              ref={profileButtonRef}
              className="h-10 flex justify-center items-center gap-2.5 px-2 shadow-none"
              onClick={() => {
                setIsOpenProfile((prev) => !prev);
                setIsOpenCategories(false);
              }}
              aria-haspopup="true"
              aria-expanded={isOpenProfile}
              aria-controls="profile-menu-dropdown"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-zinc-900 dark:text-zinc-100 font-semibold border border-zinc-300/20 dark:border-zinc-700/20">
                {renderAvatar() ? (
                  renderAvatar()
                ) : firstName ? (
                  <span>{firstName[0].toUpperCase()}</span>
                ) : (
                  <UserRound className="text-lg" aria-hidden />
                )}
              </div>
              <span className="hidden md:inline-block text-sm font-semibold max-w-[6.25rem] truncate text-zinc-900 dark:text-zinc-100">
                {firstName ? firstName : t("myAccount")}
              </span>
              <ChevronDown
                className={cn(
                  "text-zinc-500 dark:text-zinc-400 text-sm transition-transform duration-300",
                  isOpenProfile && "rotate-180",
                )}
                aria-hidden
              />
            </Button>
            <Dropdown
              ref={profileMenuRef}
              className={cn(
                isOpenProfile
                  ? "top-[calc(100%+50px)] opacity-100 pointer-events-auto scale-100"
                  : "top-[calc(100%+20px)] opacity-0 pointer-events-none scale-95",
                "w-[min(18.5rem,calc(100vw-1.5rem))] absolute ltr:right-0 rtl:left-0 transition-all duration-200 rounded-2xl p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xl border border-zinc-300/20 dark:border-zinc-700/20 z-50 flex flex-col gap-1",
              )}
              id="profile-menu-dropdown"
            >
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl mb-1 border border-zinc-300/20 dark:border-zinc-700/20 text-zinc-900 dark:text-zinc-100">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-zinc-900 dark:text-zinc-100 font-bold border border-zinc-300/20 dark:border-zinc-700/20">
                  {renderAvatar() ? (
                    renderAvatar()
                  ) : firstName ? (
                    <span>{firstName[0]?.toUpperCase()}</span>
                  ) : (
                    <span>{t("user").charAt(0)}</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {firstName
                      ? `${firstName}${lastName ? ` ${lastName}` : ""}`
                      : t("user")}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {email ? email : username ? "@" + username : t("user")}
                  </span>
                </div>
              </div>
              <AccountSwitcher
                onCloseParent={() => setIsOpenProfile(false)}
              />
              {profileMenuItems.map((item, index) => {
                if (item.href === "/my-stores" && !features.stores) {
                  return null;
                }

                const Icon = item.icon;
                return (
                  <BaseLink
                    key={item.titleKey}
                    href={item.href}
                    className={`${profileMenuItems[index].titleKey === "premium" ? "border border-amber-700/40 bg-amber-50 p-0 text-amber-950 hover:bg-amber-100 dark:border-amber-200/35 dark:bg-amber-950/60 dark:text-amber-50 dark:hover:bg-amber-900/70" : "text-zinc-900 hover:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-zinc-700/60"} h-12 w-full flex items-center justify-start gap-2.5 rounded-2xl bg-transparent px-3 `}
                  >
                    <Icon
                      className={`${profileMenuItems[index].titleKey === "premium" ? "text-amber-700" : "text-zinc-500 dark:text-zinc-400"} text-lg shrink-0`}
                      aria-hidden
                    />
                    <span>{t(item.titleKey)}</span>
                  </BaseLink>
                );
              })}
              <hr className="my-1 border-zinc-300/20 dark:border-zinc-700/20" />
              <BaseButton
                type="button"
                variant="default"
                className="w-full h-12 rounded-2xl flex justify-start items-center text-center gap-2.5"
                onClick={() => {
                  void apiRequest("/api/log-out", { method: "POST", body: {} })
                    .catch(() => undefined)
                    .finally(() => {
                      clearAllStores();
                      setIsOpenProfile(false);
                      router.push("/");
                      window.location.reload();
                    });
                }}
              >
                <LogOut className="text-lg" aria-hidden />
                <span>{t("logout")}</span>
              </BaseButton>
            </Dropdown>
          </div>
        ) : (
          <>
            {authButtons.map((btn) => {
              const MobileIcon = btn.mobileIcon;
              return (
                <BaseLink
                  key={btn.href}
                  href={btn.href}
                  className={"h-9 sm:h-10 px-2 sm:px-3 py-2"}
                >
                  <MobileIcon className="sm:hidden" aria-hidden />
                  <span className="hidden sm:inline">{t(btn.titleKey)}</span>
                </BaseLink>
              );
            })}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
