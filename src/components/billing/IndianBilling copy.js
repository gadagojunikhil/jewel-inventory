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
      const normalizedCode = code.trim().toUpperCase(); // Normalize the item code to uppercase
      const res = await fetch(`/api/jewelry/details/${normalizedCode}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data && data.code === normalizedCode) {
        setPurity(data.gold_purity || '');
        setGrossWeight(data.gross_weight || '');
        setNetWeight(data.net_weight || '');
        // Auto-populate wastage/making from category
        if (data.category_id && categories.length > 0) {
          const cat = categories.find(c => c.id === data.category_id);
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
        // Auto-populate stones
        setFetchedStones(data.stones || []);
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
    setFetchedStones([]); // Clear fetched stones
    setStoneTotal(0); // Reset stone total
    setStones([]); // Explicitly clear Stone Details
    if (itemCodeRef.current) {
      itemCodeRef.current.focus();
    }
  };

  // Stones state moved here to be at the top level of the component
  const [stones, setStones] = useState([]); // Ensure stones state is declared

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
            <label className="block text-xs font-medium mb-1">Gold Rate</label>
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
          <div className="bg-white rounded shadow p-3 flex flex-col justify-start" style={{ height: '50%' }}>
            <h2 className="text-base font-semibold mb-2">Stone Details</h2>
            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <StoneSection onStoneTotalChange={setStoneTotal} initialStones={fetchedStones} />
            </div>
          </div>
        </div>
        
        {/* Right: Totals & Taxes */}
        <div className="bg-white rounded shadow p-3 flex flex-col justify-start h-full">
          <h2 className="text-base font-semibold mb-2">Totals & Taxes</h2>
          <TotalSection totalGoldAmount={totalGoldAmount} stoneTotal={stoneTotal} />
        </div>
      </div>
      
      {/* Print and Clear buttons moved outside the Stone Details section */}
      <div className="flex gap-4 mt-4 mb-4">
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
    </div>
  );
}

// Total Section Component
function TotalSection({ totalGoldAmount, stoneTotal }) {
  const [certCharges, setCertCharges] = useState('');
  const [gst, setGst] = useState(3);
  const [taxTotal, setTaxTotal] = useState('0.00');
  const [grandTotal, setGrandTotal] = useState('0.00');

  useEffect(() => {
    fetch('/api/rates/tax/latest')
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

  useEffect(() => {
    const jewelValue = parseFloat(totalGoldAmount || 0) + parseFloat(stoneTotal || 0) + parseFloat(certCharges || 0);
    // Only GST for Indian Billing
    const gstAmount = (jewelValue * (parseFloat(gst) || 0)) / 100;
    setTaxTotal(gstAmount.toFixed(2));
    setGrandTotal((jewelValue + gstAmount).toFixed(2));
  }, [totalGoldAmount, stoneTotal, certCharges, gst]); // Ensure Total Taxes updates correctly

  // Ensure StoneSection reacts to stones reset
  useEffect(() => {
    if (fetchedStones.length === 0) {
      setStoneTotal(0);
    }
  }, [fetchedStones]); // Updated to use fetchedStones instead of stones

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Total Gold Amount</label>
          <input 
            type="number" 
            value={`₹${totalGoldAmount}`} 
            readOnly 
            className="w-full border rounded-md px-3 py-2 bg-gray-100 font-medium"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Total Stone Cost</label>
          <input 
            type="number" 
            value={`₹${stoneTotal.toFixed(2)}`} 
            readOnly 
            className="w-full border rounded-md px-3 py-2 bg-gray-100 font-medium"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Certification Charges</label>
          <input 
            type="number" 
            value={certCharges} 
            onChange={e => setCertCharges(e.target.value)} 
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">GST (%)</label>
          <input 
            type="number" 
            value={gst || ''} 
            readOnly 
            className="w-full border rounded-md px-3 py-2 bg-gray-100"
          />
        </div>
      </div>
      <div className="border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Total Taxes</label>
            <input 
              type="number" 
              value={`₹${taxTotal}`} 
              readOnly 
              className="w-full border rounded-md px-3 py-2 bg-yellow-50 font-medium"
            />
          </div>
          <div>
            <label className="block text-lg font-bold mb-2 text-green-700">Grand Total (₹)</label>
            <input 
              type="number" 
              value={`₹${grandTotal}`} 
              readOnly 
              className="w-full border-2 border-green-500 rounded-md px-3 py-3 bg-green-50 font-bold text-lg text-green-800"
            />
          </div>
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
            <span>₹{stoneTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Certification:</span>
            <span>₹{parseFloat(certCharges || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span>Subtotal:</span>
            <span>₹{(parseFloat(totalGoldAmount || 0) + stoneTotal + parseFloat(certCharges || 0)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Taxes:</span>
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

export default IndianBilling;
