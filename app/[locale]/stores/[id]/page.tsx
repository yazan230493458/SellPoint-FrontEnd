"use client";

import React, { useRef, useState } from "react";
import { useParams, redirect } from "next/navigation";
import Header from "../../components/main/Header";
import Alert from "../../components/ui/Alert";
import { useAlertStore } from "@/store/alert.store";
import { useStoreStore } from "@/store/store.store";
import { StorePageHeader } from "../../components/main/StorePageHeader";
import { StoreBrandSettings } from "../../components/main/StoreBrandSettings";
import { StorePreview } from "../../components/main/StorePreview";
import { ShoppingCartPanel } from "../../components/main/ShoppingCartPanel";
import StoreSectionsEditor from "../../components/main/StoreSectionsEditor";
import {
  availableComponentTypes,
  defaultSliderProducts,
} from "@/lib/store-editor.data";
import { StoreSection, CartItem } from "@/lib/store-editor.types";
import { Plus, Settings, ShoppingCart, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { features } from "@/app/[locale]/features";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Button from "../../components/ui/Button";

if (!features.stores) {
  redirect("/");
}

const UserStorePage = () => {
  const params = useParams();
  const storeIdentifier = decodeURIComponent(String(params?.id || ""));
  const stores = useStoreStore((state) => state.stores);
  const currentStore = useStoreStore((state) => state.currentStore);
  const setCurrentStore = useStoreStore((state) => state.setCurrentStore);
  const updateStoreSections = useStoreStore(
    (state) => state.updateStoreSections,
  );
  const updateStoreDetails = useStoreStore((state) => state.updateStoreDetails);
  const { setTitle, setDescription, onOpen } = useAlertStore();
  const t = useTranslations("StoreEditor");
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [storeName, setStoreName] = useState<string>(t("defaultStoreName"));
  const [searchTerm] = useState<string>("");

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      title: t("sampleWatch"),
      price: 299,
      image: "/placeholder.png",
      quantity: 1,
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedStoreKey, setAppliedStoreKey] = useState("");
  const sectionSerial = useRef(0);

  const [sections, setSections] = useState<StoreSection[]>([
    {
      id: "sec-header",
      type: "header",
      title: t("headerTitle"),
      enabled: true,
      buttonText: t("contactUs"),
      navButtons: [
        { id: "nav-1", label: t("home") },
        { id: "nav-2", label: t("catalog") },
      ],
      rightNavButtons: [{ id: "rnav-1", label: t("vipClub") }],
      navAlignment: "center",
    },
    {
      id: "sec-hero",
      type: "hero",
      title: t("heroSectionTitle"),
      enabled: true,
      buttonText: t("shopCollection"),
      heroButtons: [
        { id: "hb-1", label: t("shopCollection"), variant: "Primary Style" },
      ],
      bgColor: "#09090b",
      heroTitle: t("heroTitle"),
      heroSubtitle: t("heroSubtitle"),
    },
    {
      id: "sec-slider",
      type: "slider",
      title: t("sliderTitle"),
      enabled: true,
      buttonText: t("addToCart"),
      sliderProducts: defaultSliderProducts.map((product, index) => ({
        ...product,
        title: t(
          (
            [
              "sampleWatch",
              "sampleBag",
              "sampleAudio",
              "sampleSunglasses",
              "samplePerfume",
            ] as const
          )[index] ?? "sampleWatch",
        ),
      })),
    },
    {
      id: "sec-footer",
      type: "footer",
      title: t("footerTitle"),
      enabled: true,
      buttonText: t("subscribe"),
      bgColor: "#09090b",
      footerTitle: storeName,
      footerDescription: t("footerDescription"),
    },
  ]);

  const decodedStoreIdentifier = storeIdentifier.toLowerCase();
  const storeCatalog = [
    ...stores,
    ...(currentStore && !stores.some((store) => store.id === currentStore.id) ? [currentStore] : []),
  ];
  const matchedStore = storeCatalog.find((store) => {
    const username = (store.username || "").toLowerCase();
    const name = (store.step1?.storeName || "").toLowerCase();
    return String(store.id) === storeIdentifier || username === decodedStoreIdentifier || name === decodedStoreIdentifier;
  });
  const matchedStoreKey = matchedStore ? `${matchedStore.id}:${matchedStore.step1?.storeName ?? ""}:${matchedStore.sections?.length ?? 0}` : "";
  if (matchedStore && appliedStoreKey !== matchedStoreKey) {
    setAppliedStoreKey(matchedStoreKey);
    if (currentStore?.id !== matchedStore.id) setCurrentStore(matchedStore);
    setStoreName(matchedStore.step1?.storeName || matchedStore.username || t("defaultStoreName"));
    if (matchedStore.sections?.length) setSections(matchedStore.sections as StoreSection[]);
  }

  const showAlert = (titleText: string, descriptionText: string) => {
    if (setTitle) setTitle(titleText);
    if (setDescription) setDescription(descriptionText);
    if (onOpen) onOpen();
  };

  const handleUpdateCartQty = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const totalCartPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const handleAddSection = (type: StoreSection["type"], title: string) => {
    sectionSerial.current += 1;
    const newSection: StoreSection = {
      id: `sec-${sectionSerial.current}`,
      type,
      title,
      enabled: true,
      buttonText: t("explore"),
      bgColor: type === "hero" || type === "footer" ? "#09090b" : undefined,
      sliderProducts:
        type === "slider"
          ? defaultSliderProducts.map((product, index) => ({
              ...product,
              title: t(
                (
                  [
                    "sampleWatch",
                    "sampleBag",
                    "sampleAudio",
                    "sampleSunglasses",
                    "samplePerfume",
                  ] as const
                )[index] ?? "sampleWatch",
              ),
            }))
          : undefined,
    };
    setSections((prev) => [...prev, newSection]);
    showAlert(t("componentAddedTitle"), t("componentAddedDescription", { title }));
  };

  const handleRemoveSection = (id: string, title: string) => {
    setSections((prev) => prev.filter((sec) => sec.id !== id));
    showAlert(
      t("componentRemovedTitle"),
      t("componentRemovedDescription", { title }),
    );
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSections(updated);
  };

  const filteredSections = sections.map((sec) => {
    if (
      sec.type === "slider" &&
      sec.sliderProducts &&
      searchTerm.trim() !== ""
    ) {
      const filteredProds = sec.sliderProducts.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      return { ...sec, sliderProducts: filteredProds };
    }
    return sec;
  });

  return (
    <>
      <Alert />
      <Header className="" />
      <ShoppingCartPanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        totalCartCount={totalCartCount}
        totalCartPrice={totalCartPrice}
        onUpdateQty={handleUpdateCartQty}
        onCheckout={() => {
          showAlert(t("checkoutTitle"), t("checkoutDescription"));
          setIsCartOpen(false);
        }}
      />

      <main className="min-h-dvh flex flex-col items-center p-5 space-y-6 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <section className="w-full max-w-7xl flex flex-col space-y-6">
          <StorePageHeader
            isPreview={isPreview}
            onTogglePreview={() => setIsPreview(!isPreview)}
            onSave={() => {
              if (currentStore) {
                updateStoreSections(sections as typeof currentStore.sections);
                updateStoreDetails({
                  step1: {
                    ...currentStore.step1,
                    storeName,
                  },
                });
              }
              showAlert(t("savedTitle"), t("savedDescription"));
            }}
          />

          {isPreview ? (
            <StorePreview
              sections={filteredSections}
              storeName={storeName}
              totalCartCount={totalCartCount}
              setIsCartOpen={setIsCartOpen}
              onAddToCart={(product) => {
                const numericPrice =
                  parseFloat(String(product.price).replace(/[^0-9.]/g, "")) ||
                  100;
                setCartItems((prev) => {
                  const productId = Number(product.id);
                  if (!Number.isInteger(productId)) return prev;
                  const existing = prev.find((item) => item.id === productId);
                  if (existing) {
                    return prev.map((item) =>
                      item.id === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                    );
                  }
                  return [
                    ...prev,
                    {
                      id: productId,
                      title: product.title,
                      price: numericPrice,
                      image: product.image || "/placeholder.png",
                      quantity: 1,
                    },
                  ];
                });
                setIsCartOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="flex flex-col space-y-5 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 h-fit">
                <StoreBrandSettings
                  storeName={storeName}
                  setStoreName={setStoreName}
                />
                <h2 className="text-lg font-bold flex items-center gap-2">
                  {t("availableComponents")}
                </h2>
                <div className="flex flex-col space-y-3">
                  {availableComponentTypes.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.type}
                        onClick={() =>
                          handleAddSection(
                            item.type,
                            t(
                              `components.${item.type}.title` as "components.header.title",
                            ),
                          )
                        }
                        className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                      >
                        <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-700">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-bold">
                            {t(`components.${item.type}.title` as "components.header.title")}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {t(
                              `components.${item.type}.description` as "components.header.description",
                            )}
                          </span>
                        </div>
                        <Plus className="w-4 h-4 text-zinc-400 self-center" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-2 flex flex-col space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5" /> {t("activeStructure")}
                </h2>

                {sections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-700 text-center gap-3">
                    <Store className="w-10 h-10 text-zinc-400" />
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      {t("emptyStructure")}
                    </p>
                  </div>
                ) : (
                  <StoreSectionsEditor
                    sections={sections}
                    onMoveSection={(index, dir) =>
                      handleMoveSection(index, dir)
                    }
                    onToggleEnable={(id) => {
                      setSections((prev) =>
                        prev.map((s) =>
                          s.id === id ? { ...s, enabled: !s.enabled } : s,
                        ),
                      );
                    }}
                    onRemoveSection={(id, title) =>
                      handleRemoveSection(id, title)
                    }
                    onButtonTextChange={(id, text) => {
                      setSections((prev) =>
                        prev.map((sec) =>
                          sec.id === id ? { ...sec, buttonText: text } : sec,
                        ),
                      );
                    }}
                    onBgColorChange={(id, color) => {
                      setSections((prev) =>
                        prev.map((sec) =>
                          sec.id === id ? { ...sec, bgColor: color } : sec,
                        ),
                      );
                    }}
                    onNavAlignmentChange={(id, alignment) => {
                      setSections((prev) =>
                        prev.map((sec) =>
                          sec.id === id
                            ? { ...sec, navAlignment: alignment }
                            : sec,
                        ),
                      );
                    }}
                    onAddNavBtn={(sectionId, target) => {
                      setSections((prev) =>
                        prev.map((sec) => {
                          if (sec.id !== sectionId) return sec;
                          const newBtn = {
                            id: `btn-${Date.now()}`,
                            label: target === "right" ? t("action") : t("navLink"),
                          };
                          return target === "right"
                            ? {
                                ...sec,
                                rightNavButtons: [
                                  ...(sec.rightNavButtons || []),
                                  newBtn,
                                ],
                              }
                            : {
                                ...sec,
                                navButtons: [...(sec.navButtons || []), newBtn],
                              };
                        }),
                      );
                    }}
                    onRemoveNavBtn={(sectionId, target, btnId) => {
                      setSections((prev) =>
                        prev.map((sec) => {
                          if (sec.id !== sectionId) return sec;
                          return target === "right"
                            ? {
                                ...sec,
                                rightNavButtons: (
                                  sec.rightNavButtons || []
                                ).filter((b) => b.id !== btnId),
                              }
                            : {
                                ...sec,
                                navButtons: (sec.navButtons || []).filter(
                                  (b) => b.id !== btnId,
                                ),
                              };
                        }),
                      );
                    }}
                    onUpdateNavBtnLabel={(sectionId, target, btnId, label) => {
                      setSections((prev) =>
                        prev.map((sec) => {
                          if (sec.id !== sectionId) return sec;
                          const listKey =
                            target === "right"
                              ? "rightNavButtons"
                              : "navButtons";
                          const updated = (sec[listKey] || []).map((b) =>
                            b.id === btnId ? { ...b, label } : b,
                          );
                          return { ...sec, [listKey]: updated };
                        }),
                      );
                    }}
                    onAddHeroBtn={(sectionId) => {
                      setSections((prev) =>
                        prev.map((sec) => {
                          if (sec.id !== sectionId) return sec;
                          if ((sec.heroButtons || []).length >= 3) return sec;
                          const newBtn = {
                            id: `hbtn-${Date.now()}`,
                            label: t("newAction"),
                            variant: "Secondary Style",
                          };
                          return {
                            ...sec,
                            heroButtons: [...(sec.heroButtons || []), newBtn],
                          };
                        }),
                      );
                    }}
                    onRemoveHeroBtn={(sectionId, btnId) => {
                      setSections((prev) =>
                        prev.map((sec) => {
                          if (sec.id !== sectionId) return sec;
                          return {
                            ...sec,
                            heroButtons: (sec.heroButtons || []).filter(
                              (b) => b.id !== btnId,
                            ),
                          };
                        }),
                      );
                    }}
                    onUpdateHeroBtn={(sectionId, btnId, field, val) => {
                      setSections((prev) =>
                        prev.map((sec) => {
                          if (sec.id !== sectionId) return sec;
                          const updated = (sec.heroButtons || []).map((b) =>
                            b.id === btnId ? { ...b, [field]: val } : b,
                          );
                          return { ...sec, heroButtons: updated };
                        }),
                      );
                    }}
                    onHeroTextChange={(sectionId, field, value) => {
                      setSections((prev) =>
                        prev.map((sec) =>
                          sec.id === sectionId
                            ? { ...sec, [field]: value }
                            : sec,
                        ),
                      );
                    }}
                    onFooterTextChange={(sectionId, field, value) => {
                      setSections((prev) =>
                        prev.map((sec) =>
                          sec.id === sectionId
                            ? { ...sec, [field]: value }
                            : sec,
                        ),
                      );
                    }}
                    onUpdateSliderProduct={(
                      sectionId,
                      prodId,
                      field,
                      value,
                    ) => {
                      setSections((prev) =>
                        prev.map((sec) => {
                          if (sec.id !== sectionId) return sec;
                          const updatedProds = (sec.sliderProducts || []).map(
                            (p) =>
                              p.id === prodId ? { ...p, [field]: value } : p,
                          );
                          return { ...sec, sliderProducts: updatedProds };
                        }),
                      );
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {isPreview && totalCartCount > 0 && (
            <Button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="fixed bottom-6 right-6 z-40 p-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-3 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">
                {t("cartItems", { count: totalCartCount, price: totalCartPrice })}
              </span>
            </Button>
          )}
        </section>
      </main>
    </>
  );
};

export default UserStorePage;
