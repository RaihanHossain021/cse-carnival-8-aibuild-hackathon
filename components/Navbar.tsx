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
  Clock,
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
          second: '2-digit',
        })
      );
      setDayStr(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
    { id: 'schedules', label: 'Schedules', icon: <Calendar className="w-4 h-4" /> },
    { id: 'rooms', label: 'Rooms & Labs', icon: <DoorOpen className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <PartyPopper className="w-4 h-4" /> },
    { id: 'announcements', label: 'Notices', icon: <BellRing className="w-4 h-4" /> },
    { id: 'assignments', label: 'Assignments', icon: <BookOpenCheck className="w-4 h-4" /> },
    { id: 'agent', label: 'AI Assistant', icon: <Bot className="w-4 h-4" />, badge: 'Live' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University Tag */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveSection('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5 text-sky-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  CampusOS
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  AUST CSE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Intelligent University System
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Clock, Reset & Theme Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>{dayStr}</span>
              <span className="text-slate-400">|</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400">{timeStr}</span>
            </div>

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              disabled={isResetting}
              title="Reset Database to Default Seed Data"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-sky-500' : ''}`} />
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-200 hover:-rotate-12" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center space-x-1 overflow-x-auto py-2 border-t border-slate-200 dark:border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300 font-semibold'
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
