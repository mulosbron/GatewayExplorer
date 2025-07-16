import React from 'react';
import './GraphFilters.css';

export default function GraphFilters({ enabledLevels, onToggle, disabled = false }) {
  const levels = [
    { key: 'country', label: 'Country', color: '#4A90E2' },
    { key: 'region', label: 'Region', color: '#50E3C2' },
    { key: 'city', label: 'City', color: '#F5A623' },
    { key: 'isp', label: 'ISP', color: '#E67E22' },
    { key: 'release', label: 'Release', color: '#9B59B6' }
  ];

  return (
    <div className={`graph-filters ${disabled ? 'disabled' : ''}`}>
      {levels.map((level, idx) => (
        <React.Fragment key={level.key}>
          <div
            className={`filter-node ${enabledLevels[level.key] ? 'enabled' : 'disabled'}`}
            title={level.label}
            onClick={() => onToggle(level.key)}
            style={{
              borderColor: level.color,
              boxShadow: enabledLevels[level.key] ? `0 0 8px ${level.color}88` : undefined,
              background: enabledLevels[level.key] ? `${level.color}22` : 'var(--bg-secondary)'
            }}
          >
            {level.label}
          </div>
          {idx < levels.length - 1 && <div className="filter-line" />}
        </React.Fragment>
      ))}
      {disabled && <div className="filters-loading-spinner" />}
    </div>
  );
}