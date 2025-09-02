import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import * as XLSX from 'xlsx';
import { 
  Upload, FileText, CheckCircle, XCircle, AlertTriangle, 
  Download, Save, Eye, Edit2, Trash2, Plus, X, 
  FileSpreadsheet, FilePlus, Settings, RefreshCw,
  ChevronDown, ChevronUp, Info, Check, AlertCircle
} from 'lucide-react';

const UploadInventory = () => {
  // State management
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedItems, setProcessedItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [rejectedItems, setRejectedItems] = useState([]);
  const [vendorProfiles, setVendorProfiles] = useState({});
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [columnMappings, setColumnMappings] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load vendor profiles
    const savedProfiles = 
    if (savedProfiles) {
      const profiles = JSON.parse(savedProfiles);
      setVendorProfiles(profiles);
    } else {
      // Create default profiles
      const defaultProfiles = {
        'standard': {
          id: 'standard',
          name: 'Standard Format',
          mappings: {
            itemCode: 'Item Code',
            name: 'Description',
            category: 'Category',
            goldWeight: 'Gold Weight',
            goldPurity: 'Gold Purity',
            goldRate: 'Gold Rate',
            diamondWeight: 'Diamond Weight',
            diamondRate: 'Diamond Rate',
            stoneWeight: 'Stone Weight',
            stoneRate: 'Stone Rate',
            laborCost: 'Labor Cost',
            otherCosts: 'Other Costs',
            salePrice: 'Sale Price',
            vendor: 'Vendor',
            notes: 'Notes'
          },
          validationRules: {
            requiredFields: ['itemCode', 'name', 'category'],
            minGoldPurity: 10,
            maxGoldPurity: 24,
            minPrice: 0
          }
        }
      };
      setVendorProfiles(defaultProfiles);
      setCurrentProfile(defaultProfiles.standard);
      
    }

    // Load categories
    const savedCategories = 
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }

    // Load materials
    const savedMaterials = 
    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    }
  }, []);

  // Default column mappings
  const defaultMappings = {
    itemCode: ['Item Code', 'Code', 'SKU', 'Product Code', 'itemCode'],
    name: ['Description', 'Name', 'Product Name', 'Title', 'description', 'name'],
    category: ['Category', 'Type', 'Product Type', 'category'],
    goldWeight: ['Gold Weight', 'Gold Wt', 'Net Weight', 'goldWeight', 'netWeight'],
    goldPurity: ['Gold Purity', 'Purity', 'Karat', 'goldPurity'],
    goldRate: ['Gold Rate', 'Gold Price', 'goldRate'],
    diamondWeight: ['Diamond Weight', 'Diamond Wt', 'Diamond Carats', 'diamondWeight'],
    diamondRate: ['Diamond Rate', 'Diamond Price', 'diamondRate'],
    stoneWeight: ['Stone Weight', 'Stone Wt', 'Gemstone Weight', 'stoneWeight'],
    stoneRate: ['Stone Rate', 'Stone Price', 'stoneRate'],
    laborCost: ['Labor Cost', 'Making Charge', 'Labor', 'laborCost'],
    otherCosts: ['Other Costs', 'Additional Costs', 'Misc Costs', 'otherCosts'],
    salePrice: ['Sale Price', 'Selling Price', 'MRP', 'salePrice'],
    vendor: ['Vendor', 'Supplier', 'vendor'],
    notes: ['Notes', 'Remarks', 'Comments', 'notes']
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  // File upload handler
  const handleFileUpload = async (files) => {
    setIsProcessing(true);
    setProgress(0);
    setValidationErrors({});
    
    const allProcessedItems = [];
    const errors = {};
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(Math.round(((i + 1) / files.length) * 100));
      
      try {
        const items = await processFile(file);
        
        // Validate items
        items.forEach((item, index) => {
          const itemErrors = validateItem(item);
          if (itemErrors.length > 0) {
            errors[`${file.name}_${index}`] = itemErrors;
          }
        });
        
        allProcessedItems.push(...items.map(item => ({
          ...item,
          fileName: file.name,
          fileIndex: i
        })));
        
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          itemCount: items.length,
          status: 'processed'
        }]);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        errors[file.name] = [`Failed to process file: ${error.message}`];
        
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          itemCount: 0,
          status: 'error',
          error: error.message
        }]);
      }
    }
    
    setProcessedItems(allProcessedItems);
    setValidationErrors(errors);
    setIsProcessing(false);
    
    // Auto-approve valid items
    const validIndexes = allProcessedItems
      .map((item, index) => ({ item, index }))
      .filter(({ item, index }) => !errors[`${item.fileName}_${allProcessedItems.indexOf(item)}`])
      .map(({ index }) => index);
    
    if (validIndexes.length > 0 && Object.keys(errors).length === 0) {
      setApprovedItems(validIndexes);
    }
  };

  // Process individual file
  const processFile = async (file) => {
    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (fileType === 'csv') {
      return await readCSVFile(file);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      return await readExcelFile(file);
    } else {
      throw new Error('Unsupported file format. Please upload CSV or Excel files.');
    }
  };

  // CSV file reader
  const readCSVFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());
          
          const data = [];
          for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim() || '';
            });
            data.push(mapAndCalculateItem(row, headers));
          }
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  };

  // Parse CSV line handling quoted values
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    
    return result;
  };

  // Excel file reader
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error('Excel file is empty or has no data rows');
          }
          
          const headers = jsonData[0].map(h => String(h).trim());
          const items = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = {};
            headers.forEach((header, index) => {
              row[header] = jsonData[i][index] !== undefined ? String(jsonData[i][index]).trim() : '';
            });
            
            // Skip empty rows
            if (Object.values(row).some(val => val !== '')) {
              items.push(mapAndCalculateItem(row, headers));
            }
          }
          
          resolve(items);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Map columns and calculate item values
  const mapAndCalculateItem = (row, headers) => {
    const item = {
      itemCode: '',
      name: '',
      category: 'Other',
      goldWeight: 0,
      goldPurity: 18,
      goldRate: 0,
      diamondWeight: 0,
      diamondRate: 0,
      stoneWeight: 0,
      stoneRate: 0,
      laborCost: 0,
      otherCosts: 0,
      salePrice: 0,
      vendor: '',
      notes: '',
      status: 'Pending Review',
      rawData: row
    };

    // Auto-map columns based on header names
    Object.keys(defaultMappings).forEach(field => {
      const possibleHeaders = defaultMappings[field];
      const matchedHeader = headers.find(h => 
        possibleHeaders.some(ph => h.toLowerCase() === ph.toLowerCase())
      );
      
      if (matchedHeader && row[matchedHeader]) {
        const value = row[matchedHeader];
        
        // Parse numeric fields
        if (['goldWeight', 'goldPurity', 'goldRate', 'diamondWeight', 'diamondRate', 
             'stoneWeight', 'stoneRate', 'laborCost', 'otherCosts', 'salePrice'].includes(field)) {
          item[field] = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
        } else {
          item[field] = value;
        }
      }
    });

    // Calculate gold amount
    const purityMultiplier = item.goldPurity / 24;
    item.goldAmount = item.goldWeight * item.goldRate * purityMultiplier;
    
    // Calculate diamond amount
    item.diamondAmount = item.diamondWeight * item.diamondRate;
    
    // Calculate stone amount
    item.stoneAmount = item.stoneWeight * item.stoneRate;
    
    // Calculate total cost
    item.totalCost = item.goldAmount + item.diamondAmount + item.stoneAmount + 
                     item.laborCost + item.otherCosts;
    
    // If sale price is not provided, calculate with margin
    if (!item.salePrice || item.salePrice === 0) {
      item.salePrice = item.totalCost * 1.35; // 35% margin
    }
    
    // Calculate profit
    item.profit = item.salePrice - item.totalCost;
    item.profitPercentage = item.totalCost > 0 ? (item.profit / item.totalCost * 100) : 0;
    
    // Create materials array (matching existing structure)
    item.materials = [];
    
    if (item.goldAmount > 0) {
      // Find matching gold material based on purity
      let goldMaterial;
      if (item.goldPurity >= 22) {
        goldMaterial = { id: 17, code: 'G22-Y', name: '22K Yellow Gold' };
      } else if (item.goldPurity >= 18) {
        goldMaterial = { id: 14, code: 'G18-Y', name: '18K Yellow Gold' };
      } else {
        goldMaterial = { id: 11, code: 'G14-Y', name: '14K Yellow Gold' };
      }
      
      item.materials.push({
        materialId: goldMaterial.id,
        materialCode: goldMaterial.code,
        materialName: goldMaterial.name,
        quantity: item.goldWeight,
        unit: 'gram',
        costPerUnit: item.goldRate,
        totalCost: item.goldAmount
      });
    }
    
    if (item.diamondAmount > 0) {
      item.materials.push({
        materialId: 2,
        materialCode: 'RD',
        materialName: 'Round Diamonds',
        quantity: item.diamondWeight,
        unit: 'carat',
        costPerUnit: item.diamondRate,
        totalCost: item.diamondAmount
      });
    }
    
    if (item.stoneAmount > 0) {
      item.materials.push({
        materialId: 4,
        materialCode: 'ST',
        materialName: 'Precious Stones',
        quantity: item.stoneWeight,
        unit: 'carat',
        costPerUnit: item.stoneRate,
        totalCost: item.stoneAmount
      });
    }

    item.createdDate = new Date().toISOString();
    
    return item;
  };

  // Validate item
  const validateItem = (item) => {
    const errors = [];
    
    // Required fields
    if (!item.itemCode || item.itemCode.trim() === '') {
      errors.push('Item Code is required');
    }
    if (!item.name || item.name.trim() === '') {
      errors.push('Item Name is required');
    }
    if (!item.category || item.category.trim() === '') {
      errors.push('Category is required');
    }
    
    // Validate numeric fields
    if (item.goldWeight < 0) errors.push('Gold Weight cannot be negative');
    if (item.goldPurity < 0 || item.goldPurity > 24) {
      errors.push('Gold Purity must be between 0 and 24');
    }
    if (item.totalCost < 0) errors.push('Total Cost cannot be negative');
    if (item.salePrice < 0) errors.push('Sale Price cannot be negative');
    
    // Check for duplicate item codes
    const existingItems = JSON.parse(
    if (existingItems.some(existing => existing.code === item.itemCode)) {
      errors.push(`Duplicate Item Code: ${item.itemCode} already exists`);
    }
    
    return errors;
  };

  // Toggle row expansion
  const toggleRowExpansion = (index) => {
    setExpandedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Approve item
  const approveItem = (index) => {
    setApprovedItems(prev => [...prev, index]);
    setRejectedItems(prev => prev.filter(i => i !== index));
  };

  // Reject item
  const rejectItem = (index) => {
    setRejectedItems(prev => [...prev, index]);
    setApprovedItems(prev => prev.filter(i => i !== index));
  };

  // Approve all valid items
  const approveAllValid = () => {
    const validItems = processedItems
      .map((item, index) => ({ item, index }))
      .filter(({ item, index }) => {
        const errors = validateItem(item);
        return errors.length === 0;
      })
      .map(({ index }) => index);
    
    setApprovedItems(validItems);
  };

  // Edit item inline
  const updateItemField = (index, field, value) => {
    const updatedItems = [...processedItems];
    
    // Parse numeric values
    if (['goldWeight', 'goldPurity', 'goldRate', 'diamondWeight', 'diamondRate', 
         'stoneWeight', 'stoneRate', 'laborCost', 'otherCosts', 'salePrice'].includes(field)) {
      value = parseFloat(value) || 0;
    }
    
    updatedItems[index][field] = value;
    
    // Recalculate totals
    const item = updatedItems[index];
    const purityMultiplier = item.goldPurity / 24;
    item.goldAmount = item.goldWeight * item.goldRate * purityMultiplier;
    item.diamondAmount = item.diamondWeight * item.diamondRate;
    item.stoneAmount = item.stoneWeight * item.stoneRate;
    item.totalCost = item.goldAmount + item.diamondAmount + item.stoneAmount + 
                     item.laborCost + item.otherCosts;
    item.profit = item.salePrice - item.totalCost;
    item.profitPercentage = item.totalCost > 0 ? (item.profit / item.totalCost * 100) : 0;
    
    setProcessedItems(updatedItems);
    
    // Revalidate
    const errors = validateItem(item);
    setValidationErrors(prev => ({
      ...prev,
      [`${item.fileName}_${index}`]: errors.length > 0 ? errors : undefined
    }));
  };

  // Save approved items
  const saveApprovedItems = () => {
    const itemsToSave = approvedItems.map(index => processedItems[index]);
    
    if (itemsToSave.length === 0) {
      alert('No items approved for saving');
      return;
    }
    
    // Get existing jewelry pieces
    const existingJewelry = JSON.parse(
    
    // Add new items with proper IDs
    const maxId = existingJewelry.length > 0 
      ? Math.max(...existingJewelry.map(item => item.id)) 
      : 0;
    
    const newItems = itemsToSave.map((item, index) => ({
      ...item,
      id: maxId + index + 1,
      code: item.itemCode,
      status: 'In Stock'
    }));
    
   /*  const updatedJewelry = [...existingJewelry, ...newItems];
    
    
    alert(`Successfully added ${newItems.length} items to inventory!`);
    
    // Reset state
    resetUpload(); */
    const saveApprovedItems = async () => {
  try {
    const itemsToSave = approvedItems.map(index => processedItems[index]);
    
    // Use bulk upload API
    const response = await api.bulkUploadJewelry(itemsToSave);
    
    alert(`Successfully uploaded ${response.successful.length} items!`);
    resetUpload();
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Failed to upload items. Please try again.');
  }
};
  };

  // Reset upload state
  const resetUpload = () => {
    setProcessedItems([]);
    setApprovedItems([]);
    setRejectedItems([]);
    setUploadedFiles([]);
    setValidationErrors({});
    setExpandedRows([]);
    setProgress(0);
  };

  // Download sample template
  const downloadTemplate = () => {
    const template = [
      ['Item Code', 'Description', 'Category', 'Gold Weight', 'Gold Purity', 'Gold Rate', 
       'Diamond Weight', 'Diamond Rate', 'Stone Weight', 'Stone Rate', 
       'Labor Cost', 'Other Costs', 'Sale Price', 'Vendor', 'Notes'],
      ['JN-001', 'Diamond Necklace', 'Necklace', '10', '18', '50', 
       '2.5', '500', '0', '0', '500', '100', '4500', 'Vendor A', 'Premium piece'],
      ['JR-001', 'Gold Ring', 'Ring', '5', '22', '55', 
       '0', '0', '0.5', '200', '300', '50', '2000', 'Vendor B', 'Custom design']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }
    ];
    
    XLSX.writeFile(wb, 'jewelry_upload_template.xlsx');
  };

  // Statistics
  const statistics = {
    total: processedItems.length,
    approved: approvedItems.length,
    rejected: rejectedItems.length,
    pending: processedItems.length - approvedItems.length - rejectedItems.length,
    totalValue: processedItems
      .filter((_, index) => approvedItems.includes(index))
      .reduce((sum, item) => sum + item.salePrice, 0),
    totalCost: processedItems
      .filter((_, index) => approvedItems.includes(index))
      .reduce((sum, item) => sum + item.totalCost, 0)
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Upload Inventory</h2>
        <p className="text-gray-600">Bulk upload jewelry items from CSV or Excel files</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Download size={18} />
            Download Template
          </button>
          
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
          >
            <Settings size={18} />
            Vendor Profiles
          </button>
          
          {processedItems.length > 0 && (
            <>
              <button
                onClick={approveAllValid}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Approve All Valid
              </button>
              
              <button
                onClick={resetUpload}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Reset
              </button>
              
              {approvedItems.length > 0 && (
                <button
                  onClick={saveApprovedItems}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold"
                >
                  <Save size={18} />
                  Save {approvedItems.length} Items
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-4 text-blue-500" size={48} />
          <h3 className="text-lg font-semibold mb-2">
            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className="text-gray-600 mb-4">
            Supports CSV and Excel files (.csv, .xlsx, .xls)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Choose Files
          </button>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Uploaded Files:</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="text-green-500" size={20} />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-gray-600">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === 'processed' ? (
                      <>
                        <CheckCircle className="text-green-500" size={18} />
                        <span className="text-sm text-green-600">
                          {file.itemCount} items
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-500" size={18} />
                        <span className="text-sm text-red-600">
                          {file.error}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Processing Files...</h3>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
        </div>
      )}

      {/* Statistics Summary */}
      {processedItems.length > 0 && !isProcessing && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold">{statistics.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">{statistics.approved}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-xl font-bold">${statistics.totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="text-xl font-bold">${statistics.totalCost.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Verification Table */}
      {processedItems.length > 0 && !isProcessing && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">Review Items</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left"></th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Item Code</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Total Cost</th>
                  <th className="px-4 py-3 text-right">Sale Price</th>
                  <th className="px-4 py-3 text-right">Profit %</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedItems.map((item, index) => {
                  const isApproved = approvedItems.includes(index);
                  const isRejected = rejectedItems.includes(index);
                  const isExpanded = expandedRows.includes(index);
                  const itemErrors = validationErrors[`${item.fileName}_${index}`] || [];
                  
                  return (
                    <React.Fragment key={index}>
                      <tr className={`border-t ${
                        isApproved ? 'bg-green-50' : 
                        isRejected ? 'bg-red-50' : 
                        itemErrors.length > 0 ? 'bg-yellow-50' : 
                        'bg-white hover:bg-gray-50'
                      }`}>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleRowExpansion(index)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {isApproved ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle size={16} className="mr-1" /> Approved
                            </span>
                          ) : isRejected ? (
                            <span className="flex items-center text-red-600">
                              <XCircle size={16} className="mr-1" /> Rejected
                            </span>
                          ) : itemErrors.length > 0 ? (
                            <span className="flex items-center text-yellow-600">
                              <AlertTriangle size={16} className="mr-1" /> Has Errors
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-600">
                              <AlertCircle size={16} className="mr-1" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.itemCode}
                            onChange={(e) => updateItemField(index, 'itemCode', e.target.value)}
                            className={`px-2 py-1 border rounded w-full ${
                              !item.itemCode ? 'border-red-300 bg-red-50' : ''
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItemField(index, 'name', e.target.value)}
                            className={`px-2 py-1 border rounded w-full ${
                              !item.name ? 'border-red-300 bg-red-50' : ''
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={item.category}
                            onChange={(e) => updateItemField(index, 'category', e.target.value)}
                            className="px-2 py-1 border rounded w-full"
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                            <option value="Other">Other</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ${item.totalCost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            value={item.salePrice}
                            onChange={(e) => updateItemField(index, 'salePrice', e.target.value)}
                            className="px-2 py-1 border rounded w-20 text-right"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-medium ${
                            item.profitPercentage > 30 ? 'text-green-600' : 
                            item.profitPercentage > 15 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {item.profitPercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            {!isApproved && !isRejected && (
                              <>
                                <button
                                  onClick={() => approveItem(index)}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                                  title="Approve"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => rejectItem(index)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Reject"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            {(isApproved || isRejected) && (
                              <button
                                onClick={() => {
                                  setApprovedItems(prev => prev.filter(i => i !== index));
                                  setRejectedItems(prev => prev.filter(i => i !== index));
                                }}
                                className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                              >
                                Undo
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row Details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="9" className="px-4 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Left Column - Item Details */}
                              <div>
                                <h4 className="font-semibold mb-3">Item Details</h4>
                                
                                {/* Validation Errors */}
                                {itemErrors.length > 0 && (
                                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
                                    <p className="font-semibold text-red-700 mb-1">Validation Errors:</p>
                                    <ul className="list-disc list-inside text-sm text-red-600">
                                      {itemErrors.map((error, i) => (
                                        <li key={i}>{error}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-sm text-gray-600">Gold Weight (g)</label>
                                    <input
                                      type="number"
                                      value={item.goldWeight}
                                      onChange={(e) => updateItemField(index, 'goldWeight', e.target.value)}
                                      className="w-full px-2 py-1 border rounded"
                                      step="0.01"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-600">Gold Purity (K)</label>
                                    <input
                                      type="number"
                                      value={item.goldPurity}
                                      onChange={(e) => updateItemField(index, 'goldPurity', e.target.value)}
                                      className="w-full px-2 py-1 border rounded"
                                      min="0"
                                      max="24"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-600">Gold Rate ($/g)</label>
                                    <input
                                      type="number"
                                      value={item.goldRate}
                                      onChange={(e) => updateItemField(index, 'goldRate', e.target.value)}
                                      className="w-full px-2 py-1 border rounded"
                                      step="0.01"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-600">Diamond Weight (ct)</label>
                                    <input
                                      type="number"
                                      value={item.diamondWeight}
                                      onChange={(e) => updateItemField(index, 'diamondWeight', e.target.value)}
                                      className="w-full px-2 py-1 border rounded"
                                      step="0.01"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-600">Diamond Rate ($/ct)</label>
                                    <input
                                      type="number"
                                      value={item.diamondRate}
                                      onChange={(e) => updateItemField(index, 'diamondRate', e.target.value)}
                                      className="w-full px-2 py-1 border rounded"
                                      step="0.01"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-600">Labor Cost ($)</label>
                                    <input
                                      type="number"
                                      value={item.laborCost}
                                      onChange={(e) => updateItemField(index, 'laborCost', e.target.value)}
                                      className="w-full px-2 py-1 border rounded"
                                      step="0.01"
                                    />
                                  </div>
                                </div>
                                
                                <div className="mt-3">
                                  <label className="text-sm text-gray-600">Vendor</label>
                                  <input
                                    type="text"
                                    value={item.vendor}
                                    onChange={(e) => updateItemField(index, 'vendor', e.target.value)}
                                    className="w-full px-2 py-1 border rounded"
                                  />
                                </div>
                                
                                <div className="mt-3">
                                  <label className="text-sm text-gray-600">Notes</label>
                                  <textarea
                                    value={item.notes}
                                    onChange={(e) => updateItemField(index, 'notes', e.target.value)}
                                    className="w-full px-2 py-1 border rounded"
                                    rows="2"
                                  />
                                </div>
                              </div>
                              
                              {/* Right Column - Calculations */}
                              <div>
                                <h4 className="font-semibold mb-3">Cost Breakdown</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">Gold Amount:</span>
                                    <span className="font-medium">${item.goldAmount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">Diamond Amount:</span>
                                    <span className="font-medium">${item.diamondAmount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">Stone Amount:</span>
                                    <span className="font-medium">${item.stoneAmount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">Labor Cost:</span>
                                    <span className="font-medium">${item.laborCost.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">Other Costs:</span>
                                    <span className="font-medium">${item.otherCosts.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b font-semibold">
                                    <span>Total Cost:</span>
                                    <span className="text-red-600">${item.totalCost.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b font-semibold">
                                    <span>Sale Price:</span>
                                    <span className="text-green-600">${item.salePrice.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between py-2 font-semibold">
                                    <span>Profit:</span>
                                    <span className="text-blue-600">
                                      ${item.profit.toFixed(2)} ({item.profitPercentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                </div>
                                
                                {/* File Info */}
                                <div className="mt-4 p-3 bg-gray-100 rounded">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Source File:</span> {item.fileName}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isProcessing && processedItems.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileSpreadsheet className="mx-auto mb-4 text-gray-300" size={64} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No items uploaded yet</h3>
          <p className="text-gray-600 mb-4">
            Upload CSV or Excel files to import jewelry items in bulk
          </p>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Download Template to Get Started
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadInventory;