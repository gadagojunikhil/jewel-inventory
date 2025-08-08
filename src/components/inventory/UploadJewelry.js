// src/components/inventory/UploadInventory.js

import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const UploadInventory = () => {
  const [fileData, setFileData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    setFileName(file.name);
    setError('');

    try {
      if (extension === 'csv' || extension === 'xlsx') {
        const data = await parseExcelOrCSV(file);
        setFileData(data);
      } else {
        setError('Only CSV or Excel files are supported at this stage.');
      }
    } catch (err) {
      setError('Failed to parse file. Please check the format.');
    }
  };

  const parseExcelOrCSV = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="upload-inventory">
      <h2>📦 Upload Inventory File</h2>
      <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} />
      {fileName && <p>✅ Uploaded: {fileName}</p>}
      {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}

      {fileData.length > 0 && (
        <div>
          <h4>📊 Parsed Items: {fileData.length}</h4>
          <pre>{JSON.stringify(fileData.slice(0, 3), null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadInventory;
