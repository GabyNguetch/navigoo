"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Check, Settings, X } from "lucide-react";
import { useCookieConsent } from "@/hooks/useCookiesConsent";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export const CookieConsent = () => {
  const { showConsent, preferences, acceptAll, acceptNecessary, savePreferences, setShowConsent } =
    useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const handleSaveCustom = () => {
    savePreferences(localPreferences);
    setShowDetails(false);
  };

  if (!showConsent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-end sm:items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-purple-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Cookie size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Respect de votre vie privée</h3>
                  <p className="text-sm text-white/80 mt-1">
                    Nous utilisons des cookies pour améliorer votre expérience
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  acceptNecessary();
                  setShowConsent(false);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {!showDetails ? (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Nous utilisons des cookies essentiels pour faire fonctionner notre site et des
                  cookies optionnels pour améliorer votre expérience et analyser notre trafic.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={acceptAll}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white gap-2 h-12"
                  >
                    <Check size={18} />
                    Tout accepter
                  </Button>
                  <Button
                    onClick={acceptNecessary}
                    variant="outline"
                    className="flex-1 h-12"
                  >
                    Nécessaires uniquement
                  </Button>
                  <Button
                    onClick={() => setShowDetails(true)}
                    variant="ghost"
                    className="flex-1 h-12 gap-2"
                  >
                    <Settings size={18} />
                    Personnaliser
                  </Button>
                </div>

                <p className="text-xs text-zinc-500 text-center">
                  En continuant, vous acceptez notre{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    Politique de confidentialité
                  </a>
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h4 className="font-bold text-lg dark:text-white">Paramètres des cookies</h4>

                {/* Cookie nécessaires */}
                <div className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-bold text-sm dark:text-white">Cookies nécessaires</h5>
                      <span className="text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
                        Obligatoire
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Indispensables au fonctionnement du site (authentification, préférences)
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-primary rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Cookie analytiques */}
                <div className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <div className="flex-1">
                    <h5 className="font-bold text-sm dark:text-white mb-1">Cookies analytiques</h5>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Nous aident à comprendre comment vous utilisez notre site
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setLocalPreferences({ ...localPreferences, analytics: !localPreferences.analytics })
                    }
                    className="ml-4"
                  >
                    <div
                      className={`w-12 h-6 rounded-full flex items-center transition-all ${
                        localPreferences.analytics
                          ? "bg-primary justify-end"
                          : "bg-zinc-300 dark:bg-zinc-600 justify-start"
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </button>
                </div>

                {/* Cookie marketing */}
                <div className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <div className="flex-1">
                    <h5 className="font-bold text-sm dark:text-white mb-1">Cookies marketing</h5>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Utilisés pour personnaliser la publicité
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setLocalPreferences({ ...localPreferences, marketing: !localPreferences.marketing })
                    }
                    className="ml-4"
                  >
                    <div
                      className={`w-12 h-6 rounded-full flex items-center transition-all ${
                        localPreferences.marketing
                          ? "bg-primary justify-end"
                          : "bg-zinc-300 dark:bg-zinc-600 justify-start"
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setShowDetails(false)} variant="outline" className="flex-1">
                    Retour
                  </Button>
                  <Button onClick={handleSaveCustom} className="flex-1 bg-primary hover:bg-primary-dark">
                    Enregistrer mes choix
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};