import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";

type SloganProps = {
  className?: string;
  text?: boolean;
};

const Slogan = ({ className, text }: SloganProps) => {
  const t = useTranslations("HomePage");
  return (
    <BaseLink href="/" className={`flex items-center gap-5 ${className}`}>
      <Image
        src={"/Images/1.png"}
        className="w-7"
        width={1920}
        height={1080}
        alt={t("brand")}
      ></Image>
      {text && <h1 className="text-2xl font-bold">{t("brand")}</h1>}
    </BaseLink>
  );
};

export default Slogan;
