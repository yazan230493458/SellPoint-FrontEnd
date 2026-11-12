import type { Steps } from "@/store/ad.store";
import { assetUrl } from "@/lib/api";

export type ApiAd = {
  id: number;
  userId?: number;
  username: string;
  adName: string;
  mobileNumber?: string;
  selectedCountry: string;
  selectedRegion?: string;
  selectedCity: string;
  description: string;
  category: string;
  price: string;
  showPrice: boolean;
  images: string[];
  mainImageIndex: number;
  preferredContactMethod: string;
  views?: number;
  featuredActive?: boolean;
  isFeatured?: boolean;
  likes?: number;
  dislikes?: number;
  createdAt?: string;
  viewerReaction?: "LIKE" | "DISLIKE" | null;
  rating?: number;
};

export const toAdSteps = (ad: ApiAd): Steps => ({
  id: ad.id,
  username: ad.username,
  step1: {
    adName: ad.adName,
    mobileNumber: ad.mobileNumber ?? "",
    selectedCountry: ad.selectedCountry,
    selectedCity: ad.selectedCity,
    description: ad.description,
  },
  step2: {
    category: ad.category,
    price: ad.price,
    showPrice: ad.showPrice,
    images: ad.images.map((image) => assetUrl(image)),
    mainImageIndex: ad.mainImageIndex,
  },
  step3: {
    preferredContactMethod: ad.preferredContactMethod,
    acceptTerms: true,
  },
});

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  region: string;
  city: string;
  bio: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN" | "OWNER";
  premium: boolean;
  evaluation: number;
  is2FAEnabled: boolean;
  verifiedEmail: boolean;
  verifiedMobilePhone: boolean;
};

export type AuthResponse = {
  message: string;
  twoFactorRequired?: boolean;
  challengeToken?: string;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
};
