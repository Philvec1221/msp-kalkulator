import type { Service } from '@/hooks/useServices';
import type { License } from '@/hooks/useLicenses';
import type { ServiceLicense } from '@/hooks/useServiceLicenses';
import type { PackageConfig } from '@/hooks/usePackageConfigs';

export interface UniqueLicense {
  id: string;
  name: string;
  cost_per_month: number;
  price_per_month: number;
  billing_unit: string;
  quantity: number;
}

export interface EnhancedServiceCost {
  service: Service;
  packageConfig?: PackageConfig;
  inclusion_type: 'inclusive' | 'effort_based' | 'not_available' | 'custom';
  base_time_cost: number;
  adjusted_time_cost: number;
  is_included: boolean;
  hourly_rate_multiplier: number;
}

export interface EnhancedPackageCostCalculation {
  uniqueLicenses: UniqueLicense[];
  serviceCosts: EnhancedServiceCost[];
  totalLicenseCostEK: number;
  totalLicensePriceVK: number;
  totalInclusiveTimeCost: number;
  totalEffortBasedTimeCost: number;
  totalTimeCost: number;
  totalCostEK: number;
  totalPriceVK: number;
}

/**
 * Calculate enhanced package costs with package configurations
 */
export function calculateEnhancedPackageCosts(
  services: Service[],
  licenses: License[],
  serviceLicenses: ServiceLicense[],
  packageConfigs: PackageConfig[],
  avgCostPerMinute: number,
  packageType: string,
  config: { clients: number; servers: number; users: number }
): EnhancedPackageCostCalculation {
  
  // Get unique licenses for this package (same as original logic)
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

  // Calculate enhanced service costs with package configurations
  const serviceCosts: EnhancedServiceCost[] = services.map(service => {
    const packageConfig = packageConfigs.find(
      config => config.service_id === service.id && config.package_type.toLowerCase() === packageType.toLowerCase()
    );

    // Determine inclusion type
    const inclusion_type = packageConfig?.inclusion_type || 'effort_based';
    const is_included = inclusion_type === 'inclusive';

    // Calculate base time cost
    let quantity = 1;
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

    const base_time_cost = service.time_in_minutes * avgCostPerMinute * quantity;
    
    // Apply package configuration multiplier and surcharge
    const configMultiplier = packageConfig?.multiplier || 1.0;
    const hourlyRateSurcharge = packageConfig?.hourly_rate_surcharge || 0;
    const hourly_rate_multiplier = 1 + (hourlyRateSurcharge / 100);
    
    let adjusted_time_cost = base_time_cost * configMultiplier * hourly_rate_multiplier;
    
    // If service is not available in this package, set cost to 0
    if (inclusion_type === 'not_available') {
      adjusted_time_cost = 0;
    }

    return {
      service,
      packageConfig,
      inclusion_type,
      base_time_cost,
      adjusted_time_cost,
      is_included,
      hourly_rate_multiplier
    };
  });

  // Calculate totals
  const totalInclusiveTimeCost = serviceCosts
    .filter(sc => sc.is_included)
    .reduce((sum, sc) => sum + sc.adjusted_time_cost, 0);

  const totalEffortBasedTimeCost = serviceCosts
    .filter(sc => sc.inclusion_type === 'effort_based')
    .reduce((sum, sc) => sum + sc.adjusted_time_cost, 0);

  const totalTimeCost = totalInclusiveTimeCost + totalEffortBasedTimeCost;

  return {
    uniqueLicenses,
    serviceCosts,
    totalLicenseCostEK,
    totalLicensePriceVK,
    totalInclusiveTimeCost,
    totalEffortBasedTimeCost,
    totalTimeCost,
    totalCostEK: totalTimeCost + totalLicenseCostEK,
    totalPriceVK: totalTimeCost + totalLicensePriceVK
  };
}

/**
 * Get unique licenses from a set of services and calculate their quantities
 * (Same as original implementation)
 */
function getUniqueLicensesFromServices(
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
          default:
            quantity = 1;
            break;
        }

        licenseMap.set(relation.license_id, {
          id: license.id,
          name: license.name,
          cost_per_month: license.cost_per_month,
          price_per_month: license.price_per_month,
          billing_unit: license.billing_unit,
          quantity: quantity
        });
      }
    });
  });

  return Array.from(licenseMap.values());
}

/**
 * Get services for a specific package level with package configuration filtering and hierarchy logic
 */
export function getServicesForPackageWithConfig(
  services: Service[], 
  packageConfigs: PackageConfig[],
  packageLevel: string
): Service[] {
  const packageLevels = ['basis', 'gold', 'allin', 'allin_black'];
  const selectedIndex = packageLevels.indexOf(packageLevel.toLowerCase().replace(' ', '_'));
  
  if (selectedIndex === -1) return [];
  
  return services.filter(service => {
    if (!service.active) return false;
    
    // Check if service has a specific package configuration for this package type
    const packageConfig = packageConfigs.find(
      config => config.service_id === service.id && 
                 config.package_type.toLowerCase() === packageLevel.toLowerCase()
    );
    
    // If there's a package config and it's marked as not_available, exclude the service
    if (packageConfig && packageConfig.inclusion_type === 'not_available') {
      return false;
    }
    
    // If there's a specific package config, include the service
    if (packageConfig) {
      return true;
    }
    
    // HIERARCHY LOGIC: Services available in lower packages are automatically available in higher packages
    // Get the minimum package level for this service
    const serviceMinLevel = (service.min_package_level || service.package_level || 'basis')
      .toLowerCase().replace(' ', '_');
    const serviceIndex = packageLevels.indexOf(serviceMinLevel);
    
    // Service is available if:
    // 1. The service has a valid minimum package level
    // 2. The selected package is at or above the service's minimum level
    // 3. There's no explicit 'not_available' configuration for any lower package level
    if (serviceIndex !== -1 && serviceIndex <= selectedIndex) {
      // Check if the service is explicitly marked as not_available in this or any lower package
      for (let i = serviceIndex; i <= selectedIndex; i++) {
        const checkLevel = packageLevels[i];
        const checkConfig = packageConfigs.find(
          config => config.service_id === service.id && 
                   config.package_type.toLowerCase() === checkLevel
        );
        if (checkConfig && checkConfig.inclusion_type === 'not_available') {
          return false;
        }
      }
      return true;
    }
    
    return false;
  });
}