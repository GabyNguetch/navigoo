"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OnboardingContextType {
  showTips: boolean;
  currentTip: number;
  setShowTips: (show: boolean) => void;
  nextTip: () => void;
  closeTips: () => void;
  resetTips: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const TIPS = [
  {
    title: "Bienvenue sur Navigoo ! 🎉",
    description: "Découvrez et partagez les meilleurs endroits du Cameroun",
    target: null
  },
  {
    title: "Explorez la carte 🗺️",
    description: "Cliquez sur les marqueurs pour découvrir des lieux",
    target: ".maplibregl-map"
  },
  {
    title: "Recherchez des lieux 🔍",
    description: "Utilisez la barre de recherche pour trouver rapidement",
    target: "input[placeholder*='Rechercher']"
  },
  {
    title: "Créez votre POI 📍",
    description: "Partagez vos découvertes avec la communauté",
    target: "button[data-create-poi]"
  }
];

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [showTips, setShowTips] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasSeenOnboarding = localStorage.getItem("navigoo_onboarding_completed");
    if (!hasSeenOnboarding) {
      setShowTips(true);
    }
  }, []);

  const nextTip = () => {
    if (currentTip < TIPS.length - 1) {
      setCurrentTip(prev => prev + 1);
    } else {
      closeTips();
    }
  };

  const closeTips = () => {
    setShowTips(false);
    setCurrentTip(0);
    localStorage.setItem("navigoo_onboarding_completed", "true");
  };

  const resetTips = () => {
    localStorage.removeItem("navigoo_onboarding_completed");
    setCurrentTip(0);
    setShowTips(true);
  };

  return (
    <OnboardingContext.Provider
      value={{ showTips, currentTip, setShowTips, nextTip, closeTips, resetTips }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
};

export { TIPS };