"use client";

import { useState, useEffect } from "react";

export const useCookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Toujours activé
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("navigoo_cookie_consent");
    if (!consent) {
      setShowConsent(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem("navigoo_cookie_consent", JSON.stringify(allAccepted));
    setShowConsent(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    localStorage.setItem("navigoo_cookie_consent", JSON.stringify(necessaryOnly));
    setShowConsent(false);
  };

  const savePreferences = (newPreferences: typeof preferences) => {
    setPreferences(newPreferences);
    localStorage.setItem("navigoo_cookie_consent", JSON.stringify(newPreferences));
    setShowConsent(false);
  };

  return {
    showConsent,
    preferences,
    acceptAll,
    acceptNecessary,
    savePreferences,
    setShowConsent,
  };
};