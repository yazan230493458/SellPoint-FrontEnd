"use client";
import React from "react";
import { useAsideStore } from "@/store/aside.store";

type PageContentProps = {
  children?: React.ReactNode;
};

const PageContent = ({ children }: PageContentProps) => {
  const { isOpen } = useAsideStore();
  return (
    <div
      className={`${isOpen ? "md:ps-74" : "md:ps-30"} z-30 relative transition-all duration-300`}
    >
      {children}
    </div>
  );
};

export default PageContent;
