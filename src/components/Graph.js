import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import GatewayModal from './GatewayModal';
import GraphFilters from './GraphFilters';
import '../components/GatewayModal.css';

const Graph = ({ gateways, filters, onGatewaySelect }) => {
  const graphRef = useRef(null);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [enabledLevels, setEnabledLevels] = useState({
    country: true,
    region: false,
    city: false,
    isp: false,
    release: false
  });

  const [filterProcessing, setFilterProcessing] = useState(false);

  const toggleLevel = useCallback((key) => {
    if (filterProcessing) return;
    setEnabledLevels(prev => ({ ...prev, [key]: !prev[key] }));
    setFilterProcessing(true);
    setTimeout(() => setFilterProcessing(false), 300); // Faster
  }, [filterProcessing]);

  // Memoize graph data generation
  const graphData = useMemo(() => {
    if (gateways.length === 0) return { nodes: [], links: [] };

    // Root node
    const rootNode = {
      id: 'ar-io-network', 
      type: 'root',
      name: 'AR.IO Network',
      radius: 35,
      color: '#00d4aa'
    };

    const nodes = [rootNode];
    const links = [];
    const levelMaps = {
      country: {},
      region: {},
      city: {},
      isp: {},
      release: {}
    };

    const levelConfigs = [
      {
        key: 'country', enabled: enabledLevels.country, radius: 25, color: '#4A90E2',
        getName: g => g.country || 'Unknown'
      },
      {
        key: 'region', enabled: enabledLevels.region, radius: 20, color: '#50E3C2',
        getName: g => g.region || 'Unknown'
      },
      {
        key: 'city', enabled: enabledLevels.city, radius: 16, color: '#F5A623',
        getName: g => g.city || 'Unknown'
      },
      {
        key: 'isp', enabled: enabledLevels.isp, radius: 14, color: '#E67E22',
        getName: g => g.isp || 'Unknown ISP'
      },
      {
        key: 'release', enabled: enabledLevels.release, radius: 12, color: '#9B59B6',
        getName: g => g.release || 'unknown'
      }
    ];

    // Build hierarchy dynamically
    gateways.forEach(gateway => {
      let parentId = rootNode.id;
      let parentKeyConcat = '';

      levelConfigs.forEach(level => {
        if (!level.enabled) return;
        const name = level.getName(gateway);
        const nodeKey = `${parentKeyConcat}${level.key}-${name}`;
        let map = levelMaps[level.key];
        let levelNode = map[nodeKey];
        if (!levelNode) {
          levelNode = {
            id: nodeKey,
            type: level.key,
            name,
            radius: level.radius,
            color: level.color
          };
          map[nodeKey] = levelNode;
          nodes.push(levelNode);
          links.push({ source: levelNode.id, target: parentId });
        }
        parentId = levelNode.id;
        parentKeyConcat += `${level.key}-${name}-`;
      });

      // Gateway nodes
      const normalizedStatus = (gateway.status === 'ok' || gateway.status === 'online') ? 'ok' :
                              (gateway.status === 'offline' || gateway.status === 'leaving') ? 'offline' : 'unknown';

      const gatewayNode = {
        id: `gateway-${gateway.id || gateway.address}`,
        type: 'gateway',
        name: gateway.label || gateway.Label || gateway.domain || 'Gateway',
        gateway: gateway,
        radius: Math.max(8, Math.min(15, (gateway.stake || 0) / 100000)),
        color: normalizedStatus === 'ok' ? 'var(--success)' : normalizedStatus === 'offline' ? 'var(--danger)' : 'var(--warning)',
        status: normalizedStatus
      };
      nodes.push(gatewayNode);
      links.push({ source: gatewayNode.id, target: parentId });
    });

    return { nodes, links };
  }, [gateways, enabledLevels]);

  // Initialize graph once
  useEffect(() => {
    if (!graphRef.current || gateways.length === 0) return;

    const container = graphRef.current;
    
    // Clear existing
    d3.select(container).select('svg').remove();

    // Fixed dimensions to prevent layout shift
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Create SVG with absolute positioning
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('background', 'var(--bg-graph)');

    svgRef.current = svg;

      const g = svg.append("g");

    // Zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      svg.call(zoom);

    // Add click handler to reset selection when clicking on empty space
    svg.on('click', (event) => {
      // Only reset if clicking directly on SVG (not on nodes)
      if (event.target === svg.node()) {
        // setSelectedNode(null); // This line is removed
        g.selectAll('.node-tooltip').remove();
        
        // Reset all links and nodes to normal opacity
        g.selectAll('.links line').style('stroke-opacity', 0.6);
        g.selectAll('.nodes circle').style('opacity', 1);
      }
    });

    // Store simulation reference
    simulationRef.current = d3.forceSimulation();

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [gateways.length, graphRef, simulationRef, svgRef]); // Only re-initialize when gateways first load

  // Update graph data without full re-render
  useEffect(() => {
    if (!svgRef.current || !simulationRef.current || graphData.nodes.length === 0) return;

    const svg = svgRef.current;
    const g = svg.select('g');
    const simulation = simulationRef.current;

    // Clear existing elements
    g.selectAll('*').remove();

    const width = parseInt(svg.attr('width'));
    const height = parseInt(svg.attr('height'));

    // Configure simulation with new data
    simulation
      .nodes(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(d => {
        switch (d.source.type) {
          case 'country': return 250;
          case 'region': return 200;
          case 'city': return 150;
          case 'isp': return 120;
          case 'release': return 80;
          default: return 60;
        }
      }).strength(0.8))
      .force('charge', d3.forceManyBody().strength(d => {
        switch (d.type) {
          case 'root': return -3000;
          case 'country': return -1500;
          case 'region': return -1000;
          case 'city': return -600;
          case 'isp': return -400;
          case 'release': return -250;
          default: return -150;
        }
      }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(d => d.radius + 6));

      // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graphData.links)
      .enter().append('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.3)')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

      // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(graphData.nodes)
      .enter().append('g')
      .style('cursor', 'pointer')
        .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles
    const circles = node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', 'rgba(255, 255, 255, 0.3)')
      .attr('stroke-width', 2)
      .style('filter', d => {
        if (d.type === 'root') return 'drop-shadow(0 0 15px #00d4aa)';
        if (d.type === 'gateway' && d.status === 'ok') return 'drop-shadow(0 0 8px #4caf50)';
        if (d.type === 'gateway' && d.status === 'offline') return 'drop-shadow(0 0 8px #f44336)';
        return 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))';
      });

    // Click events
    circles.on('click', (event, d) => {
      // Stop event propagation to prevent SVG click from firing
      event.stopPropagation();
      
      g.selectAll('.node-tooltip').remove();
      
      if (d.type !== 'gateway') {
        g.append('text')
          .attr('class', 'node-tooltip')
          .attr('data-id', d.id)
          .attr('x', d.x)
          .attr('y', d.y - d.radius - 15)
          .attr('fill', 'var(--color-white)')
          .attr('font-size', '14px')
          .attr('font-weight', '600')
          .attr('text-anchor', 'middle')
          .attr('opacity', 1)
          .text(d.name);
      }

      // setSelectedNode(d); // This line is removed
      
      if (d.type === 'gateway' && d.gateway) {
        setSelectedGateway(d.gateway);
            setModalOpen(true);
        if (onGatewaySelect) onGatewaySelect(d.gateway);
          }
          
      // Highlight connections
      const connectedLinks = graphData.links.filter(l => 
        l.source.id === d.id || l.target.id === d.id
      );
          const connectedNodeIds = new Set();
          connectedLinks.forEach(l => {
            connectedNodeIds.add(l.source.id);
            connectedNodeIds.add(l.target.id);
          });

      link.style('stroke-opacity', l =>
            connectedNodeIds.has(l.source.id) && connectedNodeIds.has(l.target.id) ? 1 : 0.1
          );
      circles.style('opacity', n => connectedNodeIds.has(n.id) ? 1 : 0.3);
        });

    // Tick function
      simulation.on("tick", () => {
          link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
          
      node.attr("transform", d => `translate(${d.x},${d.y})`);
      
      g.selectAll('.node-tooltip').each(function() {
        const tooltip = d3.select(this);
        const nodeId = tooltip.attr('data-id');
        const matchingNode = graphData.nodes.find(n => n.id === nodeId);
        if (matchingNode) {
          tooltip
            .attr('x', matchingNode.x)
            .attr('y', matchingNode.y - matchingNode.radius - 15);
        }
      });
        });

      // Drag functions
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

    // Restart simulation with new data
    simulation.alpha(0.3).restart();

  }, [graphData, svgRef, simulationRef, onGatewaySelect]);

  return (
    <>
      <div className="graph-container" ref={graphRef} style={{ 
        position: 'relative',
        width: '100%', 
        height: '100%',
        minHeight: '500px',
        overflow: 'hidden'
      }}>
        <GraphFilters enabledLevels={enabledLevels} onToggle={toggleLevel} disabled={filterProcessing} />
      </div>
      <GatewayModal gateway={selectedGateway} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Graph;
