import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, TrendingUp, TrendingDown, Calendar, AlertCircle, CheckCircle, Globe, Clock, Database, History } from 'lucide-react';
import PageIdentifier from '../shared/PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const DollarRate = () => {
  const [exchangeData, setExchangeData] = useState(null);
  const [historicalRates, setHistoricalRates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [customRate, setCustomRate] = useState('');
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [autoFetch, setAutoFetch] = useState(false);
  const [nextFetchTime, setNextFetchTime] = useState('');

  // Load saved data from database on component mount
  useEffect(() => {
    loadTodaysRate();
    loadHistoricalRates();
    loadSettings();
    calculateNextFetchTime();
  }, []);

  // Load today's exchange rate from database
  const loadTodaysRate = async () => {
    try {
      const response = await fetch('/api/rates/dollar/today', {
        credentials: 'include'
      });

      console.log('Dollar rate response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dollar rate response data:', data);
        
        if (data.success && data.rate) {
          setExchangeData({
            rate: data.rate.usd_to_inr,
            date: data.rate.rate_date,
            lastUpdated: data.rate.fetched_at,
            source: data.rate.source,
            rates: {
              INR: data.rate.usd_to_inr
            }
          });
          setLastUpdated(data.rate.fetched_at);
        }
      } else {
        const errorData = await response.json();
        console.error('Dollar rate API error:', errorData);
        setError(`Failed to load today's rate: ${errorData.error || errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error loading today\'s dollar rate:', error);
      setError(`Network error: ${error.message}`);
    }
  };

  // Load historical rates from database
  const loadHistoricalRates = async () => {
    setIsFetchingHistory(true);
    try {
      const response = await fetch('/api/rates/dollar/history?limit=30', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHistoricalRates(data.rates || []);
        }
      }
    } catch (error) {
      console.error('Error loading historical rates:', error);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  // Load settings from session (defaults)
  const loadSettings = () => {
    // Set defaults - in future versions, load from user preferences in database
    setCustomRate('');
    setUseCustomRate(false);
    setAutoFetch(false);
  };

  // Calculate next fetch time (8:00 AM EST daily)
  const calculateNextFetchTime = () => {
    const now = new Date();
    const nextFetch = new Date();
    
    // Set to 8:00 AM EST (which is 1:00 PM UTC or 6:30 PM IST)
    nextFetch.setUTCHours(13, 0, 0, 0); // 1:00 PM UTC = 8:00 AM EST
    
    // If we've passed today's fetch time, set for tomorrow
    if (now.getUTCHours() >= 13) {
      nextFetch.setDate(nextFetch.getDate() + 1);
    }
    
    setNextFetchTime(nextFetch.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }));
  };

  // Fetch exchange rate from API and save to database
  const fetchExchangeRate = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rates/dollar/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Dollar rate fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dollar rate fetch response data:', data);
        
        if (data.success) {
          // Update local state with the new rate
          setExchangeData({
            rate: data.rate.usd_to_inr,
            date: data.rate.rate_date,
            lastUpdated: data.rate.fetched_at,
            source: data.rate.source,
            rates: {
              INR: data.rate.usd_to_inr
            }
          });
          setLastUpdated(data.rate.fetched_at);
          
          // Reload historical rates to include the new one
          await loadHistoricalRates();
          
          setError('');
        } else {
          setError(data.message || 'Failed to fetch exchange rate');
        }
      } else {
        const errorData = await response.json();
        console.error('Dollar rate fetch API error:', errorData);
        setError(`Failed to fetch rate: ${errorData.error || errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Exchange rate fetch error:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle custom rate changes
  const handleCustomRateChange = (value) => {
    setCustomRate(value);
    // TODO: Save to user preferences in database
  };

  const handleUseCustomRateChange = (checked) => {
    setUseCustomRate(checked);
    // TODO: Save to user preferences in database
  };

  // Handle auto-fetch setting change
  const handleAutoFetchChange = (checked) => {
    setAutoFetch(checked);
    // TODO: Save to user preferences in database
  };

  // Save custom rate to database
  const saveCustomRate = async () => {
    if (!customRate) return;

    try {
      const response = await fetch('/api/rates/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          rateType: 'dollar',
          customRate: customRate,
          notes: 'Custom rate set by user'
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update local state and reload rates
        await loadTodaysRate();
        await loadHistoricalRates();
      }
    } catch (error) {
      console.error('Error saving custom rate:', error);
    }
  };

  // Get current effective rate
  const getCurrentRate = () => {
    if (useCustomRate && customRate) {
      const rate = parseFloat(customRate);
      return isNaN(rate) ? 0 : rate;
    }
    const rate = exchangeData?.rate;
    return (rate && !isNaN(rate)) ? parseFloat(rate) : 0;
  };

  // Format currency
  const formatCurrency = (amount, currency = 'INR') => {
    const validAmount = (amount && !isNaN(amount)) ? parseFloat(amount) : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(validAmount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate conversion examples
  const conversionExamples = [100, 500, 1000, 5000, 10000];

  return (
    <div className="p-6 pb-12">
      <PageIdentifier pageId={SCREEN_IDS?.RATES?.DOLLAR_RATE || 'RATE-002'} pageName="Dollar Rate Management" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <DollarSign className="w-7 h-7 mr-2 text-green-600" />
          Dollar Exchange Rate
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={fetchExchangeRate}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Updating...' : 'Refresh Rate'}
          </button>
          <button
            onClick={loadHistoricalRates}
            disabled={isFetchingHistory}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center"
          >
            <History className={`w-4 h-4 mr-2 ${isFetchingHistory ? 'animate-spin' : ''}`} />
            History
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Rate Display */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-500" />
            Current Exchange Rate
          </h2>

          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              ₹{(getCurrentRate() || 0).toFixed(2)}
            </div>
            <div className="text-gray-600 mb-4">per 1 USD</div>

            {useCustomRate ? (
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm inline-flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Using Custom Rate
              </div>
            ) : (
              exchangeData && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Live Rate from {exchangeData.source}
                </div>
              )
            )}
          </div>

          {lastUpdated && (
            <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center">
              <Clock className="w-4 h-4 mr-1" />
              Last updated: {formatDate(lastUpdated)}
            </div>
          )}
        </div>

        {/* Custom Rate Settings */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Custom Rate Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useCustomRate}
                  onChange={(e) => handleUseCustomRateChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium">Use custom exchange rate</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Override the live rate with your own preferred rate
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Rate (INR per USD)
              </label>
              <input
                type="number"
                value={customRate}
                onChange={(e) => handleCustomRateChange(e.target.value)}
                placeholder="Enter custom rate"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!useCustomRate}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your preferred exchange rate for calculations
              </p>
            </div>

            {useCustomRate && customRate && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You're using a custom rate of ₹{(parseFloat(customRate) || 0).toFixed(2)} per USD. 
                  This will be used for all jewelry pricing calculations.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Auto-Fetch Settings */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-500" />
            Automated Updates
          </h2>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoFetch}
                  onChange={(e) => handleAutoFetchChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium">Enable daily auto-fetch at 8:00 AM EST</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Automatically fetch exchange rates every day and save to database
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Schedule Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Fetch Time:</span>
                  <span className="font-mono">8:00 AM EST Daily</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Update:</span>
                  <span className="font-mono">{nextFetchTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${autoFetch ? 'text-green-600' : 'text-gray-500'}`}>
                    {autoFetch ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {autoFetch && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  <strong>Auto-fetch enabled!</strong> Exchange rates will be automatically fetched 
                  daily at 8:00 AM EST and saved to the database for historical tracking.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Historical Rates */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <History className="w-5 h-5 mr-2 text-purple-500" />
            Recent History (Last 7 Days)
          </h2>

          {historicalRates.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {historicalRates.slice(0, 7).map((rate, index) => {
                const prevRate = historicalRates[index + 1];
                const trend = prevRate ? rate.usd_to_inr - prevRate.usd_to_inr : 0;
                const trendPercentage = prevRate ? ((trend / prevRate.usd_to_inr) * 100) : 0;
                
                return (
                  <div key={rate.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-gray-800">
                        {formatDate(rate.rate_date)}
                        {index === 0 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Today</span>}
                      </div>
                      <div className="text-sm text-gray-500">{rate.source}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        ₹{parseFloat(rate.usd_to_inr).toFixed(2)}
                      </div>
                      {prevRate && (
                        <div className={`text-sm flex items-center justify-end ${
                          trend >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {Math.abs(trendPercentage).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No historical data available</p>
            </div>
          )}
        </div>

        {/* Other Major Currencies */}
        {exchangeData && !useCustomRate && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-semibold mb-4">Other Major Currencies</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(exchangeData.rates)
                .filter(([currency]) => currency !== 'INR')
                .map(([currency, rate]) => (
                  <div key={currency} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-800">{currency}</div>
                    <div className="text-sm text-gray-600">{rate.toFixed(4)}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Conversion Calculator */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Quick Conversion</h2>
          
          <div className="space-y-3">
            {conversionExamples.map(amount => (
              <div key={amount} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">${amount}</span>
                <span className="text-green-600 font-semibold">
                  {formatCurrency(amount * getCurrentRate())}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> These conversions use the current effective rate 
              ({useCustomRate ? 'custom' : 'live'}) and can help you quickly estimate jewelry costs.
            </p>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-3">How to use Dollar Rate utility:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Database Integration:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Click "Refresh Rate" to fetch current rates and save to database</li>
              <li>All rates are automatically saved with timestamps</li>
              <li>View historical trends and rate changes over time</li>
              <li>Rates are persistent across different access methods</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-700 mb-2">Automated Updates:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Enable auto-fetch for daily updates at 8:00 AM EST</li>
              <li>Historical data automatically tracked in database</li>
              <li>Perfect for consistent jewelry pricing</li>
              <li>No manual intervention required once enabled</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Live Rates:</strong> Fetched from exchangerate-api.com and automatically saved to database. 
              Perfect for real-time pricing accuracy with historical tracking.
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Custom Rates:</strong> Set your own preferred rates for consistency. 
              Custom rates are also saved to database for audit trail and team synchronization.
            </p>
          </div>
        </div>

        <div className="mt-4 bg-yellow-100 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Database Integration:</strong> All exchange rates are stored in the database 
            are now saved to the database, ensuring data persistence, team collaboration, and comprehensive historical tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DollarRate;
