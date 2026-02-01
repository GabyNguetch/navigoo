'use client';

import React from 'react';
import { formatDateTime } from '@/components/admin/utils';

interface Activity {
  id: string;
  type: 'poi' | 'review' | 'user' | 'access';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  icon?: React.ReactNode;
}

interface RecentActivityProps {
  activities: Activity[];
  maxItems?: number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, maxItems = 10 }) => {
  const displayActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'poi':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'review':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'user':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'access':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'poi':
        return 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400';
      case 'review':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'user':
        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'access':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Activité Récente
      </h3>
      <div className="space-y-4">
        {displayActivities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-700"
            style={{
              animation: `fadeInLeft 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getActivityColor(activity.type)}`}>
              {activity.icon || getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {activity.description}
              </p>
              {activity.user && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Par {activity.user}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatDateTime(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};