// src/pages/AllBills.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { EyeIcon, TrashIcon, ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AllBills() {
  const navigate = useNavigate();
  const { bills, loading, refreshData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [deleting, setDeleting] = useState(null);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || new Date(bill.createdAt).toDateString() === new Date(filterDate).toDateString();
    return matchesSearch && matchesDate;
  });

  const handleDeleteBill = async (billId) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this bill?");
    if (!confirmDelete) return;

    setDeleting(billId);
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://evbackend-3jlc.onrender.com/api/bills/${billId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Bill deleted successfully');
      await refreshData(); // Refresh the data after deletion
      
    } catch (error) {
      console.log(error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to delete bill');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">All Bills</h1>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              {bills.length} Total
            </span>
          </div>
          
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by customer name or invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        
        {/* Bills Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredBills.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No bills found</p>
              <button
                onClick={() => navigate('/create-bill')}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create First Bill
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bills-table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-small text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-gray-50 bill-row">
                      <td data-label="Invoice No" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill.invoiceNumber}
                      </td>
                      <td data-label="Customer Name" className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {bill.customerDetails.name}
                       </td>
                      <td data-label="Date" className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(bill.createdAt).toLocaleDateString()}
                       </td>
                      <td data-label="Total Amount" className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                        ₹{bill.grandTotal.toLocaleString()}
                       </td>
                      <td data-label="Action" className="px-6 py-4">
                        <div className="flex items-center justify-end gap-4 flex-wrap">
                          <button
                            onClick={() => navigate(`/bill/${bill._id}`)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800 transition"
                          >
                            <EyeIcon className="h-5 w-5" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDeleteBill(bill._id)}
                            disabled={deleting === bill._id}
                            className="flex items-center gap-1 text-red-600 whitespace-nowrap text-sm font-medium hover:text-red-800 disabled:opacity-50"
                          >
                            {deleting === bill._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <TrashIcon className="h-5 w-5" />
                            )}
                            <span>Delete</span>
                          </button>
                        </div>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}