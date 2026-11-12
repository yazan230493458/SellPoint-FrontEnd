"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/store/user.store";
import { useHydrated } from "@/lib/use-hydrated";
import { isSafeImageSrc } from "@/lib/safe-href";
import { clearAllStores } from "@/store/clear-stores";
import { apiRequest } from "@/lib/api";
import Button from "./Button";
import BaseButton from "./BaseButton";
import BaseLink from "./BaseLink";
import AccountSwitcher from "./AccountSwitcher";
import {
  actionButtons,
  authButtons,
} from "./Navbar";
import CategoriesMenu from "./CategoriesMenu";
import {
  CirclePlus,
  ChevronDown,
  MessagesCircle,
  X,
  List,
  LogOut,
  Menu,
  Bell,
  UserRound,
  Settings,
  Gem,
} from "lucide-react";
import { features } from "@/app/[locale]/features";

const linkClass =
  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800";

const MobileNav = () => {
  const t = useTranslations("HomePage.header");
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();
  const hydrated = useHydrated();
  const showAccount = hydrated && isAuthenticated;
  const [open, setOpen] = useState(false);
  const mounted = useHydrated();
  const [section, setSection] = useState<"categories" | null>(null);
  const [seenPath, setSeenPath] = useState(pathname);
  const isDesktop = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("resize", onStoreChange);
      return () => window.removeEventListener("resize", onStoreChange);
    },
    () => window.innerWidth > 768,
    () => false,
  );
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
    setSection(null);
  }

  const account = user?.settings?.account;
  const firstName = account?.firstName ?? "";
  const lastName = account?.lastName ?? "";
  const email = account?.email ?? "";
  const username = account?.username ?? "";
  const avatarUrl = isSafeImageSrc(account?.avatarUrl)
    ? account.avatarUrl
    : undefined;

  const close = () => {
    setOpen(false);
    setSection(null);
  };

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const profileMenuItems = [
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
    { href: "/settings", icon: Settings, titleKey: "settings" },
    { href: "/plans", icon: Gem, titleKey: "premium" },
  ];

  const panel = (
    <div
      className="fixed inset-0 z-100 md:hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 border-0 cursor-default"
        aria-label={t("closeMenu")}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
      />
      <div
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        className="absolute inset-y-0 inset-e-0 flex w-[min(24rem,calc(100%-1rem))] flex-col overflow-hidden rounded-s-lg border border-zinc-200 bg-white text-zinc-900 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <p className="text-base font-semibold tracking-tight">{t("menu")}</p>
          <BaseButton
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl px-0 shadow-none"
            aria-label={t("closeMenu")}
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          >
            <X className="text-xl" aria-hidden />
          </BaseButton>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {showAccount && (
            <div className="mb-1 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-200 font-bold dark:border-zinc-700 dark:bg-zinc-700">
                {avatarUrl ? (
                  avatarUrl.startsWith("data:") ? (
                    <div
                      role="img"
                      aria-label={firstName || t("user")}
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${avatarUrl})` }}
                    />
                  ) : (
                    <Image
                      src={avatarUrl}
                      alt={firstName || t("user")}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <span>
                    {(firstName || t("user")).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {firstName
                    ? `${firstName}${lastName ? ` ${lastName}` : ""}`
                    : t("user")}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {email || (username ? `@${username}` : t("user"))}
                </p>
              </div>
            </div>
          )}

          <BaseLink href="/" className={linkClass} onClick={close}>
            {t("Home")}
          </BaseLink>

          <Section
            title={t("Categories")}
            expanded={section === "categories"}
            onToggle={() =>
              setSection((current) =>
                current === "categories" ? null : "categories",
              )
            }
          >
            <CategoriesMenu
              compact
              enabled
              onNavigate={close}
            />
          </Section>

          {(user?.role === "OWNER" || user?.role === "ADMIN") && (
            <>
              <BaseLink href="/dashboard" className={linkClass}>
                {t("Dashboard")}
              </BaseLink>
            </>
          )}

          <BaseLink href="/contact" className={linkClass} onClick={close}>
            {t("Contact Us")}
          </BaseLink>

          <div className="mt-1 grid grid-cols-1 gap-2">
            {actionButtons.map((item) => {
              if (item.href === "/create-store" && !features.stores) {
                return null;
              }
              return (
                <BaseLink
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <CirclePlus className="text-lg" aria-hidden />
                  {t(item.titleKey)}
                </BaseLink>
              );
            })}
          </div>

          {showAccount ? (
            <div className="mt-1 flex flex-col gap-1 border-t border-zinc-200 pt-2 dark:border-zinc-700">
              <AccountSwitcher compact onCloseParent={close} />
              {profileMenuItems.map((item, index) => {
                if (item.href === "/my-stores" && !features.stores) {
                  return null;
                }

                const Icon = item.icon;
                return (
                  <BaseLink
                    key={item.titleKey}
                    href={item.href}
                    className={`${profileMenuItems[index].titleKey === "premium" ? "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 border border-amber-700/40 bg-amber-50 p-0 text-amber-950 hover:bg-amber-100 dark:border-amber-200/35 dark:bg-amber-950/60 dark:text-amber-50 dark:hover:bg-amber-900/70" : linkClass}`}
                    onClick={close}
                  >
                    <Icon
                      className={`${profileMenuItems[index].titleKey === "premium" ? "text-amber-700" : "text-zinc-500 dark:text-zinc-400"} text-lg text-zinc-500 dark:text-zinc-400`}
                      aria-hidden
                    />
                    {t(item.titleKey)}
                  </BaseLink>
                );
              })}
              <BaseButton
                type="button"
                variant="default"
                className="mt-1 h-12 w-full justify-start rounded-xl"
                onClick={() => {
                  void apiRequest("/api/log-out", { method: "POST", body: {} })
                    .catch(() => undefined)
                    .finally(() => {
                      clearAllStores();
                      close();
                      router.push("/");
                      window.location.reload();
                    });
                }}
              >
                <LogOut className="text-lg" aria-hidden />
                {t("logout")}
              </BaseButton>
            </div>
          ) : (
            <div className="mt-1 grid grid-cols-2 gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
              {authButtons.map((item) => {
                const Icon = item.mobileIcon;
                return (
                  <BaseLink
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors duration-200 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Icon aria-hidden />
                    {t(item.titleKey)}
                  </BaseLink>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="ms-auto flex items-center z-100 md:hidden">
      <Button
        type="button"
        className="size-10 touch-manipulation rounded-xl px-0 text-zinc-900 shadow-none hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
        aria-label={t("menu")}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log("MobileNav clicked");
          setOpen(true);
        }}
      >
        <Menu className="text-2xl" aria-hidden />
      </Button>
      {mounted && open ? createPortal(panel, document.body) : null}
    </div>
  );
};

function Section({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <BaseButton
        type="button"
        variant="ghost"
        className="h-11 w-full justify-between rounded-xl px-3 text-sm font-medium text-zinc-900 shadow-none hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span>{title}</span>
        <ChevronDown
          className={`text-base text-zinc-500 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </BaseButton>
      {expanded ? (
        <div className="flex flex-col gap-1 ps-1">{children}</div>
      ) : null}
    </div>
  );
}

export default MobileNav;
