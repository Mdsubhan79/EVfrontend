// frontend/src/pages/AllBills.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {EyeIcon,TrashIcon} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function AllBills() {
  const navigate = useNavigate();
  const { bills, setBills } = useAuth();
  

  

  const handleDeleteBill = async (billId) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to permanently delete this bill?"
  );

  if (!confirmDelete) return;

  try {

    const token = localStorage.getItem('token');

    await axios.delete(
  `https://evbackend-3jlc.onrender.com/api/bills/${billId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

    toast.success('Bill deleted successfully');

    setBills(
      bills.filter((bill) => bill._id !== billId)
    );

  } catch (error) {

    console.log(error.response?.data || error);

toast.error(
  error.response?.data?.message ||
  'Failed to delete bill'
);

  }

};

  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">All Bills</h2>
          </div>
          
          {bills.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No bills created yet</p>
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
                  {bills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-gray-50 bill-row">
                      <td
                          data-label="Invoice No"
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                        {bill.invoiceNumber}
                      </td>
                      <td
                          data-label="Customer Name"
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                        >
                        {bill.customerDetails.name}
                      </td>
                      <td
                          data-label="Date"
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                        >
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </td>
                      <td
                          data-label="Total Amount"
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold"
                        >
                        ₹{bill.grandTotal.toLocaleString()}
                      </td>
                      <td
                          data-label="Action"
                          className="px-6 py-4"
                        >
                        <div className="flex items-center justify-end gap-4 flex-wrap">
                            {/* View Button */}
                            <button
                              onClick={() => navigate(`/bill/${bill._id}`)}
                              className="
                                flex items-center gap-1
                                text-green-600
                                hover:text-green-800
                                transition
                              "
                            >
                              <EyeIcon className="h-5 w-5" />
                              <span>View</span>
                            </button>

                            {/* Delete Button */}
                            <button
                               onClick={() => handleDeleteBill(bill._id)}
                              className="
                                flex
                                items-center
                                gap-1
                                text-red-600
                                whitespace-nowrap
                                text-sm
                                font-medium
                              "
                            >
                              <TrashIcon className="h-5 w-5" />
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