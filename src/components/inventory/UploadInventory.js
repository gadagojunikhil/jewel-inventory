import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';

const UploadJewelry = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedItems, setProcessedItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [rejectedItems, setRejectedItems] = useState([]);
  const [vendorProfiles, setVendorProfiles] = useState({});
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load vendor profiles from localStorage
  useEffect(() => {
    const savedProfiles = localStorage.getItem('vendorProfiles');
    if (savedProfiles) {
      setVendorProfiles(JSON.parse(savedProfiles));
    }
  }, []);

  // File upload handler
  const handleFileUpload = async (files) => {
    setIsProcessing(true);
    setProgress(0);
    
    const allProcessedItems = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(Math.round((i / files.length) * 80));
      
      try {
        const items = await processFile(file);
        allProcessedItems.push(...items);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }
    
    setProgress(100);
    setProcessedItems(allProcessedItems);
    setIsProcessing(false);
  };

  // Process individual file
  const processFile = async (file) => {
    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (fileType === 'csv') {
      return await readCSVFile(file);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      return await readExcelFile(file);
    } else {
      throw new Error('Unsupported file format');
    }
  };

  // CSV file reader
  const readCSVFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim() || '';
            });
            data.push(calculateJewelryItem(row));
          }
        }
        resolve(data);
      };
      reader.readAsText(file);
    });
  };

  // Excel file reader (requires XLSX library)
  const readExcelFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // This would need the XLSX library
        // For now, we'll just return empty array
        resolve([]);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Calculate jewelry item values
  const calculateJewelryItem = (data) => {
    const item = {
      itemCode: data['Item Code'] || data['itemCode'] || '',
      name: data['Description'] || data['description'] || '',
      category: data['Category'] || data['category'] || 'Other',
      goldRate: parseFloat(data['Gold Rate'] || data['goldRate'] || '0'),
      grossWeight: parseFloat(data['Gross Weight'] || data['grossWeight'] || '0'),
      stoneWeight: parseFloat(data['Stone Weight'] || data['stoneWeight'] || '0'),
      diamondWeight: parseFloat(data['Diamond Weight'] || data['diamondWeight'] || '0'),
      diamondRate: parseFloat(data['Diamond Rate'] || data['diamondRate'] || '0'),
      laborCost: parseFloat(data['Labor Cost'] || data['laborCost'] || '0'),
      otherCosts: parseFloat(data['Other Costs'] || data['otherCosts'] || '0'),
      status: 'Pending Review'
    };

    // Calculate net weight (gross - stone weight in grams)
    item.netWeight = item.grossWeight - (item.stoneWeight * 0.2); // Convert carats to grams
    
    // Calculate gold amount
    item.goldAmount = item.netWeight * item.goldRate;
    
    // Calculate diamond amount
    item.diamondAmount = item.diamondWeight * item.diamondRate;
    
    // Calculate total cost
    item.totalCost = item.goldAmount + item.diamondAmount + item.laborCost + item.otherCosts;
    
    // Set sale price (cost + margin)
    item.salePrice = item.totalCost * 1.3; // 30% margin
    
    // Create materials array (matching your existing structure)
    item.materials = [];
    if (item.goldAmount > 0) {
      item.materials.push({
        materialId: 14, // 18K Gold ID from your existing data
        materialCode: 'G18-Y',
        materialName: '18K Yellow Gold',
        quantity: item.netWeight,
        unit: 'gram',
        costPerUnit: item.goldRate,
        totalCost: item.goldAmount
      });
    }
    
    if (item.diamondAmount > 0) {
      item.materials.push({
        materialId: 2, // Round Diamond ID from your existing data
        materialCode: 'RD',
        materialName: 'Round Diamonds',
        quantity: item.diamondWeight,
        unit: 'carat',
        costPerUnit: item.diamondRate,
        totalCost: item.diamondAmount
      });
    }

    item.createdDate = new Date().toISOString();
    return item;
  };

  // Approve item
  const approveItem = (index) => {
    setApprovedItems([...approvedItems, index]);
    setRejectedItems(rejectedItems.filter(i => i !== index));
  };

  // Reject item
  const rejectItem = (index) => {
    setRejectedItems([...rejectedItems, index]);
    setApprovedItems(approvedItems.filter(i => i !== index));
  };

  // Save approved items
  const saveApprovedItems = () => {
    const itemsToSave = approvedItems.map(index => processedItems[index]);
    
    // Get existing jewelry pieces
    const existingJewelry = JSON.parse(localStorage.getItem('jewelryPieces')) || [];
    
    // Add new items with proper IDs
    const newItems = itemsToSave.map((item, index) => ({
      ...item,
      id: existingJewelry.length + index + 1,
      status: 'In Stock'
    }));
    
    // Save to localStorage
    const updatedJewelry = [...existingJewelry, ...newItems];
    localStorage.setItem('jewelryPieces', JSON.stringify(updatedJewelry));
    
    alert(`Successfully added ${newItems.length} items to inventory!`);
    
    // Reset state
    setProcessedItems([]);
    setApprovedItems([]);
    setRejectedItems([]);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Upload Jewelry Items</h2>
        <p className="text-gray-600">Upload CSV or Excel files with jewelry data</p>
      </div>

      {/* File Upload Area */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div 
          className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(Array.from(e.dataTransfer.files));
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="mx-auto mb-4 text-blue-500" size={48} />
          <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
          <p className="text-gray-600 mb-4">Supports CSV and Excel files</p>
          <input
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
            Choose Files
          </label>
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Processing Files...</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
        </div>
      )}

      {/* Verification Interface */}
      {processedItems.length > 0 && !isProcessing && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Review Items ({processedItems.length})</h3>
            <div className="flex space-x-4">
              <span className="text-green-600">Approved: {approvedItems.length}</span>
              <span className="text-red-600">Rejected: {rejectedItems.length}</span>
              <span className="text-yellow-600">Pending: {processedItems.length - approvedItems.length - rejectedItems.length}</span>
            </div>
          </div>

          <div className="mb-4 flex space-x-4">
            <button
              onClick={() => {
                const validItems = processedItems
                  .map((item, index) => ({ item, index }))
                  .filter(({ item }) => item.itemCode && item.name)
                  .map(({ index }) => index);
                setApprovedItems(validItems);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Approve All Valid
            </button>
            
            {approvedItems.length > 0 && (
              <button
                onClick={saveApprovedItems}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Save Approved Items ({approvedItems.length})
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Item Code</th>
                  <th className="border border-gray-300 p-3 text-left">Name</th>
                  <th className="border border-gray-300 p-3 text-left">Category</th>
                  <th className="border border-gray-300 p-3 text-left">Total Cost</th>
                  <th className="border border-gray-300 p-3 text-left">Sale Price</th>
                  <th className="border border-gray-300 p-3 text-left">Status</th>
                  <th className="border border-gray-300 p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedItems.map((item, index) => {
                  const isApproved = approvedItems.includes(index);
                  const isRejected = rejectedItems.includes(index);
                  
                  return (
                    <tr 
                      key={index} 
                      className={`
                        ${isApproved ? 'bg-green-50' : isRejected ? 'bg-red-50' : 'bg-white'}
                      `}
                    >
                      <td className="border border-gray-300 p-3">
                        {item.itemCode || <span className="text-red-500">Missing</span>}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {item.name || <span className="text-red-500">Missing</span>}
                      </td>
                      <td className="border border-gray-300 p-3">{item.category}</td>
                      <td className="border border-gray-300 p-3">${item.totalCost?.toFixed(2)}</td>
                      <td className="border border-gray-300 p-3">${item.salePrice?.toFixed(2)}</td>
                      <td className="border border-gray-300 p-3">
                        {isApproved ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle size={16} className="mr-1" /> Approved
                          </span>
                        ) : isRejected ? (
                          <span className="text-red-600 flex items-center">
                            <XCircle size={16} className="mr-1" /> Rejected
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center">
                            <AlertTriangle size={16} className="mr-1" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {!isApproved && !isRejected && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveItem(index)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectItem(index)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {(isApproved || isRejected) && (
                          <button
                            onClick={() => {
                              setApprovedItems(approvedItems.filter(i => i !== index));
                              setRejectedItems(rejectedItems.filter(i => i !== index));
                            }}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                          >
                            Undo
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadJewelry;