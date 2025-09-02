import React, { useState, useEffect } from 'react';
import { Calendar, Gem, Calculator, User, Phone, Save, FileText } from 'lucide-react';
import PageIdentifier from '../shared/PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const INREstimate = () => {
  // Ref for Item Code input
  const itemCodeRef = React.useRef(null);
  
  // Session-based authentication
  
  // Categories for wastage/making lookup
  const [categories, setCategories] = useState([]);

  // Section 1: Header & Customer Info
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [validUntil, setValidUntil] = useState(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days validity
    const yyyy = futureDate.getFullYear();
    const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
    const dd = String(futureDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [goldRate, setGoldRate] = useState('');
  const [goldRateEditable, setGoldRateEditable] = useState(false);

  // Section 2: Jewelry & Gold Calculation
  const [itemCode, setItemCode] = useState('');
  const [jewelryName, setJewelryName] = useState('');
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

  // Additional fields
  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

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
          setGoldRateError('Gold rate not found for today. Please enter today\'s rate manually.');
          setGoldRateEditable(true);
        }
      })
      .catch(() => {
        setGoldRate('');
        setGoldRateError('Failed to fetch gold rate. Please enter rate manually.');
        setGoldRateEditable(true);
      });
      
    // Fetch categories
    fetch('/api/categories', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {
        setCategories([]);
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

  // Fetch jewelry details by Item Code
  const fetchJewelryDetails = async (code) => {
    if (!code) return;
    try {
      const normalizedCode = code.trim().toUpperCase();
      const categoryCode = normalizedCode.split('-')[0];
      
      const res = await fetch(`/api/jewelry/details/${normalizedCode}`, { credentials: 'include' });
      const data = await res.json();
      if (data && data.code === normalizedCode) {
        setJewelryName(data.name || '');
        setPurity(data.gold_purity || '');
        setGrossWeight(data.gross_weight || '');
        setNetWeight(data.net_weight || '');
        
        setCertificationRequired(data.certificate === 'Yes');
        
        const stones = data.stones || [];
        setFetchedStones(stones);
        
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
      
      // Find category by code
      if (categoryCode && categories.length > 0) {
        const cat = categories.find(c => c.code === categoryCode);
        if (cat) {
          setCategoryInfo(cat);
          setWastagePercent(cat.wastage_charges || '');
          setMakingCharge(cat.making_charges || '');
        } else {
          setCategoryInfo(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch jewelry details', err);
      setFetchedStones([]);
      setDiamondCarats(0);
      setCertificationRequired(false);
    }
  };

  // Calculate diamond carats
  const calculateDiamondCarats = async (jewelryId, stones) => {
    try {
      const diamondRes = await fetch('/api/materials/category/Diamond', { credentials: 'include' });
      const diamondData = await diamondRes.json();
      
      if (diamondData && Array.isArray(diamondData)) {
        const diamondCodes = diamondData.map(material => material.code);
        const diamondStones = stones.filter(stone => 
          diamondCodes.includes(stone.stone_code)
        );
        const totalDiamondCarats = diamondStones.reduce((total, stone) => 
          total + (parseFloat(stone.weight) || 0), 0
        );
        setDiamondCarats(totalDiamondCarats);
      } else {
        setDiamondCarats(0);
      }
    } catch (err) {
      console.error('Failed to calculate diamond carats:', err);
      setDiamondCarats(0);
    }
  };

  // Save estimate
  const saveEstimate = async () => {
    try {
      setSaveStatus('saving');

      // Prepare stone details for JSON storage
      const stoneDetails = fetchedStones.map(stone => ({
        id: stone.id,
        code: stone.stone_code,
        name: stone.stone_name,
        weight: stone.weight,
        rate: stone.sale_price,
        cost: parseFloat(stone.weight) * parseFloat(stone.sale_price)
      }));

      const estimateData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        item_code: itemCode,
        jewelry_name: jewelryName,
        category_id: categoryInfo?.id || null,
        gold_purity: parseFloat(purity) || null,
        gross_weight: parseFloat(grossWeight) || null,
        net_weight: parseFloat(netWeight) || null,
        fine_weight: parseFloat(fineWeight) || null,
        gold_rate: parseFloat(goldRate) || null,
        gold_price: parseFloat(goldPrice) || null,
        gold_value: parseFloat(goldValue) || null,
        wastage_percent: parseFloat(wastagePercent) || null,
        wastage_amount: parseFloat(wastageAmount) || null,
        making_charge_per_gram: parseFloat(makingCharge) || null,
        making_amount: parseFloat(makingAmount) || null,
        total_gold_amount: parseFloat(totalGoldAmount) || null,
        stone_total: parseFloat(stoneTotal) || null,
        stone_details: stoneDetails,
        diamond_carats: parseFloat(diamondCarats) || null,
        certification_required: certificationRequired,
        certification_charges: 0, // Will be calculated on backend
        currency: 'INR',
        tax_rate: 3, // Default GST
        valid_until: validUntil,
        notes: notes
      };

      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(estimateData)
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error saving estimate:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const clearForm = () => {
    setItemCode('');
    setJewelryName('');
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
    setDiamondCarats(0);
    setCertificationRequired(false);
    setCategoryInfo(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    if (itemCodeRef.current) {
      itemCodeRef.current.focus();
    }
  };

  return (
    <div className="p-4 pb-12 min-h-screen bg-gray-100">
      <PageIdentifier pageId={SCREEN_IDS?.ESTIMATES?.INR_ESTIMATE || 'EST-001'} pageName="INR Estimate" />
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <Calculator className="mr-2" />
        INR Jewelry Estimate
      </h1>
      
      {/* Header Section - Customer & Date Info */}
      <div className="bg-white rounded shadow p-3 mb-4">
        <h2 className="text-base font-semibold mb-2 flex items-center">
          <User className="mr-2" size={16} />
          Customer Information & Estimate Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-2">
          <div>
            <label className="block text-xs font-medium mb-1">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Valid Until</label>
            <input 
              type="date" 
              value={validUntil} 
              onChange={(e) => setValidUntil(e.target.value)} 
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Customer Name *</label>
            <input 
              type="text" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)} 
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
              placeholder="Enter customer name"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Phone Number</label>
            <input 
              type="text" 
              value={customerPhone} 
              onChange={e => setCustomerPhone(e.target.value)} 
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Email</label>
            <input 
              type="email" 
              value={customerEmail} 
              onChange={e => setCustomerEmail(e.target.value)} 
              className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
              placeholder="Enter email"
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
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ height: '600px' }}>
        {/* Left side - Jewelry Details */}
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
              <label className="text-xs font-medium w-24 ml-4">Jewelry Name</label>
              <input
                type="text"
                value={jewelryName}
                onChange={e => setJewelryName(e.target.value)}
                className="border rounded px-2 py-1 text-xs flex-1"
                placeholder="Jewelry Name"
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
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <StoneSection onStoneTotalChange={setStoneTotal} initialStones={fetchedStones} />
            </div>
            
            {/* Notes Section */}
            <div className="mt-4 pt-4 border-t">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Add any special notes or requirements..."
              />
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-4 mt-4 pt-4 border-t">
              <button 
                className="bg-green-500 text-white px-6 py-3 rounded shadow hover:bg-green-600 font-medium flex items-center"
                onClick={saveEstimate}
                disabled={!customerName || saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2" size={16} />
                    Save Estimate
                  </>
                )}
              </button>
              <button className="bg-blue-500 text-white px-6 py-3 rounded shadow hover:bg-blue-600 font-medium flex items-center" onClick={() => window.print()}>
                <FileText className="mr-2" size={16} />
                Print
              </button>
              <button
                className="bg-gray-500 text-white px-6 py-3 rounded shadow hover:bg-gray-600 font-medium"
                onClick={clearForm}
              >
                Clear
              </button>
            </div>
            
            {/* Save Status */}
            {saveStatus && (
              <div className={`mt-2 p-2 rounded text-sm ${
                saveStatus === 'saved' ? 'bg-green-100 text-green-800' :
                saveStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {saveStatus === 'saved' && 'Estimate saved successfully!'}
                {saveStatus === 'error' && 'Error saving estimate. Please try again.'}
                {saveStatus === 'saving' && 'Saving estimate...'}
              </div>
            )}
          </div>
        </div>
        
        {/* Right: Totals & Taxes */}
        <div className="bg-white rounded shadow p-3 flex flex-col justify-start h-full">
          <h2 className="text-base font-semibold mb-2">Totals & Taxes (INR)</h2>
          <EstimateTotalSection 
            totalGoldAmount={totalGoldAmount} 
            stoneTotal={stoneTotal}
            diamondCarats={diamondCarats}
            certificationRequired={certificationRequired}
            categoryInfo={categoryInfo}
          />
        </div>
      </div>
    </div>
  );
};

// Stone Section Component (same as billing)
function StoneSection({ onStoneTotalChange, initialStones = [] }) {
  const [stones, setStones] = useState([]);

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

// Total Section Component for Estimates
function EstimateTotalSection({ totalGoldAmount, stoneTotal, diamondCarats, certificationRequired, categoryInfo }) {
  const [certChargePerCarat, setCertChargePerCarat] = useState(0);
  const [gst, setGst] = useState(3);
  const [taxTotal, setTaxTotal] = useState('0.00');
  const [grandTotal, setGrandTotal] = useState('0.00');
  const [calculatedCertCharges, setCalculatedCertCharges] = useState(0);

  // Helper to get auth headers
  // Session-based authentication

  // Update certification charge per carat when category changes
  useEffect(() => {
    if (categoryInfo && categoryInfo.certification_charges) {
      setCertChargePerCarat(categoryInfo.certification_charges);
    } else {
      setCertChargePerCarat(0);
    }
  }, [categoryInfo]);

  // Fetch tax rates on mount
  useEffect(() => {
    fetch('/api/rates/tax/latest', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.rate && data.rate.gst_percentage) {
          setGst(data.rate.gst_percentage);
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
    
    let certAmt = 0;
    if (certificationRequired && diamondCarats > 0) {
      certAmt = diamondCarats * parseFloat(certChargePerCarat || 0);
    }
    setCalculatedCertCharges(certAmt);
    
    const jewelValue = goldAmt + stoneAmt + certAmt;
    const gstAmount = (jewelValue * (parseFloat(gst) || 0)) / 100;
    setTaxTotal(gstAmount.toFixed(2));
    setGrandTotal((jewelValue + gstAmount).toFixed(2));
  }, [totalGoldAmount, stoneTotal, certChargePerCarat, gst, certificationRequired, diamondCarats]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div>
          <label className="block text-sm font-medium mb-2">Certification Charges</label>
          <input 
            type="text" 
            value={`₹${calculatedCertCharges.toFixed(2)}`}
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">GST (%)</label>
          <input 
            type="number" 
            value={gst || ''} 
            onChange={e => setGst(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Total Taxes (GST)</label>
            <input 
              type="text" 
              value={`₹${taxTotal}`} 
              readOnly 
              className="w-full border rounded-md px-3 py-3 bg-yellow-50 font-medium text-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-bold mb-2 text-green-700">Grand Total (INR)</label>
            <input 
              type="text" 
              value={`₹${grandTotal}`} 
              readOnly 
              className="w-full border-2 border-green-500 rounded-md px-3 py-3 bg-green-50 font-bold text-lg text-green-800"
            />
          </div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2">Estimate Summary</h3>
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
            <span>Total Taxes (GST {gst}%):</span>
            <span>₹{taxTotal}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-1">
            <span>Grand Total:</span>
            <span className="text-green-600">₹{grandTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default INREstimate;
