"use client";
import React from "react";
import Slogan from "../ui/Slogan";
import Navbar from "../ui/Navbar";
import MobileNav from "../ui/MobileNav";
import ThemeToggle from "../ui/ThemeToggle";
import { useAsideStore } from "@/store/aside.store";

type HeaderProps = {
  className?: string;
  inHome?: boolean;
};

const Header = ({ className, inHome = false }: HeaderProps) => {
  const { isOpen } = useAsideStore();
  return (
    <header
      className={`${className} ${inHome ? (isOpen ? "inset-e-5 md:inset-s-74" : "inset-e-5 md:inset-s-30") : ""} h-20 flex min-w-0 items-center px-3 sm:px-5 py-2.5 transition-all duration-300 z-40`}
    >
      <Slogan
        className="w-max flex justify-center items-center h-full"
        text={true}
      />
      <div className="hidden h-full min-w-0 w-full md:flex">
        <Navbar />
      </div>
      <ThemeToggle />
      <MobileNav />
    </header>
  );
};

export default Header;
