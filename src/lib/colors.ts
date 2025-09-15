// Standardized color palette for packages and UI elements
// Colors are defined as HSL values for consistency with design system

export interface ColorDefinition {
  name: string;
  value: string; // HSL format
  hex: string; // For display purposes
  cssVar: string; // CSS variable name
}

// Design Colors (Professional palette)
export const designColors: ColorDefinition[] = [
  { name: 'Slate', value: '210 40% 98%', hex: '#F8FAFC', cssVar: '--package-slate' },
  { name: 'Gray', value: '220 14.3% 95.9%', hex: '#F3F4F6', cssVar: '--package-gray' },
  { name: 'Blue', value: '221.2 83.2% 53.3%', hex: '#3B82F6', cssVar: '--package-blue' },
  { name: 'Indigo', value: '238.7 83.5% 66.7%', hex: '#6366F1', cssVar: '--package-indigo' },
  { name: 'Purple', value: '262.1 83.3% 57.8%', hex: '#8B5CF6', cssVar: '--package-purple' },
  { name: 'Pink', value: '330.4 81.2% 60.4%', hex: '#EC4899', cssVar: '--package-pink' },
];

// Standard Colors (Classic palette)
export const standardColors: ColorDefinition[] = [
  { name: 'Red', value: '0 84.2% 60.2%', hex: '#EF4444', cssVar: '--package-red' },
  { name: 'Orange', value: '24.6 95% 53.1%', hex: '#F97316', cssVar: '--package-orange' },
  { name: 'Amber', value: '45.4 93.4% 47.5%', hex: '#F59E0B', cssVar: '--package-amber' },
  { name: 'Yellow', value: '54.5 91.7% 68.3%', hex: '#EAB308', cssVar: '--package-yellow' },
  { name: 'Lime', value: '84.2 80.5% 67%', hex: '#84CC16', cssVar: '--package-lime' },
  { name: 'Green', value: '142.1 76.2% 36.3%', hex: '#22C55E', cssVar: '--package-green' },
  { name: 'Emerald', value: '160.1 84.1% 39.4%', hex: '#10B981', cssVar: '--package-emerald' },
  { name: 'Teal', value: '173.4 80.4% 40%', hex: '#14B8A6', cssVar: '--package-teal' },
  { name: 'Cyan', value: '188.7 94.5% 42.7%', hex: '#06B6D4', cssVar: '--package-cyan' },
  { name: 'Sky', value: '204.4 94% 54.1%', hex: '#0EA5E9', cssVar: '--package-sky' },
  { name: 'Violet', value: '262.1 83.3% 57.8%', hex: '#8B5CF6', cssVar: '--package-violet' },
  { name: 'Fuchsia', value: '292.2 84.1% 60.6%', hex: '#D946EF', cssVar: '--package-fuchsia' },
  { name: 'Rose', value: '351.3 94.5% 71.4%', hex: '#F43F5E', cssVar: '--package-rose' },
  { name: 'Stone', value: '25 5.3% 44.7%', hex: '#78716C', cssVar: '--package-stone' },
  { name: 'Zinc', value: '240 4.9% 83.9%', hex: '#D4D4D8', cssVar: '--package-zinc' },
  { name: 'Neutral', value: '0 0% 45.1%', hex: '#737373', cssVar: '--package-neutral' },
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
      return 'destructive';
    case 'gray':
    case 'slate':
    case 'stone':
    case 'zinc':
    case 'neutral':
      return 'secondary';
    case 'blue':
    case 'indigo':
    case 'purple':
    case 'violet':
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
  
  const varName = color.cssVar.replace('--', '');
  return {
    bg: `bg-[hsl(var(${color.cssVar}))]`,
    text: 'text-white', // Most package colors work well with white text
    border: `border-[hsl(var(${color.cssVar}))]`,
  };
};