import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import Map from './components/Map';
import Graph from './components/Graph';
import Statistics from './components/Statistics';
import { getAllGatewayDataV2 } from './services/gatewayService';
import Logo from './components/Logo';
import './App.css';

function AppContent() {
  const [allGateways, setAllGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const location = useLocation();

  // Fetch gateways data
  useEffect(() => {
    const fetchGatewaysData = async () => {
      try {
        setLoading(true);
        setError(null);
        setLoadingStep('Fetching gateway list...');
        setProgress(10);
        const data = await getAllGatewayDataV2({
          onStep: (step) => setLoadingStep(step),
          onProgress: (p) => setProgress(p)
        });
        setLoadingStep('Finalizing...');
        setProgress(100);
        setAllGateways(data);
      } catch (err) {
        console.error('❌ Error fetching gateways:', err);
        setError('An error occurred while loading gateway data. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
        setTimeout(() => {
          setLoadingStep('');
          setProgress(0);
        }, 500);
      }
    };

    fetchGatewaysData();
  }, []);

  // Update filtered gateways when filters or gateways change
  useEffect(() => {
    // Başlangıçta boş filtre uygula
  }, []);

  // Refresh data with modern animation
  const refreshData = async () => {
    setRefreshing(true);
    setLoadingStep('Refreshing gateway data...');
    setProgress(0);
    try {
      const data = await getAllGatewayDataV2({
        onStep: (step) => setLoadingStep(step),
        onProgress: (p) => setProgress(p)
      });
      setAllGateways(data);
      
      // Success feedback
      setTimeout(() => {
        setRefreshing(false);
        setLoadingStep('');
        setProgress(0);
      }, 800);
    } catch (err) {
      setError('Failed to refresh data');
      setRefreshing(false);
      setLoadingStep('');
      setProgress(0);
    }
  };

  // Navigation items with modern icons
  const navItems = [
    { path: '/', label: 'Map', description: 'Geographic View' },
    { path: '/graph', label: 'Graph', description: 'Network View' },
    { path: '/statistics', label: 'Statistics', description: 'Detailed Analytics' },
    { 
      url: 'https://logosnodos.medium.com/run-your-first-ar-io-node-complete-setup-guide-0ea2028b8022', 
      label: 'Setup Guide', 
      description: 'How to run ARIO gateway',
      external: true 
    }
  ];

  // Modern loading state
  if (loading && allGateways.length === 0) {
    return (
      <div className="loading">
        <div className="loading-progress-bar" style={{ height: 3, width: '100%', background: 'var(--bg-secondary)', position: 'relative', marginBottom: 12 }}>
          <div style={{ height: 3, width: `${progress}%`, background: 'var(--success)', position: 'absolute', left: 0, top: 0, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <div className="loading-spinner"></div>
        <div style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          textAlign: 'center'
        }}>
          Loading AR.IO Gateway Data...
        </div>
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-muted)',
          textAlign: 'center',
          maxWidth: '400px',
          marginBottom: 8
        }}>
          {loadingStep || 'Initializing gateway analysis...'}
        </div>
        <div style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-muted)',
          textAlign: 'center',
          opacity: 0.7
        }}>
          {progress > 0 && progress < 100 ? `${progress}% complete` : ''}
        </div>
      </div>
    );
  }

  // Modern error state
  if (error && allGateways.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 'var(--space-xl)',
        background: 'var(--bg-primary)',
        padding: 'var(--space-xl)'
      }}>
        <div className="card" style={{ 
          maxWidth: '600px', 
          textAlign: 'center',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <h2 style={{ 
            color: 'var(--danger)', 
            marginBottom: 'var(--space-lg)',
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700
          }}>
            Data Loading Error
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: 'var(--space-xl)',
            lineHeight: 1.6
          }}>
            {error}
          </p>
          <button onClick={refreshData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Modern Header - Completely Redesigned */}
      <header className="app-header">
        <div className="header-wrapper">
          {/* Left: Brand Section + Setup Guide */}
          <div className="header-left">
            <Link to="/" className="brand-link">
            <div className="brand-logo">
                <Logo />
            </div>
              <div className="brand-content">
                <h1 className="brand-title">AR.IO Gateway Explorer</h1>
                <span className="brand-subtitle">Decentralized Gateway Analytics</span>
            </div>
          </Link>
          
          {/* Setup Guide on the left */}
          <a
            href="https://logosnodos.medium.com/run-your-first-ar-io-node-complete-setup-guide-0ea2028b8022"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item external-link setup-guide-left"
            title="How to run ARIO gateway"
          >
            Setup Guide
            <span className="external-icon">↗</span>
          </a>
          </div>

          {/* Right: Navigation */}
          <nav className="header-right">
            {navItems.filter(item => !item.external).map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                title={item.description}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Content Area */}
        <main className="content-area">
          <Routes>
            <Route 
              path="/statistics" 
              element={<Statistics gateways={allGateways} />} 
            />
            <Route 
              path="/graph" 
              element={
                <Graph 
                  gateways={allGateways}
                />
              } 
            />
            <Route 
              path="/" 
              element={
                <Map 
                  gateways={allGateways}
                />
              } 
            />
          </Routes>
        </main>
      </div>



      {/* Modern Footer */}
      <footer className="modern-footer">
        <div className="footer-container">
          {/* Main Footer Content */}
          <div className="footer-main">
            <div className="footer-brand">
              <p className="footer-description">
                Gateways to the permanent web. Explore and analyze AR.IO gateways that facilitate data hosting, 
                domain management, and seamless querying across the decentralized network.
              </p>
            </div>

            <div className="footer-links-grid">
              <div className="footer-column">
                <h4>Navigation</h4>
                <ul>
                  <li><Link to="/">Global Map</Link></li>
                  <li><Link to="/graph">Network Graph</Link></li>
                  <li><Link to="/statistics">Statistics</Link></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4>Documentation</h4>
                <ul>
                  <li><a href="https://docs.ar.io/" target="_blank" rel="noopener noreferrer">AR.IO Docs</a></li>
                  <li><a href="https://docs.arweave.org/developers/" target="_blank" rel="noopener noreferrer">Arweave Docs</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <div className="footer-credits">
                <p>
                  <strong>Made by <a href="https://github.com/mulosbron" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>MULOSBRON</a></strong> • 
                  <span> Powered by Permaweb</span>
                </p>
                <p className="footer-tech">
                  Built with React • D3.js • Leaflet
                </p>
              </div>
              
              <div className="footer-meta">
                <div className="footer-update">
                  <span>v1.0.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>



      {/* Loading overlay */}
      {refreshing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 'var(--z-modal)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="card" style={{ 
            textAlign: 'center',
            animation: 'slideUp 0.4s ease-out'
          }}>
            <div className="loading-spinner" style={{ margin: '0 auto var(--space-lg)' }} />
            <div style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-sm)'
            }}>
              Refreshing Data
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-muted)'
            }}>
              Please wait...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;