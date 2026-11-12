import React, { useRef } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import BaseButton from "./BaseButton";
import { useUserStore } from "@/store/user.store";
import { isSafeImageSrc } from "@/lib/safe-href";

type UploadImagesProps = {
  inAccountPage?: boolean;
  children?: React.ReactNode;
  classNameForAd?: string;
};

const UploadImages = ({
  inAccountPage,
  children,
  classNameForAd,
}: UploadImagesProps) => {
  const t = useTranslations("AccountPage");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, updateAvatar } = useUserStore();
  const account = user?.settings.account;
  const avatarUrl = account?.avatarUrl;
  const firstName = account?.firstName;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        updateAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
      <div className="w-20 h-20 flex justify-center items-center relative rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
        {inAccountPage ? (
          <div className={classNameForAd}>{children}</div>
        ) : isSafeImageSrc(avatarUrl) ? (
          avatarUrl.startsWith("data:") ? (
            <div role="img" aria-label={t("profileImageAlt")} className="h-full w-full bg-cover bg-center shadow-lg" style={{ backgroundImage: `url(${avatarUrl})` }} />
          ) : (
            <Image
              src={avatarUrl}
              className="w-full h-full object-cover shadow-lg"
              width={80}
              height={80}
              alt={t("profileImageAlt")}
            />
          )
        ) : (
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {firstName?.charAt(0)?.toUpperCase()}
          </h1>
        )}

        <input
          ref={fileInputRef}
          onChange={handleAvatarUpload}
          type="file"
          accept="image/*"
          className="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer"
          aria-label={t("changeImage")}
        />
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-5">
        <BaseButton
          type="button"
          variant="default"
          className="relative"
          onClick={() => fileInputRef.current?.click()}
        >
          {t("changeImage")}
        </BaseButton>
        {avatarUrl ? (
          <BaseButton type="button" variant="default" onClick={() => updateAvatar("")}>
            {t("removeImage")}
          </BaseButton>
        ) : null}
      </div>
    </div>
  );
};

export default UploadImages;
