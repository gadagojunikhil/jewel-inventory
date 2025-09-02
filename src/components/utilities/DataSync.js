import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, CheckCircle, Database, RefreshCw, FileText, BarChart3 } from 'lucide-react';
import { apiService } from '../../services/api';

const DataSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [dataStats, setDataStats] = useState({});

  // Load data statistics on component mount
  useEffect(() => {
    updateDataStats();
  }, []);

  const updateDataStats = async () => {
    try {
      const [materials, categories, jewelry, users, estimates] = await Promise.all([
        apiService.getMaterials().catch(() => []),
        apiService.getCategories().catch(() => []),
        apiService.getJewelryPieces().catch(() => []),
        apiService.getUsers().catch(() => []),
        apiService.getEstimates().catch(() => [])
      ]);

      const stats = {
        materials: Array.isArray(materials) ? materials.length : 0,
        categories: Array.isArray(categories) ? categories.length : 0,
        jewelryPieces: Array.isArray(jewelry) ? jewelry.length : 0,
        users: Array.isArray(users) ? users.length : 0,
        estimates: Array.isArray(estimates) ? estimates.length : 0
      };

      stats.totalItems = stats.materials + stats.categories + stats.jewelryPieces + stats.users + stats.estimates;
      stats.hasData = stats.totalItems > 0;

      setDataStats(stats);
    } catch (error) {
      console.error('Error loading data stats:', error);
      setDataStats({
        materials: 0,
        categories: 0,
        jewelryPieces: 0,
        users: 0,
        estimates: 0,
        totalItems: 0,
        hasData: false
      });
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      
      const [materials, categories, jewelry, users, estimates] = await Promise.all([
        apiService.getMaterials().catch(() => []),
        apiService.getCategories().catch(() => []),
        apiService.getJewelryPieces().catch(() => []),
        apiService.getUsers().catch(() => []),
        apiService.getEstimates().catch(() => [])
      ]);

      const exportData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          materials: materials || [],
          categories: categories || [],
          jewelryPieces: jewelry || [],
          users: users || [],
          estimates: estimates || []
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jewelry-inventory-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showMessage('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      showMessage('Failed to export data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await updateDataStats();
      showMessage('Data statistics refreshed successfully!');
    } catch (error) {
      showMessage('Failed to refresh data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Database className="w-7 h-7 mr-2 text-blue-600" />
          Database Overview
        </h1>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>
      
      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {messageType === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message}
        </div>
      )}

      {/* Data Statistics */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
          Database Overview
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{dataStats.jewelryPieces || 0}</div>
            <div className="text-sm text-blue-800">Jewelry Pieces</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{dataStats.materials || 0}</div>
            <div className="text-sm text-green-800">Materials</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{dataStats.categories || 0}</div>
            <div className="text-sm text-purple-800">Categories</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{dataStats.users || 0}</div>
            <div className="text-sm text-orange-800">Users</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{dataStats.estimates || 0}</div>
            <div className="text-sm text-indigo-800">Estimates</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
          <div className="text-lg font-semibold text-gray-700">
            Total Records: {dataStats.totalItems || 0}
          </div>
          <div className="text-sm text-gray-600">
            {dataStats.hasData ? 'Database contains data' : 'Database is empty'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Export Section */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-500" />
            Database Export
          </h2>
          <p className="text-gray-600 mb-4">
            Export all your database records to a JSON file for backup or analysis purposes.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleExportData}
              disabled={!dataStats.hasData || isLoading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? 'Exporting...' : 'Export Database'}
              {!dataStats.hasData && <span className="ml-2 text-xs">(No data)</span>}
            </button>
          </div>
        </div>

        {/* Database Info Section */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-green-500" />
            Database Information
          </h2>
          <p className="text-gray-600 mb-4">
            This application now uses a PostgreSQL database for secure, centralized data storage.
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Type:</span>
              <span className="font-medium">PostgreSQL Database</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Authentication:</span>
              <span className="font-medium">Session-based</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Persistence:</span>
              <span className="font-medium">Server-side</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Backup Method:</span>
              <span className="font-medium">Database Export</span>
            </div>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-3">Database-First Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Benefits</h4>
            <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
              <li>Centralized data storage across all devices</li>
              <li>No browser storage dependencies</li>
              <li>Secure session-based authentication</li>
              <li>Real-time data synchronization</li>
              <li>Professional database management</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-700 mb-2">Data Management</h4>
            <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
              <li>All data is stored in PostgreSQL database</li>
              <li>Export functionality for backup purposes</li>
              <li>Session-based authentication (no tokens)</li>
              <li>Automatic data validation and integrity</li>
              <li>Consistent data across all access methods</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 bg-blue-100 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This application stores all data securely in the database. 
            in the database and synchronized automatically across all devices and browsers when you log in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataSync;
