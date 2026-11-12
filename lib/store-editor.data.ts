import {
  Sparkles,
  Flame,
  SlidersHorizontal,
  Tag,
  ShoppingBag,
  PhoneCall,
  Layout,
} from "lucide-react";
import { SliderProductConfig } from "./store-editor.types";

export const availableComponentTypes = [
  {
    type: "header" as const,
    title: "Store Header & Nav",
    description:
      "Header with customizable navigation buttons, right actions, and alignment.",
    icon: Sparkles,
  },
  {
    type: "hero" as const,
    title: "Luxury Hero Section",
    description:
      "Custom hero section with up to 3 action buttons and color picker.",
    icon: Flame,
  },
  {
    type: "banner" as const,
    title: "Promotional Banner",
    description: "Hero image/banner with headline and custom call to action.",
    icon: Sparkles,
  },
  {
    type: "slider" as const,
    title: "Product Slider",
    description:
      "Interactive Swiper slider with custom product titles, prices, and images.",
    icon: SlidersHorizontal,
  },
  {
    type: "featured_ads" as const,
    title: "Featured Products / Ads",
    description: "Highlight top-performing or selected store items.",
    icon: Tag,
  },
  {
    type: "latest_ads" as const,
    title: "Latest Items Grid",
    description: "Automatically displays your recently added products.",
    icon: ShoppingBag,
  },
  {
    type: "contact" as const,
    title: "Direct Contact Card",
    description: "WhatsApp, phone numbers, and location details card.",
    icon: PhoneCall,
  },
  {
    type: "footer" as const,
    title: "Store Footer",
    description:
      "Footer with custom text, color picker, and dynamic brand name.",
    icon: Layout,
  },
];

export const defaultSliderProducts: SliderProductConfig[] = [
  {
    id: 1,
    title: "Royal Chronograph Watch",
    price: "$299",
    image: "/placeholder.png",
  },
  {
    id: 2,
    title: "Luxury Leather Bag",
    price: "$450",
    image: "/placeholder.png",
  },
  {
    id: 3,
    title: "Wireless Audio Pro",
    price: "$180",
    image: "/placeholder.png",
  },
  {
    id: 4,
    title: "Designer Sunglasses",
    price: "$220",
    image: "/placeholder.png",
  },
  {
    id: 5,
    title: "Velvet Perfume Edition",
    price: "$130",
    image: "/placeholder.png",
  },
];
