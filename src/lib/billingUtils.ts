export type BillingType = 'fix' | 'pro_user' | 'pro_server' | 'pro_device' | 'pro_site' | 'per_tb';

export const getBillingTypeDisplay = (billingType: string): string => {
  const types: Record<string, string> = {
    'fix': 'Pauschal',
    'pro_user': 'Pro User',
    'pro_server': 'Pro Server',
    'pro_device': 'Pro Gerät',
    'pro_client': 'Pro Device', // Legacy support
    'pro_site': 'Pro Site',
    'per_tb': 'Per TB'
  };
  return types[billingType] || billingType;
};

export const getBillingTypeBadgeVariant = (billingType: string): "default" | "secondary" | "destructive" | "outline" => {
  // Use consistent "secondary" variant for all billing types to ensure uniform appearance
  return 'secondary';
};