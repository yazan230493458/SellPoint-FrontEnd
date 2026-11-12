"use client";

import React, { ComponentPropsWithoutRef } from "react";
import { CircleAlert } from "lucide-react";
import { motion, HTMLMotionProps } from "motion/react";
import { useAlertStore } from "@/store/alert.store";

interface AlertProps extends Omit<HTMLMotionProps<"div">, "title"> {
  title?: string;
  des?: string;
  show?: boolean;
  setShow?: () => void;
  iconProps?: ComponentPropsWithoutRef<typeof CircleAlert>;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({
  title: propTitle,
  des: propDes,
  show: propShow,
  setShow: propSetShow,
  iconProps,
  duration = 5,
  className = "",
  ...props
}) => {
  const store = useAlertStore();
  const title = propTitle ?? store.title;
  const description = propDes ?? store.description;
  const open = propShow ?? store.open;
  const onClose = propSetShow ?? store.onClose;

  React.useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      onClose();
    }, duration * 1000);

    return () => clearTimeout(timeout);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: "0%", opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      className={`w-[calc(100%-2rem)] max-w-80 rounded-2xl p-4 fixed top-3 inset-s-3 sm:top-5 sm:inset-s-5 z-50 border border-zinc-300/30 dark:border-zinc-700/30 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-md overflow-hidden ${className}`}
      {...props}
    >
      <div className="flex items-center gap-4">
        <CircleAlert
          {...iconProps}
          className={`${iconProps?.className || ""}`}
        />

        <div className="flex flex-col justify-center items-start">
          {title && (
            <h1 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
      </div>

      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration, ease: "linear" }}
        className="absolute bottom-0 inset-x-0 h-1 bg-black dark:bg-white origin-left"
      />
    </motion.div>
  );
};

export default Alert;
