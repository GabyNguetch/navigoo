// Utility functions for the admin dashboard

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const getPoiCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    FOOD_DRINK: 'Alimentation & Boissons',
    ACCOMMODATION: 'Hébergement',
    SHOPPING_RETAIL: 'Commerce & Retail',
    TRANSPORTATION: 'Transport',
    HEALTH_WELLNESS: 'Santé & Bien-être',
    LEISURE_CULTURE: 'Loisirs & Culture',
    PUBLIC_ADMIN_SERVICES: 'Administration Publique',
    FINANCE: 'Finance',
    EDUCATION: 'Éducation',
    WORSHIP_SPIRITUALITY: 'Spiritualité',
  };
  return labels[category] || category;
};

export const getPoiTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    RESTAURANT: 'Restaurant',
    CAFE: 'Café',
    BAR: 'Bar',
    HOTEL: 'Hôtel',
    HOPITAL: 'Hôpital',
    BANQUE: 'Banque',
    ECOLE: 'École',
    MUSEE: 'Musée',
    PARC_JARDIN: 'Parc/Jardin',
    // Add more as needed
  };
  return labels[type] || type.replace(/_/g, ' ');
};

export const getTrendIndicator = (current: number, previous: number) => {
  if (previous === 0) return { direction: 'neutral' as const, percentage: 0 };
  const change = ((current - previous) / previous) * 100;
  return {
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral' as const,
    percentage: Math.abs(change),
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};