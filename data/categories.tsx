import React from "react";
import { 
  UtensilsCrossed, BedDouble, Bus, Landmark,
  Coffee, ShoppingBag, HeartPulse, Building2, 
  Wallet, GraduationCap, Church, Trees
} from "lucide-react";

export interface CategoryDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

// IDs mis à jour pour correspondre au POI_CATEGORY du Backend Java
export const CATEGORIES: CategoryDef[] = [
  { id: "FOOD_DRINK", label: "Restauration", icon: <UtensilsCrossed size={16} />, color: "#FF8C00" },
  { id: "ACCOMMODATION", label: "Hébergement", icon: <BedDouble size={16} />, color: "#1E90FF" },
  { id: "SHOPPING_RETAIL", label: "Boutiques", icon: <ShoppingBag size={16} />, color: "#2E8B57" },
  { id: "TRANSPORTATION", label: "Transports", icon: <Bus size={16} />, color: "#00CED1" },
  { id: "HEALTH_WELLNESS", label: "Santé", icon: <HeartPulse size={16} />, color: "#e11d48" },
  { id: "LEISURE_CULTURE", label: "Loisirs & Culture", icon: <Landmark size={16} />, color: "#8A2BE2" },
  { id: "PUBLIC_ADMIN_SERVICES", label: "Services Publics", icon: <Building2 size={16} />, color: "#64748b" },
  { id: "FINANCE", label: "Banques", icon: <Wallet size={16} />, color: "#DAA520" },
  { id: "EDUCATION", label: "Éducation", icon: <GraduationCap size={16} />, color: "#1e293b" },
  { id: "WORSHIP_SPIRITUALITY", label: "Spiritualité", icon: <Church size={16} />, color: "#4B0082" }
];

export const getCategoryConfig = (id: string) => 
    CATEGORIES.find(c => c.id === id) || { id: "OTHER", label: "Autre", icon: <Trees size={16}/>, color: "#94a3b8" };