"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cookie, Settings, Shield, Eye, BarChart3, Target,
  CheckCircle, XCircle, Info, ChevronRight, Save,
  Globe, Lock, Clock, AlertCircle, Download, Mail
} from "lucide-react";

export default function CookiesPolicyPage() {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Always true, non-modifiable
    functional: true,
    analytics: false,
    marketing: false
  });

  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const handleToggle = (category: keyof typeof cookiePreferences) => {
    if (category === "necessary") return; // Cannot disable necessary cookies
    
    setCookiePreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const savePreferences = () => {
    // Here you would save to localStorage or send to backend
    localStorage.setItem("navigoo_cookie_preferences", JSON.stringify(cookiePreferences));
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);
  };

  const acceptAll = () => {
    setCookiePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    });
    savePreferences();
  };

  const rejectAll = () => {
    setCookiePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    });
    savePreferences();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-400/30 mb-8">
              <Cookie className="text-purple-400" size={20} />
              <span className="font-bold text-purple-300">Dernière mise à jour: 5 février 2026</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-300 bg-clip-text text-transparent">
              Politique de<br />Cookies
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Découvrez comment Navigoo utilise les cookies pour améliorer votre expérience 
              et personnaliser nos services selon vos préférences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                <Download size={20} />
                Télécharger en PDF
              </button>
              <a 
                href="#preferences"
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Settings size={20} />
                Gérer mes Préférences
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What are Cookies */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4">Qu'est-ce qu'un Cookie ?</h2>
            <p className="text-slate-400 max-w-3xl mx-auto">
              Les cookies sont de petits fichiers texte stockés sur votre appareil qui nous 
              aident à améliorer votre expérience sur navigoo.cm
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <InfoCard
              icon={<Info className="text-blue-400" size={32} />}
              title="Fichiers Texte"
              description="Petits fichiers (quelques Ko) contenant des informations simples comme vos préférences"
            />
            <InfoCard
              icon={<Clock className="text-green-400" size={32} />}
              title="Durée Limitée"
              description="Expiration automatique après une période définie (de quelques heures à plusieurs mois)"
            />
            <InfoCard
              icon={<Lock className="text-purple-400" size={32} />}
              title="Sécurisés"
              description="Ne peuvent pas exécuter de code ni contenir de virus. Ils ne lisent que les données qu'ils ont créées"
            />
          </div>
        </div>
      </section>

      {/* Cookie Preferences Manager */}
      <section id="preferences" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-purple-500/20 px-6 py-3 rounded-full border border-purple-400/30 mb-6">
              <Settings className="text-purple-400" size={20} />
              <span className="font-bold text-purple-300">Centre de Préférences</span>
            </div>
            <h2 className="text-4xl font-black mb-4">Gérez Vos Cookies</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Choisissez les types de cookies que vous acceptez. Vous pouvez modifier 
              ces préférences à tout moment.
            </p>
          </motion.div>

          <div className="space-y-6">
            
            {/* Necessary Cookies */}
            <CookieCategory
              icon={<Shield className="text-blue-400" size={28} />}
              title="Cookies Nécessaires"
              description="Essentiels au fonctionnement du site. Ils ne peuvent pas être désactivés."
              enabled={cookiePreferences.necessary}
              locked={true}
              examples={[
                "Authentification (session utilisateur)",
                "Panier d'achat / commande",
                "Préférences de langue",
                "Sécurité et prévention des fraudes"
              ]}
              onToggle={() => handleToggle("necessary")}
            />

            {/* Functional Cookies */}
            <CookieCategory
              icon={<Settings className="text-green-400" size={28} />}
              title="Cookies Fonctionnels"
              description="Améliorent votre expérience en mémorisant vos choix (thème sombre, zoom de carte, etc.)"
              enabled={cookiePreferences.functional}
              examples={[
                "Préférences d'affichage (mode sombre/clair)",
                "Niveau de zoom de carte par défaut",
                "Ville favorite pour les recherches",
                "Paramètres d'accessibilité"
              ]}
              onToggle={() => handleToggle("functional")}
            />

            {/* Analytics Cookies */}
            <CookieCategory
              icon={<BarChart3 className="text-purple-400" size={28} />}
              title="Cookies Analytiques"
              description="Nous aident à comprendre comment les visiteurs utilisent notre site pour l'améliorer"
              enabled={cookiePreferences.analytics}
              examples={[
                "Google Analytics (pages visitées, durée)",
                "Hotjar (cartes de chaleur, enregistrements)",
                "Statistiques d'utilisation API",
                "Taux de conversion et performance"
              ]}
              onToggle={() => handleToggle("analytics")}
            />

            {/* Marketing Cookies */}
            <CookieCategory
              icon={<Target className="text-orange-400" size={28} />}
              title="Cookies Marketing"
              description="Utilisés pour afficher des publicités pertinentes et mesurer l'efficacité de nos campagnes"
              enabled={cookiePreferences.marketing}
              examples={[
                "Google Ads (remarketing, conversion)",
                "Facebook Pixel (audiences personnalisées)",
                "LinkedIn Insight Tag",
                "Suivi des campagnes email"
              ]}
              onToggle={() => handleToggle("marketing")}
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={acceptAll}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-10 py-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
            >
              <CheckCircle size={24} />
              Tout Accepter
            </button>
            
            <button
              onClick={savePreferences}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-10 py-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Save size={24} />
              Enregistrer mes Préférences
            </button>

            <button
              onClick={rejectAll}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-10 py-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <XCircle size={24} />
              Tout Refuser
            </button>
          </div>

          {/* Save Confirmation */}
          <AnimatePresence>
            {showSaveConfirmation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 bg-green-600/20 border border-green-500/30 rounded-xl p-6 flex items-center gap-3"
              >
                <CheckCircle className="text-green-400 shrink-0" size={24} />
                <p className="text-green-300 font-medium">
                  ✓ Vos préférences ont été enregistrées avec succès !
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Detailed Cookie List */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4">Liste Détaillée des Cookies</h2>
            <p className="text-slate-400">
              Transparence totale sur tous les cookies utilisés par Navigoo
            </p>
          </motion.div>

          <div className="space-y-4">
            <CookieDetails
              name="_navigoo_session"
              category="Nécessaire"
              purpose="Maintenir votre session d'authentification"
              duration="24 heures"
              provider="Navigoo"
            />
            <CookieDetails
              name="navigoo_lang"
              category="Fonctionnel"
              purpose="Mémoriser votre langue préférée (fr, en)"
              duration="12 mois"
              provider="Navigoo"
            />
            <CookieDetails
              name="navigoo_theme"
              category="Fonctionnel"
              purpose="Sauvegarder votre choix de thème (clair/sombre)"
              duration="12 mois"
              provider="Navigoo"
            />
            <CookieDetails
              name="_ga"
              category="Analytique"
              purpose="Distinguer les utilisateurs uniques"
              duration="2 ans"
              provider="Google Analytics"
            />
            <CookieDetails
              name="_gid"
              category="Analytique"
              purpose="Distinguer les utilisateurs"
              duration="24 heures"
              provider="Google Analytics"
            />
            <CookieDetails
              name="_fbp"
              category="Marketing"
              purpose="Mesurer et améliorer les performances publicitaires"
              duration="3 mois"
              provider="Facebook"
            />
            <CookieDetails
              name="_gcl_au"
              category="Marketing"
              purpose="Suivi des conversions Google Ads"
              duration="3 mois"
              provider="Google Ads"
            />
          </div>
        </div>
      </section>

      {/* How to Manage Cookies */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4">Gérer les Cookies via Votre Navigateur</h2>
            <p className="text-slate-400 max-w-3xl mx-auto">
              Vous pouvez également contrôler ou supprimer les cookies directement 
              depuis les paramètres de votre navigateur
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BrowserGuide
              browser="Google Chrome"
              icon="🌐"
              steps={[
                "Paramètres > Confidentialité",
                "Cookies et données des sites",
                "Gérer les cookies"
              ]}
            />
            <BrowserGuide
              browser="Mozilla Firefox"
              icon="🦊"
              steps={[
                "Paramètres > Vie privée",
                "Cookies et données",
                "Gérer les permissions"
              ]}
            />
            <BrowserGuide
              browser="Safari"
              icon="🧭"
              steps={[
                "Préférences > Confidentialité",
                "Gérer les cookies",
                "Bloquer ou autoriser"
              ]}
            />
            <BrowserGuide
              browser="Microsoft Edge"
              icon="🌊"
              steps={[
                "Paramètres > Cookies",
                "Gérer les autorisations",
                "Bloquer les cookies"
              ]}
            />
          </div>

          <div className="mt-12 bg-yellow-600/10 border border-yellow-500/30 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-yellow-400 shrink-0 mt-1" size={28} />
              <div>
                <h3 className="text-xl font-bold text-yellow-300 mb-3">
                  ⚠️ Impact de la Désactivation des Cookies
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Bloquer tous les cookies peut affecter le fonctionnement de navigoo.cm. 
                  Certaines fonctionnalités comme l'authentification, la personnalisation 
                  de la carte, ou la sauvegarde de vos préférences ne fonctionneront plus correctement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third-Party Services */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4">Services Tiers</h2>
            <p className="text-slate-400 max-w-3xl mx-auto">
              Navigoo utilise des services externes qui peuvent placer leurs propres cookies
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ThirdPartyService
              name="Google Analytics"
              purpose="Analyse d'audience"
              privacyUrl="https://policies.google.com/privacy"
            />
            <ThirdPartyService
              name="Google Ads"
              purpose="Publicité et remarketing"
              privacyUrl="https://policies.google.com/privacy"
            />
            <ThirdPartyService
              name="Facebook Pixel"
              purpose="Suivi des conversions"
              privacyUrl="https://www.facebook.com/privacy"
            />
            <ThirdPartyService
              name="Stripe"
              purpose="Paiements sécurisés"
              privacyUrl="https://stripe.com/privacy"
            />
            <ThirdPartyService
              name="Hotjar"
              purpose="Analyse comportementale"
              privacyUrl="https://www.hotjar.com/privacy"
            />
            <ThirdPartyService
              name="Intercom"
              purpose="Support client"
              privacyUrl="https://www.intercom.com/legal/privacy"
            />
          </div>
        </div>
      </section>

      {/* Contact & Updates */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black mb-4">Questions sur les Cookies ?</h2>
              <p className="text-slate-400">
                Notre équipe est disponible pour répondre à vos interrogations
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-4 bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
                <Mail className="text-purple-400 shrink-0" size={28} />
                <div>
                  <p className="text-slate-400 text-sm mb-1">Email</p>
                  <a href="mailto:privacy@navigoo.cm" className="text-white font-bold hover:text-purple-400 transition-colors">
                    privacy@navigoo.cm
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
                <Globe className="text-blue-400 shrink-0" size={28} />
                <div>
                  <p className="text-slate-400 text-sm mb-1">Site Web</p>
                  <a href="https://navigoo.cm" className="text-white font-bold hover:text-blue-400 transition-colors">
                    navigoo.cm
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-400 shrink-0 mt-1" size={20} />
                <div className="text-sm text-slate-300">
                  <p className="font-bold text-blue-300 mb-2">Mises à Jour de la Politique</p>
                  <p>
                    Cette politique peut être mise à jour périodiquement. Nous vous informerons 
                    de tout changement majeur par email ou via une notification sur le site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-4">
            Prêt à Personnaliser Votre Expérience ?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Gérez vos préférences de cookies en quelques clics
          </p>
          <a
            href="#preferences"
            className="inline-flex items-center gap-3 bg-white text-purple-600 hover:bg-slate-100 font-bold px-10 py-5 rounded-xl transition-all duration-300 shadow-2xl"
          >
            <Settings size={24} />
            Gérer mes Cookies
            <ChevronRight size={24} />
          </a>
        </div>
      </section>
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

const InfoCard = ({ icon, title, description }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50"
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const CookieCategory = ({ icon, title, description, enabled, locked, examples, onToggle }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden"
  >
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4 flex-1">
          {icon}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">{title}</h3>
              {locked && (
                <Lock className="text-slate-400" size={18} />
              )}
            </div>
            <p className="text-slate-400 leading-relaxed">{description}</p>
          </div>
        </div>

        <button
          onClick={onToggle}
          disabled={locked}
          className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
            enabled 
              ? "bg-gradient-to-r from-green-600 to-emerald-600" 
              : "bg-slate-700"
          } ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <motion.div
            animate={{ x: enabled ? 32 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
          />
        </button>
      </div>

      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
        <p className="text-sm font-bold text-slate-300 mb-3">Exemples d'utilisation :</p>
        <ul className="space-y-2">
          {examples.map((example: string, idx: number) => (
            <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
              <CheckCircle className="text-green-400 shrink-0 mt-0.5" size={16} />
              <span>{example}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </motion.div>
);

const CookieDetails = ({ name, category, purpose, duration, provider }: any) => {
  const categoryColors: any = {
    "Nécessaire": "bg-blue-600/20 text-blue-400 border-blue-500/30",
    "Fonctionnel": "bg-green-600/20 text-green-400 border-green-500/30",
    "Analytique": "bg-purple-600/20 text-purple-400 border-purple-500/30",
    "Marketing": "bg-orange-600/20 text-orange-400 border-orange-500/30"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <code className="text-blue-400 font-mono font-bold">{name}</code>
            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${categoryColors[category]}`}>
              {category}
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-2">{purpose}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {duration}
            </span>
            <span className="flex items-center gap-1">
              <Globe size={14} />
              {provider}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BrowserGuide = ({ browser, icon, steps }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/50 transition-all duration-300"
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold mb-4">{browser}</h3>
    <ol className="space-y-2">
      {steps.map((step: string, idx: number) => (
        <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
          <span className="text-purple-400 font-bold">{idx + 1}.</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  </motion.div>
);

const ThirdPartyService = ({ name, purpose, privacyUrl }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all duration-300"
  >
    <h3 className="text-lg font-bold mb-2">{name}</h3>
    <p className="text-sm text-slate-400 mb-4">{purpose}</p>
    <a
      href={privacyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2 transition-colors"
    >
      Politique de confidentialité
      <ChevronRight size={16} />
    </a>
  </motion.div>
);