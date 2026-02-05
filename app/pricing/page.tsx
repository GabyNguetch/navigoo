"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Check, X, Zap, Shield, Globe, Headphones, 
  Code, Database, TrendingUp, Users, Building2,
  ChevronRight, Star, Sparkles, Crown, Rocket,
  MessageSquare, FileText, Phone
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20">
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-gradient-to-br from-primary/5 via-purple-50 to-pink-50 dark:from-primary/10 dark:via-purple-950 dark:to-pink-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-primary/20 mb-6">
              <Zap size={16} className="text-primary" />
              <span className="text-sm font-bold text-primary">Tarification Transparente</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white mb-6">
              Des Plans pour<br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Chaque Besoin
              </span>
            </h1>

            <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto mb-8">
              Que vous soyez développeur, startup ou entreprise, trouvez le plan parfait pour intégrer Navigoo à vos projets
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 bg-white dark:bg-zinc-900 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-lg">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-white shadow-md"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all relative ${
                  billingCycle === "yearly"
                    ? "bg-primary text-white shadow-md"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Annuel
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Plan Gratuit */}
            <PricingCard
              name="Gratuit"
              price={0}
              billingCycle={billingCycle}
              description="Parfait pour découvrir l'API"
              features={[
                "100 requêtes/jour",
                "Accès aux POIs publics",
                "Documentation complète",
                "Support communautaire",
                "Données Yaoundé & Douala",
              ]}
              limitations={[
                "Géocodage limité",
                "Pas de statistiques",
                "Branding Navigoo",
              ]}
              cta="Commencer Gratuitement"
              ctaVariant="outline"
              popular={false}
            />

            {/* Plan Starter */}
            <PricingCard
              name="Starter"
              price={billingCycle === "monthly" ? 15000 : 12000}
              billingCycle={billingCycle}
              description="Pour les petits projets"
              features={[
                "5,000 requêtes/jour",
                "Accès à toutes les villes",
                "Geocoding avancé",
                "Statistiques basiques",
                "Support email (48h)",
                "SDK JavaScript & Python",
                "Webhook événements",
              ]}
              limitations={[
                "Export limité",
              ]}
              cta="Essayer Starter"
              ctaVariant="primary"
              popular={false}
              badge="Le plus populaire"
            />

            {/* Plan Pro */}
            <PricingCard
              name="Professional"
              price={billingCycle === "monthly" ? 50000 : 40000}
              billingCycle={billingCycle}
              description="Pour les applications en production"
              features={[
                "50,000 requêtes/jour",
                "API Routage premium",
                "Données en temps réel",
                "Analytics avancés",
                "Support prioritaire (24h)",
                "Tous les SDKs",
                "White-label option",
                "Consultation mensuelle",
                "SLA 99.5%",
              ]}
              cta="Passer Pro"
              ctaVariant="primary"
              popular={true}
              badge="Recommandé"
              icon={<Crown className="text-yellow-500" />}
            />

            {/* Plan Enterprise */}
            <PricingCard
              name="Enterprise"
              price="Sur mesure"
              billingCycle={billingCycle}
              description="Pour les grandes entreprises"
              features={[
                "Requêtes illimitées",
                "Infrastructure dédiée",
                "Données personnalisées",
                "Support 24/7",
                "Account manager dédié",
                "Formation équipe",
                "Intégration sur mesure",
                "SLA 99.9%",
                "Conformité légale",
                "Facturation annuelle",
              ]}
              cta="Nous Contacter"
              ctaVariant="outline"
              popular={false}
              icon={<Rocket className="text-primary" />}
              onCtaClick={() => setShowContactModal(true)}
            />
          </div>
        </div>
      </section>

      {/* Comparaison Détaillée */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-12 dark:text-white">
            Comparaison Détaillée des Fonctionnalités
          </h2>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-950">
                <tr>
                  <th className="text-left p-6 font-bold text-zinc-900 dark:text-white">Fonctionnalité</th>
                  <th className="text-center p-6 font-bold">Gratuit</th>
                  <th className="text-center p-6 font-bold">Starter</th>
                  <th className="text-center p-6 font-bold bg-primary/5">Pro</th>
                  <th className="text-center p-6 font-bold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <FeatureRow feature="Requêtes API / jour" values={["100", "5,000", "50,000", "Illimité"]} highlight={2} />
                <FeatureRow feature="Géocodage & Reverse" values={[false, true, true, true]} highlight={2} />
                <FeatureRow feature="Calcul d'itinéraire" values={[false, true, true, true]} highlight={2} />
                <FeatureRow feature="Analytics & Stats" values={[false, "Basique", "Avancé", "Complet"]} highlight={2} />
                <FeatureRow feature="Support technique" values={["Forum", "Email 48h", "Prioritaire 24h", "24/7 Dédié"]} highlight={2} />
                <FeatureRow feature="SLA Uptime" values={["-", "-", "99.5%", "99.9%"]} highlight={2} />
                <FeatureRow feature="White-label" values={[false, false, true, true]} highlight={2} />
                <FeatureRow feature="Webhooks" values={[false, true, true, true]} highlight={2} />
                <FeatureRow feature="Export données" values={[false, "Limité", "Complet", "Complet"]} highlight={2} />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-12 dark:text-white">
            Questions Fréquentes
          </h2>

          <div className="space-y-4">
            <FAQItem
              question="Quels moyens de paiement acceptez-vous ?"
              answer="Nous acceptons Mobile Money (MTN, Orange), cartes bancaires internationales, et virement bancaire pour les entreprises."
            />
            <FAQItem
              question="Puis-je changer de plan à tout moment ?"
              answer="Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. La facturation sera ajustée au prorata."
            />
            <FAQItem
              question="Offrez-vous une période d'essai ?"
              answer="Oui, tous les plans payants bénéficient de 14 jours d'essai gratuit sans engagement."
            />
            <FAQItem
              question="Les prix incluent-ils la TVA ?"
              answer="Les prix affichés sont HT. La TVA camerounaise de 19.25% sera ajoutée à la facturation."
            />
            <FAQItem
              question="Proposez-vous des réductions pour les ONG ?"
              answer="Oui, nous offrons jusqu'à 50% de réduction pour les organisations à but non lucratif et projets éducatifs. Contactez-nous."
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-6">
            Pas Encore Décidé ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Discutons de votre projet et trouvons la solution idéale ensemble
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowContactModal(true)}
              size="lg"
              className="bg-white text-primary hover:bg-zinc-100 font-bold gap-2"
            >
              <MessageSquare size={20} />
              Parler à un Expert
            </Button>
            <Link href="/documentation">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 gap-2"
              >
                <FileText size={20} />
                Voir la Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal Contact */}
      {showContactModal && (
        <ContactModal onClose={() => setShowContactModal(false)} />
      )}
    </div>
  );
}

// ============================================
// COMPOSANTS
// ============================================

const PricingCard = ({ 
  name, price, billingCycle, description, features, limitations = [], 
  cta, ctaVariant, popular, badge, icon, onCtaClick 
}: any) => {
  const discount = billingCycle === "yearly" ? 0.8 : 1;
  const displayPrice = typeof price === "number" ? Math.round(price * discount) : price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative bg-white dark:bg-zinc-900 rounded-3xl p-8 border-2 transition-all hover:shadow-2xl ${
        popular 
          ? "border-primary shadow-xl scale-105" 
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
          {badge}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">
            {name}
          </h3>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-2">
          {typeof displayPrice === "number" ? (
            <>
              <span className="text-5xl font-black text-zinc-900 dark:text-white">
                {displayPrice.toLocaleString('fr-FR')}
              </span>
              <span className="text-zinc-500">
                FCFA/{billingCycle === "monthly" ? "mois" : "an"}
              </span>
            </>
          ) : (
            <span className="text-4xl font-black text-zinc-900 dark:text-white">
              {displayPrice}
            </span>
          )}
        </div>
        {billingCycle === "yearly" && typeof price === "number" && (
          <p className="text-xs text-green-600 mt-1 font-bold">
            Économisez {((price - displayPrice) * 12).toLocaleString('fr-FR')} FCFA/an
          </p>
        )}
      </div>

      <div className="space-y-3 mb-8">
        {features.map((feature: string, idx: number) => (
          <div key={idx} className="flex items-start gap-3">
            <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{feature}</span>
          </div>
        ))}
        
        {limitations.map((limitation: string, idx: number) => (
          <div key={idx} className="flex items-start gap-3 opacity-50">
            <X size={18} className="text-zinc-400 shrink-0 mt-0.5" />
            <span className="text-sm text-zinc-500 line-through">{limitation}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={onCtaClick}
        variant={ctaVariant}
        className="w-full gap-2 font-bold"
      >
        {cta}
        <ChevronRight size={18} />
      </Button>
    </motion.div>
  );
};

const FeatureRow = ({ feature, values, highlight }: any) => (
  <tr>
    <td className="p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">{feature}</td>
    {values.map((value: any, idx: number) => (
      <td
        key={idx}
        className={`p-4 text-center ${idx === highlight ? "bg-primary/5" : ""}`}
      >
        {typeof value === "boolean" ? (
          value ? (
            <Check size={18} className="text-green-500 mx-auto" />
          ) : (
            <X size={18} className="text-zinc-300 mx-auto" />
          )
        ) : (
          <span className="text-sm font-medium dark:text-white">{value}</span>
        )}
      </td>
    ))}
  </tr>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="font-bold text-zinc-900 dark:text-white">{question}</span>
        <ChevronRight
          size={20}
          className={`text-primary transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-zinc-600 dark:text-zinc-400">
          {answer}
        </div>
      )}
    </div>
  );
};

const ContactModal = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl"
    >
      <h3 className="text-2xl font-black mb-4 dark:text-white">Contactez-nous</h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Notre équipe vous répondra dans les 24h
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
          <MessageSquare className="text-primary" />
          <div>
            <div className="font-bold text-sm dark:text-white">WhatsApp</div>
            <a href="https://wa.me/237XXXXXXXXX" className="text-xs text-primary">
              +237 XXX XXX XXX
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
          <Phone className="text-primary" />
          <div>
            <div className="font-bold text-sm dark:text-white">Téléphone</div>
            <a href="tel:+237XXXXXXXXX" className="text-xs text-primary">
              +237 XXX XXX XXX
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
          <FileText className="text-primary" />
          <div>
            <div className="font-bold text-sm dark:text-white">Email</div>
            <a href="mailto:contact@navigoo.cm" className="text-xs text-primary">
              contact@navigoo.cm
            </a>
          </div>
        </div>
      </div>

      <Button onClick={onClose} variant="outline" className="w-full mt-6">
        Fermer
      </Button>
    </motion.div>
  </motion.div>
);