"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAdStore } from "@/store/ad.store";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCatalogLabel } from "@/lib/use-catalog-label";
import Header from "./Header";
import Alert from "../ui/Alert";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import { useFavoritesStore } from "@/store/favorites.store";
import { useAlertStore } from "@/store/alert.store";
import {
  MapPin,
  Tag,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  ShieldCheck,
  Calendar,
  UserCheck,
  ChevronRight,
  Eye,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Info,
  MessageSquare,
  Send,
  Flag,
  Pencil,
  Trash2,
} from "lucide-react";
import NormalButton from "../ui/BaseButton";
import Button from "../ui/Button";
import { useUserStore } from "@/store/user.store";
import { useHydrated } from "@/lib/use-hydrated";
import { isSafeImageSrc } from "@/lib/safe-href";
import { apiRequest } from "@/lib/api";
import { formatPrice } from "@/lib/format-price";
import { formatDate } from "@/lib/intl-format";
import { getLocaleIntl } from "@/i18n/locales";
import ReportDialog from "../ui/ReportDialog";
import { toAdSteps, type ApiAd } from "@/lib/ads";
import type { Steps } from "@/store/ad.store";

type ViewerReaction = "LIKE" | "DISLIKE" | null;

const formatRating = (value: number) =>
  Number.isFinite(value) ? value.toFixed(1) : "0.0";

const formatCreatedAt = (value: string, locale: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = new Intl.DateTimeFormat(getLocaleIntl(locale), {
    month: "long",
  }).format(date);
  return `${day} ${month} ${date.getFullYear()}`;
};

function AdPhoto({
  src,
  alt,
  priority = false,
  className = "object-cover",
}: {
  src: string | undefined;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const safe = isSafeImageSrc(src) ? src : "/placeholder.png";

  if (safe.startsWith("data:image/")) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 h-full w-full bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${safe})` }}
      />
    );
  }

  return (
    <Image
      src={safe}
      alt={alt}
      fill
      priority={priority}
      unoptimized
      className={className}
    />
  );
}

interface AdProps {
  query?: string;
  entityName?: string;
  onCommentAdded?: (commentText: string, commenterName: string) => void;
}

interface CommentItem {
  id: number;
  userId: number;
  author: string;
  text: string;
  date: string;
}

const Ad: React.FC<AdProps> = ({ entityName, onCommentAdded }) => {
  const t = useTranslations("AdPage");
  const locale = useLocale();
  const router = useRouter();
  const catalogLabel = useCatalogLabel();
  const { user, isAuthenticated } = useUserStore();
  const mounted = useHydrated();
  const ads = useAdStore((state) => state.ads);
  const { setTitle, setDescription, onOpen } = useAlertStore();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [remoteAd, setRemoteAd] = useState<Steps | null>(null);
  const [loadedName, setLoadedName] = useState<string | null>(null);
  const lookup = entityName && loadedName !== entityName ? "loading" : "done";
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [viewerReaction, setViewerReaction] = useState<ViewerReaction>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [adRating, setAdRating] = useState(0);
  const [reacting, setReacting] = useState(false);
  const [featuredActive, setFeaturedActive] = useState(false);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [reportTarget, setReportTarget] = useState<{ type: "AD" | "USER" | "COMMENT"; id: number } | null>(null);

  const currentAd = React.useMemo(() => {
    if (remoteAd) return remoteAd;
    if (!entityName) return ads[0];
    const decodedName = decodeURIComponent(entityName).toLowerCase();
    return ads.find((item) => {
      const uName = (item.username || "").toLowerCase();
      const aName = (item.step1?.adName || "").toLowerCase();
      return (
        uName === decodedName ||
        aName === decodedName ||
        item.id.toString() === decodedName
      );
    });
  }, [ads, entityName, remoteAd]);

  useEffect(() => {
    if (!entityName) return;
    let cancelled = false;
    const numeric = /^\d+$/.test(entityName);
    const path = numeric
      ? `/api/ads/${entityName}`
      : `/api/ads/lookup?name=${encodeURIComponent(decodeURIComponent(entityName))}`;
    void apiRequest<{ ad: ApiAd }>(path, { auth: false })
      .then(async (result) => {
        if (cancelled) return;
        setRemoteAd(toAdSteps(result.ad));
        setViewCount(result.ad.views ?? 0);
        setLikeCount(result.ad.likes ?? 0);
        setDislikeCount(result.ad.dislikes ?? 0);
        setViewerReaction(result.ad.viewerReaction ?? null);
        setCreatedAt(result.ad.createdAt ?? null);
        setAdRating(result.ad.rating ?? 0);
        setFeaturedActive(Boolean(result.ad.featuredActive));
        setSellerId(result.ad.userId ?? null);
        setLoadedName(entityName);
        void apiRequest<{ counted?: boolean }>(`/api/ads/${result.ad.id}/view`, {
          method: "POST",
        })
          .then((view) => {
            if (!cancelled && view.counted) {
              setViewCount((current) => (current ?? 0) + 1);
            }
          })
          .catch(() => undefined);
        const commentResult = await apiRequest<{
          comments: Array<{
            id: number;
            text: string;
            createdAt: string;
            user: { id: number; username: string };
          }>;
        }>(`/api/ads/${result.ad.id}/comments`, { auth: false });
        if (!cancelled) {
          setComments(
            commentResult.comments.map((comment) => ({
              id: comment.id,
              userId: comment.user.id,
              author: comment.user.username,
              text: comment.text,
              date: formatDate(comment.createdAt, locale),
            })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setLoadedName(entityName);
      });
    return () => {
      cancelled = true;
    };
  }, [entityName]);

  const [pickedImage, setPickedImage] = useState<{
    adId: string | number;
    index: number;
  } | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const checkIsFavorite = useFavoritesStore((state) => state.isFavorite);

  const isFavorite = currentAd ? checkIsFavorite(currentAd.id) : false;
  const gallery = currentAd?.step2?.images ?? [];
  const preferredIndex = gallery[currentAd?.step2?.mainImageIndex ?? -1]
    ? (currentAd?.step2?.mainImageIndex ?? 0)
    : 0;
  const selectedImageIndex =
    pickedImage &&
    currentAd &&
    pickedImage.adId === currentAd.id &&
    gallery[pickedImage.index]
      ? pickedImage.index
      : preferredIndex;

  if (!mounted || (lookup === "loading" && !currentAd)) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-5 bg-white dark:bg-zinc-950">
        <div className="animate-pulse w-full max-w-md p-10 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl h-64" />
      </div>
    );
  }

  if (!currentAd) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Header className="fixed top-4 z-50 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-md" />
        <div className="flex-1 flex items-center justify-center p-5 pt-32">
          <div className="flex flex-col items-center gap-5 text-center max-w-md p-10 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="p-4 rounded-2xl bg-red-500/10 text-red-500">
              <Info className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold">{t("notFoundTitle")}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("notFoundDescription")}
            </p>
            <BaseLink
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm transition-all hover:opacity-90 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("backToSearch")}</span>
            </BaseLink>
          </div>
        </div>
      </div>
    );
  }

  const { step1, step2, step3 } = currentAd;
  const ownerUsername = user?.settings.account.username?.trim() ?? "";
  const sellerName = currentAd.username?.trim() ?? "";
  const chatHref = !isAuthenticated
    ? "/log-in"
    : ownerUsername
      ? sellerName
        ? `/my-chat/${encodeURIComponent(ownerUsername)}?with=${encodeURIComponent(sellerName)}`
        : `/my-chat/${encodeURIComponent(ownerUsername)}`
      : "/settings/account";
  const phoneDigits = (step1?.mobileNumber ?? "").replace(/[^\d+]/g, "");
  const whatsAppDigits = (step1?.mobileNumber ?? "").replace(/\D/g, "");
  const phoneHref = phoneDigits ? `tel:${phoneDigits}` : "";
  const whatsAppHref = whatsAppDigits ? `https://wa.me/${whatsAppDigits}` : "";
  const imagesList =
    step2?.images && step2.images.length > 0
      ? step2.images
      : ["/placeholder.png"];
  const activeImage = imagesList[selectedImageIndex] || imagesList[0];

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentAd) return;
    if (!isAuthenticated) return;
    void apiRequest<{
      comment: { id: number; text: string; user: { id: number; username: string } };
    }>(`/api/ads/${currentAd.id}/comments`, {
      method: "POST",
      body: { text: newCommentText.trim() },
    })
      .then((result) => {
        setComments((prev) => [
          {
            id: result.comment.id,
            userId: result.comment.user.id,
            author: result.comment.user.username,
            text: result.comment.text,
            date: t("justNow"),
          },
          ...prev,
        ]);
        setNewCommentText("");
        onCommentAdded?.(result.comment.text, result.comment.user.username);
      })
      .catch(() => undefined);
  };

  const saveComment = (id: number) => {
    const text = editText.trim();
    if (!text) return;
    void apiRequest(`/api/comments/${id}`, { method: "PATCH", body: { text } })
      .then(() => {
        setComments((current) => current.map((item) => item.id === id ? { ...item, text } : item));
        setEditingId(null);
      })
      .catch(() => undefined);
  };

  const deleteComment = (id: number) => {
    void apiRequest(`/api/comments/${id}`, { method: "DELETE" })
      .then(() => setComments((current) => current.filter((item) => item.id !== id)))
      .catch(() => undefined);
  };

  const handleReaction = (reaction: Exclude<ViewerReaction, null>) => {
    if (!currentAd || reacting) return;
    if (!isAuthenticated) {
      router.push("/log-in");
      return;
    }
    setReacting(true);
    void apiRequest<{
      ad: { likes?: number; dislikes?: number; viewerReaction?: ViewerReaction };
    }>(`/api/ads/${currentAd.id}/reactions`, {
      method: "POST",
      body: { reaction },
    })
      .then((result) => {
        setLikeCount(result.ad.likes ?? 0);
        setDislikeCount(result.ad.dislikes ?? 0);
        setViewerReaction(result.ad.viewerReaction ?? null);
      })
      .catch(() => {
        if (setTitle) setTitle(t("reactionFailed"));
        if (setDescription) setDescription(t("reactionFailedDescription"));
        if (onOpen) onOpen();
      })
      .finally(() => setReacting(false));
  };

  const handleToggleFavorite = () => {
    if (!currentAd) return;
    if (isFavorite) {
      removeFavorite(currentAd.id);
      void apiRequest(`/api/favorites/${currentAd.id}`, {
        method: "DELETE",
      }).catch(() => undefined);
      if (setTitle) setTitle(t("removedTitle"));
      if (setDescription) setDescription(t("removedDescription"));
      if (onOpen) onOpen();
    } else {
      addFavorite({
        id: currentAd.id,
        title: step1?.adName || t("adTitle"),
        category: step2?.category ? catalogLabel(step2.category) : t("general"),
        price: step2?.price ? `$${step2.price}` : "$0",
        location: step1?.selectedCity
          ? `${step1.selectedCity}, ${step1.selectedCountry || ""}`
          : t("locationNotSpecified"),
        imageUrl: imagesList[0],
        href: `/search/ad/${currentAd.id}`,
      });
      void apiRequest("/api/favorites", {
        method: "POST",
        body: { adId: currentAd.id },
      }).catch(() => undefined);
      if (setTitle) setTitle(t("addedTitle"));
      if (setDescription) setDescription(t("addedDescription"));
      if (onOpen) onOpen();
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Header className="fixed top-4 inset-x-5 z-50 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-md px-6" />
      <div className="fixed top-24 right-4 z-50">
        <Alert />
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-16 flex flex-col gap-8">
        <nav className="flex min-w-0 items-center gap-2 overflow-x-auto text-xs font-medium text-zinc-500 md:text-sm dark:text-zinc-400">
          <BaseLink
            href="/"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {t("home")}
          </BaseLink>
          <ChevronRight className="w-3.5 h-3.5" />
          <BaseLink
            href="/search"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {t("ads")}
          </BaseLink>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-[200px]">
            {step1?.adName || t("adDetails")}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            <div className="flex flex-col gap-4 p-4 md:p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/80 group">
                <AdPhoto
                  src={activeImage}
                  alt={step1?.adName || t("adImageAlt")}
                  priority
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t("featured")}</span>
                  </span>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleToggleFavorite}
                    aria-label={
                      isFavorite
                        ? t("removeFromFavorites")
                        : t("addToFavorites")
                    }
                    className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-zinc-100 border border-white/20 dark:border-zinc-700/50 hover:scale-110 active:scale-95 transition-all shadow-lg"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorite
                          ? "fill-red-500 text-red-500"
                          : "text-black dark:text-white"
                      }`}
                    />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleShare}
                    aria-label={t("share")}
                    className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-zinc-100 border border-white/20 dark:border-zinc-700/50 hover:scale-110 active:scale-95 transition-all shadow-lg relative"
                  >
                    <Share2 className="w-5 h-5 text-black dark:text-white" />
                    {isCopied && (
                      <span className="absolute -bottom-8 right-1/2 translate-x-1/2 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[10px] whitespace-nowrap shadow-md">
                        {t("copied")}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {imagesList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none pt-2">
                  {imagesList.map((img: string, idx: number) => (
                    <Button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!currentAd) return;
                        setPickedImage({ adId: currentAd.id, index: idx });
                      }}
                      className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${
                        selectedImageIndex === idx
                          ? "border-amber-500 scale-105 shadow-md shadow-amber-500/10"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <AdPhoto
                        src={img}
                        alt={t("thumbnailAlt", { index: idx + 1 })}
                        className="object-cover"
                      />
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Tag className="w-4 h-4" />
                  <span>
                    {step2?.category
                      ? catalogLabel(step2.category)
                      : t("general")}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <time
                      dateTime={createdAt ?? undefined}
                      aria-label={
                        createdAt
                          ? t("postedOn", {
                              date: formatCreatedAt(createdAt, locale),
                            })
                          : t("recentlyPosted")
                      }
                    >
                      {createdAt
                        ? formatCreatedAt(createdAt, locale)
                        : t("recentlyPosted")}
                    </time>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>{t("views", { count: viewCount ?? 0 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug">
                  {step1?.adName || t("adTitle")}
                </h1>
                {featuredActive ? (
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("featuredAd")}
                  </span>
                ) : null}

                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>
                    {step1?.selectedCity
                      ? `${step1.selectedCity}, ${step1.selectedCountry || ""}`
                      : t("locationNotSpecified")}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    type="button"
                    onClick={() => handleReaction("LIKE")}
                    disabled={reacting}
                    aria-pressed={viewerReaction === "LIKE"}
                    aria-label={t("like")}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                      viewerReaction === "LIKE"
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{t("likes", { count: likeCount })}</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleReaction("DISLIKE")}
                    disabled={reacting}
                    aria-pressed={viewerReaction === "DISLIKE"}
                    aria-label={t("dislike")}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                      viewerReaction === "DISLIKE"
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{t("dislikes", { count: dislikeCount })}</span>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{t("descriptionTitle")}</span>
                </h3>
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                  {step1?.description || t("noDescription")}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-zinc-200/80 dark:border-zinc-800">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-1">
                  <span className="text-xs text-zinc-400 font-medium">
                    {t("preferredContact")}
                  </span>
                  <span className="text-sm font-bold capitalize text-zinc-800 dark:text-zinc-200">
                    {step3?.preferredContactMethod || t("phone")}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-1">
                  <span className="text-xs text-zinc-400 font-medium">
                    {t("termsStatus")}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t("accepted")}</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-1">
                  <span className="text-xs text-zinc-400 font-medium">
                    {t("listingType")}
                  </span>
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {t("directSale")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col gap-6">
              <div className="flex items-center gap-2 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
                <MessageSquare className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t("comments", { count: comments.length })}
                </h3>
              </div>

              <form onSubmit={handleAddComment} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={t("commentPlaceholder")}
                    aria-label={t("commentPlaceholder")}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 h-12 px-4 rounded-2xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none placeholder-zinc-400"
                  />
                  <NormalButton
                    type="submit"
                    className="h-12 px-6 rounded-2xl flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4 text-white dark:text-black" />
                    <span>{t("send")}</span>
                  </NormalButton>
                </div>
              </form>

              <div className="flex flex-col gap-4 pt-2">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {comment.author}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {comment.date}
                      </span>
                    </div>
                    {editingId === comment.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          value={editText}
                          onChange={(event) => setEditText(event.target.value)}
                          className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                        />
                        <div className="flex gap-2">
                          <Button type="button" onClick={() => saveComment(comment.id)} className="h-9 rounded-xl bg-zinc-900 px-3 text-xs text-white dark:bg-zinc-100 dark:text-zinc-950">{t("saveComment")}</Button>
                          <Button type="button" onClick={() => setEditingId(null)} className="h-9 rounded-xl border border-zinc-200 px-3 text-xs dark:border-zinc-700">{t("cancel")}</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">{comment.text}</p>
                    )}
                    {isAuthenticated ? (
                      <div className="flex flex-wrap gap-2">
                        {String(user?.id) === String(comment.userId) ? (
                          <button type="button" onClick={() => { setEditingId(comment.id); setEditText(comment.text); }} className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
                            <Pencil className="size-3.5" />{t("editComment")}
                          </button>
                        ) : null}
                        {String(user?.id) === String(comment.userId) || user?.role === "ADMIN" || user?.role === "OWNER" ? (
                          <button type="button" onClick={() => deleteComment(comment.id)} className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
                            <Trash2 className="size-3.5" />{t("deleteComment")}
                          </button>
                        ) : null}
                        {String(user?.id) !== String(comment.userId) ? (
                          <button type="button" onClick={() => setReportTarget({ type: "COMMENT", id: comment.id })} className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
                            <Flag className="size-3.5" />{t("reportComment")}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 sticky top-28">
            <div className="p-6 md:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {t("askingPrice")}
                </span>
                <div className="flex items-baseline gap-2">
                  {step2?.showPrice && step2?.price ? (
                    <>
                      <span className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                        {formatPrice(step2.price)}
                      </span>
                      <span className="text-sm font-bold text-zinc-500">
                        {t("currency")}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {t("priceUponRequest")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
                <BaseLink
                  href={chatHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 py-4 font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{t("contactPrivate")}</span>
                </BaseLink>
                {phoneHref ? (
                  <BaseLink
                    href={phoneHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{t("callAdvertiser")}</span>
                  </BaseLink>
                ) : null}
                {whatsAppHref ? (
                  <BaseLink
                    href={whatsAppHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-4 font-medium text-white transition-colors hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{t("chatWhatsApp")}</span>
                  </BaseLink>
                ) : null}
                {isAuthenticated && sellerId && String(user?.id) !== String(sellerId) ? (
                  <Button type="button" onClick={() => setReportTarget({ type: "AD", id: currentAd.id })} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 text-sm font-medium dark:border-zinc-700">
                    <Flag className="size-4" />
                    {t("reportAd")}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md">
                  <div className="w-full h-full rounded-[14px] bg-zinc-900 flex items-center justify-center text-white font-extrabold text-xl uppercase">
                    {currentAd.username ? currentAd.username.charAt(0) : "U"}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    {currentAd.username ? (
                      <BaseLink href={`/profile/${encodeURIComponent(currentAd.username)}`} className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {currentAd.username}
                      </BaseLink>
                    ) : (
                      <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{t("verifiedUser")}</h4>
                    )}
                    <UserCheck className="w-4 h-4 text-blue-500" />
                  </div>
                  {isAuthenticated && sellerId && String(user?.id) !== String(sellerId) ? (
                    <button type="button" onClick={() => setReportTarget({ type: "USER", id: sellerId })} className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
                      <Flag className="size-3.5" />
                      {t("reportAccount")}
                    </button>
                  ) : null}
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {t("trustedMember")}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <span>{t("sellerRating")}</span>
                <div className="flex items-center gap-1 text-zinc-900 dark:text-white font-bold">
                  <span>{formatRating(adRating)}</span>
                  <span>★</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-start gap-3.5">
              <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  {t("safetyTip")}
                </h5>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
                  {t("safetyTipDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {reportTarget ? (
        <ReportDialog
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          open
          onClose={() => setReportTarget(null)}
        />
      ) : null}
    </div>
  );
};

export default Ad;
