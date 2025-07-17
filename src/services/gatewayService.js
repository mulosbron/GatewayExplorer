// Next Generation Gateway Data Service
// Fetches data from ArioSDK and ipgeo API, returns data mapped and error-handled for frontend

import { ARIO } from '@ar.io/sdk';

const ario = ARIO.mainnet();

// 2. Function to fetch GeoJSON data from ipgeo_gatewayexplorer.ar.io
async function fetchIpGeoList() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4 sec timeout
    const res = await fetch('https://ipgeo_gatewayexplorer.ar.io/', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('ipgeo API error');
    const geojson = await res.json();
    
    // Create address-based mapping from GeoJSON
    const addressMapping = {};
    if (geojson.features && Array.isArray(geojson.features)) {
      geojson.features.forEach(feature => {
        if (feature.properties && feature.properties.address) {
          addressMapping[feature.properties.address] = {
            ip: feature.properties.ip,
            isp: feature.properties.isp,
            org: feature.properties.org,
            city: feature.properties.city,
            region: feature.properties.region,
            country: feature.properties.country,
            lat: feature.geometry.coordinates[1], // [lon, lat] format in GeoJSON
            lon: feature.geometry.coordinates[0]
          };
        }
      });
    }
    
    return addressMapping;
  } catch (err) {
    console.error('ipgeo API error:', err);
    // Fallback: return empty object
    return {};
  }
}

// === HTTP STATUS CHECK FUNCTION ===
function determineStatusFromHttpResponse(response, error) {
  if (error) {
    // Network error or timeout
    if (error.name === 'AbortError') {
      return { status: 'timeout', httpStatus: 'timeout' };
    }
    if (error.message && error.message.includes('SSL')) {
      return { status: 'ssl_error', httpStatus: 'ssl_error' };
    }
    if (error.message && error.message.includes('fetch')) {
      return { status: 'offline', httpStatus: 'network_error' };
    }
    return { status: 'offline', httpStatus: 'network_error' };
  }
  
  if (!response) {
    return { status: 'unknown', httpStatus: 'no_response' };
  }
  
  const status = response.status;
  
  if (status === 200) {
    return { status: 'ok', httpStatus: 200 };
  } else if ([503, 504].includes(status)) {
    return { status: 'offline', httpStatus: status };
  } else if ([300, 301, 302, 303, 304, 305, 306, 307, 308].includes(status)) {
    return { status: 'offline', httpStatus: status };
  } else if (status >= 400 && status < 500) {
    return { status: 'offline', httpStatus: status };
  } else if (status >= 500) {
    return { status: 'offline', httpStatus: status };
  } else {
    return { status: 'unknown', httpStatus: status };
  }
}

// === TRANSFORMATION FUNCTION ===
function transformArioToFrontendFormat(gw, ipgeo = {}, info = {}, address = '', healthcheck = {}) {
  // Status mapping - determined by HTTP status codes
  let status = 'unknown';
  
  // First, check the contract status of the gateway
  if (gw.status === 'leaving') {
    status = 'offline'; // Leaving gateways are definitely offline
  } else if (gw.status === 'joined') {
    // For joined gateways, check HTTP status
    if (info && info.httpStatus) {
      if (info.httpStatus === 200) {
        status = 'ok'; // 200 = online
      } else if ([503, 504, 300, 301, 302, 303, 304, 305, 306, 307, 308].includes(info.httpStatus)) {
        status = 'offline'; // These status codes are offline
      } else if (info.httpStatus === 'ssl_error') {
        status = 'unknown'; // SSL/TLS error → unknown
      } else if (info.httpStatus === 'timeout') {
        status = 'unknown'; // Timeout error → unknown
      } else {
        status = 'unknown'; // Other cases unknown
      }
    } else if (healthcheck && healthcheck.httpStatus) {
      // If no info, check healthcheck
      if (healthcheck.httpStatus === 200) {
        status = 'ok';
      } else if ([503, 504, 300, 301, 302, 303, 304, 305, 306, 307, 308].includes(healthcheck.httpStatus)) {
        status = 'offline';
      } else if (healthcheck.httpStatus === 'ssl_error') {
        status = 'unknown'; // SSL/TLS error → unknown
      } else if (healthcheck.httpStatus === 'timeout') {
        status = 'unknown'; // Timeout error → unknown
      } else {
        status = 'unknown';
      }
    } else {
      // If no HTTP status at all, check if address exists
      if (address) {
        status = 'unknown'; // Address exists but no response
      } else {
        status = 'offline'; // Not even address, so offline
      }
    }
  } else if (gw.status) {
    status = gw.status; // For other cases, use current status
  }

  // Debug log - track status changes
  if (address && status !== 'ok') {
    console.log(`[STATUS][${status}] ${address} - info:`, info?.httpStatus, 'healthcheck:', healthcheck?.httpStatus);
  }

  // Release info is taken from info, check alternatives
  let release = 'unknown';
  if (info && info.release) release = info.release;
  else if (info && info.version) release = info.version;
  else if (info && Array.isArray(info.supportedManifestVersions) && info.supportedManifestVersions.length > 0) release = info.supportedManifestVersions[0];
  else if (gw.info && gw.info.release) release = gw.info.release;
  else if (gw.release) release = gw.release;
  if (release === 'unknown') {
    console.warn(`[RELEASE][UNKNOWN] ${address} - info:`, info);
  }

  return {
    label: gw.settings?.label || 'Unknown',
    address: gw.settings ? buildAddress(gw.settings) : '',
    wallet: gw.gatewayAddress || '',
    observerWallet: gw.observerAddress || '',
    propertiesId: gw.settings?.properties || '',
    status,
    note: gw.settings?.note || '',
    rewardAutoStake: boolToEnabledDisabled(gw.settings?.autoStake ?? false),
    delegatedStaking: boolToEnabledDisabled(gw.settings?.allowDelegatedStaking ?? false),
    rewardShareRatio: formatRewardShareRatio(gw.settings?.delegateRewardShareRatio ?? 0),
    minimumDelegatedStake: formatMinDelegatedStake(gw.settings?.minDelegatedStake ?? 0),
    ip: ipgeo.ip || '',
    country: ipgeo.country || '',
    city: ipgeo.city || '',
    region: ipgeo.region || '',
    isp: ipgeo.isp || '',
    org: ipgeo.org || '',
    lat: ipgeo.lat || null,
    lon: ipgeo.lon || null,
    release,
  };
}

// === TRANSFORMATION FUNCTIONS ===
function buildAddress(settings) {
  return `${settings.protocol}://${settings.fqdn}:${settings.port}`;
}

function boolToEnabledDisabled(val) {
  return val ? "Enabled" : "Disabled";
}

function formatMinDelegatedStake(val) {
  if (!val || val === 0) return '0';
  // Return as is, will be formatted in frontend
  return val.toString();
}

function formatRewardShareRatio(val) {
  return `${val}%`;
}

// === CACHE AND TIMEOUT SETTINGS ===
const infoCache = new Map();
const healthcheckCache = new Map();
const INFO_TIMEOUT = 10000;
const HEALTHCHECK_TIMEOUT = 10000;
const CACHE_DURATION = 30 * 60 * 1000; // 30 min cache (reduced from 1 day)
const MAX_RETRIES = 3;

// === GATEWAY INFO FETCH FUNCTION ===
export async function fetchGatewayInfo(address) {
  const cached = infoCache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[INFO][CACHE] ${address}`);
    return cached.data;
  }
  
  let lastError = null;
  
  // Retry mechanism
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), INFO_TIMEOUT);
      const response = await fetch(`${address}/ar-io/info`, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        const result = { ...data, httpStatus: 200 };
        infoCache.set(address, { data: result, timestamp: Date.now() });
        console.log(`[INFO][FETCHED] ${address} release: ${data.release} status: 200`);
        return result;
      } else {
        // HTTP status error - no need to retry
        const statusResult = determineStatusFromHttpResponse(response, null);
        const result = { release: 'unknown', ...statusResult };
        infoCache.set(address, { data: result, timestamp: Date.now() });
        console.log(`[INFO][HTTP_ERROR] ${address} status: ${response.status}`);
        return result;
      }
    } catch (err) {
      lastError = err;
      console.error(`[INFO][ERROR] ${address} attempt ${attempt + 1}:`, err);
      
      // SSL/TLS error check - no need to retry
      if (err.message && (err.message.includes('SSL') || err.message.includes('TLS') || err.message.includes('certificate'))) {
        const result = { release: 'unknown', status: 'unknown', httpStatus: 'ssl_error' };
        infoCache.set(address, { data: result, timestamp: Date.now() });
        return result;
      }
      
      // If not last attempt, continue
      if (attempt < MAX_RETRIES) {
        console.log(`[INFO][RETRY] ${address} attempt ${attempt + 1} failed, retrying...`);
        continue;
      }
    }
  }
  
  // All attempts failed
  if (lastError) {
    // Timeout check
    if (lastError.name === 'AbortError') {
      const result = { release: 'unknown', status: 'unknown', httpStatus: 'timeout' };
      infoCache.set(address, { data: result, timestamp: Date.now() });
      return result;
    }
    
    // Other network errors
    const result = { release: 'unknown', status: 'offline', httpStatus: 'network_error' };
    infoCache.set(address, { data: result, timestamp: Date.now() });
    return result;
  }
}

// === GATEWAY HEALTHCHECK FETCH FUNCTION ===
export async function fetchGatewayHealthcheck(address) {
  const cached = healthcheckCache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  let lastError = null;
  
  // Retry mechanism
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), HEALTHCHECK_TIMEOUT);
      const response = await fetch(`${address}/ar-io/healthcheck`, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        const result = { ...data, httpStatus: 200 };
        healthcheckCache.set(address, { data: result, timestamp: Date.now() });
        console.log(`[HEALTHCHECK][FETCHED] ${address} status: 200`);
        return result;
      } else {
        // HTTP status error - no need to retry
        const statusResult = determineStatusFromHttpResponse(response, null);
        const result = { status: 'unknown', ...statusResult };
        healthcheckCache.set(address, { data: result, timestamp: Date.now() });
        console.log(`[HEALTHCHECK][HTTP_ERROR] ${address} status: ${response.status}`);
        return result;
      }
    } catch (err) {
      lastError = err;
      console.error(`[HEALTHCHECK][ERROR] ${address} attempt ${attempt + 1}:`, err);
      
      // SSL/TLS error check - no need to retry
      if (err.message && (err.message.includes('SSL') || err.message.includes('TLS') || err.message.includes('certificate'))) {
        const result = { status: 'unknown', httpStatus: 'ssl_error' };
        healthcheckCache.set(address, { data: result, timestamp: Date.now() });
        return result;
      }
      
      // If not last attempt, continue
      if (attempt < MAX_RETRIES) {
        console.log(`[HEALTHCHECK][RETRY] ${address} attempt ${attempt + 1} failed, retrying...`);
        continue;
      }
    }
  }
  
  // All attempts failed
  if (lastError) {
    // Timeout check
    if (lastError.name === 'AbortError') {
      const result = { status: 'unknown', httpStatus: 'timeout' };
      healthcheckCache.set(address, { data: result, timestamp: Date.now() });
      return result;
    }
    
    // Other network errors
    const result = { status: 'offline', httpStatus: 'network_error' };
    healthcheckCache.set(address, { data: result, timestamp: Date.now() });
    return result;
  }
}

// === MAIN DATA FETCH FUNCTION ===
export async function getAllGatewayDataV2(options = {}) {
  const { onStep, onProgress } = options;
  let gateways = [];
  let ipgeoList = [];
  const releaseLog = [];
  
  try {
    if (onStep) onStep('Fetching gateway list...');
    if (onProgress) onProgress(5);
    
    // First, fetch the first page to get totalItems
    const firstPage = await ario.getGateways();
    const total = firstPage.totalItems || (firstPage.items ? firstPage.items.length : 0);
    let allItems = firstPage.items || [];
    
    if (total > allItems.length) {
      if (onStep) onStep('Fetching all gateways...');
      if (onProgress) onProgress(10);
      const allPage = await ario.getGateways({ limit: total });
      allItems = allPage.items || [];
    }
    
    gateways = allItems;
    
    if (onStep) onStep('Fetching geolocation data...');
    if (onProgress) onProgress(15);
    ipgeoList = await fetchIpGeoList();
    
    if (onStep) onStep('Checking gateway status...');
    if (onProgress) onProgress(20);
  } catch (err) {
    console.error('Gateway or ipgeo data could not be fetched:', err);
    gateways = gateways || [];
    ipgeoList = ipgeoList || [];
  }

  // Calculate progress based on number of joined gateways
  const joinedGateways = gateways.filter(gw => gw.status === 'joined');
  const totalToCheck = joinedGateways.length;
  let checkedCount = 0;

  // Progress callback function
  const updateProgress = () => {
    checkedCount++;
    const progress = 20 + Math.floor((checkedCount / totalToCheck) * 75); // 20% - 95% range
    if (onProgress) onProgress(progress);
    if (onStep) onStep(`Checking gateway ${checkedCount}/${totalToCheck}...`);
  };

  // Only fetch info and healthcheck for status 'joined'
  const infoPromises = gateways.map(async (gw, idx) => {
    let address = '';
    try {
      address = gw.settings ? buildAddress(gw.settings) : '';
    } catch (e) {
      address = '';
    }
    
    let info = null;
    let healthcheck = null;
    
    if (address && gw.status === 'joined') {
      info = await fetchGatewayInfo(address);
      healthcheck = await fetchGatewayHealthcheck(address);
      updateProgress(); // Update progress after each gateway check
    }
    
    const ipgeo = ipgeoList[address] || {};
    
    const mapped = transformArioToFrontendFormat(gw, ipgeo, info, address, healthcheck);
    releaseLog.push(`${address} => ${mapped.release}`);
    return mapped;
  });

  const result = await Promise.all(infoPromises);
  if (onStep) onStep('Finalizing...');
  if (onProgress) onProgress(100);
  
  // Log status statistics
  const statusCounts = result.reduce((acc, gw) => {
    acc[gw.status] = (acc[gw.status] || 0) + 1;
    return acc;
  }, {});
  console.log('STATUS DISTRIBUTION:', statusCounts);
  console.log('RELEASE LOG:', releaseLog);
  
  return result;
}

// === FILTER FUNCTION ===
export function filterGateways(gateways, filters) {
  if (!gateways || !Array.isArray(gateways)) {
    return [];
  }

  return gateways.filter(gateway => {
    // Search filter (domain, label, city, country, isp, org)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = [
        gateway.address,
        gateway.label,
        gateway.city,
        gateway.country,
        gateway.region,
        gateway.isp,
        gateway.org
      ].filter(Boolean).join(' ').toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    // Status filter
    if (filters.status && gateway.status !== filters.status) {
      return false;
    }

    // Country filter
    if (filters.country && gateway.country !== filters.country) {
      return false;
    }

    // ISP filter
    if (filters.isp && gateway.isp !== filters.isp) {
      return false;
    }

    // Stake range filter
    if (filters.minStake) {
      const minStake = parseInt(filters.minStake);
      if (!gateway.minimumDelegatedStake || parseInt(gateway.minimumDelegatedStake) < minStake) {
        return false;
      }
    }
    if (filters.maxStake) {
      const maxStake = parseInt(filters.maxStake);
      if (!gateway.minimumDelegatedStake || parseInt(gateway.minimumDelegatedStake) > maxStake) {
        return false;
      }
    }
    return true;
  });
}

// === STATISTICS FUNCTION ===
export function getGatewayStatistics(gateways) {
  if (!gateways || gateways.length === 0) {
    return {
      total: 0,
      online: 0,
      offline: 0,
      unknown: 0,
      countries: 0,
      totalStake: 0,
      avgResponseTime: 0,
      statusStats: {},
      countryStats: {},
      ispStats: {},
      stakeStats: {},
      cityStats: {},
      regionStats: {},
      releaseStats: {}
    };
  }

  const stats = {
    total: gateways.length,
    online: gateways.filter(g => g.status === 'ok').length,
    offline: gateways.filter(g => g.status === 'offline').length,
    unknown: gateways.filter(g => g.status === 'unknown').length,
    totalStake: gateways.reduce((sum, g) => sum + (parseInt(g.minimumDelegatedStake) || 0), 0),
    countries: [...new Set(gateways.map(g => g.country))].filter(Boolean).length
  };

  // Status distribution
  stats.statusStats = {
    online: stats.online,
    offline: stats.offline,
    unknown: stats.unknown
  };

  // Country distribution
  stats.countryStats = gateways.reduce((acc, gateway) => {
    const country = gateway.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  // Region distribution
  stats.regionStats = gateways.reduce((acc, gateway) => {
    const region = gateway.region || 'Unknown';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});

  // City distribution
  stats.cityStats = gateways.reduce((acc, gateway) => {
    const city = gateway.city || 'Unknown';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  // Release distribution
  stats.releaseStats = gateways.reduce((acc, gateway) => {
    const release = gateway.release || 'unknown';
    acc[release] = (acc[release] || 0) + 1;
    return acc;
  }, {});

  // ISP distribution
  stats.ispStats = gateways.reduce((acc, gateway) => {
    const isp = gateway.isp || 'Unknown ISP';
    acc[isp] = (acc[isp] || 0) + 1;
    return acc;
  }, {});

  // Stake distribution by ranges
  stats.stakeStats = gateways.reduce((acc, gateway) => {
    const stake = parseInt(gateway.minimumDelegatedStake) || 0;
    let range;
    if (stake >= 1000000) range = '1M+ ARIO';
    else if (stake >= 500000) range = '500K-1M ARIO';
    else if (stake >= 100000) range = '100K-500K ARIO';
    else if (stake >= 50000) range = '50K-100K ARIO';
    else if (stake >= 10000) range = '10K-50K ARIO';
    else range = 'Under 10K ARIO';
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {});

  return stats;
}

// === GATEWAY SERVICE CLASS ===
export class GatewayService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 min cache (increased from 5 min)
  }

  /**
   * Fetches all gateways from AR.IO contract. First gets the first page, learns totalItems, then calls again with limit=totalItems.
   */
  async getGateways() {
    const cacheKey = 'rawGateways';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('Using cache.');
      return cached.data;
    }
    try {
      // First, get the first page (default limit)
      const firstPage = await ario.getGateways();
      const total = firstPage.totalItems || (firstPage.items ? firstPage.items.length : 0);
      // If all are already fetched, no need to call again
      if (!total || total <= (firstPage.items?.length || 0)) {
        this.cache.set(cacheKey, {
          data: firstPage,
          timestamp: Date.now(),
        });
        return firstPage;
      }
      // To fetch all gateways, call again with limit=total
      const allGateways = await ario.getGateways({ limit: total });
      this.cache.set(cacheKey, {
        data: allGateways,
        timestamp: Date.now(),
      });
      return allGateways;
    } catch (error) {
      console.error('getGateways error:', error);
      if (cached) {
        console.warn('Returning old cache due to error.');
        return cached.data;
      }
      throw new Error('Could not fetch gateways from AR.IO contract.');
    }
  }
} 