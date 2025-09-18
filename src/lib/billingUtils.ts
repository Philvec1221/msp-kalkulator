export type BillingType = 'fix' | 'pro_user' | 'pro_server' | 'pro_device' | 'pro_site' | 'per_tb';

export const getBillingTypeDisplay = (billingType: string): string => {
  const types: Record<string, string> = {
    'fix': 'Pauschal',
    'pro_user': 'Pro Benutzer',
    'pro_server': 'Pro Server',
    'pro_device': 'Pro Gerät',
    'pro_client': 'Pro Device', // Legacy support
    'pro_site': 'Pro Site',
    'per_tb': 'Per TB'
  };
  return types[billingType] || billingType;
};

export const getBillingTypeBadgeVariant = (billingType: string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    'fix': 'destructive',
    'pro_user': 'secondary', 
    'pro_server': 'default',
    'pro_device': 'outline',
    'pro_client': 'outline', // Legacy support
    'pro_site': 'secondary',
    'per_tb': 'default'
  };
  return variants[billingType] || 'default';
};