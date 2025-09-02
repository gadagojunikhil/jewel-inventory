import React, { useState, useEffect } from 'react';
import { Calendar, Gem, DollarSign, User, Phone, Plus, Trash2 } from 'lucide-react';
import PageIdentifier from '../shared/PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const USBilling = () => {
  // Ref for Item Code input
  const itemCodeRef = React.useRef(null);
  
  // Session-based authentication
  
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
  const [diamondCarats, setDiamondCarats] = useState(0);
  const [certificationRequired, setCertificationRequired] = useState(false);
  const [categoryInfo, setCategoryInfo] = useState(null);

  // Fetch rates and categories on mount
  const [goldRateError, setGoldRateError] = useState('');
  
  useEffect(() => {
    // Fetch gold rate
    fetch('/api/rates/gold/today', { credentials: 'include' })
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
    fetch('/api/rates/dollar/today', { credentials: 'include' })
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
    fetch('/api/categories', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          console.log('Categories loaded:', data); // Debug log
          setCategories(data);
        } else {
          setCategories([
            { id: 1, name: 'Rings', code: 'RNG', wastage_charges: 8, making_charges: 500 },
            { id: 2, name: 'Necklaces', code: 'DNS', wastage_charges: 10, making_charges: 800 },
            { id: 3, name: 'Earrings', code: 'EAR', wastage_charges: 6, making_charges: 400 }
          ]);
        }
      })
      .catch(() => {
        setCategories([
          { id: 1, name: 'Rings', code: 'RNG', wastage_charges: 8, making_charges: 500 },
          { id: 2, name: 'Necklaces', code: 'DNS', wastage_charges: 10, making_charges: 800 },
          { id: 3, name: 'Earrings', code: 'EAR', wastage_charges: 6, making_charges: 400 }
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
      // Gold rate is already per gram, just apply purity
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
      const normalizedCode = code.trim().toUpperCase();
      
      // Extract category code from item code (e.g., DNS-1 -> DNS)
      const categoryCode = normalizedCode.split('-')[0];
      
      const res = await fetch(`/api/jewelry/details/${normalizedCode}`, { credentials: 'include' });
      const data = await res.json();
      if (data && data.code === normalizedCode) {
        setPurity(data.gold_purity || '');
        setGrossWeight(data.gross_weight || '');
        setNetWeight(data.net_weight || '');
        
        // Set certification requirement from jewelry_pieces table
        setCertificationRequired(data.certificate === 'Yes');
        
        // Auto-populate stones
        const stones = data.stones || [];
        setFetchedStones(stones);
        
        // Calculate total diamond carats if certification is required
        if (data.certificate === 'Yes') {
          await calculateDiamondCarats(data.id, stones);
        } else {
          setDiamondCarats(0);
        }
      } else {
        setFetchedStones([]);
        setDiamondCarats(0);
        setCertificationRequired(false);
      }
      
      // Find category by code to get wastage/making/certification charges
      if (categoryCode && categories.length > 0) {
        const cat = categories.find(c => c.code === categoryCode);
        if (cat) {
          console.log('Found category:', cat); // Debug log
          setCategoryInfo(cat);
          setWastagePercent(cat.wastage_charges || cat.wastageCharges || '');
          setMakingCharge(cat.making_charges || cat.makingCharges || '');
        } else {
          console.log('Category not found for code:', categoryCode, 'Available categories:', categories); // Debug log
          // If direct match not found, try finding by name
          const catByName = categories.find(c => c.name?.toUpperCase().includes(categoryCode));
          if (catByName) {
            console.log('Found category by name:', catByName); // Debug log
            setCategoryInfo(catByName);
            setWastagePercent(catByName.wastage_charges || catByName.wastageCharges || '');
            setMakingCharge(catByName.making_charges || catByName.makingCharges || '');
          } else {
            setCategoryInfo(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch jewelry details', err);
      setFetchedStones([]);
      setDiamondCarats(0);
      setCertificationRequired(false);
    }
  };

  // Calculate diamond carats based on materials table and jewelry_stones
  const calculateDiamondCarats = async (jewelryId, stones) => {
    try {
      // First, get all diamond material codes from materials table
      const diamondRes = await fetch('/api/materials/category/Diamond', { credentials: 'include' });
      const diamondData = await diamondRes.json();
      
      if (diamondData && Array.isArray(diamondData)) {
        const diamondCodes = diamondData.map(material => material.code);
        console.log('Diamond codes from materials:', diamondCodes);
        
        // Filter stones that match diamond codes and calculate total weight
        const diamondStones = stones.filter(stone => 
          diamondCodes.includes(stone.stone_code)
        );
        
        const totalDiamondCarats = diamondStones.reduce((total, stone) => 
          total + (parseFloat(stone.weight) || 0), 0
        );
        
        console.log('Diamond stones found:', diamondStones);
        console.log('Total diamond carats:', totalDiamondCarats);
        
        setDiamondCarats(totalDiamondCarats);
      } else {
        setDiamondCarats(0);
      }
    } catch (err) {
      console.error('Failed to calculate diamond carats:', err);
      setDiamondCarats(0);
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
    setStones([]);
    setDiamondCarats(0);
    setCertificationRequired(false);
    setCategoryInfo(null);
    if (itemCodeRef.current) {
      itemCodeRef.current.focus();
    }
  };

  // Stones state moved here to be at the top level of the component
  const [stones, setStones] = useState([]);

  return (
    <div className="p-4 pb-12 min-h-screen bg-gray-100">
      <PageIdentifier pageId={SCREEN_IDS?.BILLING?.US_BILLING || 'BILL-002'} pageName="US Billing" />
      <h1 className="text-2xl font-bold mb-4">US Jewelry Billing</h1>
      
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
            <label className="block text-xs font-medium mb-1">Gold Rate (INR)</label>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ height: '600px' }}>
        {/* Left side */}
        <div className="flex flex-col gap-4 h-full">
          <div className="bg-white rounded shadow p-3 flex flex-col justify-start" style={{ height: '40%' }}>
            <h2 className="text-base font-semibold mb-2 flex items-center">
              <Gem className="mr-2" size={16} />
              Jewelry & Gold Calculation
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-medium w-24">Item Code</label>
              <input
                type="text"
                value={itemCode}
                ref={itemCodeRef}
                onChange={e => setItemCode(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fetchJewelryDetails(itemCode);
                  }
                }}
                className="border rounded px-2 py-1 text-xs w-28"
                placeholder="Item Code"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs font-medium w-24">Purity</label>
                <input
                  type="text"
                  value={purity ? `${purity} K` : ''}
                  onChange={e => setPurity(e.target.value.replace(/[^0-9]/g, ''))}
                  className="border rounded px-2 py-1 text-xs w-28"
                  placeholder="Purity"
                />
              </div>
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs font-medium w-24">Gross Wt</label>
                <input type="number" value={grossWeight} onChange={e => setGrossWeight(e.target.value)} className="border rounded px-2 py-1 text-xs w-28" placeholder="Gross Wt" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs font-medium w-24">Net Wt</label>
                <input type="number" value={netWeight} onChange={e => setNetWeight(e.target.value)} className="border rounded px-2 py-1 text-xs w-28" placeholder="Net Wt" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs font-medium w-24">Fine Wt</label>
                <input type="number" value={fineWeight} readOnly className="border rounded px-2 py-1 text-xs bg-gray-100 w-28" placeholder="Fine Wt" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs font-medium w-24">Gold Price</label>
                <input type="number" value={goldPrice} readOnly className="border rounded px-2 py-1 text-xs bg-gray-100 w-28" placeholder="Gold Price" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs font-medium w-24">Gold Value</label>
                <input type="number" value={goldValue} readOnly className="border rounded px-2 py-1 text-xs bg-gray-100 w-28" placeholder="Gold Value" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs font-medium w-24">Wastage %</label>
                <input type="number" value={wastagePercent} onChange={e => setWastagePercent(e.target.value)} className="border rounded px-2 py-1 text-xs w-28" placeholder="Wastage %" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs font-medium w-24">Wastage Amt</label>
                <input type="number" value={wastageAmount} readOnly className="border rounded px-2 py-1 text-xs bg-gray-100 w-28" placeholder="Wastage Amt" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs font-medium w-24">Making/gram</label>
                <input type="number" value={makingCharge} onChange={e => setMakingCharge(e.target.value)} className="border rounded px-2 py-1 text-xs w-28" placeholder="Making/gram" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs font-medium w-24">Making Amt</label>
                <input type="number" value={makingAmount} readOnly className="border rounded px-2 py-1 text-xs bg-gray-100 w-28" placeholder="Making Amt" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <label className="text-xs font-medium w-24">Total Gold</label>
                <input type="number" value={totalGoldAmount} readOnly className="border rounded px-2 py-1 text-xs bg-green-100 font-bold text-green-800 w-28" placeholder="Total Gold" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-3 flex flex-col justify-start" style={{ height: '60%' }}>
            <h2 className="text-base font-semibold mb-2">Stone Details</h2>
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              <StoneSection onStoneTotalChange={setStoneTotal} initialStones={fetchedStones} />
            </div>
            
            {/* Print and Clear buttons moved inside Stone Details section */}
            <div className="flex gap-4 mt-4 pt-4 border-t">
              <button className="bg-blue-500 text-white px-6 py-3 rounded shadow hover:bg-blue-600 font-medium" onClick={() => window.print()}>
                Print
              </button>
              <button
                className="bg-gray-500 text-white px-6 py-3 rounded shadow hover:bg-gray-600 font-medium"
                onClick={clearForm}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        
        {/* Right: Totals & Taxes */}
        <div className="bg-white rounded shadow p-3 flex flex-col justify-start h-full">
          <h2 className="text-base font-semibold mb-2">Totals & Taxes (USD)</h2>
          <TotalSection 
            totalGoldAmount={totalGoldAmount} 
            stoneTotal={stoneTotal} 
            dollarRate={dollarRate}
            diamondCarats={diamondCarats}
            certificationRequired={certificationRequired}
            setCertificationRequired={setCertificationRequired}
            setDiamondCarats={setDiamondCarats}
            categoryInfo={categoryInfo}
          />
        </div>
      </div>
    </div>
  );
};

// Stone Section Component
function StoneSection({ onStoneTotalChange, initialStones = [] }) {
  const [stones, setStones] = useState([]);

  // Accept initial stones from parent
  useEffect(() => {
    if (Array.isArray(initialStones) && initialStones.length > 0) {
      setStones(initialStones.map((stone, idx) => {
        const weight = parseFloat(stone.weight) || 0;
        return {
          id: stone.id || idx,
          code: stone.stone_code || '',
          name: stone.stone_name || '',
          weight,
          rate: parseFloat(stone.sale_price) || 0,
          cost: weight * (parseFloat(stone.sale_price) || 0),
        };
      }));
    } else {
      // Clear stones when initialStones is empty
      setStones([]);
    }
  }, [initialStones]);

  useEffect(() => {
    const total = stones.reduce((sum, stone) => sum + parseFloat(stone.cost || 0), 0);
    onStoneTotalChange(total);
  }, [stones, onStoneTotalChange]);

  const updateStone = (id, field, value) => {
    setStones(stones.map(stone => {
      if (stone.id === id) {
        const updatedStone = { ...stone, [field]: parseFloat(value) || 0 };
        if (field === 'rate') {
          updatedStone.cost = updatedStone.weight * updatedStone.rate;
        }
        return updatedStone;
      }
      return stone;
    }));
  };

  return (
    <div className="space-y-2">
      {stones.length > 0 && (
        <div className="mt-1">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-2 py-1 text-left">Stone Code</th>
                  <th className="border px-2 py-1 text-left">Stone Name</th>
                  <th className="border px-2 py-1 text-left">Weight (ct)</th>
                  <th className="border px-2 py-1 text-left">Rate</th>
                  <th className="border px-2 py-1 text-left">Cost (₹)</th>
                </tr>
              </thead>
              <tbody>
                {stones.map(stone => (
                  <tr key={stone.id}>
                    <td className="border px-2 py-1">{stone.code}</td>
                    <td className="border px-2 py-1">{stone.name}</td>
                    <td className="border px-2 py-1">{stone.weight}</td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={stone.rate}
                        onChange={e => updateStone(stone.id, 'rate', e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs w-16"
                      />
                    </td>
                    <td className="border px-2 py-1">₹{stone.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-1 text-right">
            <span className="font-bold">Total Stone Cost: ₹{stones.reduce((sum, stone) => sum + stone.cost, 0).toFixed(2)}</span>
          </div>
        </div>
      )}
      {stones.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No stones data available
        </div>
      )}
    </div>
  );
}

// Total Section Component - Modified for US Billing
function TotalSection({ totalGoldAmount, stoneTotal, dollarRate, diamondCarats: propDiamondCarats, certificationRequired: propCertificationRequired, setCertificationRequired, setDiamondCarats, categoryInfo }) {
  const [certChargePerCarat, setCertChargePerCarat] = useState(0); // Will be set from category
  const [totalTaxPercent, setTotalTaxPercent] = useState(13.75); // Default combined tax percentage
  const [taxTotal, setTaxTotal] = useState('0.00');
  const [grandTotal, setGrandTotal] = useState('0.00');
  const [grandTotalUSD, setGrandTotalUSD] = useState('0.00');
  const [certificationRequired, setCertificationRequiredLocal] = useState(propCertificationRequired || false);
  const [diamondCarats, setDiamondCaratsLocal] = useState(propDiamondCarats || 0);
  const [calculatedCertCharges, setCalculatedCertCharges] = useState(0);

  // Update certification charge per carat when category changes
  useEffect(() => {
    if (categoryInfo && categoryInfo.certification_charges) {
      setCertChargePerCarat(categoryInfo.certification_charges);
    } else {
      setCertChargePerCarat(0);
    }
  }, [categoryInfo]);

  // Sync with parent props
  useEffect(() => {
    setCertificationRequiredLocal(propCertificationRequired || false);
  }, [propCertificationRequired]);

  useEffect(() => {
    setDiamondCaratsLocal(propDiamondCarats || 0);
  }, [propDiamondCarats]);

  // Update parent when local state changes
  const handleCertificationChange = (value) => {
    setCertificationRequiredLocal(value);
    if (setCertificationRequired) {
      setCertificationRequired(value);
    }
  };

  const handleDiamondCaratsChange = (value) => {
    setDiamondCaratsLocal(value);
    if (setDiamondCarats) {
      setDiamondCarats(value);
    }
  };

  // Fetch tax rates on mount
  useEffect(() => {
    fetch('/api/rates/tax/latest', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.rate) {
          const customsDuty = parseFloat(data.rate.customs_duty) || 0;
          const stateTax = parseFloat(data.rate.state_tax) || 0;
          setTotalTaxPercent(customsDuty + stateTax);
        }
      })
      .catch(() => {
        // Keep default value on error
      });
  }, []);

  // Calculate certification charges and totals
  useEffect(() => {
    const goldAmt = parseFloat(totalGoldAmount || 0);
    const stoneAmt = parseFloat(stoneTotal || 0);
    
    // Calculate certification charges based on diamond carats if certification is required
    let certAmt = 0;
    if (certificationRequired && diamondCarats > 0) {
      certAmt = diamondCarats * parseFloat(certChargePerCarat || 0);
    }
    setCalculatedCertCharges(certAmt);
    
    const jewelValueINR = goldAmt + stoneAmt + certAmt;
    
    // Convert to USD first
    let jewelValueUSD = 0;
    if (dollarRate && parseFloat(dollarRate) > 0) {
      jewelValueUSD = jewelValueINR / parseFloat(dollarRate);
    }
    
    // Calculate tax on USD value
    const taxAmountUSD = (jewelValueUSD * (parseFloat(totalTaxPercent) || 0)) / 100;
    
    // Convert tax back to INR for display
    const taxAmountINR = taxAmountUSD * parseFloat(dollarRate || 1);
    setTaxTotal(taxAmountINR.toFixed(2));
    
    const grandTotalINR = jewelValueINR + taxAmountINR;
    setGrandTotal(grandTotalINR.toFixed(2));
    
    const grandTotalInUSD = jewelValueUSD + taxAmountUSD;
    setGrandTotalUSD(grandTotalInUSD.toFixed(2));
  }, [totalGoldAmount, stoneTotal, certChargePerCarat, totalTaxPercent, dollarRate, certificationRequired, diamondCarats]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Total Gold Amount</label>
          <input 
            type="text" 
            value={`₹${parseFloat(totalGoldAmount || 0).toFixed(2)}`} 
            readOnly 
            className="w-full border rounded-md px-3 py-2 bg-gray-100 font-medium"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Total Stone Cost</label>
          <input 
            type="text" 
            value={`₹${parseFloat(stoneTotal || 0).toFixed(2)}`} 
            readOnly 
            className="w-full border rounded-md px-3 py-2 bg-gray-100 font-medium"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Cert Charge per Carat</label>
          <input 
            type="number" 
            value={certChargePerCarat} 
            readOnly
            className="w-full border rounded-md px-3 py-2 bg-gray-100 font-medium"
            placeholder="700.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Total Tax %</label>
          <input 
            type="number" 
            value={totalTaxPercent || ''} 
            onChange={e => setTotalTaxPercent(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="13.75"
          />
        </div>
      </div>
      <div className="border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Total Taxes (INR)</label>
            <input 
              type="text" 
              value={`₹${taxTotal}`} 
              readOnly 
              className="w-full border rounded-md px-3 py-3 bg-yellow-50 font-medium text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Grand Total (INR)</label>
            <input 
              type="text" 
              value={`₹${grandTotal}`} 
              readOnly 
              className="w-full border rounded-md px-3 py-3 bg-blue-50 font-medium text-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-lg font-bold mb-2 text-green-700">Grand Total (USD)</label>
          <input 
            type="text" 
            value={`$${grandTotalUSD}`} 
            readOnly 
            className="w-full border-2 border-green-500 rounded-md px-3 py-3 bg-green-50 font-bold text-xl text-green-800"
          />
          {/* {dollarRate && (
            <div className="text-xs text-gray-600 mt-1">
              Exchange Rate: 1 USD = ₹{dollarRate}
            </div>
          )} */}
        </div>
      </div>
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2">Summary</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Gold Amount:</span>
            <span>₹{parseFloat(totalGoldAmount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Stone Cost:</span>
            <span>₹{parseFloat(stoneTotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Certification:</span>
            <span>₹{calculatedCertCharges.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span>Subtotal:</span>
            <span>₹{(parseFloat(totalGoldAmount || 0) + parseFloat(stoneTotal || 0) + calculatedCertCharges).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Taxes:</span>
            <span>₹{taxTotal}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-1">
            <span>Grand Total (INR):</span>
            <span className="text-blue-600">₹{grandTotal}</span>
          </div>
          <div className="flex justify-between font-bold text-xl border-t pt-1">
            <span>Grand Total (USD):</span>
            <span className="text-green-600">${grandTotalUSD}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default USBilling;
