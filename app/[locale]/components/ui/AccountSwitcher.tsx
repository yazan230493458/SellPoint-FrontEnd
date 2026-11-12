"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check, ChevronRight, Loader2, Plus, Trash2, UsersRound } from "lucide-react";
import { cn } from "cn";
import { isSafeImageSrc } from "@/lib/safe-href";
import { assetUrl } from "@/lib/api";
import {
  fetchSwitcherAccounts,
  prepareAddAnotherAccount,
  removeSwitcherAccount,
  switchAccount,
  type SwitcherAccount,
} from "@/lib/account-switcher";
import { useRouter } from "@/i18n/navigation";
import BaseButton from "./BaseButton";

type AccountSwitcherProps = {
  compact?: boolean;
  defaultOpen?: boolean;
  hideWhenEmpty?: boolean;
  showAddOption?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onCloseParent?: () => void;
  className?: string;
};

const localeLoginPath = () => {
  if (typeof window === "undefined") return "/log-in";
  const match = window.location.pathname.match(/^\/([^/]+)/);
  const locale = match?.[1];
  return locale ? `/${locale}/log-in` : "/log-in";
};

const displayName = (account: SwitcherAccount) => {
  const full = `${account.firstName} ${account.lastName}`.trim();
  return full || account.username || account.email;
};

const AccountAvatar = ({
  account,
  size = 36,
}: {
  account: SwitcherAccount;
  size?: number;
}) => {
  const src = account.avatarUrl;
  const initial =
    account.firstName?.[0]?.toUpperCase() ||
    account.username?.[0]?.toUpperCase() ||
    "?";

  return (
    <div
      className="overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 border border-zinc-300/30 dark:border-zinc-600/40 text-zinc-900 dark:text-zinc-100 font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {isSafeImageSrc(src) ? (
        src!.startsWith("data:") ? (
          <div
            role="img"
            aria-hidden
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${JSON.stringify(src)})` }}
          />
        ) : (
          <Image
            src={assetUrl(src)}
            alt=""
            width={size}
            height={size}
            className="h-full w-full object-cover"
          />
        )
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
};

const AccountSwitcher = ({
  compact = false,
  defaultOpen = false,
  hideWhenEmpty = false,
  showAddOption = true,
  onBusyChange,
  onCloseParent,
  className,
}: AccountSwitcherProps) => {
  const t = useTranslations("HomePage.header");
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [accounts, setAccounts] = useState<SwitcherAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<number | "add" | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSwitcherAccounts();
      setAccounts(data.accounts ?? []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (open || defaultOpen || hideWhenEmpty) {
      void load();
    }
  }, [open, defaultOpen, hideWhenEmpty, load]);

  useEffect(() => {
    onBusyChange?.(busyId !== null);
  }, [busyId, onBusyChange]);

  const handleSwitch = async (account: SwitcherAccount) => {
    if (account.active || busyId !== null) return;
    setBusyId(account.id);
    setError("");
    try {
      await switchAccount(account.id);
    } catch (err) {
      setBusyId(null);
      setError(err instanceof Error ? err.message : t("accountSwitchFailed"));
      void load();
    }
  };

  const handleRemove = async (account: SwitcherAccount, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (busyId !== null) return;
    setBusyId(account.id);
    setError("");
    try {
      await removeSwitcherAccount(account.id);
      if (account.active) {
        onCloseParent?.();
        router.push("/log-in");
        window.location.assign(localeLoginPath());
        return;
      }
      setAccounts((prev) => prev.filter((row) => row.id !== account.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("accountRemoveFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const handleAdd = async () => {
    if (busyId !== null) return;
    setBusyId("add");
    setError("");
    try {
      await prepareAddAnotherAccount();
      onCloseParent?.();
      router.push("/log-in");
      window.location.assign(localeLoginPath());
    } catch (err) {
      setBusyId(null);
      setError(err instanceof Error ? err.message : t("accountSwitchFailed"));
    }
  };

  if (hideWhenEmpty && loaded && !loading && accounts.length === 0) {
    return null;
  }

  if (hideWhenEmpty && !loaded) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {!defaultOpen ? (
        <button
          type="button"
          className={cn(
            "w-full h-12 rounded-2xl flex items-center justify-between gap-2.5 px-3 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 transition-colors",
            open && "bg-zinc-200/80 dark:bg-zinc-700/50",
          )}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <UsersRound
              className="text-lg shrink-0 text-zinc-500 dark:text-zinc-400"
              aria-hidden
            />
            <span className="text-sm font-medium truncate">{t("switchAccount")}</span>
          </span>
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 rtl:rotate-180",
              open && "rotate-90 rtl:rotate-90",
            )}
            aria-hidden
          />
        </button>
      ) : null}

      {(open || defaultOpen) && (
        <div
          className={cn(
            "flex flex-col gap-1.5",
            !defaultOpen && "mt-1 rounded-2xl border border-zinc-300/25 dark:border-zinc-700/30 bg-white/70 dark:bg-zinc-900/60 p-2",
            compact && "p-1.5",
          )}
        >
          {!defaultOpen ? (
            <p className="px-2 pt-1 pb-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("switchAccountTitle")}
            </p>
          ) : (
            <p className="px-1 pb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("switchAccountTitle")}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-zinc-500 dark:text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span>{t("loadingAccounts")}</span>
            </div>
          ) : accounts.length === 0 ? (
            <p className="px-2 py-3 text-sm text-zinc-500 dark:text-zinc-400">
              {t("noSavedAccounts")}
            </p>
          ) : (
            <ul className="flex flex-col gap-1" role="list">
              {accounts.map((account) => {
                const busy = busyId === account.id;
                return (
                  <li key={account.id}>
                    <div
                      className={cn(
                        "group flex items-center gap-2 rounded-xl px-2 py-2 transition-colors",
                        account.active
                          ? "bg-zinc-200/90 dark:bg-zinc-700/70 ring-1 ring-zinc-400/30 dark:ring-zinc-500/40"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/80",
                      )}
                    >
                      <button
                        type="button"
                        className="flex flex-1 items-center gap-2.5 min-w-0 text-start disabled:opacity-60"
                        disabled={account.active || busyId !== null}
                        onClick={() => void handleSwitch(account)}
                        aria-current={account.active ? "true" : undefined}
                      >
                        <AccountAvatar account={account} size={compact ? 32 : 36} />
                        <span className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {displayName(account)}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {account.username
                              ? `@${account.username}`
                              : account.email}
                          </span>
                        </span>
                        {account.active ? (
                          <span className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                            <Check className="h-3 w-3" aria-hidden />
                            {t("currentAccount")}
                          </span>
                        ) : busy ? (
                          <Loader2
                            className="h-4 w-4 shrink-0 animate-spin text-zinc-500"
                            aria-hidden
                          />
                        ) : null}
                      </button>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors disabled:opacity-40"
                        aria-label={t("removeAccount")}
                        title={t("removeAccount")}
                        disabled={busyId !== null}
                        onClick={(e) => void handleRemove(account, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {showAddOption ? (
            <BaseButton
              type="button"
              variant="ghost"
              className="mt-0.5 h-11 w-full justify-start gap-2.5 rounded-xl px-2 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              disabled={busyId !== null}
              onClick={() => void handleAdd()}
            >
              {busyId === "add" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
              <span className="text-sm font-medium">{t("addAnotherAccount")}</span>
            </BaseButton>
          ) : null}

          {error ? (
            <p role="alert" className="px-2 pb-1 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AccountSwitcher;
