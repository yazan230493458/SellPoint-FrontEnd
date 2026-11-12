"use client";

import { useParams } from "next/navigation";
import Store from "../../../components/main/Store";
import Ad from "../../../components/main/Ad";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { triggerNotificationByPreference } from "@/utils/notifications";
import { useHydrated } from "@/lib/use-hydrated";
import { features } from "@/app/[locale]/features";

const resolveSearchTarget = (type: string, name: string) => {
  if (!type) {
    return {
      contentType: "general" as const,
      entityName: "",
    };
  }

  const typeIndicator = type.toLowerCase();
  const entityName = name ? decodeURIComponent(name) : "";

  if (
    features.stores &&
    (typeIndicator === "store" ||
      typeIndicator === "stores" ||
      typeIndicator === "bl")
  ) {
    return { contentType: "store" as const, entityName };
  }

  if (typeIndicator === "ad" || typeIndicator === "ads") {
    return { contentType: "ad" as const, entityName };
  }

  return { contentType: "general" as const, entityName };
};

export default function SearchResultPage() {
  const t = useTranslations("SearchPage");
  const params = useParams();
  const mounted = useHydrated();

  const type = (params?.type as string) || "";
  const name = (params?.name as string) || "";
  const { contentType, entityName } = resolveSearchTarget(type, name);

  const handleNewCommentNotification = async (
    commentText: string,
    commenterName: string,
  ) => {
    if (contentType === "ad") {
      await triggerNotificationByPreference(
        "reviewsAndRatings",
        t("newCommentOnAd", { entityName }),
        {
          body: `${commenterName}: ${commentText}`,
          icon: "/favicon.ico",
        },
      );
    }
  };

  if (!mounted) {
    return (
      <main className="">
        <div className="p-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center space-y-4 shadow-lg shadow-zinc-900/5 animate-pulse">
          <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </main>
    );
  }

  return (
    <main className="">
      {contentType === "store" ? (
        <Store query={`${type}/${name}`} entityName={entityName} />
      ) : contentType === "ad" ? (
        <Ad
          query={`${type}/${name}`}
          entityName={entityName}
          onCommentAdded={handleNewCommentNotification}
        />
      ) : (
        <div className="p-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center space-y-4 shadow-lg shadow-zinc-900/5">
          <div className="p-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">
            {t("searchQuery", { name: entityName || t("emptyQuery") })}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
            {t("invalidRoute", {
              storeExample: t("storeExample"),
              adExample: t("adExample"),
            })}
          </p>
        </div>
      )}
    </main>
  );
}
