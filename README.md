# AR.IO Gateway Explorer

A comprehensive visualization tool for exploring AR.IO Gateway network infrastructure. Built with React, D3.js, and Leaflet.js to provide interactive maps, network graphs, and detailed statistics of the AR.IO Gateway ecosystem.

## 🚀 Features

### 📊 **Multiple Visualization Modes**
- **Interactive Map View**: Geographic distribution of gateways with clustering and detailed popups
- **Network Graph View**: Dynamic network visualization with multiple layout options
- **Statistics Dashboard**: Analytics and metrics


## 🛠️ Technology Stack

- **Frontend**: React 19+ with modern hooks
- **Mapping**: Leaflet.js with marker clustering
- **Visualization**: D3.js for interactive graphs
- **API & Data Service**: Advanced gatewayService.js (ArioSDK, ipgeo API, health check, caching, error handling, frontend data transformation)
- **Geolocation**: IP Geolocation API for geographic data
- **Styling**: Modern CSS with responsive design
- **Routing**: React Router for SPA navigation

## 🏗️ Project Structure

```
ariogatewayexplorer/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Map.js         # Interactive map component
│   │   ├── Graph.js       # Network graph visualization
│   │   ├── Statistics.js  # Dashboard and analytics
│   │   └── FilterPanel.js # Advanced filtering UI
│   ├── services/          # API and advanced data services
│   │   └── gatewayService.js # Gateway data, health check, geo-location, status mapping, caching, error handling, frontend data transformation, statistical analysis
│   ├── App.js            # Main application component
│   ├── App.css           # Global styles and themes
│   └── index.js          # Application entry point
├── package.json          # Dependencies and scripts
└── README.md            # Project documentation
```

### 🌍 Gateway Geolocation Data via ArNS

Gateway geolocation data is published as a GeoJSON file under the ArNS subname and is publicly accessible for decentralized access. The dataset includes gateway addresses, IPs, ISPs, organizations, cities, regions, countries, and geographic coordinates. This data is used for network visualization, analytics, and monitoring.

You can view the full dataset here: [https://ipgeo_gatewayexplorer.ar.io/](https://ipgeo_gatewayexplorer.ar.io/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.