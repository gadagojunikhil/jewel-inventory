import React, { useState, useEffect } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Copy, Database, Trash2, BarChart3, RefreshCw, FileText } from 'lucide-react';
import { storageUtils } from '../../utils/simpleStorage';

const DataSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [dataStats, setDataStats] = useState({});
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Load data statistics on component mount and when data changes
  useEffect(() => {
    updateDataStats();
  }, []);

  const updateDataStats = () => {
    const data = storageUtils.getAllData();
    setDataStats({
      materials: data.materials.length,
      categories: data.categories.length,
      jewelryPieces: data.jewelryPieces.length,
      users: data.users.length,
      totalItems: data.materials.length + data.categories.length + data.jewelryPieces.length + data.users.length,
      hasData: storageUtils.hasData()
    });
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
    // Update stats after any data operation
    setTimeout(() => updateDataStats(), 100);
  };

  const handleDownloadBackup = () => {
    try {
      const success = storageUtils.downloadBackup();
      if (success) {
        showMessage('Backup downloaded successfully!');
      } else {
        showMessage('Failed to download backup', 'error');
      }
    } catch (error) {
      showMessage('Failed to download backup: ' + error.message, 'error');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      const result = storageUtils.importBackup(backupData);
      
      if (result.success) {
        showMessage('Backup restored successfully! Please refresh the page.');
        // Refresh the page after a delay to load the new data
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showMessage('Failed to restore backup: ' + result.error, 'error');
      }
    } catch (error) {
      showMessage('Failed to restore backup: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const handleCopyData = () => {
    try {
      const backup = storageUtils.exportBackup();
      navigator.clipboard.writeText(JSON.stringify(backup, null, 2));
      showMessage('Data copied to clipboard! You can paste this in another browser.');
    } catch (error) {
      showMessage('Failed to copy data: ' + error.message, 'error');
    }
  };

  const handlePasteData = async () => {
    try {
      setIsLoading(true);
      const text = await navigator.clipboard.readText();
      const backupData = JSON.parse(text);
      const result = storageUtils.importBackup(backupData);
      
      if (result.success) {
        showMessage('Data restored successfully! Please refresh the page.');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showMessage('Failed to restore data: ' + result.error, 'error');
      }
    } catch (error) {
      showMessage('Failed to paste data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = () => {
    if (!showConfirmClear) {
      setShowConfirmClear(true);
      return;
    }

    try {
      storageUtils.clearAll();
      setShowConfirmClear(false);
      showMessage('All data cleared successfully! The system has been reset.');
      updateDataStats();
    } catch (error) {
      showMessage('Failed to clear data: ' + error.message, 'error');
    }
  };

  const handleCancelClear = () => {
    setShowConfirmClear(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Database className="w-7 h-7 mr-2 text-blue-600" />
          Data Synchronization
        </h1>
        <button
          onClick={updateDataStats}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center text-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Stats
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
          Current Data Overview
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
          <div className="text-lg font-semibold text-gray-700">
            Total Items: {dataStats.totalItems || 0}
          </div>
          <div className="text-sm text-gray-600">
            {dataStats.hasData ? 'System contains data' : 'No data found - system is empty'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Local Backup Section */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-500" />
            File Backup
          </h2>
          <p className="text-gray-600 mb-4">
            Download or restore your data to sync between different access methods (localhost vs IP address).
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleDownloadBackup}
              disabled={!dataStats.hasData}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Backup File
              {!dataStats.hasData && <span className="ml-2 text-xs">(No data)</span>}
            </button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="backup-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="backup-upload"
                className={`w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center cursor-pointer ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Restoring...' : 'Restore from File'}
              </label>
            </div>
          </div>
        </div>

        {/* Clipboard Sync Section */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Copy className="w-5 h-5 mr-2 text-purple-500" />
            Clipboard Sync
          </h2>
          <p className="text-gray-600 mb-4">
            Copy your data to clipboard and paste it in another browser or device for quick sync.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleCopyData}
              disabled={!dataStats.hasData}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Data to Clipboard
              {!dataStats.hasData && <span className="ml-2 text-xs">(No data)</span>}
            </button>
            
            <button
              onClick={handlePasteData}
              disabled={isLoading}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center justify-center disabled:opacity-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isLoading ? 'Pasting...' : 'Paste Data from Clipboard'}
            </button>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-red-500" />
            Data Management
          </h2>
          <p className="text-gray-600 mb-4">
            Manage your local data storage. Use with caution as these operations cannot be undone.
          </p>
          
          <div className="space-y-3">
            {!showConfirmClear ? (
              <button
                onClick={handleClearAllData}
                disabled={!dataStats.hasData}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
                {!dataStats.hasData && <span className="ml-2 text-xs">(No data)</span>}
              </button>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800 text-sm mb-3 font-medium">
                  ⚠️ Are you sure you want to delete ALL data? This action cannot be undone!
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleClearAllData}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    onClick={handleCancelClear}
                    className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-3">How to sync data between localhost and IP access:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Method 1: File Backup</h4>
            <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
              <li>Add your data while accessing via one method (localhost or IP)</li>
              <li>Download a backup file from this page</li>
              <li>Switch to the other access method (IP or localhost)</li>
              <li>Upload the backup file to restore your data</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-purple-700 mb-2">Method 2: Clipboard Sync</h4>
            <ol className="list-decimal list-inside text-purple-700 space-y-1 text-sm">
              <li>Add your data while accessing via one method</li>
              <li>Copy data to clipboard using the "Copy Data" button</li>
              <li>Switch to the other access method or device</li>
              <li>Paste the data using "Paste Data" button</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-green-700 mb-2">Best Practices</h4>
            <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
              <li>Always backup before major changes</li>
              <li>Verify data stats after sync operations</li>
              <li>Use clipboard method for quick transfers</li>
              <li>Use file method for long-term backups</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>File Backup:</strong> Creates a timestamped JSON file that you can save permanently. 
              Best for creating backups before major changes or sharing data with others.
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Clipboard Sync:</strong> Faster for quick syncing between browser tabs or windows. 
              Perfect when you need to transfer data immediately without downloading files.
            </p>
          </div>
        </div>

        <div className="mt-4 bg-yellow-100 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Both localhost (127.0.0.1) and IP address access use separate local storage. 
            Use these sync tools to keep your data consistent across different access methods.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataSync;
