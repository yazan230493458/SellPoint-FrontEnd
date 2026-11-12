"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import Button from "../ui/Button";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useUserStore } from "@/store/user.store";
import { useHydrated } from "@/lib/use-hydrated";
import { Bell, House, MessageCircle, Plus, Search } from "lucide-react";
import { features } from "@/app/[locale]/features";

const itemClass =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500";

const MobileNav = () => {
  const t = useTranslations("MobileNav");
  const pathname = usePathname();
  const { user, isAuthenticated } = useUserStore();
  const hydrated = useHydrated();
  const username = user?.settings.account.username?.trim() ?? "";
  const [createPath, setCreatePath] = useState<string | null>(null);
  const createOpen = createPath === pathname;
  const createRootRef = useRef<HTMLDivElement | null>(null);
  const createMenuId = useId();

  const personalHref = (path: "my-notifications" | "my-chat") => {
    if (!hydrated || !isAuthenticated) return "/log-in";
    if (!username) return "/settings/account";
    return `/${path}/${encodeURIComponent(username)}`;
  };

  const links = [
    {
      id: "home",
      label: t("home"),
      href: "/",
      icon: House,
      active: pathname === "/",
    },
    {
      id: "notifications",
      label: t("notifications"),
      href: personalHref("my-notifications"),
      icon: Bell,
      active: pathname.startsWith("/my-notifications"),
    },
    {
      id: "search",
      label: t("search"),
      href: "/search",
      icon: Search,
      active: pathname.startsWith("/search"),
    },
    {
      id: "messages",
      label: t("messages"),
      href: personalHref("my-chat"),
      icon: MessageCircle,
      active: pathname.startsWith("/my-chat"),
    },
  ] as const;

  useEffect(() => {
    if (!createOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!createRootRef.current?.contains(event.target as Node)) {
        setCreatePath(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCreatePath(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [createOpen]);

  const createActive =
    pathname === "/create-ad" || pathname === "/create-store";

  const tone = (active: boolean) =>
    active
      ? "text-zinc-950 dark:text-zinc-50"
      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

  return (
    <nav
      data-mobile-nav
      aria-label={t("label")}
      className="fixed inset-x-0 bottom-0 z-40 h-[var(--mobile-nav-height)] border-t border-zinc-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden dark:border-zinc-800 dark:bg-zinc-950/95"
    >
      <div className="mx-auto flex h-full max-w-lg items-stretch justify-between gap-1">
        {links.slice(0, 2).map((item) => {
          const Icon = item.icon;
          return (
            <BaseLink
              key={item.id}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`${itemClass} ${tone(item.active)}`}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="line-clamp-2 text-center">{item.label}</span>
            </BaseLink>
          );
        })}

        <div ref={createRootRef} className="relative flex min-w-0 flex-1">
          {createOpen ? (
            <div
              id={createMenuId}
              role="menu"
              className="absolute bottom-[calc(100%+0.5rem)] left-1/2 z-30 w-44 -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            >
              <BaseLink
                href="/create-ad"
                role="menuitem"
                className="flex w-full items-center px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setCreatePath(null)}
              >
                {t("createAd")}
              </BaseLink>
              {features.stores && (
                <>
                  <BaseLink
                    href="/create-store"
                    role="menuitem"
                    className="flex w-full items-center px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => setCreatePath(null)}
                  >
                    {t("createStore")}
                  </BaseLink>
                </>
              )}
            </div>
          ) : null}
          <Button
            type="button"
            aria-haspopup="menu"
            aria-expanded={createOpen}
            aria-controls={createMenuId}
            onClick={() => setCreatePath(createOpen ? null : pathname)}
            className={`${itemClass} h-auto min-h-0 w-full px-1 py-1.5 ${tone(createActive || createOpen)}`}
          >
            <Plus className="size-5 shrink-0" aria-hidden />
            <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight">
              {t("create")}
            </span>
          </Button>
        </div>

        {links.slice(2).map((item) => {
          const Icon = item.icon;
          return (
            <BaseLink
              key={item.id}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`${itemClass} ${tone(item.active)}`}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="line-clamp-2 text-center">{item.label}</span>
            </BaseLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
