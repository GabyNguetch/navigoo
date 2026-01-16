import React from "react";
import { 
  UtensilsCrossed, BedDouble, Bus, Landmark, // Classiques
  Soup, Coffee, Flame, Fish, Home, Beer, // Locaux 1
  Music4, Mic2, Sandwich, Wine, Croissant, Users, Speaker, Waves, // Locaux 2
  Church, Store, Tractor // Nouveaux (Eglise, Marché, Ferme)
} from "lucide-react";

export interface CategoryDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  // --- Classiques Universels ---
  { id: "Restaurant", label: "Restaurants", icon: <UtensilsCrossed size={16} />, color: "#FF8C00" }, // Orange Foncé
  { id: "Hotel", label: "Hôtels", icon: <BedDouble size={16} />, color: "#1E90FF" }, // Bleu roi
  { id: "Transport", label: "Transports", icon: <Bus size={16} />, color: "#00CED1" }, // Cyan
  { id: "Culture", label: "Musées/Culture", icon: <Landmark size={16} />, color: "#8A2BE2" }, // Violet
  { id: "Eglise", label: "Lieux de Culte", icon: <Church size={16} />, color: "#4B0082" }, // Indigo
  { id: "Marche", label: "Marchés", icon: <Store size={16} />, color: "#2E8B57" }, // Vert Mer
  { id: "Ferme", label: "Nature & Ferme", icon: <Tractor size={16} />, color: "#556B2F" }, // Olive

  // --- Spécialités Camerounaises (Gastronomie & Vie) ---
  { id: "Tourne-dos", label: "Tourne-dos", icon: <Soup size={16} />, color: "#DAA520" }, // Jaune Moutarde
  { id: "Kiosque", label: "Kiosque BHB", icon: <Coffee size={16} />, color: "#8B4513" }, // Marron Café
  { id: "Soya", label: "Point Soya", icon: <Flame size={16} />, color: "#FF0000" }, // Rouge Feu
  { id: "Boukarou", label: "Boukarou", icon: <Fish size={16} />, color: "#20B2AA" }, // Vert Lagon
  { id: "Circuit", label: "Circuit", icon: <Home size={16} />, color: "#32CD32" }, // Citron vert
  { id: "Cave", label: "Vente Emportée", icon: <Beer size={16} />, color: "#FFD700" }, // Or (Bière)
  { id: "Snack", label: "Snack-Bar", icon: <Music4 size={16} />, color: "#FF1493" }, // Rose Vif
  { id: "Cabaret", label: "Cabaret Live", icon: <Mic2 size={16} />, color: "#C71585" }, // Violet Moyen
  { id: "FastFood", label: "Chawarmerie", icon: <Sandwich size={16} />, color: "#FFA500" }, // Orange
  { id: "Lounge", label: "Lounge/Rooftop", icon: <Wine size={16} />, color: "#800080" }, // Pourpre
  { id: "Boulangerie", label: "Boulangerie", icon: <Croissant size={16} />, color: "#D2691E" }, // Chocolat
  { id: "Foyer", label: "Foyer/Tontine", icon: <Users size={16} />, color: "#708090" }, // Gris Ardoise
  { id: "Club", label: "Boîte de Nuit", icon: <Speaker size={16} />, color: "#000000" }, // Noir
  { id: "Piscine", label: "Piscine/Détente", icon: <Waves size={16} />, color: "#00BFFF" }, // Bleu Clair
];

export const getCategoryConfig = (id: string) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];