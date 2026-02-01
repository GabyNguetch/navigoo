'use client';

import React from 'react';
import { cn } from '@/components/admin/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  variant?: 'default' | 'accent' | 'success' | 'warning';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800',
    accent: 'from-fuchsia-500/10 to-pink-500/10 border-fuchsia-200 dark:border-fuchsia-800',
    success: 'from-emerald-500/10 to-green-500/10 border-emerald-200 dark:border-emerald-800',
    warning: 'from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-800',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
        variantClasses[variant]
      )}
      style={{
        animation: 'fadeInUp 0.5s ease-out',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.direction === 'up' ? (
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : trend.direction === 'down' ? (
                <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.direction === 'up' && 'text-emerald-600 dark:text-emerald-400',
                  trend.direction === 'down' && 'text-red-600 dark:text-red-400',
                  trend.direction === 'neutral' && 'text-gray-600 dark:text-gray-400'
                )}
              >
                {trend.percentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="rounded-xl bg-white/50 p-3 dark:bg-gray-800/50">
          {icon}
        </div>
      </div>
    </div>
  );
};