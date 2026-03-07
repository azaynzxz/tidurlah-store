// Dynamic text color utility for Halloween and other theme modes
// Detects background color and applies appropriate text color

export function applyDynamicTextColors() {
  // Find all elements with colored backgrounds in Halloween/theme mode
  const isHalloweenMode = document.body.classList.contains('halloween-mode');
  const isChristmasMode = document.body.classList.contains('christmas-mode');
  const isEidMode = document.body.classList.contains('eid-mode');
  const isRamadanMode = document.body.classList.contains('ramadan-mode');
  const isDiwaliMode = document.body.classList.contains('diwali-mode');

  const isThemeActive = isHalloweenMode || isChristmasMode || isEidMode || isRamadanMode || isDiwaliMode;

  if (!isThemeActive) return;

  // Select all elements with Tailwind background classes
  const elements = document.querySelectorAll('[class*="bg-"]');

  elements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    const classList = Array.from(htmlElement.classList);

    // Find the first colored background class (skip gray, background, etc)
    const bgClass = classList.find(cls =>
      cls.startsWith('bg-') &&
      !cls.includes('gray') &&
      !cls.includes('background') &&
      !cls.includes('card') &&
      !cls.includes('muted') &&
      !cls.includes('primary') &&
      !cls.includes('secondary')
    );

    if (!bgClass) return;

    // Extract the color from the class (e.g., 'bg-green-100' -> 'green-100')
    const colorMatch = bgClass.match(/bg-([a-z]+)-\d+/);
    if (!colorMatch) return;

    const colorBase = colorMatch[1];
    const numberMatch = bgClass.match(/bg-[a-z]+-(\d+)/);
    const colorNumber = numberMatch ? parseInt(numberMatch[1]) : 0;

    // Light backgrounds (50-300) should have dark text
    // Dark backgrounds (400+) should have light text
    // Neutral/gray backgrounds should follow theme foreground

    if (colorBase === 'green' && colorNumber <= 300) {
      htmlElement.style.color = '#166534'; // Dark green text
    } else if (colorBase === 'orange' && colorNumber <= 300) {
      htmlElement.style.color = '#c2410c'; // Dark orange text
    } else if (colorBase === 'blue' && colorNumber <= 300) {
      htmlElement.style.color = '#1e40af'; // Dark blue text
    } else if (colorBase === 'yellow' && colorNumber <= 300) {
      htmlElement.style.color = '#a16207'; // Dark yellow text
    } else if (colorBase === 'purple' && colorNumber <= 300) {
      htmlElement.style.color = '#7c3aed'; // Dark purple text
    } else if (colorBase === 'pink' && colorNumber <= 300) {
      htmlElement.style.color = '#be185d'; // Dark pink text
    } else if (colorBase === 'red' && colorNumber <= 300) {
      htmlElement.style.color = '#dc2626'; // Dark red text
    } else if (colorNumber > 300) {
      // For darker backgrounds, use light text
      htmlElement.style.color = '#ffffff';
    }

    // Apply to child elements as well
    const childElements = htmlElement.querySelectorAll('*');
    childElements.forEach(child => {
      const childElement = child as HTMLElement;
      if (!childElement.style.color) {
        // Only inherit if child doesn't already have a color
        childElement.style.color = 'inherit';
      }
    });
  });
}

// Call the function when DOM is ready or when theme changes
if (typeof window !== 'undefined') {
  // Apply on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyDynamicTextColors);
  } else {
    applyDynamicTextColors();
  }

  // Apply when theme mode changes (observe body class changes)
  const observer = new MutationObserver(() => {
    applyDynamicTextColors();
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
}
