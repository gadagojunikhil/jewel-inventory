import React, { useState, useEffect } from 'react';
import { Calendar, Gem, DollarSign, User, Phone, Plus, Trash2 } from 'lucide-react';

const IndianBilling = () => {
  // Ref for Item Code input
  const itemCodeRef = React.useRef(null);
  
  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };
  
  // Categories for wastage/making lookup
  const [categories, setCategories] = useState([]);

  // Section 1: Header & Rates
  const [date, setDate] = useState(() => {
    const today = new Date();
    // Get local date in YYYY-MM-DD format
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [goldRate, setGoldRate] = useState('');
  const [goldRateEditable, setGoldRateEditable] = useState(false);
  const [dollarRate, setDollarRate] = useState('');

  // Section 2: Jewelry & Gold Calculation
  const [itemCode, setItemCode] = useState('');
  const [purity, setPurity] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [fineWeight, setFineWeight] = useState('');
  const [goldPrice, setGoldPrice] = useState('');
  const [goldValue, setGoldValue] = useState('');
  const [wastagePercent, setWastagePercent] = useState('');
  const [wastageAmount, setWastageAmount] = useState('');
  const [makingCharge, setMakingCharge] = useState('');
  const [makingAmount, setMakingAmount] = useState('');
  const [totalGoldAmount, setTotalGoldAmount] = useState('');

  // Stone calculations
  const [stoneTotal, setStoneTotal] = useState(0);
  const [fetchedStones, setFetchedStones] = useState([]);

  // Fetch rates and categories on mount
  const [goldRateError, setGoldRateError] = useState('');
  
  useEffect(() => {
    // Fetch gold rate
    fetch('/api/rates/gold/today', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.rate && data.rate.gold_24k_per_10g != null && data.rate.gold_24k_per_10g !== '') {
          setGoldRate(data.rate.gold_24k_per_10g);
          setGoldRateError('');
          setGoldRateEditable(false);
        } else {
          setGoldRate('');
          setGoldRateError('Gold rate not found for today. Please enter today\'s rate in Manual Rate Entry (UTIL-003) or enter manually below.');
          setGoldRateEditable(true);
        }
      })
      .catch(() => {
        setGoldRate('');
        setGoldRateError('Failed to fetch gold rate. Please check your connection or enter rate manually.');
        setGoldRateEditable(true);
      });
      
    // Fetch dollar rate
    fetch('/api/rates/dollar/today', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.rate) {
          setDollarRate(data.rate.usd_to_inr);
        }
      })
      .catch(() => {
        // Keep default value on error
      });
      
    // Fetch categories
    fetch('/api/categories', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([
            { id: 1, name: 'Rings', wastageCharges: 8, makingCharges: 500 },
            { id: 2, name: 'Necklaces', wastageCharges: 10, makingCharges: 800 },
            { id: 3, name: 'Earrings', wastageCharges: 6, makingCharges: 400 }
          ]);
        }
      })
      .catch(() => {
        setCategories([
          { id: 1, name: 'Rings', wastageCharges: 8, makingCharges: 500 },
          { id: 2, name: 'Necklaces', wastageCharges: 10, makingCharges: 800 },
          { id: 3, name: 'Earrings', wastageCharges: 6, makingCharges: 400 }
        ]);
      });
  }, []);

  // Calculate fine weight
  useEffect(() => {
    if (netWeight && purity) {
      setFineWeight((parseFloat(netWeight) * parseFloat(purity) / 24).toFixed(3));
    } else {
      setFineWeight('');
    }
  }, [netWeight, purity]);

  // Calculate gold price (based on purity)
  useEffect(() => {
    if (goldRate && purity) {
      setGoldPrice((parseFloat(goldRate) * parseFloat(purity) / 24).toFixed(2));
    } else {
      setGoldPrice('');
    }
  }, [goldRate, purity]);

  // Calculate gold value
  useEffect(() => {
    if (goldPrice && fineWeight) {
      setGoldValue((parseFloat(goldPrice) * parseFloat(fineWeight)).toFixed(2));
    } else {
      setGoldValue('');
    }
  }, [goldPrice, fineWeight]);

  // Calculate wastage amount
  useEffect(() => {
    if (netWeight && wastagePercent && goldPrice) {
      setWastageAmount((parseFloat(netWeight) * parseFloat(wastagePercent) / 100 * parseFloat(goldPrice)).toFixed(2));
    } else {
      setWastageAmount('');
    }
  }, [netWeight, wastagePercent, goldPrice]);

  // Calculate making amount
  useEffect(() => {
    if (netWeight && makingCharge) {
      setMakingAmount((parseFloat(netWeight) * parseFloat(makingCharge)).toFixed(2));
    } else {
      setMakingAmount('');
    }
  }, [netWeight, makingCharge]);

  // Calculate total gold amount
  useEffect(() => {
    const gv = parseFloat(goldValue) || 0;
    const wa = parseFloat(wastageAmount) || 0;
    const ma = parseFloat(makingAmount) || 0;
    setTotalGoldAmount((gv + wa + ma).toFixed(2));
  }, [goldValue, wastageAmount, makingAmount]);

  // Date validation
  const handleDateChange = (e) => {
    const val = e.target.value;
    const today = new Date().toISOString().split('T')[0];
    if (val > today) return; // Block future dates
    setDate(val);
  };

  // Fetch jewelry details by Item Code
  const fetchJewelryDetails = async (code) => {
    if (!code) return;
    try {
      // Use new endpoint to get jewelry details with stone sale_price
      const res = await fetch(`/api/jewelry/details/${code}`, { headers: getAuthHeaders() });
      const item = await res.json();
      if (item && item.code) {
        setPurity(item.gold_purity || '');
        setGrossWeight(item.gross_weight || '');
        setNetWeight(item.net_weight || '');
        
        // Auto-populate wastage/making from category
        if (item.category_id && categories.length > 0) {
          const cat = categories.find(c => c.id === item.category_id);
          let wastage = cat?.wastageCharges;
          let making = cat?.makingCharges;
          
          // Fallback to parent if missing
          if ((!wastage || wastage === 0) && cat?.parentId) {
            const parentCat = categories.find(c => c.id === cat.parentId);
            wastage = parentCat?.wastageCharges;
          }
          if ((!making || making === 0) && cat?.parentId) {
            const parentCat = categories.find(c => c.id === cat.parentId);
            making = parentCat?.makingCharges;
          }
          
          setWastagePercent(wastage || '');
          setMakingCharge(making || '');
        }
        
        // Stones already have sale_price from backend
        let stones = [];
        if (item.stones) {
          stones = Array.isArray(item.stones) ? item.stones : [];
        }
        setFetchedStones(stones);
      } else {
        setFetchedStones([]);
      }
    } catch (err) {
      console.error('Failed to fetch jewelry details', err);
      setFetchedStones([]);
    }
  };

  const clearForm = () => {
    setItemCode('');
    setPurity('');
    setGrossWeight('');
    setNetWeight('');
    setFineWeight('');
    setGoldPrice('');
    setGoldValue('');
    setWastagePercent('');
    setWastageAmount('');
    setMakingCharge('');
    setMakingAmount('');
    setTotalGoldAmount('');
    setFetchedStones([]);
    setStoneTotal(0);
    if (itemCodeRef.current) {
      itemCodeRef.current.focus();
    }
  };

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Indian Jewelry Billing</h1>
      
      {/* Header Section */}
      <div className="bg-white rounded shadow p-3 mb-4">
        <h2 className="text-base font-semibold mb-2 flex items-center">
          <Calendar className="mr-2" size={16} />
          Basic Information & Rates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2">
          <div>
            <label className="block text-xs font-medium mb-1">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={handleDateChange} 
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Gold Rate (24K per 10g)</label>
            <input 
              type="number" 
              value={goldRate} 
              onChange={(e) => setGoldRate(e.target.value)}
              readOnly={!goldRateEditable}
              className={`w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${!goldRateEditable ? 'bg-gray-100' : ''}`}
            />
            {goldRateError && <div className="text-xs text-red-600 mt-1">{goldRateError}</div>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">USD to INR Rate</label>
            <input 
              type="number" 
              value={dollarRate} 
              onChange={(e) => setDollarRate(e.target.value)}
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Customer Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Phone Number</label>
            <input 
              type="text" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ height: '500px' }}>
        {/* Left side */}
        <div className="flex flex-col gap-4 h-full">
          <div className="bg-white rounded shadow p-3 flex flex-col justify-start" style={{ height: '50%' }}>
            <h2 className="text-base font-semibold mb-2 flex items-center">
              <Gem className="mr-2" size={16} />
              Jewelry & Gold Calculation
            </h2>
            <div className="flex items-center gap-2 mb-2">
