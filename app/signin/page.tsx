"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(formData);
      router.push("/");
    } catch (err: any) {
      setError(typeof err === 'string' ? err : "Email ou mot de passe incorrect");
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
          alt="Welcome back"
          fill
          className="object-cover dark:hidden"
          priority
        />
        {/* Image Dark Mode */}
        <Image 
          src="/images/image2.png"
          alt="Welcome back"
          fill
          className="object-cover hidden dark:block"
          priority
        />
        
        {/* Overlay décoratif avec icônes et texte */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/5 dark:from-green-500/20 dark:to-green-500/10">
          
          {/* Cercles décoratifs */}
          <div className="absolute top-20 right-10 w-32 h-32 bg-white/20 dark:bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-green-400/20 dark:bg-green-500/20 rounded-full blur-3xl"></div>
          
          {/* Texte centré */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-128 ml-48 px-8 z-10">
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm px-8 py-6 rounded-3xl border border-white/50 dark:border-zinc-800">
              <h2 className="text-3xl font-black text-green-700 dark:text-green-500 mb-3">Bon retour !</h2>
              <p className="text-zinc-600 dark:text-zinc-300 text-base max-w-md">
                Reprenez votre navigation là où vous l'avez laissée.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION DROITE (Formulaire) --- */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-black p-8 lg:p-16 flex flex-col justify-center overflow-y-auto">
        
        <div className="max-w-md mx-auto w-full">
          
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 mb-3 bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full text-primary text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              POI Navigoo
            </div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-2">Connexion</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Entrez vos identifiants pour accéder.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-pulse">
              <span>⛔</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">Adresse Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="text" name="email" required
                  value={formData.email} onChange={handleChange}
                  placeholder="nom@mail.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none text-zinc-900 dark:text-white font-medium transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between ml-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Mot de passe</label>
                <a href="#" className="text-xs text-primary hover:underline font-semibold">Oublié ?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} name="password" required
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
            <Button 
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-lg hover:-translate-y-1 active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Se connecter <LogIn size={20} />
                </span>
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Pas encore de compte ? 
              <Link href="/register" className="ml-2 font-bold text-primary hover:text-primary-dark hover:underline transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}