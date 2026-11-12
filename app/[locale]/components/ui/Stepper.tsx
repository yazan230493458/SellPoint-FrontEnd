"use client";

import React from "react";
import Button from "./Button";

type StepperProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
  numberOfSteps?: number;
  activeStep?: number;
  onStepClick?: (step: number) => void;
};

const Stepper = ({
  className = "",
  orientation = "horizontal",
  numberOfSteps = 3,
  activeStep,
  onStepClick,
}: StepperProps) => {
  const [internalActive, setInternalActive] = React.useState<number>(1);
  const currentStep = activeStep ?? internalActive;

  const handleStepClick = (step: number) => {
    if (onStepClick) {
      onStepClick(step);
    } else {
      setInternalActive(step);
    }
  };

  const stepsArray = Array.from({ length: numberOfSteps }, (_, i) => i + 1);
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex justify-center items-center ${
        isVertical
          ? "flex-col gap-2 h-auto"
          : "flex-row items-center w-full max-w-xl px-4"
      } ${className}`}
    >
      {stepsArray.map((step, index) => {
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        const isLast = index === stepsArray.length - 1;

        return (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => handleStepClick(step)}
                className={`w-10 h-10 rounded-full flex justify-center items-center text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black ring-4 ring-zinc-300 dark:ring-zinc-600 scale-105"
                    : isCompleted
                      ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black"
                      : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {step}
              </Button>
            </div>

            {!isLast && (
              <div
                className={`transition-all duration-300 bg-zinc-200 dark:bg-zinc-700 overflow-hidden ${
                  isVertical ? "w-0.5 h-10 my-1" : "flex-1 h-1 mx-2"
                }`}
              >
                <div
                  className={`bg-black dark:bg-white transition-all duration-500 ${
                    isVertical ? "w-full" : "h-full"
                  }`}
                  style={{
                    [isVertical ? "height" : "width"]: isCompleted
                      ? "100%"
                      : "0%",
                  }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;