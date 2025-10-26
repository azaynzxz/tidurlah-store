import React from 'react';
import { useHalloweenTheme } from '@/contexts/HalloweenThemeContext';

const HalloweenDecorations = () => {
  const { isHalloweenMode } = useHalloweenTheme();

  if (!isHalloweenMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99998]">
      {/* Top Left Spider Web */}
      <img 
        src="/theme/SVG/top-left-haloween-spider-web.svg"
        alt="Halloween decoration"
        className="absolute top-0 left-0 w-32 h-32 opacity-60"
      />
      
      {/* Top Right Spider Web */}
      <img 
        src="/theme/SVG/top-right-haloween-spider-web.svg"
        alt="Halloween decoration"
        className="absolute top-0 right-0 w-32 h-32 opacity-60"
      />
      
      {/* Optional: Add more decorations for other corners */}
      {/* Bottom Left - could add a different decoration */}
      {/* Bottom Right - could add a different decoration */}
    </div>
  );
};

export default HalloweenDecorations;
