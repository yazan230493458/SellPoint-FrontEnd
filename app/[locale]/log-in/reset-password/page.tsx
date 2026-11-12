import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import Header from "../../components/main/Header";
import ResetPasswordForm from "./reset-password-form";

const ResetPasswordPage = async () => {
  const t = await getTranslations("ResetPasswordPage");

  return (
    <div className="min-h-dvh bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <Header className="fixed inset-x-3 top-5 flex h-20 justify-between rounded-xl border border-zinc-200 bg-zinc-100 px-5 py-2.5 dark:border-zinc-700/30 dark:bg-zinc-800" />
      <main className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 pb-8 pt-28 sm:px-6 sm:pt-36 lg:px-8">
        <div className="flex w-full max-w-xl flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="text-sm leading-7 text-zinc-500 sm:text-base dark:text-zinc-400">{t("description")}</p>
        </div>
        <Suspense fallback={<div className="h-40 w-full max-w-150 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
