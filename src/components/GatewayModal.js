import React, { useState } from 'react';
import './GatewayModal.css';

const formatValue = (val, fallback = 'N/A') => (val !== undefined && val !== null && val !== '' ? val : fallback);
const formatShort = (val, len = 8) => val && val.length > 2 * len ? `${val.slice(0, len)}...${val.slice(-len)}` : val;

// Kopyalanabilir değer component'i
const CopyableValue = ({ value, displayValue, className = "modal-card-value" }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (!value || value === 'N/A') {
    return <span className={className}>{displayValue || value}</span>;
  }

  return (
    <span 
      className={`${className} copyable-value`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Click to copy: ${value}`}
    >
      {displayValue || value}
      {copied && <span className="copy-feedback">✓</span>}
    </span>
  );
};
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export default function GatewayModal({ gateway, open, onClose }) {
  if (!gateway) return null;

  // Status badge rengi
  const statusColor = gateway.status === 'ok' ? '#10B981' : gateway.status === 'offline' ? '#EF4444' : '#ff9800';
  const statusText = gateway.status === 'ok' ? 'Online' : gateway.status === 'offline' ? 'Offline' : 'Unknown';

  return (
    <dialog open={open} className="gateway-modal-card" onClose={onClose}>
      <div className="modal-card-content">
        {/* Header */}
        <div className="modal-card-header">
          <span className="modal-status-dot" style={{ background: statusColor }} />
          <div>
            <div className="modal-card-title">{formatValue(gateway.label || gateway.Label)}</div>
            <div className="modal-card-domain">{formatValue(gateway.domain || (gateway.address || gateway.Address ? new URL(gateway.address || gateway.Address).hostname : ''))}</div>
          </div>
          <button className="modal-card-close" aria-label="Close" onClick={onClose}>&times;</button>
        </div>
        <hr className="modal-divider" />
        
        {/* Main Status & Performance Grid */}
        <div className="modal-card-grid">
          <div>
            <div className="modal-card-label">Status</div>
            <div className="modal-card-value" style={{ color: statusColor, fontWeight: 600 }}>{statusText}</div>
          </div>
          <div>
            <div className="modal-card-label">Uptime</div>
            <div className="modal-card-value">{gateway.healthcheck?.uptime ? Math.round(gateway.healthcheck.uptime / 3600) + 'h' : 'N/A'}</div>
          </div>
          <div>
            <div className="modal-card-label">Release</div>
            <div className="modal-card-value">{formatValue(gateway.info?.release || gateway.release)}</div>
          </div>
        </div>

        {/* Stake */}
        <div className="modal-card-stake">
          <span className="modal-card-label">Minimum Delegated Stake</span>
          <span className="modal-card-value" style={{ fontWeight: 700, fontSize: '1.2em' }}>
            {gateway.minimumDelegatedStake || gateway['Minimum Delegated Stake (ARIO)'] ? 
              (gateway.minimumDelegatedStake || gateway['Minimum Delegated Stake (ARIO)']).toLocaleString() + ' ARIO' : 'N/A'}
          </span>
        </div>

        {/* Location & Network Info */}
        <div className="modal-card-grid">
          <div>
            <div className="modal-card-label">Location</div>
            <div className="modal-card-value">
              {formatValue(gateway.ipgeo?.city || gateway.city)}, {formatValue(gateway.ipgeo?.region || gateway.state)}
            </div>
          </div>
          <div>
            <div className="modal-card-label">Country</div>
            <div className="modal-card-value">{formatValue(gateway.ipgeo?.country || gateway.country)}</div>
          </div>
          <div>
            <div className="modal-card-label">ISP</div>
            <div className="modal-card-value">{formatValue(gateway.ipgeo?.isp || gateway.isp)}</div>
          </div>
          <div>
            <div className="modal-card-label">Organization</div>
            <div className="modal-card-value">{formatValue(gateway.ipgeo?.org)}</div>
          </div>
        </div>

        {/* Gateway Details */}
        <div className="modal-card-box">
          <div className="modal-card-box-title">Gateway Details</div>
          <div className="modal-card-box-grid">
            <div><span className="modal-card-label">Address:</span> <CopyableValue value={gateway.address || gateway.Address} /></div>
            <div><span className="modal-card-label">Owner Wallet: </span> 
              <CopyableValue 
                value={gateway.wallet || gateway['Owner Wallet']} 
                displayValue={formatShort(gateway.wallet || gateway['Owner Wallet'])}
              />
            </div>
            <div><span className="modal-card-label">Observer Wallet: </span> 
              <CopyableValue 
                value={gateway.observerWallet || gateway['Observer Wallet']} 
                displayValue={formatShort(gateway.observerWallet || gateway['Observer Wallet'])}
              />
            </div>
            <div><span className="modal-card-label">Properties ID: </span> 
              <CopyableValue 
                value={gateway.propertiesId || gateway['Properties ID']} 
                displayValue={formatShort(gateway.propertiesId || gateway['Properties ID'], 6)}
              />
            </div>
            <div><span className="modal-card-label">Process ID: </span> 
              <CopyableValue 
                value={gateway.info?.processId} 
                displayValue={formatShort(gateway.info?.processId, 6)}
              />
            </div>
            <div><span className="modal-card-label">Note:</span> <span className="modal-card-value">{formatValue(gateway.note || gateway.Note)}</span></div>
          </div>
        </div>

        {/* Staking & Rewards */}
        <div className="modal-card-box">
          <div className="modal-card-box-title">Staking & Rewards</div>
          <div className="modal-card-box-grid">
            <div>
              <span className="modal-card-label">Auto Stake: </span> 
              <span 
                className="modal-card-value" 
                style={{ 
                  color: (gateway.rewardAutoStake || gateway['Reward Auto Stake']) === 'Enabled' ? '#10B981' : 
                         (gateway.rewardAutoStake || gateway['Reward Auto Stake']) === 'Disabled' ? '#EF4444' : undefined 
                }}
              >
                {formatValue(gateway.rewardAutoStake || gateway['Reward Auto Stake'])}
              </span>
            </div>
            <div>
              <span className="modal-card-label">Delegated Staking: </span> 
              <span 
                className="modal-card-value" 
                style={{ 
                  color: (gateway.delegatedStaking || gateway['Delegated Staking']) === 'Enabled' ? '#10B981' : 
                         (gateway.delegatedStaking || gateway['Delegated Staking']) === 'Disabled' ? '#EF4444' : undefined 
                }}
              >
                {formatValue(gateway.delegatedStaking || gateway['Delegated Staking'])}
              </span>
            </div>
            <div><span className="modal-card-label">Reward Share:</span> <span className="modal-card-value">{formatValue(gateway.rewardShareRatio || gateway['Reward Share Ratio'])}</span></div>
            <div><span className="modal-card-label">Join Status:</span> <span className="modal-card-value">{formatValue(gateway.status || gateway.Status)}</span></div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="modal-card-box">
          <div className="modal-card-box-title">Technical Info</div>
          <div className="modal-card-box-grid">
            <div><span className="modal-card-label">IP Address:</span> <span className="modal-card-value" style={{ fontWeight: 600 }}>{formatValue(gateway.ipgeo?.ip || gateway.ip)}</span></div>
            <div><span className="modal-card-label">Coordinates:</span> <span className="modal-card-value">{gateway.ipgeo?.lat && gateway.ipgeo?.lon ? `${gateway.ipgeo.lat}, ${gateway.ipgeo.lon}` : 'N/A'}</span></div>
            <div><span className="modal-card-label">Manifest Versions:</span> <span className="modal-card-value">{gateway.info?.supportedManifestVersions?.join(', ') || 'N/A'}</span></div>
            <div><span className="modal-card-label">ANS104 Bundle Filter:</span> <span className="modal-card-value">{gateway.info?.ans104UnbundleFilter?.never ? 'Never' : 'Allowed'}</span></div>
          </div>
        </div>
      </div>
    </dialog>
  );
} 