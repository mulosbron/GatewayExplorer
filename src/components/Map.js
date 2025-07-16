import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import GatewayModal from './GatewayModal';
import '../components/GatewayModal.css';

// Modern, site-compatible marker colors
const getStatusColor = (status) => {
  if (status === 'ok') return '#10B981'; // site success
  if (status === 'offline') return '#EF4444'; // red
  if (status === 'unknown') return '#ff9800'; // orange
  return '#4A4A4E'; // site secondary
};

const createMarkerIcon = (status, stake, zoomLevel = 3) => {
  const color = getStatusColor(status);
  const baseSize = Math.max(24, Math.min(60, 80 - zoomLevel * 4));
  const stakeMultiplier = stake > 500000 ? 1.5 : stake > 100000 ? 1.25 : 1;
  const size = Math.floor(baseSize * stakeMultiplier);
  const glowColor = color + '80';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle at 30% 30%, ${color}dd, ${color});
        border: 3px solid #FCFCFC;
        border-radius: 50%;
        box-shadow: 0 0 0 4px ${glowColor}, 0 4px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${Math.floor(size * 0.3)}px;
        color: #FCFCFC;
        font-weight: bold;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        position: relative;
        backdrop-filter: blur(4px);">
        <div style="font-size: ${Math.floor(size * 0.25)}px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
          ${status === 'ok' ? '●' : status === 'offline' ? '✕' : '?'}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

const Map = ({ gateways, filters, onGatewaySelect }) => {
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(3);
  const allMarkersRef = useRef([]);

  // Markerları tekrar divIcon olarak oluştur
  const updateMarkerSizes = () => {
    if (!mapRef.current || !allMarkersRef.current) return;
    const newZoom = mapRef.current.getZoom();
    setCurrentZoom(newZoom);
    markersRef.current.clearLayers();
    allMarkersRef.current.forEach(({ marker, gateway }) => {
      if (gateway.latitude && gateway.longitude) {
        const marker = L.marker(
          [gateway.latitude, gateway.longitude],
          {
            icon: createMarkerIcon(gateway.status, gateway.stake, newZoom),
            gatewayData: gateway
          }
        );
        marker.on('click', () => {
          setSelectedGateway(gateway);
          setModalOpen(true);
          if (onGatewaySelect) onGatewaySelect(gateway);
        });
        markersRef.current.addLayer(marker);
      }
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    // More flexible zoom settings
    const map = L.map(mapContainerRef.current, {
      center: [45, -45],
      zoom: 3,
      minZoom: 1,
      maxZoom: 18,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 0.7,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true,
      tap: true,
      worldCopyJump: true
    });
    mapRef.current = map;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©CartoDB',
      subdomains: 'abcd',
      maxZoom: 19,
      noWrap: true
    }).addTo(map);
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        // Dynamic sizing: bigger count -> bigger circle
        const getClusterSize = (cnt) => {
          if (cnt < 10) return 40;
          if (cnt < 50) return 50;
          if (cnt < 100) return 60;
          if (cnt < 200) return 70;
          if (cnt < 500) return 80;
          return 90;
        };
        const size = getClusterSize(count);
        return L.divIcon({
          html: `<div style="background: #D1D5DB; border: 3px solid #FFFFFF; border-radius: 50%; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; color: #0F172A; font-weight: 700; font-size: ${Math.floor(size * 0.35)}px; box-shadow: 0 6px 20px rgba(0,0,0,0.65);">${count}</div>`,
          className: 'custom-cluster',
          iconSize: L.point(size, size)
        });
      }
    });
    markersRef.current = markers;
    map.addLayer(markers);
    const markerData = gateways
      .filter(g => g.latitude && g.longitude)
      .map(gateway => {
        const marker = L.marker(
          [gateway.latitude, gateway.longitude],
          {
            icon: createMarkerIcon(gateway.status, gateway.stake, map.getZoom()),
            gatewayData: gateway
          }
        );
        marker.on('click', () => {
          setSelectedGateway(gateway);
          setModalOpen(true);
          if (onGatewaySelect) onGatewaySelect(gateway);
        });
        markers.addLayer(marker);
        return { marker, gateway };
      });
    allMarkersRef.current = markerData;
    map.on('zoomend', updateMarkerSizes);
    return () => { if (map) { map.remove(); } };
  }, [gateways, onGatewaySelect]);

  return (
    <>
      <div className="map-container" ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />
      <GatewayModal gateway={selectedGateway} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Map;
