import React, { useState, useEffect, useMemo } from 'react';

const FilterPanel = ({ gateways, onFiltersChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    country: '',
    isp: '',
    minStake: '',
    maxStake: ''
  });

  // Extract unique values for dropdowns
  const { countries, isps, stakeRange } = useMemo(() => {
    const uniqueCountries = [...new Set(gateways.map(g => g.country))].filter(Boolean).sort();
    const uniqueIsps = [...new Set(gateways.map(g => g.isp))].filter(Boolean).sort();
    const stakes = gateways.map(g => g.stake || 0).filter(s => s > 0);
    const minStake = stakes.length > 0 ? Math.min(...stakes) : 0;
    const maxStake = stakes.length > 0 ? Math.max(...stakes) : 0;
    return {
      countries: uniqueCountries,
      isps: uniqueIsps,
      stakeRange: { min: minStake, max: maxStake }
    };
  }, [gateways]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      country: '',
      isp: '',
      minStake: '',
      maxStake: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  return (
    <div className="filter-panel-box">
      <div className="filter-panel-header">Filters</div>
      <div className="filter-panel-fields">
        <input
          className="filter-input"
          type="text"
          placeholder="Search domain, label, city, country..."
          value={filters.search || ''}
          onChange={e => handleFilterChange('search', e.target.value)}
        />
        <select
          className="filter-select"
          value={filters.status || ''}
          onChange={e => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ok">🟢 Online</option>
          <option value="offline">🔴 Offline</option>
          <option value="unknown">🟡 Unknown</option>
        </select>
        <select
          className="filter-select"
          value={filters.country || ''}
          onChange={e => handleFilterChange('country', e.target.value)}
        >
          <option value="">All Countries ({countries.length})</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filters.isp || ''}
          onChange={e => handleFilterChange('isp', e.target.value)}
        >
          <option value="">All ISPs ({isps.length})</option>
          {isps.slice(0, 20).map(isp => (
            <option key={isp} value={isp}>{isp.length > 35 ? isp.substring(0, 32) + '...' : isp}</option>
          ))}
        </select>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
          <input
            className="filter-input"
            type="number"
            placeholder="Min Stake"
            value={filters.minStake || ''}
            onChange={e => handleFilterChange('minStake', e.target.value)}
          />
          <input
            className="filter-input"
            type="number"
            placeholder="Max Stake"
            value={filters.maxStake || ''}
            onChange={e => handleFilterChange('maxStake', e.target.value)}
          />
        </div>
      </div>
      <div className="filter-panel-actions">
        <button className="button" onClick={clearFilters} type="button" disabled={!hasActiveFilters}>Reset</button>
      </div>
      <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginTop: 'var(--space-lg)' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <h4 style={{ margin: '0 0 var(--space-sm) 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
            💡 Filter Tips
          </h4>
          <ul style={{ margin: 0, paddingLeft: 'var(--space-md)' }}>
            <li>Use search to find specific domains or locations</li>
            <li>Combine multiple filters for precise results</li>
            <li>Stake filters help find major network participants</li>
            <li>Dropdowns show all available values</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel; 