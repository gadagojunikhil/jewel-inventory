import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const UploadJewelry = ({ jewelryPieces, setJewelryPieces, materials, jewelryCategories }) => {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a CSV or Excel file (.csv, .xlsx, .xls)'
      });
      return;
    }

    // Simulate upload progress
    setUploadStatus({ type: 'uploading', message: 'Processing file...' });
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setUploadStatus({
            type: 'success',
            message: `Successfully processed ${file.name}. Found 0 valid jewelry records.`
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadTemplate = (type) => {
    const headers = [
      'Name',
      'Code', 
      'Category',
      'Labor Cost',
      'Other Costs',
      'Sale Price',
      'Status',
      'Material 1 ID',
      'Material 1 Quantity',
      'Material 2 ID',
      'Material 2 Quantity'
    ];

    const sampleData = [
      [
        'Sample Diamond Ring',
        'R-001',
        'Ring',
        '200',
        '50',
        '1500',
        'In Stock',
        '1',
        '2.5',
        '11',
        '5'
      ]
    ];

    const csvContent = [headers, ...sampleData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jewelry_template.${type}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Jewelry</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Bulk Upload Jewelry</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <h4 className="text-lg font-medium mb-2">Drop files here or click to upload</h4>
            <p className="text-gray-600 mb-4">Support for CSV, Excel files</p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="jewelry-upload"
            />
            <label
              htmlFor="jewelry-upload"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 cursor-pointer inline-block"
            >
              Choose Files
            </label>
          </div>

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              uploadStatus.type === 'error' ? 'bg-red-50 border border-red-200' :
              uploadStatus.type === 'success' ? 'bg-green-50 border border-green-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center space-x-2">
                {uploadStatus.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
                {uploadStatus.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
                {uploadStatus.type === 'uploading' && <Upload className="text-blue-500" size={20} />}
                <span className={`font-medium ${
                  uploadStatus.type === 'error' ? 'text-red-700' :
                  uploadStatus.type === 'success' ? 'text-green-700' :
                  'text-blue-700'
                }`}>
                  {uploadStatus.message}
                </span>
              </div>
              
              {uploadStatus.type === 'uploading' && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-blue-600">{uploadProgress}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Download Template</h3>
          <p className="text-gray-600 mb-4">
            Download our template to ensure your data is formatted correctly.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => downloadTemplate('csv')}
              className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2"
            >
              <FileText size={20} />
              <span>Download CSV Template</span>
            </button>
            
            <button 
              onClick={() => downloadTemplate('xlsx')}
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
            >
              <FileText size={20} />
              <span>Download Excel Template</span>
            </button>
          </div>

          <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Upload Guidelines:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Use the template format for best results</p>
              <p>• Material IDs must match existing materials</p>
              <p>• Categories must exist in your system</p>
              <p>• Codes must be unique</p>
              <p>• Numeric fields should contain valid numbers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
        <div className="text-center py-8 text-gray-500">
          <Upload className="mx-auto mb-2" size={32} />
          <p>No upload history available</p>
        </div>
      </div>
    </div>
  );
};

export { AddInventory, EditInventory, UploadJewelry };