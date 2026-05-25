
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PencilIcon, DocumentArrowDownIcon, ChatBubbleLeftRightIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function BillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchBillDetails();
  }, [id]);
  
  const fetchBillDetails = async () => {
    try {
      const token = localStorage.getItem('token');

const [billRes, businessRes] = await Promise.all([
  axios.get(`http://localhost:5000/api/bills/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),

  axios.get(`http://localhost:5000/api/business/details`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
]);
      setBill(billRes.data);
      setBusiness(businessRes.data);
    } catch (error) {
      toast.error('Failed to load bill details');
      navigate('/bills');
    } finally {
      setLoading(false);
    }
  };
  
    const downloadPDF = async () => {
      const input = document.getElementById('bill-preview');

      const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
        });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight =
        (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      pdf.save('invoice.pdf');
    };
  
    const handleSendWhatsApp = async () => {

      const phoneNumber = prompt(
        'Enter customer phone number with country code (e.g., 91XXXXXXXXXX):'
      );

      if (!phoneNumber) return;

      // Download PDF first
      await downloadPDF();

      const text =
    `Thank you for your purchase from ${business.businessName}.

    Invoice Number: ${bill.invoiceNumber}
    Total Amount: ₹${bill.grandTotal}

    Please find the attached invoice PDF.

    For any queries contact:
    ${business.phone}`;

      const whatsappUrl =
    `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;

      window.open(whatsappUrl, '_blank');

      toast.success('PDF downloaded & WhatsApp opened');
    };
  
  const handleSendSMS = () => {
    const phoneNumber = prompt('Enter customer phone number:');
    if (phoneNumber) {
      const message = `Invoice from ${business.businessName}\nInvoice No: ${bill.invoiceNumber}\nTotal: ₹${bill.grandTotal}\nDate: ${new Date(bill.createdAt).toLocaleDateString()}`;
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
      window.location.href = smsUrl;
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
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mb-6 no-print">
          <button
            onClick={() => navigate(`/edit-bill/${id}`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Bill
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
            WhatsApp
          </button>
          <button
            onClick={handleSendSMS}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <EnvelopeIcon className="h-5 w-5 mr-2" />
            SMS
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Download PDF
          </button>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Print Bill
          </button>
        </div>
        
        {/* Invoice */}
          <div
            id="bill-preview"
            className="print-container bg-white rounded-lg shadow-xl overflow-hidden"
          >
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                {business?.logo && (
                    <img
                      src={business.logo}
                      alt="Logo"
                      crossOrigin="anonymous"
                      className="h-20 mb-4 object-contain"
                    />
                  )}
                <h1 className="text-2xl font-bold text-gray-800">{business?.businessName}</h1>
                <p className="text-gray-600">{business?.tagline}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Invoice #{bill.invoiceNumber}</p>
                <p className="text-sm text-gray-600">Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          {/* Business & Customer Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Business Details:</h3>
                <p className="text-sm text-gray-600">{business?.address}</p>
                <p className="text-sm text-gray-600">GSTIN: {business?.gstinNumber || 'N/A'}</p>
                <p className="text-sm text-gray-600">Phone: {business?.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Customer Details:</h3>
                <p className="text-sm text-gray-600">Name: {bill.customerDetails.name}</p>
                <p className="text-sm text-gray-600">Phone: {bill.customerDetails.phoneNumber}</p>
                {bill.customerDetails.address && (
                  <p className="text-sm text-gray-600">Address: {bill.customerDetails.address}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Products Table */}
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Item</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.products.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2">{product.name}</td>
                    <td className="py-3">

                      <p>{product.description}</p>

                      <p>
                        <strong>Chassis No:</strong> {product.chassisNumber}
                      </p>

                      <p>
                        <strong>Motor No:</strong> {product.motorNumber}
                      </p>

                      <p>
                        <strong>Battery Type:</strong> {product.battery}
                      </p>

                      <div className="font-semibold text-sm mt-1">
                        GST: ₹{product.gstAmount}
                      </div>

                    </td>
                     <td className="py-2 text-right">{product.quantity}</td>
                    <td className="py-2 text-right">₹{product.unitPrice}</td>
                    <td className="py-2 text-right">₹{product.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
            {/* Totals */}
              <div className="p-6 bg-gray-50">

                <div className="flex justify-end">

                  <div className="w-72 space-y-3">

                    <div className="flex justify-between text-lg">
                      <span>Subtotal:</span>
                      <span>₹{bill.subTotal}</span>
                    </div>

                    <div className="flex justify-between text-lg">
                      <span>
                        GST ({business?.gstRate || 0}%):
                      </span>

                      <span>
                        ₹{bill.gstTotal}
                      </span>
                    </div>

                    <div className="border-t pt-3 flex justify-between text-2xl font-bold text-green-700">

                      <span>Total:</span>

                      <span>₹{bill.grandTotal}</span>

                    </div>

                  </div>

                </div>

              </div>
          
          {/* Warranty & Footer */}
          <div className="p-6 text-sm text-gray-600 border-t border-gray-200">
            
            <div className="mt-4 whitespace-pre-line text-sm leading-7">

              <h3 className="font-semibold mb-2">
                Warranty Details:
              </h3>

              <p>{bill.specialInstructions.otherComments}</p>

            </div>
            <p className="mt-4 text-center">
              If you have any questions about this invoice, please contact us at {business?.phone}
            </p>
            <p className="text-center mt-2">Thank you!</p>
            <div className="flex justify-end mt-16">

                <div className="text-center">

                  <div className="h-12"></div>

                  <p className="font-semibold border-t pt-2 w-48">
                    Authorized Signatory
                  </p>

                </div>

              </div>
          </div>
        </div>
      </div>
    </div>
  );
}