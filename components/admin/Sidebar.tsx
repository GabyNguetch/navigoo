'use client';

import React, { useState } from 'react';
import { cn } from '@/components/admin/utils';
import { LogOut } from 'lucide-react';
import { authService } from '@/services/authService';
import { router, useRouter } from 'next/navigation';
interface SidebarProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentSection = 'dashboard' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
   const router = useRouter();

  const handleLogout = () => {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
      authService.logout();
    }
  };

  const handleReturnToMap = () => {
    router.push('/');
  };
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'pois',
      label: 'Points d\'Intérêt',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'reviews',
      label: 'Avis',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          {!isCollapsed && (
            <h1 className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              POI Admin
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className={cn('h-5 w-5 text-gray-600 transition-transform dark:text-gray-400', isCollapsed && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li
                key={item.id}
                style={{
                  animation: `fadeInLeft 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <button
                  onClick={() => onNavigate?.(item.id)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                    currentSection === item.id
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  <span className={cn(currentSection !== item.id && 'group-hover:scale-110', 'transition-transform')}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

      {/* Footer Area: Profile & Logout */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700 space-y-2">
        {/* Profile Info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white font-bold">
            AD
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Admin Navigoo</p>
              <p className="text-xs text-gray-500 truncate">admin@navigoo.com</p>
            </div>
          )}
        </div>

        {/* --- ACTION: LOGOUT --- */}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          title="Se déconnecter"
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span>Se déconnecter</span>}
        </button>
      </div>
      </div>
    </aside>
  );
};