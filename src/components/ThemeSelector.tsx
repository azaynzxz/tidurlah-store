import React from 'react';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const ThemeSelector = () => {
  const { currentTheme, setTheme, isThemeActive } = useTheme();

  const themes: { mode: ThemeMode; name: string; icon: string; description: string }[] = [
    { mode: 'normal', name: 'Normal', icon: '☀️', description: 'Default theme' },
    { mode: 'halloween', name: 'Halloween', icon: '🎃', description: 'Spooky dark theme' },
    { mode: 'christmas', name: 'Christmas', icon: '🎄', description: 'Festive red & green' },
    { mode: 'eid', name: 'Eid', icon: '🌙', description: 'Gold & green theme' },
    { mode: 'ramadan', name: 'Ramadan', icon: '🌙', description: 'Purple & gold theme' },
    { mode: 'diwali', name: 'Diwali', icon: '🪔', description: 'Orange & gold theme' },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground mb-3">Theme Selector</h3>
      <div className="grid grid-cols-2 gap-2">
        {themes.map((theme) => (
          <Button
            key={theme.mode}
            variant={isThemeActive(theme.mode) ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme(theme.mode)}
            className={`flex items-center gap-2 text-xs ${
              isThemeActive(theme.mode) 
                ? 'bg-[#FF5E01] text-white hover:bg-[#e54d00]' 
                : 'hover:bg-muted'
            }`}
          >
            <span>{theme.icon}</span>
            <span>{theme.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
