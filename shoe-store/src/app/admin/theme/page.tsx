'use client';

import { useState, useEffect } from 'react';
import { themes, themeList } from '@/lib/themes';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemePage() {
  const { activeTheme, mode, setActiveTheme, setMode } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveTheme(themeId: string) {
    setSaving(true);
    setSaved(false);
    setActiveTheme(themeId);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'theme', value: themeId }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function saveMode(newMode: 'light' | 'dark' | 'auto') {
    setMode(newMode);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'theme-mode', value: newMode }),
    });
  }

  const modeOptions = [
    { id: 'light' as const, icon: Sun, label: 'Light' },
    { id: 'dark' as const, icon: Moon, label: 'Dark' },
    { id: 'auto' as const, icon: Monitor, label: 'Auto' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Theme & Appearance</h1>
        <p className="text-sm text-gray-500 mt-1">Customize the store look and feel</p>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
          >
            Theme saved! Visit the <a href="/" className="underline font-medium">store</a> to see it live.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark Mode Toggle */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-bold text-lg mb-4">Appearance</h2>
        <div className="flex gap-3">
          {modeOptions.map(opt => {
            const Icon = opt.icon;
            const isActive = mode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => saveMode(opt.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all',
                  isActive
                    ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <Icon size={18} />
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">Auto follows your device&apos;s light/dark setting.</p>
      </div>

      {/* Seasonal Themes */}
      <div>
        <h2 className="font-bold text-lg mb-4">Seasonal Themes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themeList.map(theme => {
            const isActive = activeTheme.id === theme.id;
            const Icon = theme.icon;

            return (
              <motion.button
                key={theme.id}
                onClick={() => saveTheme(theme.id)}
                disabled={saving}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'text-left rounded-2xl border-2 p-5 transition-all',
                  isActive
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: theme.primary + '20' }}
                  >
                    <Icon size={20} style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{theme.name}</h3>
                    {isActive && (
                      <span className="text-xs font-semibold text-primary-600">Active</span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-3">{theme.description}</p>

                <div className="flex gap-2">
                  <span className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: theme.primary }} title="Primary" />
                  <span className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: theme.secondary }} title="Secondary" />
                  <span className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: theme.accent }} title="Accent" />
                  {theme.discountPercent > 0 && (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                      {theme.discountPercent}% off
                    </span>
                  )}
                </div>

                {theme.bannerText && (
                  <div className="mt-3 text-xs text-gray-400">
                    Banner: &ldquo;{theme.bannerText} &mdash; {theme.bannerSubtext}&rdquo;
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
