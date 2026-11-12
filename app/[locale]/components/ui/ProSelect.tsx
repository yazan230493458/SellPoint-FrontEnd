
"use client";

import { GlobeIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/components/ui/Combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { catalogLabels } from "@/lib/use-catalog-label";

export type ProSelectGroup = {
  value: string;
  items: string[];
};

export type ProSelectOptions = ProSelectGroup[];

export interface ProSelectProps {
  id?: string;
  name?: string;
  value?: string | null;
  defaultValue?: string;
  onChange?: (value: string | null) => void;
  options?: ProSelectOptions;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

const defaultCountries: ProSelectOptions = [
  {
    value: "Americas",
    items: [
      "(GMT-5) New York",
      "(GMT-8) Los Angeles",
      "(GMT-6) Chicago",
      "(GMT-5) Toronto",
      "(GMT-8) Vancouver",
      "(GMT-3) São Paulo",
    ],
  },
  {
    value: "Europe",
    items: [
      "(GMT+0) London",
      "(GMT+1) Paris",
      "(GMT+1) Berlin",
      "(GMT+1) Rome",
      "(GMT+1) Madrid",
      "(GMT+1) Amsterdam",
    ],
  },
  {
    value: "Asia/Pacific",
    items: [
      "(GMT+9) Tokyo",
      "(GMT+8) Shanghai",
      "(GMT+8) Singapore",
      "(GMT+4) Dubai",
      "(GMT+11) Sydney",
      "(GMT+9) Seoul",
    ],
  },
];

const styleLabels = {
  "Primary Style": "primaryStyle",
  "Secondary Style": "secondaryStyle",
} as const;

const regionLabels = {
  Americas: "americas",
  Europe: "europe",
  "Asia/Pacific": "asiaPacific",
} as const;

export const ProSelect = ({
  id,
  name,
  value,
  defaultValue,
  onChange,
  options = defaultCountries,
  placeholder,
  emptyText,
  className = "w-full h-full dark:bg-zinc-800",
  disabled = false,
}: ProSelectProps) => {
  const t = useTranslations("ProSelect");
  const tCatalog = useTranslations("Catalog");

  const resolvedPlaceholder = placeholder || t("selectTimezone");
  const resolvedEmptyText = emptyText || t("emptyTimezones");

  const labelOf = (value: string) => {
    if (value in styleLabels) {
      return t(styleLabels[value as keyof typeof styleLabels]);
    }

    if (value in regionLabels) {
      return t(regionLabels[value as keyof typeof regionLabels]);
    }

    if (catalogLabels.has(value)) {
      return tCatalog(value as never);
    }

    return value;
  };

  return (
    <Combobox
      autoComplete="off"
      items={options}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange}
      disabled={disabled}
      itemToStringLabel={(item) => labelOf(String(item ?? ""))}
    >
      <ComboboxInput
        id={id}
        name={name}
        placeholder={resolvedPlaceholder}
        aria-label={resolvedPlaceholder}
        disabled={disabled}
        className={className}
      >
        <InputGroupAddon>
          <GlobeIcon />
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent
        alignOffset={-28}
        className="w-full bg-zinc-100 dark:bg-zinc-800"
      >
        <ComboboxEmpty>{resolvedEmptyText}</ComboboxEmpty>

        <ComboboxList>
          {(group) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>{labelOf(group.value)}</ComboboxLabel>

              <ComboboxCollection>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {labelOf(item)}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default ProSelect;
