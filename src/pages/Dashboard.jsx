import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserCircleIcon, 
  DocumentTextIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon,
  CurrencyRupeeIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, business, dashboardStats, appLoading,bills, refreshData } = useAuth();

  const stats = [
    {
      title: 'Total Bills',
      value: dashboardStats.totalBills,
      icon: DocumentDuplicateIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Revenue',
      value: `₹${dashboardStats.totalRevenue.toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500',
    },
    {
      title: "Today's Bills",
      value: dashboardStats.todayBills,
      icon: CalendarIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'This Month',
      value: dashboardStats.thisMonthBills,
      icon: DocumentTextIcon,
      color: 'bg-orange-500',
    },
  ];

  const handleStartBilling = () => {
    navigate('/create-bill');
  };

  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {business?.logo ? (
                <img src={business.logo} alt="Logo" className="h-10 w-auto" />
              ) : (
                <BoltIcon className="h-10 w-10 text-green-600" />
              )}
              <span className="ml-3 text-xl font-bold text-gray-800">
                {business?.businessName || 'EV Billing'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button
                onClick={refreshData}
                disabled={appLoading}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition"
                title="Refresh Data"
              >
                <ArrowPathIcon className={`h-5 w-5 ${appLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 focus:outline-none">
                  <UserCircleIcon className="h-10 w-10 text-gray-600 hover:text-gray-800" />
                </Menu.Button>
                
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{business?.businessName || 'Business Name'}</p>
                      <p className="text-xs text-gray-500">{business?.email || 'No email set'}</p>
                    </div>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/business-details')}
                          className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <CogIcon className="h-5 w-5 mr-2" />
                          Settings
                        </button>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/bills')}
                          className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <DocumentTextIcon className="h-5 w-5 mr-2" />
                          All Bills ({dashboardStats.totalBills})
                        </button>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-red-600 border-t`}
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
{/* Hero Section */}

<div className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-8 text-white mb-8 shadow-lg">

  <h1 className="text-4xl font-bold mb-2">
    Welcome Back 👋
  </h1>

  <p className="text-green-100 text-lg">
    {business?.businessName}
  </p>

  <p className="text-green-50 mt-2">
    Manage invoices and revenue.
  </p>

</div>
        
<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

  {stats.map((stat, index) => (

    <div
      key={index}
      className="bg-white rounded-3xl shadow-md p-6 hover:shadow-xl transition duration-300"
    >

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500 text-sm">
            {stat.title}
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {stat.value}
          </h2>

        </div>

        <div className={`${stat.color} p-4 rounded-2xl`}>
          <stat.icon className="h-7 w-7 text-white" />
        </div>

      </div>

    </div>

  ))}

</div>
        
        {/* Action Buttons */}
<div className="grid md:grid-cols-2 gap-6 mb-8">

  <div
    onClick={() => navigate('/create-bill')}
    className="cursor-pointer bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-8 text-white shadow-lg hover:scale-105 transition"
  >

    <h2 className="text-2xl font-bold">
      Create New Bill
    </h2>

    <p className="mt-2 text-green-100">
      Generate invoice instantly
    </p>

  </div>

  <div
    onClick={() => navigate('/bills')}
    className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-8 text-white shadow-lg hover:scale-105 transition"
  >

    <h2 className="text-2xl font-bold">
      View All Bills
    </h2>

    <p className="mt-2 text-blue-100">
      Manage all invoices
    </p>

  </div>

</div>
        <div className="bg-white rounded-3xl shadow-md p-6 mb-8">

  <h2 className="text-xl font-bold mb-4">
    Business Information
  </h2>

  <div className="grid md:grid-cols-2 gap-5">

    <div>
      <p className="text-gray-500 text-sm">
        Business Name
      </p>

      <p className="font-semibold">
        {business?.businessName}
      </p>
    </div>

    <div>
      <p className="text-gray-500 text-sm">
        GST Number
      </p>

      <p className="font-semibold">
        {business?.gstNumber}
      </p>
    </div>

    <div>
      <p className="text-gray-500 text-sm">
        Phone
      </p>

      <p className="font-semibold">
        {business?.phone}
      </p>
    </div>

    <div>
      <p className="text-gray-500 text-sm">
        Email
      </p>

      <p className="font-semibold">
        {business?.email}
      </p>
    </div>

  </div>

</div>
        {/* Recent Bills */}
        {dashboardStats.recentBills.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bills</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardStats.recentBills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{bill.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{bill.customerDetails.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                        ₹{bill.grandTotal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => navigate(`/bill/${bill._id}`)}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}