"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import Button from "./Button";

const accountReasons = ["FAKE_ACCOUNT", "SCAM", "IMPERSONATION", "INAPPROPRIATE", "HARASSMENT", "OTHER"] as const;
const advertisementReasons = ["SCAM", "MISLEADING", "INCORRECT_PRICE", "PROHIBITED", "DUPLICATE", "INAPPROPRIATE_IMAGES", "OTHER"] as const;
const commentReasons = ["SPAM", "SCAM", "HARASSMENT", "INAPPROPRIATE", "COUNTERFEIT", "OTHER"] as const;
type ReportReason = (typeof accountReasons)[number] | (typeof advertisementReasons)[number] | (typeof commentReasons)[number];

const reasonsFor = (targetType: "USER" | "AD" | "COMMENT") =>
  targetType === "USER" ? accountReasons : targetType === "AD" ? advertisementReasons : commentReasons;

type ReportDialogProps = {
  targetType: "USER" | "AD" | "COMMENT";
  targetId: number;
  open: boolean;
  onClose: () => void;
};

const ReportDialog = ({ targetType, targetId, open, onClose }: ReportDialogProps) => {
  const t = useTranslations("Report");
  const reasons = reasonsFor(targetType);
  const [reason, setReason] = useState<ReportReason>(reasons[0]);
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = () => {
    setPending(true);
    setError("");
    void apiRequest("/api/reports", {
      method: "POST",
      body: {
        targetType,
        targetId,
        reason,
        ...(description.trim() ? { description: description.trim() } : {}),
      },
    })
      .then(() => {
        setNotice(t("success"));
        setDescription("");
      })
      .catch((caught) => {
        const message = caught instanceof ApiError ? caught.message : t("error");
        setError(message === "This report is already open" ? t("duplicate") : message === "You cannot report yourself" || message.startsWith("You cannot report") ? t("own") : t("error"));
      })
      .finally(() => setPending(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
        <div className="mb-4 flex items-center gap-2">
          <Flag className="size-4" />
          <h2 className="text-lg font-semibold">{t("title")}</h2>
        </div>
        {notice ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{notice}</p> : null}
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        {!notice ? (
          <>
            <label className="mb-3 block text-sm">
              <span className="mb-1 block font-medium">{t("reason")}</span>
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value as ReportReason)}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-950"
              >
                {reasons.map((item) => (
                  <option key={item} value={item}>{t(item)}</option>
                ))}
              </select>
            </label>
            <label className="mb-4 block text-sm">
              <span className="mb-1 block font-medium">{t("description")}</span>
              <textarea
                value={description}
                maxLength={1000}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={onClose} disabled={pending} className="h-10 rounded-xl border border-zinc-200 px-4 text-sm disabled:opacity-60 dark:border-zinc-700">
                {t("cancel")}
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={submit}
                className="h-10 rounded-xl bg-zinc-900 px-4 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950"
              >
                {pending ? t("sending") : t("submit")}
              </Button>
            </div>
          </>
        ) : (
          <Button type="button" onClick={onClose} className="mt-4 h-10 rounded-xl bg-zinc-900 px-4 text-sm text-white dark:bg-zinc-100 dark:text-zinc-950">
            {t("close")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReportDialog;
