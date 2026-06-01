// frontend/src/pages/EditBill.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, ArrowLeftIcon, CalculatorIcon } from '@heroicons/react/24/outline';

export default function EditBill() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    aadharNumber: '',
  });

  const [products, setProducts] = useState([
    {
      quantity: 1,
      name: '',
      description: '',
      chassisNumber: '',
      motorNumber: '',
      battery: '',
      model: '',
      color: '',
      batteryType: '',
      motorPower: '',
      range: '',
      topSpeed: '',
      chargingTime: '',
      controller: '',
      wheelSize: '',
      unitPrice: 0,
      gstAmount: 0,
      totalPrice: 0,
    }
  ]);

  const [paymentMode, setPaymentMode] = useState('cash');
  const [specialInstructions, setSpecialInstructions] = useState({
    motorWarranty: '12 months',
    batteryWarranty: '12 months',
    otherComments: 'Warranty:\n- Motor, Controller & Charger: 12 months\n- Battery: 12 months\n\nIf you have any questions about this invoice, please contact the above given numbers.\nThank you.',
  });

  const [gstRate, setGstRate] = useState(0);
  const [totals, setTotals] = useState({ subtotal: 0, gstTotal: 0, grandTotal: 0 });

  const API_BASE_URL = 'https://evbackend-3jlc.onrender.com/api';

  useEffect(() => {
    fetchBillAndBusiness();
  }, [id]);

  // Recalculate totals whenever products or gstRate changes
  useEffect(() => {
    calculateTotals();
  }, [products, gstRate]);

  const fetchBillAndBusiness = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [billRes, businessRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/bills/${id}`, { headers }),
        axios.get(`${API_BASE_URL}/business/details`, { headers })
      ]);

      const bill = billRes.data;
      const businessData = businessRes.data;

      // Set business details
      setBusiness(businessData);
      setGstRate(businessData.gstRate || 0);

      // Set customer details
      if (bill.customerDetails) {
        setCustomerDetails({
          name: bill.customerDetails.name || '',
          phoneNumber: bill.customerDetails.phoneNumber || '',
          address: bill.customerDetails.address || '',
          aadharNumber: bill.customerDetails.aadharNumber || '',
        });
      }

      // Set products with all fields
      if (bill.products && bill.products.length > 0) {
        const formattedProducts = bill.products.map(product => ({
          quantity: product.quantity || 1,
          name: product.name || '',
          description: product.description || '',
          chassisNumber: product.chassisNumber || '',
          motorNumber: product.motorNumber || '',
          battery: product.battery || '',
          model: product.model || '',
          color: product.color || '',
          batteryType: product.batteryType || '',
          motorPower: product.motorPower || '',
          range: product.range || '',
          topSpeed: product.topSpeed || '',
          chargingTime: product.chargingTime || '',
          controller: product.controller || '',
          wheelSize: product.wheelSize || '',
          unitPrice: product.unitPrice || 0,
          gstAmount: product.gstAmount || 0,
          totalPrice: product.totalPrice || 0,
        }));
        setProducts(formattedProducts);
      }

      // Set payment mode
      if (bill.paymentMode) {
        setPaymentMode(bill.paymentMode);
      }

      // Set special instructions
      if (bill.specialInstructions) {
        setSpecialInstructions({
          motorWarranty: bill.specialInstructions.motorWarranty || '12 months',
          batteryWarranty: bill.specialInstructions.batteryWarranty || '12 months',
          otherComments: bill.specialInstructions.otherComments || '',
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('Bill not found');
        navigate('/bills');
      } else {
        toast.error('Failed to load bill data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

const handleProductChange = (index, field, value) => {
  const updatedProducts = [...products];

  if (field === 'quantity' || field === 'unitPrice') {
    updatedProducts[index][field] = Number(value) || 0;
  } else {
    updatedProducts[index][field] = value;
  }

  const qty = Number(updatedProducts[index].quantity) || 0;
  const unitPrice = Number(updatedProducts[index].unitPrice) || 0;

  // Grand Total (selling price)
  const grandTotal = qty * unitPrice;

  // GST from business settings
  const gstAmount = (grandTotal * gstRate) / 100;

  // Subtotal excluding GST
  const subTotal = grandTotal - gstAmount;

  updatedProducts[index].priceWithoutGst = Number(
    subTotal.toFixed(2)
  );

  updatedProducts[index].gstAmount = Number(
    gstAmount.toFixed(2)
  );

  updatedProducts[index].totalPrice = Number(
    grandTotal.toFixed(2)
  );

  setProducts(updatedProducts);
};

  const addProduct = () => {
    setProducts([...products, {
      quantity: 1,
      name: '',
      description: '',
      chassisNumber: '',
      motorNumber: '',
      battery: '',
      model: '',
      color: '',
      batteryType: '',
      motorPower: '',
      range: '',
      topSpeed: '',
      chargingTime: '',
      controller: '',
      wheelSize: '',
      unitPrice: 0,
      gstAmount: 0,
      totalPrice: 0,
    }]);
  };

  const removeProduct = (index) => {
    if (products.length > 1) {
      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);
    } else {
      toast.error('At least one product is required');
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let gstTotal = 0;

    products.forEach(product => {
      const productTotal = (product.quantity || 0) * (product.unitPrice || 0);
      subtotal += productTotal;
      const gstAmount = (productTotal * gstRate) / 100;
      gstTotal += gstAmount;
    });

    const grandTotal = subtotal + gstTotal;
    setTotals({ subtotal, gstTotal, grandTotal });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!customerDetails.name || !customerDetails.phoneNumber) {
      toast.error('Please fill in customer name and phone number');
      return;
    }

    const invalidProduct = products.find(p => !p.name || !p.unitPrice);
    if (invalidProduct) {
      toast.error('Please fill in product name and unit price for all products');
      return;
    }

    setSaving(true);

    // Prepare warranty text
    const warrantyText = `Warranty:
- Motor, Controller & Charger: ${specialInstructions.motorWarranty}
- Battery: ${specialInstructions.batteryWarranty}

${specialInstructions.otherComments}`;

    const billData = {
      customerDetails,
      products: products.map(p => ({
        ...p,
        quantity: parseInt(p.quantity) || 1,
        unitPrice: parseFloat(p.unitPrice) || 0,
        totalPrice: parseFloat(p.totalPrice) || 0,
        gstAmount: parseFloat(p.gstAmount) || 0,
      })),
      paymentMode,
      specialInstructions: {
        ...specialInstructions,
        otherComments: warrantyText,
      },
      subTotal: totals.subtotal,
      gstTotal: totals.gstTotal,
      grandTotal: totals.grandTotal,
      gstRate,
    };

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/bills/${id}`, billData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Bill updated successfully!');
      navigate(`/bill/${id}`);
    } catch (error) {
      console.error('Error updating bill:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update bill');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading bill data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/bill/${id}`)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Bill
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Bill</h1>
        </div>

        {/* Totals Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <CalculatorIcon className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Bill Summary</span>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-500">Subtotal:</span>
                <span className="ml-2 font-semibold">₹{totals.subtotal.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">GST ({gstRate}%):</span>
                <span className="ml-2 font-semibold">₹{totals.gstTotal.toLocaleString()}</span>
              </div>
              <div className="text-lg">
                <span className="text-gray-500">Total:</span>
                <span className="ml-2 font-bold text-green-600">₹{totals.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Customer Details Section */}
            <div className="bill-form-section">
              <h3 className="bill-form-title">👤 Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerDetails.name}
                    onChange={handleCustomerChange}
                    placeholder="Enter customer name"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={customerDetails.phoneNumber}
                    onChange={handleCustomerChange}
                    placeholder="Enter phone number"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={customerDetails.address}
                    onChange={handleCustomerChange}
                    placeholder="Enter address"
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={customerDetails.aadharNumber}
                    onChange={handleCustomerChange}
                    placeholder="Enter Aadhar number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="bill-form-section">
              <div className="flex justify-between items-center mb-4">
                <h3 className="bill-form-title"> Product Details</h3>
                <button
                  type="button"
                  onClick={addProduct}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Product
                </button>
              </div>

              {products.map((product, index) => (
                <div key={index} className="product-row">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-700">
                      Product {index + 1}
                      {product.name && ` - ${product.name}`}
                    </h4>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Remove product"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Basic Product Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                        placeholder="e.g., E-Scooter Pro"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Unit Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={product.unitPrice}
                        onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Description & Identifiers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Description
                      </label>
                      <textarea
                        value={product.description}
                        onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                        placeholder="Product description..."
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Chassis Number
                      </label>
                      <input
                        type="text"
                        value={product.chassisNumber}
                        onChange={(e) => handleProductChange(index, 'chassisNumber', e.target.value)}
                        placeholder="Chassis No."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Motor Number
                      </label>
                      <input
                        type="text"
                        value={product.motorNumber}
                        onChange={(e) => handleProductChange(index, 'motorNumber', e.target.value)}
                        placeholder="Motor No."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Vehicle Specifications */}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                      ⚙️ Vehicle Specifications
                    </summary>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
                        <input
                          type="text"
                          value={product.model}
                          onChange={(e) => handleProductChange(index, 'model', e.target.value)}
                          placeholder="Model"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                        <input
                          type="text"
                          value={product.color}
                          onChange={(e) => handleProductChange(index, 'color', e.target.value)}
                          placeholder="Color"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Battery Type</label>
                        <input
                          type="text"
                          value={product.batteryType}
                          onChange={(e) => handleProductChange(index, 'batteryType', e.target.value)}
                          placeholder="Battery Type"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Motor Power</label>
                        <input
                          type="text"
                          value={product.motorPower}
                          onChange={(e) => handleProductChange(index, 'motorPower', e.target.value)}
                          placeholder="Motor Power"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Range</label>
                        <input
                          type="text"
                          value={product.range}
                          onChange={(e) => handleProductChange(index, 'range', e.target.value)}
                          placeholder="Range"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Top Speed</label>
                        <input
                          type="text"
                          value={product.topSpeed}
                          onChange={(e) => handleProductChange(index, 'topSpeed', e.target.value)}
                          placeholder="Top Speed"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Charging Time</label>
                        <input
                          type="text"
                          value={product.chargingTime}
                          onChange={(e) => handleProductChange(index, 'chargingTime', e.target.value)}
                          placeholder="Charging Time"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Wheel Size</label>
                        <input
                          type="text"
                          value={product.wheelSize}
                          onChange={(e) => handleProductChange(index, 'wheelSize', e.target.value)}
                          placeholder="Wheel Size"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Controller</label>
                        <input
                          type="text"
                          value={product.controller}
                          onChange={(e) => handleProductChange(index, 'controller', e.target.value)}
                          placeholder="Controller"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Battery Details</label>
                        <input
                          type="text"
                          value={product.battery}
                          onChange={(e) => handleProductChange(index, 'battery', e.target.value)}
                          placeholder="Battery Details"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </details>

                  {/* Product Totals */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap justify-end gap-6 text-sm">

                    <div>
                      <span className="text-gray-500">
                        Product Total:
                      </span>

                      <span className="ml-2 font-semibold">
                        ₹{(
                          (Number(product.quantity) || 0) *
                          (Number(product.priceWithoutGst) || 0)
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        GST:
                      </span>

                      <span className="ml-2 font-semibold text-green-600">
                        ₹{Number(product.gstAmount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Total Amount:
                      </span>

                      <span className="ml-2 font-semibold text-blue-600">
                        ₹{Number(product.totalPrice || 0).toLocaleString()}
                      </span>
                    </div>

                  </div>
                </div>
              ))}
            </div>
            

            {/* Payment Mode Section */}
            <div className="bill-form-section">
              <h3 className="bill-form-title">💳 Payment Mode</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'cash', label: 'Cash', icon: '💵' },
                  { value: 'card', label: 'Card', icon: '💳' },
                  { value: 'upi', label: 'UPI', icon: '📱' },
                  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
                ].map(mode => (
                  <label
                    key={mode.value}
                    className={`payment-method ${
                      paymentMode === mode.value
                        ? 'payment-method-selected'
                        : 'payment-method-unselected'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode.value}
                      checked={paymentMode === mode.value}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-lg mr-2">{mode.icon}</span>
                    <span className="text-sm font-medium">{mode.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Warranty & Instructions Section */}
            <div className="bill-form-section">
              <h3 className="bill-form-title">🛡️ Warranty & Special Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motor, Controller & Charger Warranty
                  </label>
                  <input
                    type="text"
                    value={specialInstructions.motorWarranty}
                    onChange={(e) => setSpecialInstructions(prev => ({ 
                      ...prev, 
                      motorWarranty: e.target.value 
                    }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Battery Warranty
                  </label>
                  <input
                    type="text"
                    value={specialInstructions.batteryWarranty}
                    onChange={(e) => setSpecialInstructions(prev => ({ 
                      ...prev, 
                      batteryWarranty: e.target.value 
                    }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Comments / Special Instructions
                </label>
                <textarea
                  value={specialInstructions.otherComments}
                  onChange={(e) => setSpecialInstructions(prev => ({ 
                    ...prev, 
                    otherComments: e.target.value 
                  }))}
                  rows="5"
                  placeholder="Add any additional notes, terms, or instructions..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default warranty text will be included above your comments.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/bill/${id}`)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Bill'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}