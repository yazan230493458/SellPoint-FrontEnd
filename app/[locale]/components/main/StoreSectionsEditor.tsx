"use client";

import React from "react";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import ProSelect from "../ui/ProSelect";
import { StoreSection } from "../../../../lib/store-editor.types";
import Button from "../ui/Button";

type StoreSectionsEditorProps = {
  sections: StoreSection[];
  onMoveSection: (index: number, direction: "up" | "down") => void;
  onToggleEnable: (id: string) => void;
  onRemoveSection: (id: string, title: string) => void;
  onButtonTextChange: (id: string, text: string) => void;
  onBgColorChange: (id: string, color: string) => void;
  onNavAlignmentChange: (
    id: string,
    alignment: "left" | "center" | "right",
  ) => void;
  onAddNavBtn: (sectionId: string, target: "center" | "right") => void;
  onRemoveNavBtn: (
    sectionId: string,
    target: "center" | "right",
    btnId: string,
  ) => void;
  onUpdateNavBtnLabel: (
    sectionId: string,
    target: "center" | "right",
    btnId: string,
    label: string,
  ) => void;
  onAddHeroBtn: (sectionId: string) => void;
  onRemoveHeroBtn: (sectionId: string, btnId: string) => void;
  onUpdateHeroBtn: (
    sectionId: string,
    btnId: string,
    field: "label" | "variant",
    val: string,
  ) => void;
  onHeroTextChange: (
    sectionId: string,
    field: "heroTitle" | "heroSubtitle",
    value: string,
  ) => void;
  onFooterTextChange: (
    sectionId: string,
    field: "footerTitle" | "footerDescription",
    value: string,
  ) => void;
  onUpdateSliderProduct: (
    sectionId: string,
    prodId: number,
    field: "title" | "price" | "image",
    value: string,
  ) => void;
};

const StoreSectionsEditor: React.FC<StoreSectionsEditorProps> = ({
  sections,
  onMoveSection,
  onToggleEnable,
  onRemoveSection,
  onButtonTextChange,
  onBgColorChange,
  onNavAlignmentChange,
  onAddNavBtn,
  onRemoveNavBtn,
  onUpdateNavBtnLabel,
  onAddHeroBtn,
  onRemoveHeroBtn,
  onUpdateHeroBtn,
  onHeroTextChange,
  onFooterTextChange,
  onUpdateSliderProduct,
}) => {
  const t = useTranslations("StoreEditor");
  const sectionTypeLabel = (type: string) => {
    const key = `types.${type}` as "types.header";
    return t.has(key) ? t(key) : type;
  };
  const componentTitle = (type: string, fallback: string) => {
    const key = `components.${type}.title` as "components.header.title";
    return t.has(key) ? t(key) : fallback;
  };

  return (
    <div className="flex flex-col space-y-5">
      {sections.map((sec, index) => (
        <div
          key={sec.id}
          className={`flex flex-col p-5 rounded-xl border space-y-4 transition-colors duration-200 ${
            sec.enabled
              ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-lg"
              : "bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 opacity-60"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  disabled={index === 0}
                  onClick={() => onMoveSection(index, "up")}
                  aria-label={t("moveUp")}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  disabled={index === sections.length - 1}
                  onClick={() => onMoveSection(index, "down")}
                  aria-label={t("moveDown")}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-bold truncate max-w-50 sm:max-w-xs">
                  {componentTitle(sec.type, sec.title)}
                </span>
                <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                  {t("sectionType", { type: sectionTypeLabel(sec.type) })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => onToggleEnable(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  sec.enabled
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {sec.enabled ? t("visible") : t("hidden")}
              </Button>

              <Button
                type="button"
                onClick={() =>
                  onRemoveSection(sec.id, componentTitle(sec.type, sec.title))
                }
                aria-label={t("removeSection")}
                className="p-2 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase text-[10px]">
                {t("primaryButtonLabel")}
              </label>
              <input
                type="text"
                value={sec.buttonText || ""}
                onChange={(e) => onButtonTextChange(sec.id, e.target.value)}
                placeholder={t("buttonPlaceholder")}
                className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>

            {(sec.type === "hero" || sec.type === "footer") && (
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase text-[10px] flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" /> {t("backgroundColor")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sec.bgColor || "#09090b"}
                    onChange={(e) => onBgColorChange(sec.id, e.target.value)}
                    className="w-12 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={sec.bgColor || "#09090b"}
                    onChange={(e) => onBgColorChange(sec.id, e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex-1 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          
          {sec.type === "header" && (
            <div className="flex flex-col space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="font-bold text-xs">
                  {t("navbarAlignment")}
                </span>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <Button
                    type="button"
                    onClick={() => onNavAlignmentChange(sec.id, "left")}
                    aria-label={t("alignLeft")}
                    className={`p-1.5 rounded-md text-xs font-bold ${
                      sec.navAlignment === "left"
                        ? "bg-white dark:bg-zinc-900 shadow-sm"
                        : "text-zinc-500"
                    }`}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onNavAlignmentChange(sec.id, "center")}
                    aria-label={t("alignCenter")}
                    className={`p-1.5 rounded-md text-xs font-bold ${
                      sec.navAlignment === "center" || !sec.navAlignment
                        ? "bg-white dark:bg-zinc-900 shadow-sm"
                        : "text-zinc-500"
                    }`}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onNavAlignmentChange(sec.id, "right")}
                    aria-label={t("alignRight")}
                    className={`p-1.5 rounded-md text-xs font-bold ${
                      sec.navAlignment === "right"
                        ? "bg-white dark:bg-zinc-900 shadow-sm"
                        : "text-zinc-500"
                    }`}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="flex flex-col space-y-2 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                      {t("centerNavButtons")}
                    </span>
                    <Button
                      type="button"
                      onClick={() => onAddNavBtn(sec.id, "center")}
                      aria-label={t("addButton")}
                      className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  {(sec.navButtons || []).map((b) => (
                    <div key={b.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={b.label}
                        onChange={(e) =>
                          onUpdateNavBtnLabel(
                            sec.id,
                            "center",
                            b.id,
                            e.target.value,
                          )
                        }
                        className="px-4 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex-1 outline-none"
                      />
                      <Button
                        type="button"
                        onClick={() => onRemoveNavBtn(sec.id, "center", b.id)}
                        aria-label={t("removeButton")}
                        className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                
                <div className="flex flex-col space-y-2 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                      {t("rightActionButtons")}
                    </span>
                    <Button
                      type="button"
                      onClick={() => onAddNavBtn(sec.id, "right")}
                      aria-label={t("addButton")}
                      className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  {(sec.rightNavButtons || []).map((b) => (
                    <div key={b.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={b.label}
                        onChange={(e) =>
                          onUpdateNavBtnLabel(
                            sec.id,
                            "right",
                            b.id,
                            e.target.value,
                          )
                        }
                        className="px-4 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex-1 outline-none"
                      />
                      <Button
                        type="button"
                        onClick={() => onRemoveNavBtn(sec.id, "right", b.id)}
                        aria-label={t("removeButton")}
                        className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          
          {sec.type === "hero" && (
            <div className="flex flex-col space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-xs">
                {t("heroConfig")}
              </span>
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  value={sec.heroTitle || ""}
                  onChange={(e) =>
                    onHeroTextChange(sec.id, "heroTitle", e.target.value)
                  }
                  placeholder={t("heroTitlePlaceholder")}
                  className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                />
                <textarea
                  value={sec.heroSubtitle || ""}
                  onChange={(e) =>
                    onHeroTextChange(sec.id, "heroSubtitle", e.target.value)
                  }
                  placeholder={t("heroSubtitlePlaceholder")}
                  rows={2}
                  className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none resize-none"
                />
                <div className="flex flex-col space-y-2 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-500">
                      {t("heroButtons")}
                    </span>
                    {(sec.heroButtons || []).length < 3 && (
                      <Button
                        type="button"
                        onClick={() => onAddHeroBtn(sec.id)}
                        aria-label={t("addButton")}
                        className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  {(sec.heroButtons || []).map((hb) => (
                    <div key={hb.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={hb.label}
                        onChange={(e) =>
                          onUpdateHeroBtn(
                            sec.id,
                            hb.id,
                            "label",
                            e.target.value,
                          )
                        }
                        className="px-4 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex-1 outline-none"
                      />
                      <ProSelect
                        value={hb.variant || "Secondary Style"}
                        onChange={(val) =>
                          onUpdateHeroBtn(sec.id, hb.id, "variant", val ?? "")
                        }
                        options={[
                          {
                            value: "styles",
                            items: ["Primary Style", "Secondary Style"],
                          },
                        ]}
                      />
                      <Button
                        type="button"
                        onClick={() => onRemoveHeroBtn(sec.id, hb.id)}
                        aria-label={t("removeButton")}
                        className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          
          {sec.type === "footer" && (
            <div className="flex flex-col space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-xs">
                {t("footerCustomization")}
              </span>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={sec.footerTitle || ""}
                  onChange={(e) =>
                    onFooterTextChange(sec.id, "footerTitle", e.target.value)
                  }
                  placeholder={t("footerTitlePlaceholder")}
                  className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                />
                <textarea
                  value={sec.footerDescription || ""}
                  onChange={(e) =>
                    onFooterTextChange(
                      sec.id,
                      "footerDescription",
                      e.target.value,
                    )
                  }
                  placeholder={t("footerDescriptionPlaceholder")}
                  rows={2}
                  className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none resize-none"
                />
              </div>
            </div>
          )}

          
          {sec.type === "slider" && (
            <div className="flex flex-col space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-xs flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> {t("sliderCustomization")}
              </span>
              <div className="flex flex-col space-y-3">
                {(sec.sliderProducts || []).map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-zinc-500">
                        {t("productTitle", { id: p.id })}
                      </label>
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) =>
                          onUpdateSliderProduct(
                            sec.id,
                            p.id,
                            "title",
                            e.target.value,
                          )
                        }
                        className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-zinc-500">
                        {t("price")}
                      </label>
                      <input
                        type="text"
                        value={p.price}
                        onChange={(e) =>
                          onUpdateSliderProduct(
                            sec.id,
                            p.id,
                            "price",
                            e.target.value,
                          )
                        }
                        className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-zinc-500">
                        {t("imageUrl")}
                      </label>
                      <input
                        type="text"
                        value={p.image}
                        onChange={(e) =>
                          onUpdateSliderProduct(
                            sec.id,
                            p.id,
                            "image",
                            e.target.value,
                          )
                        }
                        className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StoreSectionsEditor;
