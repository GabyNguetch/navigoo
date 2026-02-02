"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  User, Mail, Phone, Lock, Camera, LogOut, 
  MapPin, Route, Star, LayoutDashboard, ChevronRight, 
  Settings, Building2, Calendar
} from "lucide-react";
import { authService } from "@/services/authService";
import { poiService } from "@/services/poiService";
import { useUserData } from "@/hooks/useUserData";
import { AppUser, POI } from "@/types";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [userPoi, setUserPoi] = useState<POI | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { recentPois, recentTrips } = useUserData();

  useEffect(() => {
    const initProfile = async () => {
      const session = authService.getSession();
      
      if (!session) {
        router.push("/signin");
        return;
      }

      // REDIRECTION SI SUPERADMIN
      if (session.role === "SUPER_ADMIN") {
        router.push("/admin");
        return;
      }

      setUser(session);

      // Charger le POI de l'utilisateur s'il existe
      try {
        const pois = await poiService.getPoisByUser(session.userId);
        if (pois && pois.length > 0) {
            setUserPoi(pois[0]); // On prend le premier
        }
      } catch (err) {
        console.error("Erreur POI", err);
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, [router]);

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col md:flex-row font-sans">
      
      {/* --- SIDEBAR GAUCHE : INFOS UTILISATEUR --- */}
      <div className="w-full md:w-[350px] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-8 flex flex-col shrink-0">
        
        {/* Photo de Profil */}
        <div className="relative w-32 h-32 mx-auto mb-6 group">
            <div className="w-full h-full rounded-3xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
               {/* Simuler photo ou Initiale */}
               <span className="text-4xl font-black text-primary">
                 {user?.username.charAt(0).toUpperCase()}
               </span>
            </div>
            <button className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                <Camera size={18} />
            </button>
        </div>

        <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{user?.username}</h1>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1 bg-primary/5 py-1 px-3 rounded-full inline-block">
                Explorateur Navigoo
            </p>
        </div>

        {/* Champs Infos */}
        <div className="space-y-4 flex-1">
            <InfoBox icon={<Mail size={18}/>} label="Email" value={user?.email || "N/A"} />
            <InfoBox icon={<Phone size={18}/>} label="Téléphone" value={user?.phone || "Non renseigné"} />
            <InfoBox icon={<Lock size={18}/>} label="Mot de passe" value="••••••••••••" />
            <InfoBox icon={<Calendar size={18}/>} label="Membre depuis" value={new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'})} />
        </div>

        {/* Boutons Actions Basiques */}
        <div className="mt-auto space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => router.push("/")}>
                <MapPin size={20}/> Retour à la carte
            </Button>
            <Button onClick={handleLogout} className="w-full justify-start gap-3 h-12 bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none font-bold">
                <LogOut size={20}/> Se déconnecter
            </Button>
        </div>
      </div>

      {/* --- CONTENU CENTRAL : ACTIVITÉ --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12 space-y-12 pb-24">
        
        <header className="max-w-4xl">
            <h2 className="text-4xl font-black text-zinc-900 dark:text-white mb-2">Tableau de Bord</h2>
            <p className="text-zinc-500">Bienvenue chez vous. Gérez vos découvertes et vos lieux favoris.</p>
        </header>

        {/* --- SECTION "MON POI" (SI EXISTE) --- */}
        {userPoi ? (
            <section className="max-w-5xl">
                <div className="flex items-center gap-3 mb-6">
                    <Building2 className="text-primary" size={24} />
                    <h3 className="text-xl font-bold dark:text-white">Votre établissement</h3>
                </div>
                <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-primary/20">
                    <div className="w-32 h-32 relative rounded-2xl overflow-hidden shrink-0 shadow-lg border-4 border-white/20">
                        <Image src={userPoi.poi_images_urls[0] || "/images/placeholder.png"} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-3xl font-black mb-1">{userPoi.poi_name}</h4>
                        <div className="flex items-center gap-4 text-white/80 text-sm mb-4">
                            <span className="flex items-center gap-1 font-bold"><Star size={16} fill="white" className="text-yellow-400" /> {userPoi.rating}</span>
                            <span className="px-2 py-0.5 bg-white/20 rounded-md text-xs">{userPoi.poi_category}</span>
                            <span>{userPoi.address_city}</span>
                        </div>
                        <Button onClick={() => router.push(`/add-poi?id=${userPoi.poi_id}`)} className="bg-white text-primary font-black px-8 py-3 rounded-xl hover:bg-zinc-100">
                           Gérer les infos
                        </Button>
                    </div>
                </div>
            </section>
        ) : (
            /* Call to Action si pas de POI */
            <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] flex flex-col items-center text-center max-w-4xl">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400 mb-4">
                    <Building2 size={32} />
                </div>
                <h3 className="text-xl font-bold dark:text-white mb-2">Vous avez un commerce ?</h3>
                <p className="text-zinc-500 text-sm mb-6 max-w-xs">Enregistrez votre lieu sur Navigoo et soyez visible par des milliers d'explorateurs.</p>
                <Button onClick={() => router.push("/add-poi")} className="font-bold">Publier mon lieu</Button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl">
            
            {/* --- LIEUX RÉCENTS --- */}
            <section>
                <h3 className="text-xl font-black dark:text-white mb-6 flex items-center gap-3">
                    <MapPin className="text-zinc-400" size={20} /> Consultés récemment
                </h3>
                <div className="space-y-4">
                    {recentPois.length > 0 ? (
                        recentPois.slice(0, 4).map(poi => (
                            <ActivityCard key={poi.poi_id} title={poi.poi_name} sub={poi.poi_category} img={poi.poi_images_urls[0]} />
                        ))
                    ) : (
                        <p className="text-zinc-400 italic text-sm">Pas d'activité récente.</p>
                    )}
                </div>
            </section>

            {/* --- TRAJETS RÉCENTS --- */}
            <section>
                <h3 className="text-xl font-black dark:text-white mb-6 flex items-center gap-3">
                    <Route className="text-zinc-400" size={20} /> Derniers itinéraires
                </h3>
                <div className="space-y-4">
                    {recentTrips.length > 0 ? (
                        recentTrips.slice(0, 4).map(trip => (
                            <div key={trip.id} className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                                    <Route size={20} className="text-zinc-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{trip.arriveName}</p>
                                    <p className="text-[11px] text-zinc-400 uppercase font-black">{Math.round(trip.distance / 1000)} km parcourus</p>
                                </div>
                                <ChevronRight size={16} className="text-zinc-300" />
                            </div>
                        ))
                    ) : (
                        <p className="text-zinc-400 italic text-sm">Aucun trajet enregistré.</p>
                    )}
                </div>
            </section>

        </div>
      </main>

    </div>
  );
}

// --- SOUS COMPOSANTS DE STYLE ---

const InfoBox = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-4">
        <div className="text-zinc-400">{icon}</div>
        <div className="overflow-hidden">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{label}</p>
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 truncate">{value}</p>
        </div>
    </div>
);

const ActivityCard = ({ title, sub, img }: { title: string, sub: string, img?: string }) => (
    <div className="group flex items-center gap-4 p-3 bg-white dark:bg-zinc-900 hover:border-primary border border-zinc-100 dark:border-zinc-800 rounded-2xl cursor-pointer transition-all shadow-sm">
        <div className="w-14 h-14 rounded-xl relative overflow-hidden bg-zinc-100">
            {img && <Image src={img} alt="" fill className="object-cover group-hover:scale-110 transition-transform" />}
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{title}</p>
            <p className="text-xs text-zinc-500">{sub}</p>
        </div>
        <ChevronRight size={16} className="text-zinc-300 mr-2" />
    </div>
);