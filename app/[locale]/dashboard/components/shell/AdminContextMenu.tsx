"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCopy,
  Link2,
  RefreshCw,
  RotateCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import type { Section } from "../types";
import { sections } from "../types";

type MenuPosition = { x: number; y: number };

type AdminContextMenuProps = {
  children: ReactNode;
  section: Section;
  onRefresh: () => void;
  onSelectSection: (section: Section) => void;
};

const MENU_WIDTH = 240;

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
};

const AdminContextMenu = ({
  children,
  section,
  onRefresh,
  onSelectSection,
}: AdminContextMenuProps) => {
  const t = useTranslations("Dashboard");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [hasSelection, setHasSelection] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useLayoutEffect(() => {
    if (!open || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const padding = 8;
    let nextX = position.x;
    let nextY = position.y;
    if (nextX + rect.width > window.innerWidth - padding) {
      nextX = Math.max(padding, window.innerWidth - rect.width - padding);
    }
    if (nextY + rect.height > window.innerHeight - padding) {
      nextY = Math.max(padding, window.innerHeight - rect.height - padding);
    }
    if (nextX !== position.x || nextY !== position.y) {
      setPosition({ x: nextX, y: nextY });
    }
  }, [open, position.x, position.y]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) close();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [close, open]);

  const onContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isEditableTarget(event.target)) return;
    event.preventDefault();
    const selection = window.getSelection()?.toString() ?? "";
    setHasSelection(Boolean(selection.trim()));
    const navigation = (
      window as Window & {
        navigation?: { canGoBack?: boolean; canGoForward?: boolean };
      }
    ).navigation;
    setCanGoBack(navigation?.canGoBack ?? window.history.length > 1);
    setCanGoForward(navigation?.canGoForward ?? false);
    setPosition({ x: event.clientX, y: event.clientY });
    setOpen(true);
  };

  const copySelectedText = async () => {
    const text = window.getSelection()?.toString() ?? "";
    if (!text.trim() || !navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(text);
    close();
  };

  const copyPageUrl = async () => {
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(window.location.href);
    close();
  };

  return (
    <div className="relative min-h-svh w-full" onContextMenu={onContextMenu}>
      {children}
      {open ? (
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-100 min-w-56 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg"
          style={{
            left: position.x,
            top: position.y,
            width: MENU_WIDTH,
          }}
        >
          <MenuItem
            icon={<RefreshCw className="size-4" />}
            label={t("contextRefreshData")}
            onSelect={() => {
              onRefresh();
              close();
            }}
          />
          <MenuItem
            icon={<RotateCw className="size-4" />}
            label={t("contextReloadPage")}
            onSelect={() => {
              window.location.reload();
            }}
          />
          <MenuItem
            icon={<ClipboardCopy className="size-4" />}
            label={t("contextCopySelection")}
            disabled={!hasSelection}
            onSelect={() => {
              void copySelectedText();
            }}
          />
          <MenuItem
            icon={<Link2 className="size-4" />}
            label={t("contextCopyUrl")}
            onSelect={() => {
              void copyPageUrl();
            }}
          />
          <div className="my-1 h-px bg-border" />
          <MenuItem
            icon={<ArrowLeft className="size-4" />}
            label={t("contextGoBack")}
            disabled={!canGoBack}
            onSelect={() => {
              window.history.back();
              close();
            }}
          />
          <MenuItem
            icon={<ArrowRight className="size-4" />}
            label={t("contextGoForward")}
            disabled={!canGoForward}
            onSelect={() => {
              window.history.forward();
              close();
            }}
          />
          <div className="my-1 h-px bg-border" />
          <p className="px-2 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {t("contextSections")}
          </p>
          {sections
            .filter((item) =>
              [
                "overview",
                "reports",
                "payments",
                "subscriptions",
                "users",
              ].includes(item),
            )
            .map((item) => (
              <MenuItem
                key={item}
                label={t(item)}
                active={section === item}
                onSelect={() => {
                  onSelectSection(item);
                  close();
                }}
              />
            ))}
        </div>
      ) : null}
    </div>
  );
};

type MenuItemProps = {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  active?: boolean;
};

const MenuItem = ({
  label,
  onSelect,
  icon,
  disabled,
  active,
}: MenuItemProps) => (
  <button
    type="button"
    role="menuitem"
    disabled={disabled}
    className={cn(
      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm transition-colors",
      active ? "bg-muted font-medium" : "hover:bg-muted",
      disabled && "pointer-events-none opacity-40",
    )}
    onClick={onSelect}
  >
    {icon}
    <span className="truncate">{label}</span>
  </button>
);

export default AdminContextMenu;
