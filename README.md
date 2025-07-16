# AR.IO Gateway Explorer 🌐

A comprehensive visualization tool for exploring AR.IO Gateway network infrastructure. Built with React, D3.js, and Leaflet.js to provide interactive maps, network graphs, and detailed statistics of the AR.IO Gateway ecosystem.

## 🚀 Features

### 📊 **Multiple Visualization Modes**
- **Interactive Map View**: Geographic distribution of gateways with clustering and detailed popups
- **Network Graph View**: Dynamic network visualization with multiple layout options
- **Statistics Dashboard**: Comprehensive analytics and metrics

### 🗺️ **Map Features**
- Real-time gateway locations with geographic clustering
- Status-based marker styling (Online/Offline/Unknown)
- Stake-weighted marker sizing
- Detailed gateway information popups
- Custom legend and controls
- Responsive design for all devices

### 📈 **Graph Visualizations**
- **Hub View**: Central AR.IO network connected to all gateways
- **Country View**: Gateways grouped by geographic regions
- **ISP View**: Network topology by Internet Service Providers
- Interactive node dragging and zooming
- Connection highlighting on selection
- Comprehensive tooltips

### 📋 **Advanced Filtering**
- Real-time search across domains, labels, and locations
- Filter by gateway status, country, and ISP
- Stake range filtering
- Quick filter presets
- Active filter summary and management

### 📊 **Statistics & Analytics**
- Total gateway counts and network health metrics
- Geographic distribution analysis
- ISP concentration statistics
- Status distribution charts
- Stake analysis and network economics
- Real-time performance monitoring

## 🛠️ Technology Stack

- **Frontend**: React 19+ with modern hooks
- **Mapping**: Leaflet.js with marker clustering
- **Visualization**: D3.js for interactive graphs
- **API Integration**: AR.IO SDK for gateway data
- **Geolocation**: IP Geolocation API for geographic data
- **Styling**: Modern CSS with responsive design
- **Routing**: React Router for SPA navigation

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- IP Geolocation API key (from [ipgeolocation.io](https://ipgeolocation.io/))

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ariogatewayexplorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # IP Geolocation API Key (required for location data)
   REACT_APP_IPGEOLOCATION_API_KEY=your_api_key_here
   
   # Optional: Custom AR.IO API endpoint
   REACT_APP_ARIO_API_URL=https://api.ar.io
   
   # Development settings
   REACT_APP_DEBUG=true
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### API Keys
- **IP Geolocation API**: Required for geographic location resolution
  - Sign up at [ipgeolocation.io](https://ipgeolocation.io/)
  - Add your API key to the `.env` file
  - Free tier provides 1,000 requests/day

### Environment Variables
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REACT_APP_IPGEOLOCATION_API_KEY` | IP Geolocation API key | Yes | - |
| `REACT_APP_ARIO_API_URL` | AR.IO API endpoint | No | `https://api.ar.io` |
| `REACT_APP_DEBUG` | Enable debug logging | No | `false` |

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
│   ├── services/          # API and data services
│   │   └── gatewayService.js # Gateway data management
│   ├── App.js            # Main application component
│   ├── App.css           # Global styles and themes
│   └── index.js          # Application entry point
├── package.json          # Dependencies and scripts
└── README.md            # Project documentation
```

## 🎯 Usage Guide

### Map View
- **Zoom & Pan**: Navigate the global map to explore gateway locations
- **Cluster Interaction**: Click clusters to zoom in and see individual gateways
- **Gateway Details**: Click markers for detailed gateway information
- **Legend**: Reference the legend for status color coding

### Graph View
- **View Modes**: Switch between Hub, Country, and ISP views using top controls
- **Interaction**: Drag nodes to rearrange, scroll to zoom
- **Selection**: Click nodes to highlight connections and view details
- **Reset**: Click empty space to clear selections

### Statistics Dashboard
- **Overview Cards**: Key metrics at a glance
- **Charts**: Interactive visualizations of network distribution
- **Real-time Data**: Automatically refreshed gateway information

### Filtering
- **Search**: Find gateways by domain, label, or location
- **Status Filter**: Show only online, offline, or unknown gateways
- **Geographic Filter**: Filter by country or ISP
- **Stake Filter**: Range-based filtering by ARIO stake amount
- **Quick Filters**: Preset filters for common use cases

## 🔄 Data Flow

1. **Gateway Discovery**: Fetch gateway list from AR.IO SDK
2. **IP Resolution**: Resolve domain names to IP addresses via DNS-over-HTTPS
3. **Geolocation**: Get geographic coordinates from IP addresses
4. **Health Checks**: Test gateway availability and response times
5. **Data Processing**: Aggregate and filter gateway information
6. **Visualization**: Render maps, graphs, and statistics

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built application can be deployed to any static hosting service:
- Netlify, Vercel, GitHub Pages
- AWS S3 + CloudFront
- Traditional web servers

### Environment Configuration
Ensure production environment variables are properly configured:
- Set `REACT_APP_IPGEOLOCATION_API_KEY` for production
- Configure any custom API endpoints
- Enable proper CORS settings

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow React best practices and hooks patterns
- Maintain responsive design principles
- Add comments for complex visualization logic
- Test across different browsers and devices
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AR.IO Foundation** for the gateway infrastructure and SDK
- **EthNodeMap** project for inspiration and design patterns
- **Leaflet.js** and **D3.js** communities for excellent visualization libraries
- **IP Geolocation** service for accurate geographic data

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Join the [AR.IO Discord](https://discord.com/invite/HGG52EtTc2) `#grants` channel
- Email: [grants@ar.io](mailto:grants@ar.io)

## 🔮 Future Enhancements

- **Real-time Updates**: WebSocket integration for live gateway status
- **Performance Metrics**: Historical performance tracking and trends
- **Advanced Analytics**: Machine learning insights and predictions
- **Mobile App**: Native mobile application development
- **API Access**: Public API for gateway data and statistics
- **Custom Themes**: User-selectable UI themes and customizations

---

**AR.IO Gateway Explorer** - Visualizing the Permaweb Infrastructure 🌐
