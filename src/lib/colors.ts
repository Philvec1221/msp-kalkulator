// Standardized color palette for packages and UI elements
// Colors are defined as HSL values for consistency with design system

export interface ColorDefinition {
  name: string;
  value: string; // HSL format
  hex: string; // For display purposes
  cssVar: string; // CSS variable name
}

// Design Colors (App theme colors)
export const designColors: ColorDefinition[] = [
  { name: 'Primary', value: '222.2 47.4% 11.2%', hex: '#1F2937', cssVar: '--package-primary' },
  { name: 'Teal', value: '173.4 80.4% 40%', hex: '#14B8A6', cssVar: '--package-teal' },
  { name: 'Cyan', value: '188.7 94.5% 42.7%', hex: '#06B6D4', cssVar: '--package-cyan' },
  { name: 'Muted', value: '210 40% 96.1%', hex: '#F1F5F9', cssVar: '--package-muted' },
  { name: 'Accent', value: '210 40% 96.1%', hex: '#F1F5F9', cssVar: '--package-accent' },
  { name: 'Destructive', value: '0 84.2% 60.2%', hex: '#EF4444', cssVar: '--package-destructive' },
];

// Standard Colors (Extended palette)
export const standardColors: ColorDefinition[] = [
  { name: 'Red', value: '0 84.2% 60.2%', hex: '#EF4444', cssVar: '--package-red' },
  { name: 'Orange', value: '24.6 95% 53.1%', hex: '#F97316', cssVar: '--package-orange' },
  { name: 'Amber', value: '45.4 93.4% 47.5%', hex: '#F59E0B', cssVar: '--package-amber' },
  { name: 'Yellow', value: '54.5 91.7% 68.3%', hex: '#EAB308', cssVar: '--package-yellow' },
  { name: 'Lime', value: '84.2 80.5% 67%', hex: '#84CC16', cssVar: '--package-lime' },
  { name: 'Green', value: '142.1 76.2% 36.3%', hex: '#22C55E', cssVar: '--package-green' },
  { name: 'Emerald', value: '160.1 84.1% 39.4%', hex: '#10B981', cssVar: '--package-emerald' },
  { name: 'Teal-Std', value: '173.4 80.4% 40%', hex: '#14B8A6', cssVar: '--package-teal-std' },
  { name: 'Sky', value: '204.4 94% 54.1%', hex: '#0EA5E9', cssVar: '--package-sky' },
  { name: 'Blue', value: '221.2 83.2% 53.3%', hex: '#3B82F6', cssVar: '--package-blue' },
  { name: 'Indigo', value: '238.7 83.5% 66.7%', hex: '#6366F1', cssVar: '--package-indigo' },
  { name: 'Violet', value: '262.1 83.3% 57.8%', hex: '#8B5CF6', cssVar: '--package-violet' },
  { name: 'Purple', value: '262.1 83.3% 57.8%', hex: '#8B5CF6', cssVar: '--package-purple-std' },
  { name: 'Fuchsia', value: '292.2 84.1% 60.6%', hex: '#D946EF', cssVar: '--package-fuchsia' },
  { name: 'Pink', value: '330.4 81.2% 60.4%', hex: '#EC4899', cssVar: '--package-pink-std' },
  { name: 'Rose', value: '351.3 94.5% 71.4%', hex: '#F43F5E', cssVar: '--package-rose' },
  { name: 'Brown', value: '25 5.3% 44.7%', hex: '#78716C', cssVar: '--package-brown' },
  { name: 'Gray', value: '220 14.3% 45.9%', hex: '#6B7280', cssVar: '--package-gray-std' },
  { name: 'Slate', value: '215.4 16.3% 46.9%', hex: '#64748B', cssVar: '--package-slate-std' },
  { name: 'Black', value: '0 0% 9%', hex: '#171717', cssVar: '--package-black' },
  { name: 'White', value: '0 0% 100%', hex: '#FFFFFF', cssVar: '--package-white' },
  { name: 'Light Gray', value: '210 20% 90%', hex: '#E2E8F0', cssVar: '--package-light-gray' },
  { name: 'Dark Gray', value: '215.4 16.3% 25%', hex: '#374151', cssVar: '--package-dark-gray' },
];

export const allColors = [...designColors, ...standardColors];

// Get color by name
export const getColorByName = (name: string): ColorDefinition | undefined => {
  return allColors.find(color => color.name.toLowerCase() === name.toLowerCase());
};

// Get Tailwind badge variant from color name
export const getBadgeVariantFromColor = (colorName: string): "default" | "secondary" | "destructive" | "outline" => {
  const color = getColorByName(colorName);
  if (!color) return "outline";
  
  // Map colors to appropriate badge variants based on contrast and meaning
  switch (color.name.toLowerCase()) {
    case 'red':
    case 'rose':
    case 'destructive':
      return 'destructive';
    case 'gray':
    case 'slate':
    case 'light gray':
    case 'dark gray':
    case 'brown':
    case 'black':
    case 'white':
      return 'secondary';
    case 'blue':
    case 'indigo':
    case 'purple':
    case 'violet':
    case 'primary':
    case 'teal':
    case 'cyan':
      return 'default';
    default:
      return 'outline';
  }
};

// Generate CSS variables for all colors
export const generateColorCSSVars = (): string => {
  return allColors.map(color => `  ${color.cssVar}: ${color.value};`).join('\n');
};

// Get background and text classes for a color
export const getColorClasses = (colorName: string) => {
  const color = getColorByName(colorName);
  if (!color) return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted' };
  
  // Determine if we need white or black text based on color
  const needsBlackText = ['white', 'light gray', 'yellow', 'amber', 'lime'].includes(color.name.toLowerCase());
  
  return {
    bg: `bg-[hsl(var(${color.cssVar}))]`,
    text: needsBlackText ? 'text-black' : 'text-white',
    border: `border-[hsl(var(${color.cssVar}))]`,
  };
};