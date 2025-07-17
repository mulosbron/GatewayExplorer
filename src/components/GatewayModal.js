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

export default function GatewayModal({ gateway, open, onClose }) {
  if (!gateway) return null;

  // Debug: Gateway verisini console'a yazdır
  console.log('Gateway Modal Data:', gateway);

  // Status badge rengi
  const statusColor = gateway.status === 'ok' ? '#10B981' : gateway.status === 'offline' ? '#EF4444' : '#ff9800';
  const statusText = gateway.status === 'ok' ? 'Online' : 
                    gateway.status === 'offline' ? 'Offline' : 'Unknown';

  // Domain'i address'ten çıkar
  const getDomain = () => {
    if (gateway.address) {
      try {
        const url = new URL(gateway.address);
        return url.hostname;
      } catch {
        // URL parse edilemezse, address'i olduğu gibi göster
        return gateway.address;
      }
    }
    return 'N/A';
  };

  return (
    <dialog open={open} className="gateway-modal-card" onClose={onClose}>
      <div className="modal-card-content">
        {/* Header */}
        <div className="modal-card-header">
          <span className="modal-status-dot" style={{ background: statusColor }} />
          <div>
            <div className="modal-card-title">
              {gateway.label && gateway.label.trim() ? gateway.label : getDomain()}
            </div>
            <div className="modal-card-domain">
              {gateway.label && gateway.label.trim() ? getDomain() : ''}
            </div>
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
            <div className="modal-card-value">N/A</div>
          </div>
          <div>
            <div className="modal-card-label">Release</div>
            <div className="modal-card-value">{formatValue(gateway.release)}</div>
          </div>
        </div>

        {/* Stake */}
        <div className="modal-card-stake">
          <span className="modal-card-label">Minimum Delegated Stake</span>
          <span className="modal-card-value" style={{ fontWeight: 700, fontSize: '1.2em' }}>
            {gateway.minimumDelegatedStake ? 
              gateway.minimumDelegatedStake + ' ARIO' : 'N/A'}
          </span>
        </div>

        {/* Location & Network Info */}
        <div className="modal-card-grid">
          <div>
            <div className="modal-card-label">Location</div>
            <div className="modal-card-value">
              {gateway.city && gateway.region ? `${gateway.city}, ${gateway.region}` : 
               gateway.city ? gateway.city : 
               gateway.region ? gateway.region : 'N/A'}
            </div>
          </div>
          <div>
            <div className="modal-card-label">Country</div>
            <div className="modal-card-value">{formatValue(gateway.country)}</div>
          </div>
          <div>
            <div className="modal-card-label">ISP</div>
            <div className="modal-card-value">{formatValue(gateway.isp)}</div>
          </div>
          <div>
            <div className="modal-card-label">Organization</div>
            <div className="modal-card-value">{formatValue(gateway.org)}</div>
          </div>
        </div>

        {/* Gateway Details */}
        <div className="modal-card-box">
          <div className="modal-card-box-title">Gateway Details</div>
          <div className="modal-card-box-grid">
            <div><span className="modal-card-label">Address:</span> <CopyableValue value={gateway.address} /></div>
            <div><span className="modal-card-label">Owner Wallet: </span> 
              <CopyableValue 
                value={gateway.wallet} 
                displayValue={formatShort(gateway.wallet)}
              />
            </div>
            <div><span className="modal-card-label">Observer Wallet: </span> 
              <CopyableValue 
                value={gateway.observerWallet} 
                displayValue={formatShort(gateway.observerWallet)}
              />
            </div>
            <div><span className="modal-card-label">Properties ID: </span> 
              <CopyableValue 
                value={gateway.propertiesId} 
                displayValue={formatShort(gateway.propertiesId, 6)}
              />
            </div>
            <div><span className="modal-card-label">Process ID: </span> 
              <CopyableValue 
                value="N/A" 
                displayValue="N/A"
              />
            </div>
            <div><span className="modal-card-label">Note:</span> <span className="modal-card-value">
              {gateway.note && gateway.note.trim() ? gateway.note : 'N/A'}
            </span></div>
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
                  color: gateway.rewardAutoStake === 'Enabled' ? '#10B981' : 
                         gateway.rewardAutoStake === 'Disabled' ? '#EF4444' : undefined 
                }}
              >
                {formatValue(gateway.rewardAutoStake)}
              </span>
            </div>
            <div>
              <span className="modal-card-label">Delegated Staking: </span> 
              <span 
                className="modal-card-value" 
                style={{ 
                  color: gateway.delegatedStaking === 'Enabled' ? '#10B981' : 
                         gateway.delegatedStaking === 'Disabled' ? '#EF4444' : undefined 
                }}
              >
                {formatValue(gateway.delegatedStaking)}
              </span>
            </div>
            <div><span className="modal-card-label">Reward Share:</span> <span className="modal-card-value">
              {gateway.rewardShareRatio ? gateway.rewardShareRatio : 'N/A'}
            </span></div>
            <div><span className="modal-card-label">Join Status:</span> <span className="modal-card-value">
              {gateway.status === 'ok' ? 'Online' : 
               gateway.status === 'offline' ? 'Offline' : 
               gateway.status === 'unknown' ? 'Unknown' : gateway.status}
            </span></div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="modal-card-box">
          <div className="modal-card-box-title">Technical Info</div>
          <div className="modal-card-box-grid">
            <div><span className="modal-card-label">IP Address:</span> <span className="modal-card-value" style={{ fontWeight: 600 }}>{formatValue(gateway.ip)}</span></div>
            <div><span className="modal-card-label">Coordinates:</span> <span className="modal-card-value">{gateway.lat && gateway.lon ? `${gateway.lat.toFixed(4)}, ${gateway.lon.toFixed(4)}` : 'N/A'}</span></div>
            <div><span className="modal-card-label">Manifest Versions:</span> <span className="modal-card-value">N/A</span></div>
            <div><span className="modal-card-label">ANS104 Bundle Filter:</span> <span className="modal-card-value">N/A</span></div>
          </div>
        </div>
      </div>
    </dialog>
  );
} 