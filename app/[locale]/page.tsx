import React from "react";
import Background from "./components/main/Background";
import Header from "./components/main/Header";
import Aside from "./components/main/Aside";
import PageContent from "./components/main/PageContent";
import Main from "./components/main/Main";

const HomePage = () => {
  return (
    <>
      <Background />
      <PageContent>
        <Header
          inHome={true}
          className="h-20 fixed top-5 inset-s-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/20"
        />
        <Aside />
        <Main />
      </PageContent>
    </>
  );
};

export default HomePage;
