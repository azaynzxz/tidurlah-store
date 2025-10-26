// Dynamic Text Color Utility
// Automatically calculates the best text color (black or white) based on background color

export const getContrastColor = (backgroundColor: string): string => {
  // Remove any CSS variables or complex values, get the actual color
  const color = backgroundColor.replace(/hsl\(|\)|var\([^)]+\)/g, '');
  
  // Convert to RGB if needed
  let r: number, g: number, b: number;
  
  if (color.startsWith('#')) {
    // Hex color
    const hex = color.replace('#', '');
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.includes(',')) {
    // HSL or RGB values
    const values = color.split(',').map(v => parseFloat(v.trim()));
    if (values.length >= 3) {
      [r, g, b] = values;
    } else {
      return '#000000'; // Default to black
    }
  } else {
    return '#000000'; // Default to black
  }
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Tailwind color mapping for dynamic text colors
export const tailwindColorMap: Record<string, string> = {
  // Green variants
  'bg-green-50': '#166534',
  'bg-green-100': '#166534',
  'bg-green-200': '#15803d',
  'bg-green-300': '#16a34a',
  
  // Orange variants
  'bg-orange-50': '#c2410c',
  'bg-orange-100': '#c2410c',
  'bg-orange-200': '#ea580c',
  'bg-orange-300': '#f97316',
  
  // Blue variants
  'bg-blue-50': '#1e40af',
  'bg-blue-100': '#1e40af',
  'bg-blue-200': '#2563eb',
  'bg-blue-300': '#3b82f6',
  
  // Yellow variants
  'bg-yellow-50': '#a16207',
  'bg-yellow-100': '#a16207',
  'bg-yellow-200': '#ca8a04',
  'bg-yellow-300': '#eab308',
  
  // Red variants
  'bg-red-50': '#dc2626',
  'bg-red-100': '#dc2626',
  'bg-red-200': '#ef4444',
  'bg-red-300': '#f87171',
  
  // Purple variants
  'bg-purple-50': '#7c3aed',
  'bg-purple-100': '#7c3aed',
  'bg-purple-200': '#8b5cf6',
  'bg-purple-300': '#a78bfa',
  
  // Pink variants
  'bg-pink-50': '#be185d',
  'bg-pink-100': '#be185d',
  'bg-pink-200': '#ec4899',
  'bg-pink-300': '#f472b6',
  
  // Indigo variants
  'bg-indigo-50': '#3730a3',
  'bg-indigo-100': '#3730a3',
  'bg-indigo-200': '#4f46e5',
  'bg-indigo-300': '#6366f1',
  
  // Teal variants
  'bg-teal-50': '#0f766e',
  'bg-teal-100': '#0f766e',
  'bg-teal-200': '#0d9488',
  'bg-teal-300': '#14b8a6',
  
  // Cyan variants
  'bg-cyan-50': '#0891b2',
  'bg-cyan-100': '#0891b2',
  'bg-cyan-200': '#06b6d4',
  'bg-cyan-300': '#22d3ee',
  
  // Emerald variants
  'bg-emerald-50': '#047857',
  'bg-emerald-100': '#047857',
  'bg-emerald-200': '#059669',
  'bg-emerald-300': '#10b981',
  
  // Lime variants
  'bg-lime-50': '#65a30d',
  'bg-lime-100': '#65a30d',
  'bg-lime-200': '#84cc16',
  'bg-lime-300': '#a3e635',
  
  // Amber variants
  'bg-amber-50': '#d97706',
  'bg-amber-100': '#d97706',
  'bg-amber-200': '#f59e0b',
  'bg-amber-300': '#fbbf24',
  
  // Sky variants
  'bg-sky-50': '#0369a1',
  'bg-sky-100': '#0369a1',
  'bg-sky-200': '#0284c7',
  'bg-sky-300': '#0ea5e9',
  
  // Violet variants
  'bg-violet-50': '#7c2d12',
  'bg-violet-100': '#7c2d12',
  'bg-violet-200': '#a21caf',
  'bg-violet-300': '#c084fc',
  
  // Fuchsia variants
  'bg-fuchsia-50': '#a21caf',
  'bg-fuchsia-100': '#a21caf',
  'bg-fuchsia-200': '#c026d3',
  'bg-fuchsia-300': '#d946ef',
  
  // Rose variants
  'bg-rose-50': '#be123c',
  'bg-rose-100': '#be123c',
  'bg-rose-200': '#e11d48',
  'bg-rose-300': '#f43f5e',
  
  // Slate variants
  'bg-slate-50': '#334155',
  'bg-slate-100': '#334155',
  'bg-slate-200': '#475569',
  'bg-slate-300': '#64748b',
  
  // Zinc variants
  'bg-zinc-50': '#3f3f46',
  'bg-zinc-100': '#3f3f46',
  'bg-zinc-200': '#52525b',
  'bg-zinc-300': '#71717a',
  
  // Neutral variants
  'bg-neutral-50': '#404040',
  'bg-neutral-100': '#404040',
  'bg-neutral-200': '#525252',
  'bg-neutral-300': '#737373',
  
  // Stone variants
  'bg-stone-50': '#44403c',
  'bg-stone-100': '#44403c',
  'bg-stone-200': '#57534e',
  'bg-stone-300': '#78716c',
};

// Get text color for a Tailwind background class
export const getTextColorForBackground = (bgClass: string): string => {
  return tailwindColorMap[bgClass] || '#000000';
};

// Apply dynamic text colors to elements
export const applyDynamicTextColors = () => {
  const elements = document.querySelectorAll('[class*="bg-"]');
  
  elements.forEach((element) => {
    const classList = Array.from(element.classList);
    const bgClass = classList.find(cls => cls.startsWith('bg-') && !cls.includes('gray'));
    
    if (bgClass && tailwindColorMap[bgClass]) {
      (element as HTMLElement).style.color = tailwindColorMap[bgClass];
    }
  });
};
