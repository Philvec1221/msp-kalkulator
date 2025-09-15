export type InclusionType = 'inclusive' | 'effort_based' | 'not_available' | 'custom';

export const getInclusionLabel = (type: InclusionType): string => {
  const labels = {
    inclusive: 'Inklusive',
    effort_based: 'Nach Aufwand',
    not_available: 'Nicht verfügbar',
    custom: 'Benutzerdefiniert'
  };
  return labels[type];
};

export const getInclusionVariant = (type: InclusionType): "default" | "secondary" | "destructive" | "outline" => {
  const variants = {
    inclusive: 'default' as const,
    effort_based: 'secondary' as const,
    not_available: 'destructive' as const,
    custom: 'outline' as const
  };
  return variants[type];
};

export const getInclusionIcon = (type: InclusionType): string => {
  const icons = {
    inclusive: '✓',
    effort_based: '🕓',
    not_available: '✗',
    custom: '⚙️'
  };
  return icons[type];
};