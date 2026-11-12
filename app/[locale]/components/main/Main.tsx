import React from "react";
import HeroSearch from "./home/HeroSearch";
import CategorySection from "./home/CategorySection";
import HowItWorks from "./home/HowItWorks";

const Main = () => {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col items-center gap-8 px-4 pb-16 pt-32 sm:px-6 lg:px-8">
      <HeroSearch />
      <CategorySection />
      <HowItWorks />
    </main>
  );
};

export default Main;
