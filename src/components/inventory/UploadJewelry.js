import React from 'react';
import { Upload } from 'lucide-react';

const UploadJewelry = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Jewelry</h1>
      
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Bulk Upload Feature
          </h2>
          <p className="text-gray-600 mb-4">
            This feature will be available in a future update.
          </p>
          <p className="text-sm text-gray-500">
            For now, please use the individual forms to manage your jewelry inventory.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadJewelry;
