import React, { useState, useEffect } from 'react';
import { Calendar, Gem, DollarSign, User, Phone, Plus, Trash2 } from 'lucide-react';

const USBilling = () => {
	// Categories for wastage/making lookup
	const [categories, setCategories] = useState([]);

	// Section 1: Header & Rates
	const [date, setDate] = useState(() => {
		const today = new Date();
		return today.toISOString().split('T')[0];
	});
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [goldRate, setGoldRate] = useState('');
	const [dollarRate, setDollarRate] = useState('');
	const [customsDuty, setCustomsDuty] = useState('');
	const [stateTax, setStateTax] = useState('');

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
	useEffect(() => {
		// Fetch gold and dollar rates from ManualRateEntry (UTIL-003)
		fetch('/api/rates/gold/today')
			.then(res => res.json())
			.then(data => {
				if (data.success && data.rate) {
					setGoldRate(data.rate.gold_24k_per_10g);
				}
			});
		fetch('/api/rates/dollar/today')
			.then(res => res.json())
			.then(data => {
				if (data.success && data.rate) {
					setDollarRate(data.rate.usd_to_inr);
				}
			});
		// Fetch categories
		fetch('/api/categories')
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
			const res = await fetch(`/api/jewelry?search=${code}`);
			const data = await res.json();
			if (Array.isArray(data) && data.length > 0) {
				const item = data[0];
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
				// Auto-populate stones
				let stones = [];
				if (item.stones) {
					try {
						stones = typeof item.stones === 'string' ? JSON.parse(item.stones) : item.stones;
					} catch (e) {
						stones = [];
					}
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

	return (
		<div className="w-full max-w-screen-xl mx-auto bg-gray-50" style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden', padding: '12px' }}>
			<h1 className="text-2xl font-bold mb-2 text-gray-800">US Jewelry Billing</h1>
			{/* Section 1: Basic Info & Rates (full width) */}
			<div className="bg-white rounded shadow p-3 mb-2 w-full">
				<h2 className="text-base font-semibold mb-2 flex items-center">
					<Calendar className="mr-2" size={16} /> Basic Info & Rates
				</h2>
				<div className="grid grid-cols-2 gap-2 mb-2">
					<div className="flex items-center gap-2 w-full">
						<label className="text-xs font-medium w-24">Date</label>
						<input type="date" value={date} onChange={handleDateChange} className="border rounded px-2 py-1 text-xs w-28" />
					</div>
					<div className="flex items-center gap-2 w-full">
						<label className="text-xs font-medium w-24">Gold Rate</label>
						<input type="number" value={goldRate} readOnly className="border rounded px-2 py-1 text-xs w-28 bg-gray-100" placeholder="Gold Rate (UTIL-003)" />
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2 mb-2">
					<div className="flex items-center gap-2 w-full">
						<label className="text-xs font-medium w-24">USD/INR</label>
						<input type="number" value={dollarRate} readOnly className="border rounded px-2 py-1 text-xs w-28 bg-gray-100" placeholder="USD/INR" />
					</div>
					<div className="flex items-center gap-2 w-full">
						<label className="text-xs font-medium w-24">Customs Duty (%)</label>
						<input type="number" value={customsDuty} onChange={e => setCustomsDuty(e.target.value)} className="border rounded px-2 py-1 text-xs w-28" placeholder="Customs Duty" />
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<div className="flex items-center gap-2 w-full">
						<label className="text-xs font-medium w-24">State Tax (%)</label>
						<input type="number" value={stateTax} onChange={e => setStateTax(e.target.value)} className="border rounded px-2 py-1 text-xs w-28" placeholder="State Tax" />
					</div>
					<div className="flex items-center gap-2 w-full">
						<label className="text-xs font-medium w-24">Customer Name</label>
						<input type="text" value={name} onChange={e => setName(e.target.value)} className="border rounded px-2 py-1 text-xs w-80" placeholder="Customer Name" />
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2 mt-2">
					<div className="flex items-center gap-2 w-full">
						<label className="text-xs font-medium w-24">Phone</label>
						<input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="border rounded px-2 py-1 text-xs w-28" placeholder="Phone" />
					</div>
				</div>
			</div>
			{/* Section 2 & 3: Jewelry & Gold and Stones side-by-side, Section 4: Totals & Taxes on right */}
			<div className="grid grid-cols-2 gap-3" style={{ height: 'calc(100vh - 200px)' }}>
				{/* Left: Jewelry & Gold and Stones stacked */}
				<div className="flex flex-col gap-3 h-full">
					<div className="bg-white rounded shadow p-3 flex flex-col justify-start" style={{ height: '50%' }}>
						<h2 className="text-base font-semibold mb-2 flex items-center">
							<Gem className="mr-2" size={16} /> Jewelry & Gold
						</h2>
						{/* Jewelry & Gold Inputs */}
						<div className="grid grid-cols-2 gap-2 mb-2">
							<div className="flex items-center gap-2 w-full">
								<label className="text-xs font-medium w-24">Item Code</label>
								<input type="text" value={itemCode} onChange={e => setItemCode(e.target.value)} onKeyDown={e => {if (e.key === 'Enter') fetchJewelryDetails(itemCode);}} className="border rounded px-2 py-1 text-xs w-28" placeholder="Item Code" />
							</div>
							<div className="flex items-center gap-2 w-full">
								<label className="text-xs font-medium w-24">Purity</label>
								<input type="number" value={purity} onChange={e => setPurity(e.target.value)} className="border rounded px-2 py-1 text-xs w-28" placeholder="Purity" />
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
