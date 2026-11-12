export interface NavButtonConfig {
  id: string;
  label: string;
}

export interface HeroButtonConfig {
  id: string;
  label: string;
  variant?: string;
}

export interface SliderProductConfig {
  id: number;
  title: string;
  price: string;
  image: string;
}

export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface StoreSection {
  id: string;
  type:
    | "banner"
    | "featured_ads"
    | "latest_ads"
    | "testimonials"
    | "contact"
    | "slider"
    | "header"
    | "hero"
    | "footer"
    | "grid"
    | "products";
  title: string;
  enabled: boolean;
  buttonText?: string;
  navButtons?: NavButtonConfig[];
  rightNavButtons?: NavButtonConfig[];
  navAlignment?: "left" | "center" | "right";
  heroButtons?: HeroButtonConfig[];
  bgColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  footerTitle?: string;
  footerDescription?: string;
  sliderProducts?: SliderProductConfig[];
}
