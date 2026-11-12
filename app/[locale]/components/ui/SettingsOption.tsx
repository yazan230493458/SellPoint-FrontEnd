import React from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BaseButton from "./BaseButton";
import { Checkbox } from "@/components/ui/checkbox";

interface SelectOption {
  id: number;
  label: string;
  value: string;
}

interface ChoiceOption {
  id: number;
  value: string;
}

interface SettingsOptionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  dropdown?: {
    options?: SelectOption[];
    value?: string;
    placeholder?: string;
    onChange?: (value: string | null) => void;
  };
  choices?: {
    options: ChoiceOption[];
    selectedId?: number | null;
    onChange?: (id: number) => void;
  };
  switchProps?: {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
  };
  button?: {
    text?: string;
    onClick?: () => void;
    variant?:
      | "default"
      | "destructive"
      | "ghost"
      | "link"
      | "outline"
      | "secondary";
  };
  isDisabled?: boolean;
}

const SettingsOption: React.FC<SettingsOptionProps> = ({
  title,
  description,
  dropdown,
  choices,
  switchProps,
  button,
  isDisabled = false,
  className = "",
  ...props
}) => {
  const options = dropdown?.options ?? [];

  const controlElements = [
    {
      condition: Boolean(choices && choices.options.length > 0),
      render: () => (
        <div className="w-full grid grid-cols-2 place-items-center">
          {choices?.options.map((choice) => (
            <div
              key={choice.id}
              className="w-full flex justify-center items-center text-center"
            >
              <Checkbox
                className="scale-125"
                checked={choices.selectedId === choice.id}
                disabled={isDisabled}
                onCheckedChange={() => choices.onChange?.(choice.id)}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      condition: Boolean(dropdown),
      render: () => (
        <Select
          value={dropdown?.value}
          onValueChange={(val) => dropdown?.onChange?.(val)}
          disabled={isDisabled}
        >
          <SelectTrigger className="w-full sm:w-48 h-10 px-3.5 rounded-xl border-zinc-200 dark:border-zinc-700/40 bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 text-sm font-medium shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-600 focus:ring-1 focus:ring-zinc-600 dark:focus:ring-zinc-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            <SelectValue placeholder={dropdown?.placeholder} />
          </SelectTrigger>
          <SelectContent className="p-1.5 rounded-xl border border-zinc-300/30 dark:border-zinc-700/30 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-lg min-w-48 animate-in fade-in-80 zoom-in-95">
            <SelectGroup>
              {options.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-150 focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ),
    },
    {
      condition: Boolean(switchProps),
      render: () => (
        <Switch
          checked={switchProps?.checked || false}
          onCheckedChange={switchProps?.onChange}
          disabled={isDisabled}
        />
      ),
    },
    {
      condition: Boolean(button),
      render: () => (
        <BaseButton
          variant={button?.variant ?? "ghost"}
          onClick={button?.onClick}
        >
          {button?.text}
        </BaseButton>
      ),
    },
  ];

  return (
    <div
      className={`w-full min-h-20 p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center shadow-xl rounded-2xl bg-zinc-100 text-zinc-900 dark:text-zinc-100 dark:bg-zinc-800 border border-zinc-300/20 dark:border-zinc-700/20 gap-4 transition-opacity ${
        isDisabled ? "opacity-50 pointer-events-none" : ""
      } ${className}`}
      {...props}
    >
      <div className="w-full sm:w-1/2 min-w-0 flex flex-col justify-center">
        <h1 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      <div className="w-full sm:w-1/2 flex justify-start sm:justify-end items-center shrink-0">
        {controlElements
          .filter((element) => element.condition)
          .map((element, index) => (
            <React.Fragment key={index}>{element.render()}</React.Fragment>
          ))}
      </div>
    </div>
  );
};

export default SettingsOption;
