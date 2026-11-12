"use client";

import { useTranslations } from "next-intl";

const steps = ["step1", "step2", "step3"] as const;

const HowItWorks = () => {
  const t = useTranslations("HomePage.home");

  return (
    <section className="w-full max-w-5xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t("howTitle")}
        </h2>
        <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          {t("howDescription")}
        </p>
      </div>
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step}
            className="group relative rounded-2xl border border-zinc-200 bg-white p-6 text-start shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-zinc-100 font-semibold text-zinc-900 transition-colors duration-200 group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-950">
                0{index + 1}
              </span>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {t(`${step}Title`)}
            </h3>
            <p className="mt-2 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
              {t(`${step}Description`)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default HowItWorks;