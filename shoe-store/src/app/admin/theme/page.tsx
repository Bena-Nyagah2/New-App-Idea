'use client';

import { useState, useEffect } from 'react';
import { themes, themeList } from '@/lib/themes';
import { cn } from '@/lib/utils';

export default function ThemePage() {
  const [activeTheme, setActiveTheme] = useState('default');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setActiveTheme(data.theme || 'default');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function saveTheme(themeId: string) {
    setActiveTheme(themeId);
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeId }),
      });
      // Also apply to current browser for preview
      localStorage.setItem('shoe-store-theme', themeId);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading themes...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Seasonal Theme</h1>
        <p className="text-sm text-gray-500 mt-1">Switch the store look for holidays and promotions</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Theme saved! Visit the <a href="/" className="underline font-medium">store</a> to see it live.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themeList.map(theme => {
          const isActive = activeTheme === theme.id;
          const Icon = theme.icon;

          return (
            <button
              key={theme.id}
              onClick={() => saveTheme(theme.id)}
              disabled={saving}
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

              {/* Color preview */}
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
