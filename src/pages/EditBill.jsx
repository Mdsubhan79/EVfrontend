// frontend/src/pages/EditBill.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function EditBill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phoneNumber: '',
    address: '', 
    aadharNumber: '',
  });
  
  const [products, setProducts] = useState([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [specialInstructions, setSpecialInstructions] = useState({
    motorWarranty: '12 months',
    batteryWarranty: '12 months', 
    otherComments: '',
  });
  
  const [gstRate, setGstRate] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, [id]);
  
  const fetchData = async () => {
    try {
      const [billRes, businessRes] = await Promise.all([
        axios.get(`/bills/${id}`),
        axios.get('/business/details')
      ]);
      
      const bill = billRes.data;
      setCustomerDetails(bill.customerDetails);
      setProducts(bill.products);
      setPaymentMode(bill.paymentMode);
      setSpecialInstructions(bill.specialInstructions);
      setBusiness(businessRes.data);
      setGstRate(businessRes.data.gstRate || 0);
    } catch (error) {
      toast.error('Failed to load bill data');
      navigate('/bills');
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
    updatedProducts[index][field] = value;
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
      unitPrice: 0,
    }]);
  };
  
  const removeProduct = (index) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };
  
  const calculateTotals = () => {
    let subtotal = 0;
    let gstTotal = 0;
    
    products.forEach(product => {
      const productTotal = product.quantity * product.unitPrice;
      subtotal += productTotal;
      
      const gstAmount = (productTotal * gstRate) / 100;
      gstTotal += gstAmount;
    });
    
    return { subtotal, gstTotal, grandTotal: subtotal };
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { subtotal, gstTotal, grandTotal } = calculateTotals();
    
    const billData = {
      customerDetails,
      products,
      paymentMode,
      specialInstructions,
      subTotal: subtotal,
      gstTotal: gstTotal,
      grandTotal: grandTotal,
      gstRate,
    };
    
    try {
      await axios.put(`/bills/${id}`, billData);
      toast.success('Bill updated successfully!');
      navigate(`/bill/${id}`);
    } catch (error) {
      toast.error('Failed to update bill');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Bill</h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={customerDetails.name}
                  onChange={handleCustomerChange}
                  placeholder="Customer Name *"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={customerDetails.phoneNumber}
                  onChange={handleCustomerChange}
                  placeholder="Phone Number *"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  name="address"
                  value={customerDetails.address}
                  onChange={handleCustomerChange}
                  placeholder="Address"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  name="aadharNumber"
                  value={customerDetails.aadharNumber}
                  onChange={handleCustomerChange}
                  placeholder="Aadhar Number"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            {/* Products */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h3>
              {products.map((product, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Product {index + 1}</h4>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                      placeholder="Quantity"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                      placeholder="Product Name *"
                      required
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={product.description}
                      onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={product.chassisNumber}
                      onChange={(e) => handleProductChange(index, 'chassisNumber', e.target.value)}
                      placeholder="Chassis Number"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={product.motorNumber}
                      onChange={(e) => handleProductChange(index, 'motorNumber', e.target.value)}
                      placeholder="Motor Number"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={product.battery}
                      onChange={(e) => handleProductChange(index, 'battery', e.target.value)}
                      placeholder="Battery Details"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={product.unitPrice}
                      onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value))}
                      placeholder="Unit Price (including GST) *"
                      required
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                    type="text"
                    value={product.model || ''}
                    onChange={(e) =>
                        handleProductChange(index,'model',e.target.value)
                    }
                    placeholder="Model"
                  />

                  <input
                    type="text"
                    value={product.color || ''}
                    onChange={(e) =>
                        handleProductChange(index,'color',e.target.value)
                    }
                    placeholder="Color"
                  />

                  <input
                    type="text"
                    value={product.batteryType || ''}
                    onChange={(e) =>
                        handleProductChange(index,'batteryType',e.target.value)
                    }
                    placeholder="Battery Type"
                  />

                  <input
                    type="text"
                    value={product.motorPower || ''}
                    onChange={(e) =>
                        handleProductChange(index,'motorPower',e.target.value)
                    }
                    placeholder="Motor Power"
                  />

                  <input
                    type="text"
                    value={product.range || ''}
                    onChange={(e) =>
                        handleProductChange(index,'range',e.target.value)
                    }
                    placeholder="Range"
                  />
                  <input
                  type="text"
                  value={product.topSpeed || ''}
                  onChange={(e) =>
                    handleProductChange(index,'topSpeed',e.target.value)
                  }
                  placeholder="Top Speed"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />

                <input
                  type="text"
                  value={product.chargingTime || ''}
                  onChange={(e) =>
                    handleProductChange(index,'chargingTime',e.target.value)
                  }
                  placeholder="Charging Time"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />

                <input
                  type="text"
                  value={product.controller || ''}
                  onChange={(e) =>
                    handleProductChange(index,'controller',e.target.value)
                  }
                  placeholder="Controller"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />

                <input
                  type="text"
                  value={product.wheelSize || ''}
                  onChange={(e) =>
                    handleProductChange(index,'wheelSize',e.target.value)
                  }
                  placeholder="Wheel Size"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center text-green-600 hover:text-green-700"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Add Another Product
              </button>
            </div>
            
            {/* Payment Mode */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Mode</h3>
              <div className="flex space-x-4">
                {['cash', 'card', 'upi', 'bank_transfer'].map(mode => (
                  <label key={mode} className="flex items-center">
                    <input
                      type="radio"
                      value={mode}
                      checked={paymentMode === mode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="mr-2"
                    />
                    <span className="capitalize">{mode.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Warranty & Instructions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Warranty Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motor, Controller & Charger Warranty
                  </label>
                  <input
                    type="text"
                    value={specialInstructions.motorWarranty}
                    onChange={(e) => setSpecialInstructions(prev => ({ ...prev, motorWarranty: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Battery Warranty
                  </label>
                  <input
                    type="text"
                    value={specialInstructions.batteryWarranty}
                    onChange={(e) => setSpecialInstructions(prev => ({ ...prev, batteryWarranty: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Comments / Special Instructions
                  </label>
                  <textarea
                    value={specialInstructions.otherComments}
                    onChange={(e) => setSpecialInstructions(prev => ({ ...prev, otherComments: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/bill/${id}`)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Update Bill
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}