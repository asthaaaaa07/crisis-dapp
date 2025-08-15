import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useBlockchain } from '../contexts/BlockchainContext.jsx';
import { 
  ExclamationTriangleIcon, 
  MapPinIcon,
  ClockIcon,
  UserIcon 
} from '@heroicons/react/24/outline';

// Fix Leaflet marker icons in Vite
const markerIconSetup = () => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });
  } catch {
    // ignore
  }
};

const CrisisMap = () => {
  const { reports, crises, isConnected } = useBlockchain();
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    markerIconSetup();
  }, []);

  // Update map center based on reports
  useEffect(() => {
    if (reports.length > 0) {
      // For demo purposes, use a fixed center
      // In a real app, you'd calculate the center based on report locations
      setMapCenter([40.7128, -74.0060]);
    }
  }, [reports]);

  const getMarkerIcon = (type) => {
    const colors = {
      'Natural Disaster': '#EF4444',
      'Medical Emergency': '#F59E0B',
      'Infrastructure Failure': '#3B82F6',
      'Security Threat': '#8B5CF6',
      'Environmental Hazard': '#10B981',
      'Other': '#6B7280'
    };

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${colors[type] || colors['Other']};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
          </svg>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (finalized, valid) => {
    if (!finalized) return 'bg-yellow-100 text-yellow-800';
    return valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (finalized, valid) => {
    if (!finalized) return 'Pending';
    return valid ? 'Verified' : 'Invalid';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Crisis Reports Map</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{reports.length} reports</span>
              <span>•</span>
              <span>{crises.length} active crises</span>
            </div>
          </div>
          
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <MapContainer
              center={mapCenter}
              zoom={10}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Crisis Reports Markers */}
              {reports.map((report) => {
                // For demo purposes, generate random coordinates near the center
                const lat = mapCenter[0] + (Math.random() - 0.5) * 0.1;
                const lng = mapCenter[1] + (Math.random() - 0.5) * 0.1;
                
                return (
                  <Marker
                    key={report.id}
                    position={[lat, lng]}
                    icon={getMarkerIcon(report.crisisType || 'Other')}
                    eventHandlers={{
                      click: () => setSelectedReport(report)
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-gray-900">Report #{report.id}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.crisisType || 'Unknown Type'}
                        </p>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(report.finalized, report.valid)}`}>
                          {getStatusText(report.finalized, report.valid)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Reports</h3>
          
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No crisis reports yet</p>
              {!isConnected && (
                <p className="text-sm text-gray-400 mt-2">
                  Connect your wallet to view reports
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reports.slice(0, 10).map((report) => (
                <div
                  key={report.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedReport?.id === report.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          Report #{report.id}
                        </span>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.finalized, report.valid)}`}>
                          {getStatusText(report.finalized, report.valid)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {report.crisisType || 'Unknown Type'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{report.reporter ? report.reporter.slice(0, 6) + '...' : 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{formatTime(report.timestamp)}</span>
                        </div>
                      </div>
                      
                      {report.stakeTotal && (
                        <div className="mt-2 text-xs text-gray-500">
                          Total staked: {parseFloat(report.stakeTotal) / 1e18} MATIC
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Crises */}
        {crises.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mt-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Active Crises</h3>
            <div className="space-y-3">
              {crises.map((crisis) => (
                <div key={crisis.id} className="p-3 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-1">{crisis.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{crisis.location}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Target: {parseFloat(crisis.targetAmount) / 1e18} MATIC</span>
                    <span>Raised: {parseFloat(crisis.raisedAmount) / 1e18} MATIC</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((parseFloat(crisis.raisedAmount) / parseFloat(crisis.targetAmount)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrisisMap;
