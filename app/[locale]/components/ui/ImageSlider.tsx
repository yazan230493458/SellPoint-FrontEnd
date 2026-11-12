"use client";

import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./styles.css";
import { Pagination } from "swiper/modules";

export default function App() {
  const t = useTranslations("ImageSlider");
  const slides = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <>
      <Swiper pagination={true} modules={[Pagination]} className="mySwiper">
        {slides.map((number) => (
          <SwiperSlide key={number}>{t("slide", { number })}</SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
