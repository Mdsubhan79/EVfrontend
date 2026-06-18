// src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  PlusIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const {
  business,
  bills,
  appLoading,
  dashboardStats,
  user,
  logout
} = useAuth();
  const navigate = useNavigate();

  
  if (appLoading) {
    return null;
  }

  
  if (!business || !business.businessName) {
    return null;
  }

  const stats = [
    {
      name: 'Total Bills',
      value: dashboardStats.totalBills,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
   {/* {
      name: 'Total Revenue',
      value: `₹${dashboardStats.totalRevenue.toLocaleString('en-IN')}`,
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-700',
    },*/}
    ,{
      name: "Today's Bills",
      value: dashboardStats.todayBills,
      icon: CalendarDaysIcon,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      name: 'This Month',
      value: dashboardStats.thisMonthBills,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {business.logo && (
                <img
                  src={business.logo}
                  alt="Logo"
                  className="h-10 w-10 rounded-lg object-contain border border-gray-200"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {business.businessName}
                </h1>
                <p className="text-sm text-gray-500">{business.tagline}</p>
              </div>
            </div>
           <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/create-bill')}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Create Bill</span>
                </button>

                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <UserCircleIcon className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium">
                    {user?.name || "Admin"}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>

              </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgLight} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Bills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Bills
              </h2>
              <button
                onClick={() => navigate('/bills')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
          </div>

          {dashboardStats.recentBills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Bill No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardStats.recentBills.map((bill) => (
                    <tr
                      key={bill._id}
                      onClick={() => navigate(`/bill/${bill._id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {bill.invoiceNumber || bill.billNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {bill.customerDetails?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(bill.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                        ₹{(bill.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BoltIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bills created yet</p>
              <button
                onClick={() => navigate('/create-bill')}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Create your first bill
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}