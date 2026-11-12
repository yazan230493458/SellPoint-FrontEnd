"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import Header from "../components/main/Header";
import Button from "../components/ui/Button";
import { apiRequest, ApiError } from "@/lib/api";

const ContactPage = () => {
  const t = useTranslations("ContactPage");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setNotice("");
    setError("");
    void apiRequest("/api/contact", {
      method: "POST",
      body: { name, email, subject, message },
    })
      .then(() => {
        setNotice(t("success"));
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      })
      .catch((caught) => {
        setError(caught instanceof ApiError && caught.status === 409 ? t("duplicate") : t("error"));
      })
      .finally(() => setPending(false));
  };

  const fieldClass = "h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

  return (
    <>
      <Header className="fixed inset-x-3 top-5 z-40 rounded-2xl border border-zinc-200 bg-white/90 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90" />
      <main className="min-h-dvh bg-zinc-50 px-4 pt-32 pb-24 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <form onSubmit={submit} className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Mail className="size-5" />
            <h1 className="text-2xl font-bold">{t("title")}</h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>
          {notice ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{notice}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <label className="text-sm font-medium">
            {t("name")}
            <input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className={`mt-1 ${fieldClass}`} />
          </label>
          <label className="text-sm font-medium">
            {t("email")}
            <input required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className={`mt-1 ${fieldClass}`} />
          </label>
          <label className="text-sm font-medium">
            {t("subject")}
            <input required minLength={3} maxLength={120} value={subject} onChange={(event) => setSubject(event.target.value)} className={`mt-1 ${fieldClass}`} />
          </label>
          <label className="text-sm font-medium">
            {t("message")}
            <textarea required minLength={10} maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1 min-h-36 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
          </label>
          <Button type="submit" disabled={pending} className="h-12 rounded-xl bg-zinc-900 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950">
            {pending ? t("sending") : t("submit")}
          </Button>
        </form>
      </main>
    </>
  );
};

export default ContactPage;
