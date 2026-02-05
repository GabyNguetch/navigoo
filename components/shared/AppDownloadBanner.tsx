"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const AppDownloadBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("navigoo_app_banner_dismissed");
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (!dismissed && isMobile) {
      setTimeout(() => setShowBanner(true), 3000);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowBanner(false);
      localStorage.setItem("navigoo_app_banner_dismissed", "true");
    }, 300);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[80]"
        >
          <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
                <Smartphone className="text-white" size={32} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg mb-1">
                  Téléchargez l'app Navigoo
                </h3>
                <p className="text-white/80 text-xs">
                  Explorez le Cameroun depuis votre mobile
                </p>
              </div>

              {/* Close */}
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0"
              >
                <X className="text-white" size={20} />
              </button>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  className="w-full bg-white text-primary hover:bg-zinc-100 font-bold gap-2"
                  size="sm"
                >
                  <Download size={16} />
                  Play Store
                </Button>
              </a>
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  className="w-full bg-white text-primary hover:bg-zinc-100 font-bold gap-2"
                  size="sm"
                >
                  <Download size={16} />
                  App Store
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};