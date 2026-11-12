"use client";

import React, { useEffect, useId, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import GreatInput from "./GreatInput";
import { motion } from "motion/react";
import NormalButton from "./BaseButton";
import { useTranslations } from "next-intl";
import { useWindowStore } from "@/store/window.store";

interface WindowProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  title?: string;
  description?: string;
  label?: string;
  show?: boolean;
  presenceOfInput?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickForButton?: () => void;
  onClose?: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";
}

type WindowLayout = {
  mobile: boolean;
  bottom: number;
  maxHeight: number;
};

function measureWindowLayout(): WindowLayout {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const nav = document.querySelector("[data-mobile-nav]");
  const navHeight =
    mobile && nav instanceof HTMLElement ? nav.getBoundingClientRect().height : 0;
  const viewport = window.visualViewport;
  const viewportHeight = viewport?.height ?? window.innerHeight;
  const keyboardInset = viewport
    ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
    : 0;
  const occupied = mobile ? Math.max(navHeight, keyboardInset) : 0;
  const bottom = mobile ? occupied + 12 : 0;
  const maxHeight = mobile
    ? Math.max(220, viewportHeight - bottom - 12)
    : Math.max(220, window.innerHeight - 32);

  return { mobile, bottom, maxHeight };
}

const Window = React.forwardRef<HTMLDivElement, WindowProps>(
  (
    {
      className = "",
      title: propTitle,
      description: propDescription,
      label: propLabel,
      show: propShow,
      presenceOfInput,
      value: propValue,
      onChange,
      onClickForButton,
      onClose: propOnClose,
      cancelText,
      confirmText,
      confirmVariant = "outline",
    },
    ref,
  ) => {
    const t = useTranslations("Common");
    const store = useWindowStore();
    const titleId = useId();
    const descriptionId = useId();
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const resolvedCancelText = cancelText ?? t("cancel");
    const resolvedConfirmText = confirmText ?? t("save");

    const title = propTitle ?? store.title;
    const description = propDescription ?? store.description;
    const open = propShow ?? store.open;
    const input = presenceOfInput ?? store.input;
    const label = propLabel ?? store.label;
    const value = propValue ?? store.value;
    const onClose = propOnClose ?? store.onClose;
    const confirmDisabled = Boolean(input && !value?.trim());

    const [layout, setLayout] = React.useState<WindowLayout | null>(null);

    useLayoutEffect(() => {
      if (!open) {
        setLayout(null);
        return;
      }

      const update = () => setLayout(measureWindowLayout());
      update();

      window.addEventListener("resize", update);
      window.visualViewport?.addEventListener("resize", update);
      window.visualViewport?.addEventListener("scroll", update);

      return () => {
        window.removeEventListener("resize", update);
        window.visualViewport?.removeEventListener("resize", update);
        window.visualViewport?.removeEventListener("scroll", update);
      };
    }, [open]);

    useEffect(() => {
      if (!open) return;

      const previouslyFocused = document.activeElement as HTMLElement | null;
      const dialog = dialogRef.current;
      dialog?.focus();

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose?.();
        }
      };

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKeyDown);

      return () => {
        document.body.style.overflow = previousOverflow;
        document.removeEventListener("keydown", onKeyDown);
        previouslyFocused?.focus?.();
      };
    }, [open, onClose]);

    if (!open || !layout || typeof document === "undefined") return null;

    const setRefs = (node: HTMLDivElement | null) => {
      dialogRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    return createPortal(
      <div className="fixed inset-0 z-[60] pointer-events-none">
        <button
          type="button"
          aria-label={resolvedCancelText}
          className="pointer-events-auto absolute inset-x-0 top-0 bg-black/40 dark:bg-black/60"
          style={{ bottom: layout.mobile ? layout.bottom - 12 : 0 }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          className={`${className} pointer-events-auto fixed z-[60] flex w-auto flex-col gap-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-2xl outline-none sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 md:left-1/2 md:top-1/2 md:w-[min(28rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2`}
          style={
            layout.mobile
              ? {
                  left: "0.75rem",
                  right: "0.75rem",
                  bottom: layout.bottom,
                  maxHeight: layout.maxHeight,
                }
              : { maxHeight: layout.maxHeight }
          }
          ref={setRefs}
        >
          <div className="flex w-full min-w-0 flex-col gap-2">
            <h1 id={titleId} className="text-xl font-semibold tracking-tight">
              {title}
            </h1>
            {description ? (
              <p
                id={descriptionId}
                className="text-sm leading-6 text-zinc-500 dark:text-zinc-400"
              >
                {description}
              </p>
            ) : null}
          </div>

          {input ? (
            <div className="min-h-0 overflow-y-auto">
              <GreatInput
                label={label}
                value={value}
                onChange={onChange}
                type="password"
              />
            </div>
          ) : null}

          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <NormalButton type="button" variant="ghost" onClick={onClose}>
              {resolvedCancelText}
            </NormalButton>
            <NormalButton
              type="button"
              variant={confirmVariant}
              onClick={onClickForButton}
              disabled={confirmDisabled}
            >
              {resolvedConfirmText}
            </NormalButton>
          </div>
        </motion.div>
      </div>,
      document.body,
    );
  },
);

Window.displayName = "Window";

export default Window;
