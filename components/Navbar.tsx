'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { NavSection } from '@/types';
import {
  Sun,
  Moon,
  Calendar,
  Layers,
  DoorOpen,
  PartyPopper,
  BellRing,
  BookOpenCheck,
  Bot,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeSection: NavSection;
  setActiveSection: (s: NavSection) => void;
  onResetData: () => void;
  isResetting?: boolean;
}

export default function Navbar({
  activeSection,
  setActiveSection,
  onResetData,
  isResetting,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [timeStr, setTimeStr] = useState('');
  const [dayStr, setDayStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setDayStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; isAgent?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'schedules', label: 'Schedules', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'rooms', label: 'Rooms & Labs', icon: <DoorOpen className="w-3.5 h-3.5" /> },
    { id: 'events', label: 'Events', icon: <PartyPopper className="w-3.5 h-3.5" /> },
    { id: 'announcements', label: 'Notices', icon: <BellRing className="w-3.5 h-3.5" /> },
    { id: 'assignments', label: 'Assignments', icon: <BookOpenCheck className="w-3.5 h-3.5" /> },
    { id: 'agent', label: 'AI Assistant', icon: <Bot className="w-3.5 h-3.5" />, isAgent: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="glass-nav rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-slate-900/75 shadow-lg shadow-black/[0.03] dark:shadow-black/20 px-3.5 sm:px-5 py-2.5 flex items-center justify-between gap-3">
          
          {/* Brand Logo */}
          <div
            onClick={() => setActiveSection('overview')}
            className="flex items-center space-x-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  CampusOS
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                  AUST
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Island Dock */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 border border-black/[0.04] dark:border-white/[0.04]">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? item.isAgent
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm shadow-sky-500/25'
                        : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-700/40'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.isAgent && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Live Status Pill */}
            <div className="hidden xl:flex items-center space-x-2 text-xs px-2.5 py-1 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-mono border border-black/[0.04] dark:border-white/[0.04]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{dayStr}</span>
              <span className="text-slate-400">•</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{timeStr}</span>
            </div>

            {/* Quick Actions (Reset & Theme) */}
            <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 border border-black/[0.04] dark:border-white/[0.04]">
              {/* Reset Seed Button */}
              <button
                onClick={onResetData}
                disabled={isResetting}
                title="Reset Database to Default Seed Data"
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-teal-600' : ''}`} />
              </button>

              {/* Dark / Light Toggle */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all active:scale-95"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Segmented Row */}
        <div className="flex md:hidden mt-2 p-1 rounded-xl bg-white/75 dark:bg-slate-900/75 border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md overflow-x-auto no-scrollbar gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? item.isAgent
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
