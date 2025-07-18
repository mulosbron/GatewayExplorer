import React, { useMemo } from 'react';
// import { getGatewayStatistics, getNakamotoColor } from '../services/gatewayService';
import { getGatewayStatistics } from '../services/gatewayService';
import EmojiIcon from './EmojiIcon';

const Statistics = ({ gateways }) => {
  const stats = useMemo(() => getGatewayStatistics(gateways), [gateways]);

  // Summary values
  const regionCount = Object.keys(stats.regionStats || {}).length;
  const cityCount = Object.keys(stats.cityStats || {}).length;

  const StatCard = ({ title, value, subtitle, color = '#4A90E2', icon = null }) => (
    <div className="stat-card" style={{ 
      borderColor: color,
      margin: '8px',
      padding: '16px',
      minHeight: '140px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      border: `2px solid ${color}`,
      boxShadow: 'var(--shadow-md)'
    }}>
      {icon && (
        <div style={{
          fontSize: '2rem',
          marginBottom: '12px',
          color: color
        }}>
          {icon}
        </div>
      )}
      <div className="stat-label" style={{ 
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        fontWeight: 500,
        marginBottom: '8px'
      }}>
        {title}
      </div>
      <div 
        className="stat-value" 
        style={{ 
          color: 'var(--text-primary)',
          fontWeight: 600,
          fontSize: '2.5rem',
          lineHeight: 1,
          marginBottom: '4px'
        }}
      >
        {value}
      </div>
      {subtitle && (
        <div className="stat-subtitle" style={{ 
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          fontWeight: 400
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  const ChartContainer = ({ title, icon, children }) => (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-container">
          <span className="chart-icon">{icon}</span>
          <h3 className="chart-title">{title}</h3>
        </div>
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );

  // Lucide ikon eşleştirmeleri
  const lucideIcons = {
    globe: <EmojiIcon name="Globe" size={32} color="#00d4aa" />,
    trendingUp: <EmojiIcon name="TrendingUp" size={32} color="#10B981" />,
    circleDot: <EmojiIcon name="CircleDot" size={32} color="#10B981" />,
    circleX: <EmojiIcon name="CircleX" size={32} color="#EF4444" />,
    map: <EmojiIcon name="MapPin" size={32} color="#50E3C2" />,
    building: <EmojiIcon name="Building" size={32} color="#F5A623" />,
    pieChart: <EmojiIcon name="PieChart" size={28} color="#6366f1" />,
    barChart: <EmojiIcon name="BarChart" size={28} color="#4A90E2" />,
    wrench: <EmojiIcon name="Wrench" size={28} color="#F39C12" />,
  };

  const BarChart = ({ data, maxItems = 12, color = 'var(--text-primary)' }) => {
    if (!data || typeof data !== 'object') {
      return (
        <div className="chart-placeholder">
          No data available
        </div>
      );
    }

    const sortedData = Object.entries(data)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxItems);
    
    const maxValue = Math.max(...sortedData.map(([,value]) => value));

    return (
      <div className="bar-chart-container">
        {sortedData.map(([key, value]) => (
          <div key={key} className="bar-chart-item">
            <div className="bar-chart-label-container">
              <span className="bar-chart-label">
                {key.length > 25 ? key.substring(0, 22) + '...' : key}
              </span>
              <span className="bar-chart-value" style={{ color }}>
                {value}
              </span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{
                  width: `${(value / maxValue) * 100}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                }} 
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const StatusPieChart = ({ data }) => {
    if (!data || typeof data !== 'object') {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '300px',
          color: 'var(--text-muted)',
          fontSize: '1.1rem'
        }}>
          No data available
        </div>
      );
    }

    const colors = {
      ok: 'var(--success)',
      online: 'var(--success)',
      offline: 'var(--danger)',
      unknown: 'var(--warning)'
    };

    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    if (total === 0) return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '300px',
        color: 'var(--text-muted)',
        fontSize: '1.1rem'
      }}>
        No data available
      </div>
    );

    let currentAngle = 0;
    const slices = Object.entries(data).map(([status, count]) => {
      const percentage = (count / total) * 100;
      const angle = (count / total) * 360;
      const slice = {
        status,
        count,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: colors[status] || 'var(--text-muted)'
      };
      currentAngle += angle;
      return slice;
    });

    const radius = 100;
    const centerX = 120;
    const centerY = 120;

    const createArcPath = (startAngle, endAngle, innerRadius = 0) => {
      const start = polarToCartesian(centerX, centerY, radius, endAngle);
      const end = polarToCartesian(centerX, centerY, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      
      return [
        "M", centerX, centerY,
        "L", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "Z"
      ].join(" ");
    };

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    };

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '48px',
        padding: '24px',
        flexWrap: 'wrap'
      }}>
        <svg width="240" height="240" viewBox="0 0 240 240">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={createArcPath(slice.startAngle, slice.endAngle)}
              fill={slice.color}
              stroke="var(--bg-primary)"
              strokeWidth="4"
              style={{
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.transformOrigin = `${centerX}px ${centerY}px`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            />
          ))}
        </svg>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          minWidth: '200px'
        }}>
          {slices.map((slice, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '8px 12px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: slice.color,
                borderRadius: '50%',
                boxShadow: `0 0 8px ${slice.color}44`
              }} />
              <span style={{ 
                fontSize: '1rem', 
                color: 'var(--text-primary)',
                fontWeight: 500
              }}>
                {slice.status.charAt(0).toUpperCase() + slice.status.slice(1)}: {slice.count} ({slice.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="statistics-container">
      {/* Summary cards */}
      <div className="statistics-summary-grid">
        <StatCard title="Total Gateways" value={stats.total} subtitle="Network Wide" color="#00d4aa" icon={lucideIcons.globe} />
        <StatCard title="Network Health" value={`${((stats.online / stats.total) * 100).toFixed(1)}%`} subtitle="Online Gateway Rate" color="var(--success)" icon={lucideIcons.trendingUp} />
        <StatCard title="Online" value={stats.online} subtitle="Active Now" color="var(--success)" icon={lucideIcons.circleDot} />
        <StatCard title="Offline" value={stats.offline} subtitle="Inactive" color="var(--danger)" icon={lucideIcons.circleX} />
        <StatCard title="Countries" value={stats.countries} subtitle="Global Reach" color="#4A90E2" icon={lucideIcons.globe} />
        <StatCard title="Regions" value={regionCount} subtitle="Distributed" color="#50E3C2" icon={lucideIcons.map} />
        <StatCard title="Cities" value={cityCount} subtitle="Locations" color="#F5A623" icon={lucideIcons.building} />
      </div>

      {/* Gateway Status Distribution */}
      <ChartContainer title="Gateway Status Distribution" icon={lucideIcons.pieChart}>
        <StatusPieChart data={stats.statusStats} />
      </ChartContainer>

      {/* Charts Grid */}
      <div className="statistics-charts-grid">
        <ChartContainer title="Top Countries" icon={lucideIcons.globe}>
          <BarChart data={stats.countryStats} color="#4A90E2" />
        </ChartContainer>

        <ChartContainer title="Top Regions" icon={lucideIcons.map}>
          <BarChart data={stats.regionStats} color="#50E3C2" />
        </ChartContainer>

        <ChartContainer title="Top Cities" icon={lucideIcons.building}>
          <BarChart data={stats.cityStats} color="#F5A623" />
        </ChartContainer>

        <ChartContainer title="Top ISPs" icon={lucideIcons.globe}>
          <BarChart data={stats.ispStats} color="#9B59B6" />
        </ChartContainer>

        <ChartContainer title="Release Versions" icon={lucideIcons.wrench}>
          <BarChart data={stats.releaseStats} color="#F39C12" />
        </ChartContainer>
      </div>


    </div>
  );
};

export default Statistics; 