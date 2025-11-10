import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RegionConfig {
  name: string;
  endpoint: string;
  priority: number;
  enabled: boolean;
}

/**
 * Multi-Region Configuration Service
 *
 * Manages multi-region deployment configuration:
 * - Region detection
 * - Region-specific routing
 * - Failover strategies
 * - Latency-based routing
 */
@Injectable()
export class MultiRegionConfig {
  private readonly regions: RegionConfig[] = [];
  private readonly currentRegion: string;

  constructor(private readonly configService: ConfigService) {
    this.currentRegion = this.configService.get('REGION', 'us-east-1');

    // Load region configuration
    const regionsConfig = this.configService.get('REGIONS', '[]');
    try {
      this.regions = JSON.parse(regionsConfig);
    } catch (e) {
      // Default regions
      this.regions = [
        {
          name: 'us-east-1',
          endpoint: 'https://api-us.norchain.org',
          priority: 1,
          enabled: true,
        },
        {
          name: 'eu-west-1',
          endpoint: 'https://api-eu.norchain.org',
          priority: 2,
          enabled: true,
        },
        {
          name: 'ap-southeast-1',
          endpoint: 'https://api-ap.norchain.org',
          priority: 3,
          enabled: true,
        },
      ];
    }
  }

  /**
   * Get current region
   */
  getCurrentRegion(): string {
    return this.currentRegion;
  }

  /**
   * Get all enabled regions
   */
  getEnabledRegions(): RegionConfig[] {
    return this.regions
      .filter((r) => r.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get region by name
   */
  getRegion(name: string): RegionConfig | undefined {
    return this.regions.find((r) => r.name === name);
  }

  /**
   * Get nearest region (based on priority for now)
   */
  getNearestRegion(): RegionConfig {
    const enabled = this.getEnabledRegions();
    return enabled[0] || this.regions[0];
  }

  /**
   * Check if region is enabled
   */
  isRegionEnabled(name: string): boolean {
    const region = this.getRegion(name);
    return region?.enabled || false;
  }
}
