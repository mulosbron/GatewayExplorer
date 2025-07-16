// Gateway Service for AR.IO Gateway Explorer
// Handles data fetching, processing, and statistics

// Load gateway data from remote API (HTML içerebilir, JSON array'i arındır)
const loadGatewayData = async () => {
  try {
    const response = await fetch('https://api_gatewayexplorer.ar.io/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    // JSON array'i HTML'den arındır
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error('No JSON array found in response');
    const jsonString = text.slice(start, end + 1);
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (e) {
      throw new Error('Failed to parse JSON array from response');
    }
    // Handle both old format (data.gateways) and new format (direct array)
    const gateways = Array.isArray(data) ? data : (data.gateways || []);
    // Transform new data structure to match our expected format
    return gateways.map(gateway => ({
      // Basic information
      label: gateway.Label || gateway.label || 'Unknown',
      address: gateway.Address || gateway.address || '',
      domain: gateway.Address ? new URL(gateway.Address).hostname : (gateway.address ? new URL(gateway.address).hostname : ''),
      
      // Wallet information
      wallet: gateway['Owner Wallet'] || gateway.wallet || '',
      observerWallet: gateway['Observer Wallet'] || gateway.observerWallet || '',
      propertiesId: gateway['Properties ID'] || gateway.propertiesId || '',
      
      // Status and health - Mark as unknown if info/healthcheck are null and status is joined
      status: (() => {
        // If info and healthcheck are null and status is joined, mark as unknown
        if (gateway.Status === 'joined' && 
            (gateway.info === null || gateway.info === undefined) && 
            (gateway.healthcheck === null || gateway.healthcheck === undefined)) {
          return 'unknown';
        }
        
        // Otherwise use existing logic
        if (gateway.Status === 'joined') return 'ok';
        if (gateway.Status === 'leaving') return 'offline';
        return gateway.Status || gateway.status || 'unknown';
      })(),
      healthcheck: gateway.healthcheck || {},
      
      // Staking information
      stake: parseInt(gateway['Minimum Delegated Stake (ARIO)'] || gateway.stake || '0'),
      rewardAutoStake: gateway['Reward Auto Stake'] || gateway.rewardAutoStake || 'N/A',
      delegatedStaking: gateway['Delegated Staking'] || gateway.delegatedStaking || 'N/A',
      rewardShareRatio: gateway['Reward Share Ratio'] || gateway.rewardShareRatio || 'N/A',
      minimumDelegatedStake: parseInt(gateway['Minimum Delegated Stake (ARIO)'] || gateway.minimumDelegatedStake || '0'),
      
      // Technical information
      info: gateway.info || {},
      
      // Location and network information
      ipgeo: gateway.ipgeo || {},
      ip: gateway.ipgeo?.ip || gateway.ip || '',
      latitude: gateway.ipgeo?.location?.latitude ? parseFloat(gateway.ipgeo.location.latitude) : (gateway.ipgeo?.lat || gateway.latitude || null),
      longitude: gateway.ipgeo?.location?.longitude ? parseFloat(gateway.ipgeo.location.longitude) : (gateway.ipgeo?.lon || gateway.longitude || null),
      country: gateway.ipgeo?.location?.country_name || gateway.ipgeo?.country || gateway.country || 'Unknown',
      city: gateway.ipgeo?.location?.city || gateway.ipgeo?.city || gateway.city || 'Unknown',
      state: gateway.ipgeo?.location?.state_prov || gateway.ipgeo?.regionName || gateway.ipgeo?.region || gateway.state || '',
      region: gateway.ipgeo?.location?.state_prov || gateway.ipgeo?.regionName || gateway.ipgeo?.region || gateway.state || '',
      isp: gateway.ipgeo?.location?.organization || gateway.ipgeo?.isp || gateway.ipgeo?.org || gateway.isp || 'Unknown',
      
      // Additional information
      note: gateway.Note || gateway.note || '',
      
      // Legacy fields for compatibility
      organization: gateway.ipgeo?.location?.organization || gateway.organization || 'Unknown',
      responseTime: gateway['Response Time'] === 'Error' ? null : 
                   (typeof gateway['Response Time'] === 'number' ? gateway['Response Time'] : 
                    (gateway.responseTime || null)),
      lastChecked: gateway.lastChecked || new Date().toISOString(),
      uptimePercentage: gateway.uptimePercentage || 0,
      
      // Teknik bilgi içinde release ekle
      release: gateway.info?.release || gateway.release || 'unknown',
    }));
  } catch (error) {
    console.error('Error loading gateway data:', error);
    throw new Error('Failed to load gateway data from remote API');
  }
};

// Simulate health check for a gateway
const checkGatewayHealth = async (domain) => {
  // Simulate health check with random response times and occasional failures
  return new Promise((resolve) => {
    setTimeout(() => {
      const isHealthy = Math.random() > 0.1; // 90% success rate
      const responseTime = isHealthy ? Math.floor(Math.random() * 200) + 50 : null;
      
      resolve({
        status: isHealthy ? 'ok' : 'offline',
        responseTime: responseTime,
        timestamp: new Date().toISOString()
      });
    }, Math.random() * 1000 + 500); // Random delay between 500-1500ms
  });
};

// Main function to get all gateways with enhanced data
export const getGateways = async () => {
  try {
    console.log('Loading gateway data from remote API...');
    
    // Load base gateway data with new structure
    let gateways = await loadGatewayData();
    
    console.log(`Loaded ${gateways.length} gateways from API`);
    
    // Add computed fields and use real health data
    gateways = gateways.map(gateway => ({
      ...gateway,
      // Add a unique ID if not present
      id: gateway.address || `${gateway.domain}-${Date.now()}`,
      // Ensure stake is a number
      stake: typeof gateway.stake === 'string' ? parseInt(gateway.stake) : gateway.stake || 0,
      // Use real status from healthcheck or fallback
      status: gateway.healthcheck?.status || gateway.status || 'unknown',
      // Use real uptime from healthcheck
      uptimePercentage: gateway.healthcheck?.uptime ? 
        Math.min(100, Math.max(0, (gateway.healthcheck.uptime / 3600) * 100)) : 
        (gateway.status === 'ok' ? 98.5 + Math.random() * 1.5 : 
         gateway.status === 'offline' ? 0 : 
         Math.random() * 50 + 25),
      // Use real last check time
      lastChecked: gateway.healthcheck?.date || gateway.lastChecked || new Date().toISOString()
    }));
    
    console.log(`Processed ${gateways.length} gateways successfully`);
    return gateways;
    
  } catch (error) {
    console.error('Error in getGateways:', error);
    throw error;
  }
};

// Filter gateways based on various criteria
export const filterGateways = (gateways, filters) => {
  if (!gateways || !Array.isArray(gateways)) {
    return [];
  }

  return gateways.filter(gateway => {
    // Search filter (domain, label, city, country)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = [
        gateway.domain,
        gateway.label,
        gateway.city,
        gateway.country,
        gateway.organization
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
      if (!gateway.stake || gateway.stake < minStake) {
        return false;
      }
    }

    if (filters.maxStake) {
      const maxStake = parseInt(filters.maxStake);
      if (!gateway.stake || gateway.stake > maxStake) {
        return false;
      }
    }

    return true;
  });
};

// Calculate comprehensive statistics
export const getGatewayStatistics = (gateways) => {
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
    totalStake: gateways.reduce((sum, g) => sum + (g.stake || 0), 0),
    countries: [...new Set(gateways.map(g => g.country))].filter(Boolean).length
  };

  // Calculate average response time (only for gateways with valid response times, exclude "Error")
  const validResponseTimeGateways = gateways.filter(g => 
    g.responseTime !== null && 
    g.responseTime !== undefined && 
    typeof g.responseTime === 'number' && 
    g.responseTime > 0
  );
  stats.avgResponseTime = validResponseTimeGateways.length > 0 
    ? validResponseTimeGateways.reduce((sum, g) => sum + g.responseTime, 0) / validResponseTimeGateways.length
    : 0;

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

  // Region distribution (just region/state names)
  stats.regionStats = gateways.reduce((acc, gateway) => {
    const region = gateway.region || gateway.state || 'Unknown';
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
    const release = gateway.release || gateway.info?.release || 'unknown';
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
    const stake = gateway.stake || 0;
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

  // Calculate Enhanced Decentralization Index
  const uniqueWallets = [...new Set(gateways.map(g => g.wallet))].filter(Boolean).length;
  const uniqueCountries = [...new Set(gateways.map(g => g.country))].filter(Boolean).length;
  const uniqueRegions = [...new Set(gateways.map(g => g.region || g.state))].filter(Boolean).length;
  const uniqueCities = [...new Set(gateways.map(g => g.city))].filter(Boolean).length;
  const uniqueISPs = [...new Set(gateways.map(g => g.isp))].filter(Boolean).length;
  
  // Enhanced weights for comprehensive decentralization formula
  const w1 = 0.20; // Country diversity weight
  const w2 = 0.15; // Region diversity weight  
  const w3 = 0.15; // City diversity weight
  const w4 = 0.20; // ISP diversity weight
  const w5 = 0.15; // Gateway health weight
  const w6 = 0.15; // Stake distribution weight
  
  // Calculate normalized ratios
  const countryRatio = uniqueCountries / stats.total;
  const regionRatio = uniqueRegions / stats.total;
  const cityRatio = uniqueCities / stats.total;
  const ispRatio = uniqueISPs / stats.total;
  const healthRatio = stats.online / stats.total; // Online gateway percentage
  
  // Calculate stake distribution (1 - concentration ratio)
  // Higher average stake per gateway means more concentrated, so we invert it
  const avgStakePerGateway = stats.totalStake / stats.total;
  const stakeDistributionRatio = stats.totalStake > 0 ? 
    Math.min(1, 1 - (avgStakePerGateway / stats.totalStake)) : 0.5;
  
  // Calculate comprehensive decentralization index (0-1)
  stats.decentralizationScore = 
    w1 * countryRatio +
    w2 * regionRatio + 
    w3 * cityRatio +
    w4 * ispRatio +
    w5 * healthRatio +
    w6 * stakeDistributionRatio;
  
  // Store individual counts and metrics for display
  stats.uniqueWallets = uniqueWallets;
  stats.uniqueCountries = uniqueCountries;
  stats.uniqueRegions = uniqueRegions;
  stats.uniqueCities = uniqueCities;
  stats.uniqueISPs = uniqueISPs;
  stats.avgStakePerGateway = avgStakePerGateway;

  // Calculate Nakamoto Coefficients
  stats.nakamotoCoefficient = calculateNakamotoCoefficients(gateways);

  return stats;
};

// Get gateway details by address or domain
export const getGatewayDetails = async (identifier) => {
  try {
    const gateways = await getGateways();
    return gateways.find(g => 
      g.address === identifier || 
      g.domain === identifier
    );
  } catch (error) {
    console.error('Error getting gateway details:', error);
    return null;
  }
};

// Export utility functions
export const formatStake = (stake) => {
  if (!stake) return '0 ARIO';
  
  if (stake >= 1000000) {
    return `${(stake / 1000000).toFixed(1)}M ARIO`;
  } else if (stake >= 1000) {
    return `${(stake / 1000).toFixed(1)}K ARIO`;
  }
  return `${stake.toLocaleString()} ARIO`;
};

export const formatResponseTime = (responseTime) => {
  if (!responseTime) return 'N/A';
  return `${responseTime}ms`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'ok':
    case 'online': return '#4caf50';
    case 'offline': return '#f44336';
    case 'unknown': return '#ff9800';
    default: return '#757575';
  }
};

// Nakamoto Coefficient Calculation Functions
export const calculateNakamotoCoefficients = (gateways) => {
  if (!gateways || gateways.length === 0) {
    return {
      ownerWalletCoeff: 0,
      stakeCoeff: 0,
      countryCoeff: 0,
      ispCoeff: 0,
      analysis: {
        totalGateways: 0,
        uniqueOwners: 0,
        totalStake: 0,
        interpretation: 'No data available'
      }
    };
  }

  // 1. Owner Wallet Based Nakamoto Coefficient
  const ownerWalletCoeff = calculateOwnerWalletNakamoto(gateways);
  
  // 2. Stake Distribution Based Nakamoto Coefficient  
  const stakeCoeff = calculateStakeNakamoto(gateways);
  
  // 3. Country Distribution Based Nakamoto Coefficient
  const countryCoeff = calculateCountryNakamoto(gateways);
  
  // 4. ISP Distribution Based Nakamoto Coefficient
  const ispCoeff = calculateISPNakamoto(gateways);

  // Analysis and interpretation
  const analysis = {
    totalGateways: gateways.length,
    uniqueOwners: [...new Set(gateways.map(g => g.wallet || g.ownerWallet))].filter(Boolean).length,
    totalStake: gateways.reduce((sum, g) => sum + (g.stake || 0), 0),
    interpretation: interpretNakamotoResults({
      owner: ownerWalletCoeff,
      stake: stakeCoeff,
      country: countryCoeff,
      isp: ispCoeff
    }, gateways.length)
  };

  return {
    ownerWalletCoeff,
    stakeCoeff,
    countryCoeff,
    ispCoeff,
    analysis
  };
};

// Owner Wallet based Nakamoto Coefficient
const calculateOwnerWalletNakamoto = (gateways) => {
  const walletCounts = {};
  
  gateways.forEach(gateway => {
    const wallet = gateway.wallet || gateway.ownerWallet || 'unknown';
    walletCounts[wallet] = (walletCounts[wallet] || 0) + 1;
  });

  // Sort by gateway count (descending)
  const sortedWallets = Object.entries(walletCounts)
    .sort(([,a], [,b]) => b - a);

  const totalGateways = gateways.length;
  const threshold = Math.ceil(totalGateways * 0.51); // 51% threshold for majority control

  let cumulativeCount = 0;
  let nakamotoCoeff = 0;

  for (const [wallet, count] of sortedWallets) {
    cumulativeCount += count;
    nakamotoCoeff += 1;
    if (cumulativeCount >= threshold) {
      break;
    }
  }

  return nakamotoCoeff;
};

// Stake Distribution based Nakamoto Coefficient
const calculateStakeNakamoto = (gateways) => {
  const totalStake = gateways.reduce((sum, g) => sum + (g.stake || 0), 0);
  
  if (totalStake === 0) return 0;

  // Sort by stake amount (descending)
  const sortedByStake = gateways
    .filter(g => g.stake > 0)
    .sort((a, b) => (b.stake || 0) - (a.stake || 0));

  const threshold = totalStake * 0.3333; // 33.33% threshold for PoS networks

  let cumulativeStake = 0;
  let nakamotoCoeff = 0;

  for (const gateway of sortedByStake) {
    cumulativeStake += gateway.stake || 0;
    nakamotoCoeff += 1;
    if (cumulativeStake >= threshold) {
      break;
    }
  }

  return nakamotoCoeff;
};

// Country Distribution based Nakamoto Coefficient
const calculateCountryNakamoto = (gateways) => {
  const countryCounts = {};
  
  gateways.forEach(gateway => {
    const country = gateway.country || 'Unknown';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  // Sort by gateway count (descending)
  const sortedCountries = Object.entries(countryCounts)
    .sort(([,a], [,b]) => b - a);

  const totalGateways = gateways.length;
  const threshold = Math.ceil(totalGateways * 0.51); // 51% threshold

  let cumulativeCount = 0;
  let nakamotoCoeff = 0;

  for (const [country, count] of sortedCountries) {
    cumulativeCount += count;
    nakamotoCoeff += 1;
    if (cumulativeCount >= threshold) {
      break;
    }
  }

  return nakamotoCoeff;
};

// ISP Distribution based Nakamoto Coefficient
const calculateISPNakamoto = (gateways) => {
  const ispCounts = {};
  
  gateways.forEach(gateway => {
    const isp = gateway.isp || 'Unknown ISP';
    ispCounts[isp] = (ispCounts[isp] || 0) + 1;
  });

  // Sort by gateway count (descending)
  const sortedISPs = Object.entries(ispCounts)
    .sort(([,a], [,b]) => b - a);

  const totalGateways = gateways.length;
  const threshold = Math.ceil(totalGateways * 0.51); // 51% threshold

  let cumulativeCount = 0;
  let nakamotoCoeff = 0;

  for (const [isp, count] of sortedISPs) {
    cumulativeCount += count;
    nakamotoCoeff += 1;
    if (cumulativeCount >= threshold) {
      break;
    }
  }

  return nakamotoCoeff;
};

// Interpret Nakamoto Coefficient Results
const interpretNakamotoResults = (coefficients, totalGateways) => {
  const { owner, stake, country, isp } = coefficients;
  
  // Calculate average coefficient for overall assessment
  const avgCoeff = (owner + stake + country + isp) / 4;
  const gatewayPercent = (avgCoeff / totalGateways) * 100;

  if (avgCoeff <= 3) {
    return 'High Centralization Risk - Network control concentrated in very few entities';
  } else if (avgCoeff <= 10) {
    return 'Medium Centralization Risk - Concerning concentration levels';
  } else if (avgCoeff <= 25) {
    return 'Low Centralization Risk - Reasonable distribution levels';
  } else if (gatewayPercent >= 15) {
    return 'Good Decentralization - Control widely distributed';
  } else {
    return 'Excellent Decentralization - Very well distributed control structure';
  }
};

// Get Nakamoto Coefficient Color for UI
export const getNakamotoColor = (coefficient, totalGateways) => {
  const percentage = (coefficient / totalGateways) * 100;
  
  if (coefficient <= 3) {
    return 'var(--danger)';
  } else if (coefficient <= 10) {
    return 'var(--warning)';
  } else if (percentage >= 15) {
    return 'var(--success)';
  } else {
    return 'var(--primary)';
  }
};

// Default export
export default {
  getGateways,
  filterGateways,
  getGatewayStatistics,
  getGatewayDetails,
  formatStake,
  formatResponseTime,
  getStatusColor,
  calculateNakamotoCoefficients,
  getNakamotoColor
};
