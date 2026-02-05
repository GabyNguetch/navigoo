"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding, TIPS } from "@/context/OnBoardingContext";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const OnboardingTips = () => {
  const { showTips, currentTip, nextTip, closeTips } = useOnboarding();

  if (!showTips || currentTip >= TIPS.length) return null;

  const tip = TIPS[currentTip];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[85] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-purple-600 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {Array.from({ length: TIPS.length }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 w-8 rounded-full transition-all ${
                        index <= currentTip ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
                <h3 className="text-2xl font-bold text-white">{tip.title}</h3>
              </div>
              <button
                onClick={closeTips}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="text-white" size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed mb-6">
              {tip.description}
            </p>

            <div className="flex gap-3">
              {currentTip < TIPS.length - 1 ? (
                <>
                  <Button onClick={closeTips} variant="outline" className="flex-1">
                    Passer
                  </Button>
                  <Button onClick={nextTip} className="flex-1 gap-2 bg-primary hover:bg-primary-dark">
                    Suivant
                    <ArrowRight size={18} />
                  </Button>
                </>
              ) : (
                <Button onClick={closeTips} className="w-full bg-primary hover:bg-primary-dark">
                  Commencer
                </Button>
              )}
            </div>

            <p className="text-center text-xs text-zinc-400 mt-4">
              {currentTip + 1} / {TIPS.length}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};