"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowRight, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.register(formData);
      router.push("/signin");
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err.message || "Une erreur est survenue");
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
          className="object-cover dark:hidden"
          priority
        />
        {/* Image Dark Mode */}
        <Image 
          src="/images/image2.png" 
          alt="Join us"
          fill
          className="object-cover hidden dark:block"
          priority
        />
        
        {/* Overlay décoratif avec icônes et texte */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 dark:from-primary/20 dark:to-primary/10">
          
          {/* Cercles décoratifs */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 dark:bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/30 dark:bg-primary/20 rounded-full blur-3xl"></div>
          
          {/* Texte centré */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-128 ml-48 px-8 z-10">
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm px-8 py-6 rounded-3xl border border-white/50 dark:border-zinc-800">
              <h2 className="text-3xl font-black text-primary mb-3">Rejoignez Navigoo</h2>
              <p className="text-zinc-600 dark:text-zinc-300 text-base max-w-md">
                Explorez, partagez et découvrez les meilleurs endroits du Cameroun en communauté.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION DROITE (Formulaire) --- */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-black p-8 lg:p-16 flex flex-col justify-center overflow-y-auto">
        
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 bg-primary rounded-full"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Inscription</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white">Créer un compte</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">Nom d'utilisateur</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="text" name="username" required
                  value={formData.username} onChange={handleChange}
                  placeholder="ex: KmerExplorer"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white font-medium transition-all"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="email" name="email" required
                    value={formData.email} onChange={handleChange}
                    placeholder="nom@mail.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white font-medium transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">Téléphone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="tel" name="phone"
                    value={formData.phone} onChange={handleChange}
                    placeholder="+237 ..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" required
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white font-medium transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                disabled={isLoading}
                className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Créer mon compte <ArrowRight size={20}/></>}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-6">
            <p className="text-xs text-zinc-400">
              En vous inscrivant, vous acceptez nos{" "}
              <span className="text-primary underline cursor-pointer">Conditions</span> et{" "}
              <span className="text-primary underline cursor-pointer">Confidentialité</span>.
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-black text-zinc-500">ou</span>
              </div>
            </div>
            
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