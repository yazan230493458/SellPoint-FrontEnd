"use client";

import React from "react";
import Image from "next/image";
import { ShoppingBasket, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { CartItem } from "@/lib/store-editor.types";
import Button from "../ui/Button";

type ShoppingCartPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalCartCount: number;
  totalCartPrice: number;
  onUpdateQty: (id: number, delta: number) => void;
  onCheckout: () => void;
};

export const ShoppingCartPanel: React.FC<ShoppingCartPanelProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalCartCount,
  totalCartPrice,
  onUpdateQty,
  onCheckout,
}) => {
  const t = useTranslations("Storefront");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full p-6 shadow-lg flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <ShoppingBasket className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {t("shoppingCart", { count: totalCartCount })}
              </h3>
            </div>
            <Button
              type="button"
              onClick={onClose}
              aria-label={t("closeCart")}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-col space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {cartItems.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 text-sm">
                {t("emptyCart")}
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shrink-0 border border-zinc-200 dark:border-zinc-700">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-36">
                        {item.title}
                      </span>
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                        ${item.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <Button
                      type="button"
                      onClick={() => onUpdateQty(item.id, -1)}
                      aria-label={t("decreaseQuantity")}
                      className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-bold cursor-pointer"
                    >
                      -
                    </Button>
                    <span className="text-xs font-bold px-1">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      onClick={() => onUpdateQty(item.id, 1)}
                      aria-label={t("increaseQuantity")}
                      className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-bold cursor-pointer"
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between text-base font-bold">
            <span>{t("totalAmount")}</span>
            <span>${totalCartPrice}</span>
          </div>
          <Button
            type="button"
            onClick={onCheckout}
            className="w-full py-2.5 px-5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200 font-semibold text-sm shadow-lg cursor-pointer"
          >
            {t("checkoutNow", { price: totalCartPrice })}
          </Button>
        </div>
      </div>
    </div>
  );
};
