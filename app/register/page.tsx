"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowRight, Loader2, Building, Camera
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
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    organizationId: DEFAULT_ORG_ID, // Organisation par défaut
    file: null as File | null // Fichier photo
  });

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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.register(formData);
      alert("Compte créé avec succès ! Connectez-vous.");
      router.push("/signin");
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur inconnue");
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

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 border border-red-100 dark:border-red-900">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Photo de profil Uploader */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                    {profilePreview ? (
                        <Image src={profilePreview} alt="Preview" fill className="object-cover" />
                    ) : (
                        <User className="text-zinc-400" size={32} />
                    )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary-dark transition-colors shadow-lg">
                    <Camera size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Prénom & Nom */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <input 
                      type="text" name="firstName" required
                      value={formData.firstName} onChange={handleChange}
                      placeholder="Prénom"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <input 
                      type="text" name="lastName" required
                      value={formData.lastName} onChange={handleChange}
                      placeholder="Nom"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white transition-all"
                    />
                </div>
            </div>

            {/* Username */}
            <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type="text" name="username" required
                  value={formData.username} onChange={handleChange}
                  placeholder="Nom d'utilisateur (ex: KmerExplorer)"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white transition-all"
                />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input 
                    type="email" name="email" required
                    value={formData.email} onChange={handleChange}
                    placeholder="Email"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white transition-all"
                  />
              </div>

              <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input 
                    type="tel" name="phone"
                    value={formData.phone} onChange={handleChange}
                    placeholder="Tél: +237..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white transition-all"
                  />
              </div>
            </div>

            {/* Organization Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">Organisation</label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
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
                {loadingOrgs && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />}
              </div>
            </div>

            {/* Password */}
            <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" required
                  value={formData.password} onChange={handleChange}
                  placeholder="Mot de passe"
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button 
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Créer mon compte <ArrowRight size={20}/></>}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-xs text-zinc-400">
              En vous inscrivant, vous acceptez nos <span className="text-primary cursor-pointer">Conditions</span>.
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