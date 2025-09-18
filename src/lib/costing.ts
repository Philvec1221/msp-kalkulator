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
    // Get licenses that should be included in cost calculation for this service
    const serviceLicenseRelations = serviceLicenses
      .filter(sl => sl.service_id === service.id && sl.include_cost === true);

    serviceLicenseRelations.forEach(relation => {
      const license = licenses.find(l => l.id === relation.license_id && l.active);
      if (!license) return;

      if (!licenseMap.has(relation.license_id)) {
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

        licenseMap.set(relation.license_id, {
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
        case 'pro_device':
          quantity = config.clients;
          break;
        case 'pro_server':
          quantity = config.servers;
          break;
        case 'pro_user':
          quantity = config.users;
          break;
        case 'pro_site':
          quantity = 1; // Per site - assuming one site
          break;
        case 'per_tb':
          quantity = 1; // Per TB - default to 1, could be configurable later
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
    
    // Handle both min_package_level and package_level fields, and normalize case
    const serviceMinLevel = (service.min_package_level || service.package_level || 'basis')
      .toLowerCase().replace(' ', '_');
    const serviceIndex = packageLevels.indexOf(serviceMinLevel);
    
    // Include services where the service's minimum package level is at or below the selected package level
    return serviceIndex !== -1 && serviceIndex <= selectedIndex;
  });
}