"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Lock, Eye, Database, User, Globe,
  FileText, AlertCircle, CheckCircle, ChevronRight,
  Mail, Phone, MapPin, Clock, Download
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-400/30 mb-8">
              <Shield className="text-blue-400" size={20} />
              <span className="font-bold text-blue-300">Dernière mise à jour: 5 février 2026</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
              Politique de<br />Confidentialité
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Navigoo s'engage à protéger vos données personnelles et votre vie privée. 
              Découvrez comment nous collectons, utilisons et protégeons vos informations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                <Download size={20} />
                Télécharger en PDF
              </button>
              <a 
                href="mailto:privacy@navigoo.cm"
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Mail size={20} />
                Nous Contacter
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black mb-4">En Résumé</h2>
            <p className="text-slate-400">Les points essentiels de notre politique</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <SummaryCard
              icon={<Lock className="text-green-400" size={32} />}
              title="Données Sécurisées"
              description="Chiffrement AES-256 et conformité RGPD pour protéger vos informations"
            />
            <SummaryCard
              icon={<Eye className="text-blue-400" size={32} />}
              title="Transparence Totale"
              description="Vous savez exactement quelles données nous collectons et pourquoi"
            />
            <SummaryCard
              icon={<User className="text-purple-400" size={32} />}
              title="Vos Droits"
              description="Accès, modification et suppression de vos données à tout moment"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="space-y-6">
            
            <PolicySection
              id="introduction"
              icon={<FileText className="text-blue-400" size={24} />}
              title="1. Introduction"
              active={activeSection === "introduction"}
              onToggle={() => toggleSection("introduction")}
            >
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  Bienvenue sur Navigoo. La présente Politique de Confidentialité décrit comment 
                  <strong className="text-white"> Navigoo SARL</strong>, société de droit camerounais 
                  immatriculée à Yaoundé, collecte, utilise, partage et protège les informations 
                  personnelles de ses utilisateurs.
                </p>
                <p>
                  En utilisant nos services (API Navigoo, bibliothèque navigoo-native, site web, 
                  applications mobiles), vous acceptez les pratiques décrites dans cette politique.
                </p>
                
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6 mt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-400 shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-blue-300 mb-2">Important</p>
                      <p className="text-sm text-slate-300">
                        Si vous n'acceptez pas cette politique, veuillez ne pas utiliser nos services.
                        Vous pouvez nous contacter à <strong>privacy@navigoo.cm</strong> pour toute question.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PolicySection>

            <PolicySection
              id="data-collection"
              icon={<Database className="text-green-400" size={24} />}
              title="2. Données Collectées"
              active={activeSection === "data-collection"}
              onToggle={() => toggleSection("data-collection")}
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold mb-3 text-white">2.1 Données d'Identification</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 shrink-0 mt-1" size={16} />
                      <span>Nom et prénom (ou nom d'organisation)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 shrink-0 mt-1" size={16} />
                      <span>Adresse email professionnelle ou personnelle</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 shrink-0 mt-1" size={16} />
                      <span>Numéro de téléphone (optionnel)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 shrink-0 mt-1" size={16} />
                      <span>Informations de facturation (pour les abonnements payants)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold mb-3 text-white">2.2 Données d'Utilisation</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 shrink-0 mt-1" size={16} />
                      <span>Requêtes API (endpoints appelés, fréquence, volumes)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 shrink-0 mt-1" size={16} />
                      <span>Logs techniques (adresses IP, user-agents, timestamps)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 shrink-0 mt-1" size={16} />
                      <span>Données de navigation sur navigoo.cm (pages vues, durée, clics)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold mb-3 text-white">2.3 Données Géographiques</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 shrink-0 mt-1" size={16} />
                      <span>Coordonnées GPS (si vous utilisez la géolocalisation dans votre application)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 shrink-0 mt-1" size={16} />
                      <span>Recherches de lieux et POIs effectuées</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 shrink-0 mt-1" size={16} />
                      <span>Itinéraires calculés via notre API de routing</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-400 shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-yellow-300 mb-2">Données Sensibles</p>
                      <p className="text-sm text-slate-300">
                        Navigoo ne collecte <strong>jamais</strong> de données de santé, religieuses, 
                        politiques ou biométriques. Nous ne suivons pas votre position en temps réel 
                        en arrière-plan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PolicySection>

            <PolicySection
              id="data-usage"
              icon={<Globe className="text-purple-400" size={24} />}
              title="3. Utilisation des Données"
              active={activeSection === "data-usage"}
              onToggle={() => toggleSection("data-usage")}
            >
              <div className="space-y-4 text-slate-300">
                <p>Nous utilisons vos données pour :</p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <UsageCard
                    icon={<CheckCircle className="text-green-400" size={20} />}
                    title="Fourniture du Service"
                    items={[
                      "Traiter vos requêtes API",
                      "Gérer votre compte utilisateur",
                      "Facturer vos abonnements"
                    ]}
                  />
                  <UsageCard
                    icon={<CheckCircle className="text-blue-400" size={20} />}
                    title="Amélioration"
                    items={[
                      "Analyser l'usage de l'API",
                      "Optimiser les performances",
                      "Développer nouvelles fonctionnalités"
                    ]}
                  />
                  <UsageCard
                    icon={<CheckCircle className="text-purple-400" size={20} />}
                    title="Communication"
                    items={[
                      "Notifications techniques",
                      "Newsletters (opt-in)",
                      "Support client"
                    ]}
                  />
                  <UsageCard
                    icon={<CheckCircle className="text-orange-400" size={20} />}
                    title="Sécurité"
                    items={[
                      "Détecter les abus",
                      "Prévenir la fraude",
                      "Conformité légale"
                    ]}
                  />
                </div>
              </div>
            </PolicySection>

            <PolicySection
              id="data-sharing"
              icon={<Lock className="text-red-400" size={24} />}
              title="4. Partage des Données"
              active={activeSection === "data-sharing"}
              onToggle={() => toggleSection("data-sharing")}
            >
              <div className="space-y-4 text-slate-300">
                <p className="font-medium text-white">
                  Navigoo ne vend <strong>JAMAIS</strong> vos données personnelles.
                </p>
                
                <p>Nous partageons vos données uniquement dans les cas suivants :</p>

                <div className="space-y-4 mt-6">
                  <SharingCase
                    title="Prestataires de Services"
                    description="Hébergement cloud (AWS, Google Cloud), services de paiement (Stripe, PayPal), 
                    outils d'analytics (conformes RGPD). Ces prestataires sont contractuellement tenus 
                    de protéger vos données."
                  />
                  <SharingCase
                    title="Obligations Légales"
                    description="Sur demande d'autorités judiciaires ou administratives camerounaises, 
                    dans le cadre d'enquêtes légales, ou pour protéger nos droits."
                  />
                  <SharingCase
                    title="Transactions d'Entreprise"
                    description="En cas de fusion, acquisition ou vente d'actifs, vos données pourraient 
                    être transférées. Vous seriez informés au préalable."
                  />
                </div>

                <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-6 mt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-400 shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-green-300 mb-2">Données Anonymisées</p>
                      <p className="text-sm text-slate-300">
                        Nous pouvons partager des statistiques <strong>anonymisées</strong> 
                        (ex: "50% des utilisateurs sont à Yaoundé") pour des études ou partenariats, 
                        sans aucune identification personnelle.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PolicySection>

            <PolicySection
              id="security"
              icon={<Shield className="text-blue-400" size={24} />}
              title="5. Sécurité des Données"
              active={activeSection === "security"}
              onToggle={() => toggleSection("security")}
            >
              <div className="space-y-4 text-slate-300">
                <p>
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
                  pour protéger vos données :
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <SecurityMeasure
                    icon={<Lock className="text-blue-400" size={24} />}
                    title="Chiffrement"
                    description="AES-256 pour les données au repos, TLS 1.3 pour les transmissions"
                  />
                  <SecurityMeasure
                    icon={<Shield className="text-green-400" size={24} />}
                    title="Contrôle d'Accès"
                    description="Authentification multi-facteurs, gestion des permissions par rôle"
                  />
                  <SecurityMeasure
                    icon={<Database className="text-purple-400" size={24} />}
                    title="Sauvegardes"
                    description="Backups quotidiens, stockage redondant sur plusieurs zones"
                  />
                  <SecurityMeasure
                    icon={<Eye className="text-orange-400" size={24} />}
                    title="Monitoring"
                    description="Surveillance 24/7, détection d'anomalies, alertes automatiques"
                  />
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mt-6">
                  <p className="text-sm text-slate-400">
                    <strong className="text-white">Certification:</strong> Navigoo est conforme 
                    au RGPD européen et aux lois camerounaises sur la protection des données 
                    personnelles (Loi n° 2010/012 du 21 décembre 2010).
                  </p>
                </div>
              </div>
            </PolicySection>

            <PolicySection
              id="user-rights"
              icon={<User className="text-green-400" size={24} />}
              title="6. Vos Droits"
              active={activeSection === "user-rights"}
              onToggle={() => toggleSection("user-rights")}
            >
              <div className="space-y-4 text-slate-300">
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>

                <div className="space-y-4 mt-6">
                  <RightCard
                    title="Droit d'Accès"
                    description="Demander une copie de toutes les données personnelles que nous détenons sur vous"
                    action="Demander mes données"
                  />
                  <RightCard
                    title="Droit de Rectification"
                    description="Corriger ou mettre à jour vos informations personnelles"
                    action="Modifier mes données"
                  />
                  <RightCard
                    title="Droit à l'Effacement"
                    description="Demander la suppression de vos données (sous réserve des obligations légales)"
                    action="Supprimer mon compte"
                  />
                  <RightCard
                    title="Droit d'Opposition"
                    description="Vous opposer au traitement de vos données pour des finalités spécifiques"
                    action="M'opposer au traitement"
                  />
                  <RightCard
                    title="Droit à la Portabilité"
                    description="Recevoir vos données dans un format structuré et interopérable"
                    action="Exporter mes données"
                  />
                </div>

                <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6 mt-8">
                  <p className="font-bold text-blue-300 mb-3">Comment exercer vos droits ?</p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Mail className="text-blue-400" size={16} />
                      <span>Email: <strong>privacy@navigoo.cm</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="text-blue-400" size={16} />
                      <span>Téléphone: <strong>+237 670 00 00 00</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="text-blue-400" size={16} />
                      <span>Délai de réponse: <strong>Maximum 30 jours</strong></span>
                    </p>
                  </div>
                </div>
              </div>
            </PolicySection>

            <PolicySection
              id="retention"
              icon={<Clock className="text-yellow-400" size={24} />}
              title="7. Durée de Conservation"
              active={activeSection === "retention"}
              onToggle={() => toggleSection("retention")}
            >
              <div className="space-y-4 text-slate-300">
                <p>Nous conservons vos données selon les durées suivantes :</p>

                <div className="space-y-3 mt-6">
                  <RetentionItem
                    category="Données de compte actif"
                    duration="Tant que votre compte existe"
                  />
                  <RetentionItem
                    category="Logs API et techniques"
                    duration="12 mois maximum"
                  />
                  <RetentionItem
                    category="Données de facturation"
                    duration="10 ans (obligation légale comptable)"
                  />
                  <RetentionItem
                    category="Compte supprimé"
                    duration="30 jours (puis suppression définitive)"
                  />
                </div>
              </div>
            </PolicySection>

            <PolicySection
              id="cookies"
              icon={<Database className="text-orange-400" size={24} />}
              title="8. Cookies & Traceurs"
              active={activeSection === "cookies"}
              onToggle={() => toggleSection("cookies")}
            >
              <div className="space-y-4 text-slate-300">
                <p>
                  Notre site utilise des cookies. Consultez notre{" "}
                  <a href="/cookies" className="text-blue-400 hover:text-blue-300 underline font-medium">
                    Politique de Cookies
                  </a>{" "}
                  pour plus de détails.
                </p>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mt-4">
                  <p className="text-sm">
                    Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres 
                    de votre navigateur ou notre bannière de consentement.
                  </p>
                </div>
              </div>
            </PolicySection>

            <PolicySection
              id="contact"
              icon={<Mail className="text-purple-400" size={24} />}
              title="9. Nous Contacter"
              active={activeSection === "contact"}
              onToggle={() => toggleSection("contact")}
            >
              <div className="space-y-6">
                <p className="text-slate-300">
                  Pour toute question concernant cette politique ou l'utilisation de vos données :
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <ContactCard
                    icon={<Mail className="text-blue-400" size={24} />}
                    title="Email"
                    value="privacy@navigoo.cm"
                    link="mailto:privacy@navigoo.cm"
                  />
                  <ContactCard
                    icon={<Phone className="text-green-400" size={24} />}
                    title="Téléphone"
                    value="+237 670 00 00 00"
                    link="tel:+237670000000"
                  />
                  <ContactCard
                    icon={<MapPin className="text-purple-400" size={24} />}
                    title="Adresse"
                    value="Yaoundé, Cameroun"
                    link="#"
                  />
                  <ContactCard
                    icon={<Globe className="text-orange-400" size={24} />}
                    title="Site Web"
                    value="navigoo.cm"
                    link="https://navigoo.cm"
                  />
                </div>

                <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                  <p className="font-bold text-blue-300 mb-2">Délégué à la Protection des Données (DPO)</p>
                  <p className="text-sm text-slate-300">
                    Email: <strong>dpo@navigoo.cm</strong><br />
                    Responsable: <strong>Jean-Claude MBARGA</strong>
                  </p>
                </div>
              </div>
            </PolicySection>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-4">
            Des Questions sur Vos Données ?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Notre équipe est là pour répondre à toutes vos interrogations
          </p>
          <a
            href="mailto:privacy@navigoo.cm"
            className="inline-flex items-center gap-3 bg-white text-purple-600 hover:bg-slate-100 font-bold px-10 py-5 rounded-xl transition-all duration-300 shadow-2xl"
          >
            <Mail size={24} />
            Contactez-nous
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

const SummaryCard = ({ icon, title, description }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const PolicySection = ({ id, icon, title, active, onToggle, children }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-8 hover:bg-slate-700/30 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        {icon}
        <h3 className="text-2xl font-bold text-left">{title}</h3>
      </div>
      <motion.div
        animate={{ rotate: active ? 90 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronRight className="text-blue-400" size={28} />
      </motion.div>
    </button>

    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-8 pb-8 pt-4 border-t border-slate-700/50">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const UsageCard = ({ icon, title, items }: any) => (
  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h4 className="font-bold text-white">{title}</h4>
    </div>
    <ul className="space-y-2">
      {items.map((item: string, idx: number) => (
        <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
          <span className="text-blue-400 mt-1">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const SharingCase = ({ title, description }: any) => (
  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
    <h4 className="font-bold text-white mb-2">{title}</h4>
    <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const SecurityMeasure = ({ icon, title, description }: any) => (
  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
    <div className="mb-3">{icon}</div>
    <h4 className="font-bold text-white mb-2">{title}</h4>
    <p className="text-sm text-slate-400">{description}</p>
  </div>
);

const RightCard = ({ title, description, action }: any) => (
  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30 flex items-start justify-between gap-4">
    <div className="flex-1">
      <h4 className="font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
    <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300">
      {action}
    </button>
  </div>
);

const RetentionItem = ({ category, duration }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
    <span className="text-slate-300 font-medium">{category}</span>
    <span className="text-blue-400 font-bold">{duration}</span>
  </div>
);

const ContactCard = ({ icon, title, value, link }: any) => (
  <a
    href={link}
    className="bg-slate-900/50 hover:bg-slate-800/50 rounded-xl p-6 border border-slate-700/30 transition-all duration-300 flex items-center gap-4"
  >
    {icon}
    <div>
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <p className="text-white font-bold">{value}</p>
    </div>
  </a>
);