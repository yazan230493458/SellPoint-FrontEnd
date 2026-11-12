"use client";

import React from "react";
import { useTheme } from "next-themes";
import Prism from "@/components/Prism";

const PrismComponent = () => {
  const { resolvedTheme } = useTheme();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-0 w-full h-dvh overflow-hidden mask-fade-bottom"
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      >
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          lightMode={resolvedTheme !== "dark"}
          noise={0}
          glow={1}
        />
      </div>
    </div>
  );
};

export default PrismComponent;
