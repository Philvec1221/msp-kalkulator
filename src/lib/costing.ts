import type { Service } from '@/hooks/useServices';
import type { License } from '@/hooks/useLicenses';
import type { ServiceLicense } from '@/hooks/useServiceLicenses';

export interface UniqueLicense {
  id: string;
  name: string;
  cost_per_month: number;
  price_per_month: number;
  billing_unit: string;
  quantity: number;
}

export interface PackageCostCalculation {
  uniqueLicenses: UniqueLicense[];
  totalLicenseCostEK: number;
  totalLicensePriceVK: number;
  totalTimeCost: number;
  totalCostEK: number;
  totalPriceVK: number;
}

/**
 * Get unique licenses from a set of services and calculate their quantities
 */
export function getUniqueLicensesFromServices(
  services: Service[],
  licenses: License[],
  serviceLicenses: ServiceLicense[],
  config: { clients: number; servers: number; users: number }
): UniqueLicense[] {
  const licenseMap = new Map<string, UniqueLicense>();

  services.forEach(service => {
    // Get license IDs for this service
    const serviceLicenseIds = serviceLicenses
      .filter(sl => sl.service_id === service.id)
      .map(sl => sl.license_id);

    serviceLicenseIds.forEach(licenseId => {
      const license = licenses.find(l => l.id === licenseId && l.active);
      if (!license) return;

      if (!licenseMap.has(licenseId)) {
        // Determine quantity based on license billing unit
        let quantity = 1;
        switch (license.billing_unit?.toLowerCase()) {
          case 'pro_client':
          case 'per_client':
            quantity = config.clients;
            break;
          case 'pro_server':
          case 'per_server':
            quantity = config.servers;
            break;
          case 'pro_user':
          case 'per_user':
            quantity = config.users;
            break;
          case 'fix':
          case 'fixed':
          default:
            quantity = 1;
            break;
        }

        licenseMap.set(licenseId, {
          id: license.id,
          name: license.name,
          cost_per_month: Number(license.cost_per_month),
          price_per_month: Number(license.price_per_month),
          billing_unit: license.billing_unit,
          quantity
        });
      }
    });
  });

  return Array.from(licenseMap.values());
}

/**
 * Calculate package costs with deduplicated licenses
 */
export function calculatePackageCosts(
  services: Service[],
  licenses: License[],
  serviceLicenses: ServiceLicense[],
  avgCostPerMinute: number,
  config: { clients: number; servers: number; users: number }
): PackageCostCalculation {
  // Get unique licenses for this package
  const uniqueLicenses = getUniqueLicensesFromServices(
    services,
    licenses,
    serviceLicenses,
    config
  );

  // Calculate deduplicated license costs
  const totalLicenseCostEK = uniqueLicenses.reduce(
    (sum, license) => sum + (license.cost_per_month * license.quantity),
    0
  );

  const totalLicensePriceVK = uniqueLicenses.reduce(
    (sum, license) => sum + (license.price_per_month * license.quantity),
    0
  );

  // Calculate time costs for all services
  let totalTimeCost = 0;
  services.forEach(service => {
    if (service.time_in_minutes) {
      let quantity = 1;
      
      // Determine quantity based on service billing type
      switch (service.billing_type) {
        case 'pro_client':
          quantity = config.clients;
          break;
        case 'pro_server':
          quantity = config.servers;
          break;
        case 'pro_user':
          quantity = config.users;
          break;
        case 'fix':
        default:
          quantity = 1;
          break;
      }

      totalTimeCost += service.time_in_minutes * avgCostPerMinute * quantity;
    }
  });

  return {
    uniqueLicenses,
    totalLicenseCostEK,
    totalLicensePriceVK,
    totalTimeCost,
    totalCostEK: totalTimeCost + totalLicenseCostEK,
    totalPriceVK: totalTimeCost + totalLicensePriceVK
  };
}

/**
 * Get services for a specific package level
 */
export function getServicesForPackage(services: Service[], packageLevel: string): Service[] {
  const packageLevels = ['basis', 'gold', 'allin', 'allin_black'];
  const selectedIndex = packageLevels.indexOf(packageLevel.toLowerCase().replace(' ', '_'));
  
  if (selectedIndex === -1) return [];
  
  return services.filter(service => {
    if (!service.active) return false;
    
    const serviceLevel = service.package_level?.toLowerCase().replace(' ', '_') || 'basis';
    const serviceIndex = packageLevels.indexOf(serviceLevel);
    
    return serviceIndex <= selectedIndex;
  });
}