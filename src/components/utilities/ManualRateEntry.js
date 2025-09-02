import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Gem, 
  Calculator, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Edit,
  Eye,
  History,
  Database
} from 'lucide-react';
import PageIdentifier from '../shared/PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const ManualRateEntry = () => {
  const [goldRates, setGoldRates] = useState({
    gold_24k_per_gram: '',
    gold_22k_per_gram: '',
    gold_18k_per_gram: '',
    gold_14k_per_gram: ''
  });
  
  const [dollarRate, setDollarRate] = useState({
    usd_to_inr: ''
  });
  
  const [taxRate, setTaxRate] = useState({
    gst_percentage: '',
    customs_duty: '',
    state_tax: ''
  });
  
  const [currentRates, setCurrentRates] = useState({
    gold: null,
    dollar: null,
    tax: null
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState({
    gold: false,
    dollar: false,
    tax: false
  });

  // Load current rates on component mount
  useEffect(() => {
    loadCurrentRates();
  }, []);

  // Auto-calculate other gold karats when 24k is entered
  useEffect(() => {
    if (goldRates.gold_24k_per_gram) {
      const baseRate = parseFloat(goldRates.gold_24k_per_gram);
      if (!isNaN(baseRate) && baseRate > 0) {
        setGoldRates(prev => ({
          ...prev,
          gold_22k_per_gram: Math.round(baseRate * 0.9167).toString(),
          gold_18k_per_gram: Math.round(baseRate * 0.75).toString(),
          gold_14k_per_gram: Math.round(baseRate * 0.5833).toString()
        }));
      }
    }
  }, [goldRates.gold_24k_per_gram]);

  // Load current rates from database
  const loadCurrentRates = async () => {
    setIsLoading(true);
    try {
      
      
      // Fetch gold rates
      const goldResponse = await fetch('/api/rates/gold/today', {
        credentials: 'include', headers: {
          
        }
      });
      
      // Fetch dollar rates
      const dollarResponse = await fetch('/api/rates/dollar/today', {
        credentials: 'include', headers: {
          
        }
      });
      
      if (goldResponse.ok) {
        const goldData = await goldResponse.json();
        if (goldData.success && goldData.rate) {
          setCurrentRates(prev => ({
            ...prev,
            gold: goldData.rate
          }));
        }
      }
      
      if (dollarResponse.ok) {
        const dollarData = await dollarResponse.json();
        console.log('Dollar data received:', dollarData);
        if (dollarData.success && dollarData.rate) {
          console.log('Dollar rate data:', dollarData.rate);
          setCurrentRates(prev => ({
            ...prev,
            dollar: dollarData.rate
          }));
        }
      }
      
      // Fetch tax rates from API
      const taxResponse = await fetch('/api/rates/tax/latest', {
        credentials: 'include', headers: {
          
        }
      });
      if (taxResponse.ok) {
        const taxData = await taxResponse.json();
        if (taxData.success && taxData.rate) {
          setCurrentRates(prev => ({
            ...prev,
            tax: taxData.rate
          }));
        }
      }
      
    } catch (error) {
      console.error('Error loading current rates:', error);
      setError('Failed to load current rates');
    } finally {
      setIsLoading(false);
    }
  };

  // Save gold rates manually
  const saveGoldRates = async () => {
    if (!goldRates.gold_24k_per_gram) {
      setError('Please enter at least the 24K gold rate');
      return;
    }

    setIsSaving(true);
    setError('');
    
    try {
      
      // Save rates as per gram (multiply by 10 for database storage which expects per 10g)
      const response = await fetch('/api/rates/gold/manual', {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({
          gold_24k_per_10g: parseFloat(goldRates.gold_24k_per_gram),
          gold_22k_per_10g: parseFloat(goldRates.gold_22k_per_gram),
          gold_18k_per_10g: parseFloat(goldRates.gold_18k_per_gram),
          gold_14k_per_10g: parseFloat(goldRates.gold_14k_per_gram),
          source: 'manual entry',
          notes: 'Manual entry - rate stored as per gram in gold_24k_per_10g column'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Gold rates saved successfully!');
        setEditMode(prev => ({ ...prev, gold: false }));
        setGoldRates({
          gold_24k_per_gram: '',
          gold_22k_per_gram: '',
          gold_18k_per_gram: '',
          gold_14k_per_gram: ''
        });
        await loadCurrentRates();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save gold rates');
      }
    } catch (error) {
      console.error('Error saving gold rates:', error);
      setError('Failed to save gold rates');
    } finally {
      setIsSaving(false);
    }
  };

  // Save dollar rates manually
  const saveDollarRates = async () => {
    if (!dollarRate.usd_to_inr) {
      setError('Please enter the USD to INR rate');
      return;
    }

    setIsSaving(true);
    setError('');
    
    try {
      
      const response = await fetch('/api/rates/dollar/manual', {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({
          usd_to_inr: parseFloat(dollarRate.usd_to_inr),
          source: 'manual entry',
          notes: 'Manual entry by admin'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Dollar rates saved successfully!');
        setEditMode(prev => ({ ...prev, dollar: false }));
        setDollarRate({ usd_to_inr: '' });
        await loadCurrentRates();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save dollar rates');
      }
    } catch (error) {
      console.error('Error saving dollar rates:', error);
      setError('Failed to save dollar rates');
    } finally {
      setIsSaving(false);
    }
  };

  // Save tax rates (stored locally since it's admin configuration)
  const saveTaxRates = async () => {


    setIsSaving(true);
    setError('');
    try {
      
      const response = await fetch('/api/rates/tax/manual', {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({
          gst_percentage: taxRate.gst_percentage ? parseFloat(taxRate.gst_percentage) : null,
          customs_duty: taxRate.customs_duty ? parseFloat(taxRate.customs_duty) : null,
          state_tax: taxRate.state_tax ? parseFloat(taxRate.state_tax) : null
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Tax rates saved successfully!');
        setEditMode(prev => ({ ...prev, tax: false }));
        setTaxRate({
          gst_percentage: '',
          customs_duty: '',
          state_tax: ''
        });
        await loadCurrentRates();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save tax rates');
      }
    } catch (error) {
      console.error('Error saving tax rates:', error);
      setError('Failed to save tax rates');
    } finally {
      setIsSaving(false);
    }
  };

  // Safe number formatter
  const safeFormatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    const num = Number(value);
    if (isNaN(num)) return 'N/A';
    return num.toFixed(decimals);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || isNaN(Number(amount))) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(amount));
  };

  // Format percentage
  const formatPercentage = (amount) => {
    if (!amount || isNaN(Number(amount))) return 'N/A';
    return `${Number(amount)}%`;
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 pb-12">
      <PageIdentifier pageId={SCREEN_IDS?.RATES?.MANUAL_ENTRY || 'RATE-003'} pageName="Manual Rate Entry" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Calculator className="w-7 h-7 mr-2 text-blue-600" />
          Manual Rate Entry
        </h1>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            {isLoading ? 'Loading...' : 'Ready for manual entry'}
          </div>
          <button
            onClick={loadCurrentRates}
            disabled={isLoading}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center text-sm"
            title="Reload current rates from database"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gold Rates Section */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Gem className="w-5 h-5 mr-2 text-yellow-500" />
              Gold Rates (per gram)
            </h2>
            <button
              onClick={() => setEditMode(prev => ({ ...prev, gold: !prev.gold }))}
              className="text-blue-500 hover:text-blue-700"
            >
              {editMode.gold ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </button>
          </div>

          {/* Current Gold Rates Display */}
          {!editMode.gold && currentRates.gold && (
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <div className="font-medium text-yellow-800">24K Gold</div>
                  <div className="text-sm text-yellow-600">Pure Gold (99.9%)</div>
                </div>
                <div className="text-xl font-bold text-yellow-700">
                  {formatCurrency(currentRates.gold.gold_24k_per_10g)}
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium text-orange-800">22K Gold</div>
                  <div className="text-sm text-orange-600">Jewelry Grade (91.6%)</div>
                </div>
                <div className="text-xl font-bold text-orange-700">
                  {formatCurrency(currentRates.gold.gold_22k_per_10g)}
                </div>
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                Last updated: {formatDateTime(currentRates.gold.fetched_at)}
              </div>
            </div>
          )}

          {/* Gold Rate Entry Form */}
          {editMode.gold && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  24K Gold Rate (per gram) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={goldRates.gold_24k_per_10g}
                  onChange={(e) => setGoldRates(prev => ({ ...prev, gold_24k_per_10g: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter 24K gold rate per gram"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  22K Gold Rate (per gram)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={goldRates.gold_22k_per_10g}
                  onChange={(e) => setGoldRates(prev => ({ ...prev, gold_22k_per_10g: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Auto-calculated"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  18K Gold Rate (per gram)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={goldRates.gold_18k_per_10g}
                  onChange={(e) => setGoldRates(prev => ({ ...prev, gold_18k_per_10g: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Auto-calculated"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  14K Gold Rate (per gram)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={goldRates.gold_14k_per_10g}
                  onChange={(e) => setGoldRates(prev => ({ ...prev, gold_14k_per_10g: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Auto-calculated"
                />
              </div>

              <button
                onClick={saveGoldRates}
                disabled={isSaving}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Gold Rates'}
              </button>
            </div>
          )}

          {!currentRates.gold && !editMode.gold && (
            <div className="text-center py-4 text-gray-500">
              <p>No gold rates available</p>
              <button
                onClick={() => setEditMode(prev => ({ ...prev, gold: true }))}
                className="text-blue-500 hover:text-blue-700 text-sm mt-2"
              >
                Enter manually
              </button>
            </div>
          )}
        </div>

        {/* Dollar Rates Section */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Dollar Exchange Rate
            </h2>
            <button
              onClick={() => setEditMode(prev => ({ ...prev, dollar: !prev.dollar }))}
              className="text-blue-500 hover:text-blue-700"
            >
              {editMode.dollar ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </button>
          </div>

          {/* Current Dollar Rate Display */}
          {!editMode.dollar && currentRates.dollar && (
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-green-800">USD to INR</div>
                  <div className="text-sm text-green-600">1 US Dollar equals</div>
                </div>
                <div className="text-xl font-bold text-green-700">
                  ₹{safeFormatNumber(currentRates.dollar?.usd_to_inr, 2)}
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-blue-800">INR to USD</div>
                  <div className="text-sm text-blue-600">1 Indian Rupee equals</div>
                </div>
                <div className="text-xl font-bold text-blue-700">
                  ${safeFormatNumber(currentRates.dollar?.inr_to_usd, 4)}
                </div>
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                Last updated: {formatDateTime(currentRates.dollar.fetched_at)}
              </div>
            </div>
          )}

          {/* Dollar Rate Entry Form */}
          {editMode.dollar && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  USD to INR Rate *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={dollarRate.usd_to_inr}
                  onChange={(e) => setDollarRate(prev => ({ ...prev, usd_to_inr: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter USD to INR rate"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: If 1 USD = 83.25 INR, enter 83.25
                </p>
              </div>

              {dollarRate.usd_to_inr && !isNaN(parseFloat(dollarRate.usd_to_inr)) && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Preview:</strong><br />
                    1 USD = ₹{parseFloat(dollarRate.usd_to_inr).toFixed(2)} INR<br />
                    1 INR = ${(1 / parseFloat(dollarRate.usd_to_inr)).toFixed(4)} USD
                  </div>
                </div>
              )}

              <button
                onClick={saveDollarRates}
                disabled={isSaving}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Dollar Rate'}
              </button>
            </div>
          )}

          {!currentRates.dollar && !editMode.dollar && (
            <div className="text-center py-4 text-gray-500">
              <p>No dollar rates available</p>
              <button
                onClick={() => setEditMode(prev => ({ ...prev, dollar: true }))}
                className="text-blue-500 hover:text-blue-700 text-sm mt-2"
              >
                Enter manually
              </button>
            </div>
          )}
        </div>

        {/* Tax Rates Section */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-purple-500" />
              Tax Rates
            </h2>
            <button
              onClick={() => setEditMode(prev => ({ ...prev, tax: !prev.tax }))}
              className="text-blue-500 hover:text-blue-700"
            >
              {editMode.tax ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </button>
          </div>

          {/* Current Tax Rates Display */}
          {!editMode.tax && currentRates.tax && (
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium text-purple-800">GST</div>
                  <div className="text-sm text-purple-600">Goods & Services Tax</div>
                </div>
                <div className="text-xl font-bold text-purple-700">
                  {formatPercentage(currentRates.tax.gst_percentage)}
                </div>
              </div>
              {currentRates.tax.customs_duty > 0 && (
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-red-800">Customs Duty</div>
                    <div className="text-sm text-red-600">Import duty</div>
                  </div>
                  <div className="text-xl font-bold text-red-700">
                    {formatPercentage(currentRates.tax.customs_duty)}
                  </div>
                </div>
              )}
              {currentRates.tax.state_tax > 0 && (
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <div className="font-medium text-indigo-800">State Tax</div>
                    <div className="text-sm text-indigo-600">Additional state levy</div>
                  </div>
                  <div className="text-xl font-bold text-indigo-700">
                    {formatPercentage(currentRates.tax.state_tax)}
                  </div>
                </div>
              )}
              <div className="text-center text-xs text-gray-500 mt-2">
                Last updated: {formatDateTime(currentRates.tax.updated_at)}
              </div>
            </div>
          )}

          {/* Tax Rate Entry Form */}
          {editMode.tax && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Percentage (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={taxRate.gst_percentage}
                  onChange={(e) => setTaxRate(prev => ({ ...prev, gst_percentage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter GST percentage"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customs Duty (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={taxRate.customs_duty}
                  onChange={(e) => setTaxRate(prev => ({ ...prev, customs_duty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter customs duty (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State Tax (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={taxRate.state_tax}
                  onChange={(e) => setTaxRate(prev => ({ ...prev, state_tax: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter state tax (optional)"
                />
              </div>

              <button
                onClick={saveTaxRates}
                disabled={isSaving}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Tax Rates'}
              </button>
            </div>
          )}

          {!currentRates.tax && !editMode.tax && (
            <div className="text-center py-4 text-gray-500">
              <p>No tax rates configured</p>
              <button
                onClick={() => setEditMode(prev => ({ ...prev, tax: true }))}
                className="text-blue-500 hover:text-blue-700 text-sm mt-2"
              >
                Configure now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-3">Manual Rate Entry Guide:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-yellow-700 mb-2">Gold Rates:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Enter 24K rate - other karats auto-calculate</li>
              <li>Rates are per gram in INR</li>
              <li>Used directly for jewelry pricing calculations</li>
              <li>Stored in database with timestamp</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-700 mb-2">Dollar Rates:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Enter USD to INR conversion rate</li>
              <li>INR to USD automatically calculated</li>
              <li>Used for international pricing</li>
              <li>Updated with current market rates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-purple-700 mb-2">Tax Rates:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Configure GST percentage (required)</li>
              <li>Add customs duty if applicable</li>
              <li>Include state taxes if needed</li>
              <li>Applied to final pricing calculations</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Manual rates override automatic API fetches and are used throughout 
            the jewelry inventory system for accurate pricing, billing, and cost calculations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualRateEntry;
