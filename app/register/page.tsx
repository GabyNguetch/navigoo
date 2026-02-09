"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowRight, Loader2, Building, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { authService, DEFAULT_ORG_ID, Organization } from "@/services/authService";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State pour les organisations
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    organizationId: DEFAULT_ORG_ID,
  });

  // Validation du formulaire
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Chargement des organisations au montage
  useEffect(() => {
    const loadOrgs = async () => {
      const orgs = await authService.getOrganizations();
      setOrganizations(orgs);
      setLoadingOrgs(false);
    };
    loadOrgs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Nettoyage du téléphone
    if (name === "phone") {
      const cleaned = value.replace(/[^\d+]/g, "");
      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Réinitialiser l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation côté client
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username (3-50 caractères, alphanumériques et certains caractères spéciaux)
    if (!formData.username || formData.username.trim().length < 3) {
      errors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    } else if (formData.username.length > 50) {
      errors.username = "Le nom d'utilisateur ne doit pas dépasser 50 caractères";
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(formData.username)) {
      errors.username = "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores";
    }

    // Email
    if (!formData.email) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email invalide";
    } else if (formData.email.length > 100) {
      errors.email = "L'email ne doit pas dépasser 100 caractères";
    }

    // Téléphone (optionnel mais si rempli, doit être valide)
    if (formData.phone && formData.phone.trim()) {
      if (!/^[+]?[0-9]{10,15}$/.test(formData.phone)) {
        errors.phone = "Numéro de téléphone invalide (10-15 chiffres, peut commencer par +)";
      }
    }

    // Mot de passe (min 8 caractères avec exigences)
    if (!formData.password || formData.password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      errors.password = "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation côté client
    if (!validateForm()) {
      setError("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Construire le payload en omettant phone s'il est vide
      const registerData: any = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        organizationId: formData.organizationId
      };

      // N'ajouter phone que s'il est rempli
      if (formData.phone && formData.phone.trim()) {
        registerData.phone = formData.phone;
      }

      await authService.register(registerData);
      
      // Succès
      alert("✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      router.push("/signin");
      
    } catch (err: any) {
      console.error("❌ Erreur inscription:", err);
      
      // Extraction du message d'erreur
      let errorMessage = "Une erreur s'est produite lors de l'inscription";
      
      if (err.message) {
        errorMessage = err.message;
        
        // Messages d'erreur spécifiques du backend
        if (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("already")) {
          errorMessage = "Cet email est déjà utilisé";
        } else if (errorMessage.toLowerCase().includes("username") && errorMessage.toLowerCase().includes("already")) {
          errorMessage = "Ce nom d'utilisateur est déjà pris";
        } else if (errorMessage.toLowerCase().includes("password")) {
          errorMessage = "Le mot de passe ne respecte pas les critères de sécurité";
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black flex">
      
      {/* --- SECTION GAUCHE (Image en arrière-plan) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Image Light Mode */}
        <Image 
          src="/images/image1.png" 
          alt="Join us"
          fill
          sizes="50vw"
          className="object-cover dark:hidden"
          priority
        />
        {/* Image Dark Mode */}
        <Image 
          src="/images/image2.png" 
          alt="Join us"
          fill
          sizes="50vw"
          className="object-cover hidden dark:block"
          priority
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 dark:from-primary/20 dark:to-primary/10">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-128 ml-48 px-8 z-10">
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm px-8 py-6 rounded-3xl border border-white/50 dark:border-zinc-800">
              <h2 className="text-3xl font-black text-primary mb-3">Rejoignez Navigoo</h2>
              <p className="text-zinc-600 dark:text-zinc-300 text-base max-w-md">
                Explorez, partagez et découvrez les meilleurs endroits du Cameroun.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION DROITE (Formulaire) --- */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-black p-8 lg:p-12 flex flex-col justify-center overflow-y-auto">
        
        <div className="max-w-md mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white">Créer un compte</h1>
            <p className="text-zinc-500 mt-2">Rejoignez une communauté de passionnés.</p>
          </div>

          {/* Message d'erreur global */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 border border-red-100 dark:border-red-900">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                Nom d'utilisateur <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type="text" 
                  name="username" 
                  required
                  value={formData.username} 
                  onChange={handleChange}
                  placeholder="VotreNom (ex: KmerExplorer)"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                    validationErrors.username 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-primary'
                  } outline-none text-zinc-900 dark:text-white transition-all`}
                />
              </div>
              {validationErrors.username && (
                <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {validationErrors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type="email" 
                  name="email" 
                  required
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                    validationErrors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-primary'
                  } outline-none text-zinc-900 dark:text-white transition-all`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Téléphone (Optionnel) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                Téléphone <span className="text-zinc-400">(optionnel)</span>
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone} 
                  onChange={handleChange}
                  placeholder="+237699123456"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                    validationErrors.phone 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-primary'
                  } outline-none text-zinc-900 dark:text-white transition-all`}
                />
              </div>
              {validationErrors.phone && (
                <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {validationErrors.phone}
                </p>
              )}
            </div>

            {/* Organization Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                Organisation <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10" size={20} />
                <select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleChange}
                  disabled={loadingOrgs}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value={DEFAULT_ORG_ID}>Utilisateur Standard (Par défaut)</option>
                  {organizations
                    .filter(org => org.organizationId !== DEFAULT_ORG_ID)
                    .map(org => (
                      <option key={org.organizationId} value={org.organizationId}>
                        {org.organizationName}
                      </option>
                    ))
                  }
                </select>
                {loadingOrgs && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required
                  value={formData.password} 
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                    validationErrors.password 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-primary'
                  } outline-none text-zinc-900 dark:text-white transition-all`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-xs text-red-500 ml-1 flex items-start gap-1">
                  <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                  <span>{validationErrors.password}</span>
                </p>
              )}
              {!validationErrors.password && (
                <p className="text-xs text-zinc-400 ml-1">
                  Min. 8 caractères avec majuscule, minuscule, chiffre et caractère spécial
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button 
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Créer mon compte <ArrowRight size={20}/>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-xs text-zinc-400">
              En vous inscrivant, vous acceptez nos <span className="text-primary cursor-pointer hover:underline">Conditions d'utilisation</span>.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Vous avez déjà un compte ? 
              <Link href="/signin" className="ml-2 font-bold text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}