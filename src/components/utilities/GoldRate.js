import React, { useState, useEffect } from 'react';
import { Gem, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Globe, Clock, Database, History, CheckCircle } from 'lucide-react';
import PageIdentifier from '../shared/PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const GoldRate = () => {
  const [goldData, setGoldData] = useState(null);
  const [historicalRates, setHistoricalRates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoFetch, setAutoFetch] = useState(false);
  const [nextFetchTime, setNextFetchTime] = useState('');

  // Load saved data and settings on component mount
  useEffect(() => {
    loadTodaysRate();
    loadHistoricalRates();
    setAutoFetch(false); // Default setting
    calculateNextFetchTime();
  }, []);

  // Load today's gold rate from database
  const loadTodaysRate = async () => {
    try {
      const response = await fetch('/api/rates/gold/today', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.rate) {
          setGoldData(data.rate);
          setLastUpdated(data.rate.fetched_at);
        }
      }
    } catch (error) {
      console.error('Error loading today\'s gold rate:', error);
    }
  };

  // Load historical rates from database
  const loadHistoricalRates = async () => {
    setIsFetchingHistory(true);
    try {
    const response = await fetch('/api/rates/gold/live', {
      credentials: 'include'
    });      if (response.ok) {
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

  // Load settings from database (future enhancement)
  useEffect(() => {
    setAutoFetch(false); // Default to false, load from user preferences later
  }, []);

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

  // Fetch gold rates from dpgold.com (via our backend API)
  const fetchGoldRates = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rates/gold/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setGoldData(data.rate);
        setLastUpdated(data.rate.fetched_at);
        
        // Reload historical rates to include the new one
        await loadHistoricalRates();
        
        setError('');
      } else {
        setError(data.message || 'Failed to fetch gold rates');
      }
    } catch (err) {
      setError('Failed to fetch gold rates. Please check your connection.');
      console.error('Gold rate fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle auto-fetch setting change
  const handleAutoFetchChange = (checked) => {
    setAutoFetch(checked);
    // TODO: Save to user preferences in database
    // For now, setting is only active during session
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Calculate trend compared to yesterday
  const getTrend = (currentRate, previousRate) => {
    if (!previousRate) return null;
    const diff = currentRate - previousRate;
    const percentage = (diff / previousRate) * 100;
    return { diff, percentage };
  };

  // Get yesterday's rate for trend calculation
  const getYesterdayRate = () => {
    if (historicalRates.length < 2) return null;
    return historicalRates[1]; // Index 1 should be yesterday (index 0 is today)
  };

  const yesterdayRate = getYesterdayRate();
  const trend24k = goldData && yesterdayRate ? getTrend(goldData.gold_24k_per_10g, yesterdayRate.gold_24k_per_10g) : null;
  const trend22k = goldData && yesterdayRate ? getTrend(goldData.gold_22k_per_10g, yesterdayRate.gold_22k_per_10g) : null;

  return (
    <div className="p-6 pb-12">
      <PageIdentifier pageId={SCREEN_IDS?.RATES?.GOLD_RATE || 'RATE-001'} pageName="Gold Rate Management" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Gem className="w-7 h-7 mr-2 text-yellow-600" />
          Gold Rate - India
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={fetchGoldRates}
            disabled={isLoading}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Fetching...' : 'Fetch Latest'}
          </button>
          <button
            onClick={loadHistoricalRates}
            disabled={isFetchingHistory}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
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
        {/* Current Gold Rates */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-yellow-500" />
            Current Gold Rates (per 10g)
          </h2>

          {goldData ? (
            <div className="space-y-4">
              {/* 24K Gold */}
              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <div>
                  <div className="font-semibold text-yellow-800">24K Gold</div>
                  <div className="text-sm text-yellow-600">Pure Gold (99.9%)</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-700">
                    {formatCurrency(goldData.gold_24k_per_10g)}
                  </div>
                  {trend24k && (
                    <div className={`text-sm flex items-center justify-end ${
                      trend24k.diff >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend24k.diff >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      {Math.abs(trend24k.percentage).toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>

              {/* 22K Gold */}
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-semibold text-orange-800">22K Gold</div>
                  <div className="text-sm text-orange-600">Jewelry Grade (91.6%)</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-700">
                    {formatCurrency(goldData.gold_22k_per_10g)}
                  </div>
                  {trend22k && (
                    <div className={`text-sm flex items-center justify-end ${
                      trend22k.diff >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend22k.diff >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      {Math.abs(trend22k.percentage).toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>

              {/* 18K Gold */}
              {goldData.gold_18k_per_10g && (
                <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-amber-800">18K Gold</div>
                    <div className="text-sm text-amber-600">Medium Grade (75%)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-amber-700">
                      {formatCurrency(goldData.gold_18k_per_10g)}
                    </div>
                  </div>
                </div>
              )}

              {/* 14K Gold */}
              {goldData.gold_14k_per_10g && (
                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-yellow-800">14K Gold</div>
                    <div className="text-sm text-yellow-600">Lower Grade (58.3%)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-700">
                      {formatCurrency(goldData.gold_14k_per_10g)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Gem className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No gold rate data available</p>
              <p className="text-sm">Click "Fetch Latest" to get current rates</p>
            </div>
          )}

          {lastUpdated && (
            <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center">
              <Clock className="w-4 h-4 mr-1" />
              Last updated: {formatDateTime(lastUpdated)}
            </div>
          )}

          {goldData && (
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <div className="text-center text-sm text-blue-800">
                <strong>Source:</strong> {goldData.source || 'dpgold.com'}
              </div>
            </div>
          )}
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
                  className="w-4 h-4 text-yellow-600 rounded"
                />
                <span className="text-sm font-medium">Enable daily auto-fetch at 8:00 AM EST</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Automatically fetch gold rates every day and save to database
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
                  <strong>Auto-fetch enabled!</strong> Gold rates will be automatically fetched 
                  daily at 8:00 AM EST and saved to the database for historical tracking.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Calculations */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Quick Weight Calculations</h2>
          
          {goldData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-yellow-800 font-medium">1 Gram (24K)</div>
                  <div className="text-lg font-bold text-yellow-700">
                    {formatCurrency(goldData.gold_24k_per_10g / 10)}
                  </div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-orange-800 font-medium">1 Gram (22K)</div>
                  <div className="text-lg font-bold text-orange-700">
                    {formatCurrency(goldData.gold_22k_per_10g / 10)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-yellow-100 rounded-lg">
                  <div className="text-sm text-yellow-800 font-medium">5 Grams (24K)</div>
                  <div className="text-lg font-bold text-yellow-700">
                    {formatCurrency(goldData.gold_24k_per_10g / 2)}
                  </div>
                </div>
                <div className="text-center p-3 bg-orange-100 rounded-lg">
                  <div className="text-sm text-orange-800 font-medium">5 Grams (22K)</div>
                  <div className="text-lg font-bold text-orange-700">
                    {formatCurrency(goldData.gold_22k_per_10g / 2)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>Fetch gold rates to see calculations</p>
            </div>
          )}
        </div>

        {/* Historical Rates */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <History className="w-5 h-5 mr-2 text-purple-500" />
            Recent History (Last 7 Days)
          </h2>

          {historicalRates.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {historicalRates.slice(0, 7).map((rate, index) => (
                <div key={rate.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-800">
                      {formatDate(rate.rate_date)}
                      {index === 0 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Today</span>}
                    </div>
                    <div className="text-sm text-gray-500">24K/22K per 10g</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">
                      {formatCurrency(rate.gold_24k_per_10g)} / {formatCurrency(rate.gold_22k_per_10g)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No historical data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-3">How to use Gold Rate utility:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-yellow-700 mb-2">Manual Updates:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Click "Fetch Latest" to get current gold rates from dpgold.com</li>
              <li>Rates are automatically saved to database with timestamp</li>
              <li>View trends compared to previous day's rates</li>
              <li>Use quick calculations for jewelry pricing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-700 mb-2">Automated Updates:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Enable auto-fetch for daily updates at 8:00 AM EST</li>
              <li>Historical data automatically tracked in database</li>
              <li>Perfect for consistent jewelry pricing</li>
              <li>No manual intervention required once enabled</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Integration:</strong> Gold rates from this utility will be used throughout the jewelry 
            inventory system for accurate pricing of gold jewelry based on current market rates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoldRate;
