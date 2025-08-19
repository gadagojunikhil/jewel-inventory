import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { storageUtils } from '../../utils/simpleStorage';

const DataSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Data Synchronization</h1>
      
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local Backup Section */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">File Backup</h2>
          <p className="text-gray-600 mb-4">
            Download or restore your data to sync between different access methods (localhost vs IP address).
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleDownloadBackup}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Backup File
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
          <h2 className="text-lg font-semibold mb-4">Clipboard Sync</h2>
          <p className="text-gray-600 mb-4">
            Copy your data to clipboard and paste it in another browser or device for quick sync.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleCopyData}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center justify-center"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Data to Clipboard
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
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">How to sync data between localhost and IP access:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-700 mb-1">Method 1: File Backup</h4>
            <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
              <li>Add your data while accessing via one method (localhost or IP)</li>
              <li>Download a backup file from this page</li>
              <li>Switch to the other access method (IP or localhost)</li>
              <li>Upload the backup file to restore your data</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-1">Method 2: Clipboard Sync</h4>
            <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
              <li>Add your data while accessing via one method</li>
              <li>Copy data to clipboard using the "Copy Data" button</li>
              <li>Switch to the other access method or device</li>
              <li>Paste the data using "Paste Data" button</li>
            </ol>
          </div>
        </div>
        <p className="text-sm text-blue-600 mt-2">
          <strong>Tip:</strong> The clipboard method is faster for quick syncing between browser tabs or windows.
        </p>
      </div>
    </div>
  );
};

export default DataSync;
