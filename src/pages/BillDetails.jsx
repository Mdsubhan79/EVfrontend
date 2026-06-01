import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  PencilIcon, 
  DocumentArrowDownIcon, 
  ChatBubbleLeftRightIcon, 
  PrinterIcon 
} from '@heroicons/react/24/outline';

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
        axios.get(`https://evbackend-3jlc.onrender.com/api/bills/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`https://evbackend-3jlc.onrender.com/api/business/details`, {
          headers: { Authorization: `Bearer ${token}` }
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
    try {
      const input = document.getElementById('bill-preview');
      if (!input) {
        toast.error('Invoice element not found');
        return;
      }

      const loadingToast = toast.loading('Generating PDF...');

      const clone = input.cloneNode(true);
      clone.style.width = '794px';
      clone.style.maxWidth = '794px';
      clone.style.minHeight = '1123px';
      clone.style.overflow = 'hidden';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      clone.style.borderRadius = '0';
      
      document.body.appendChild(clone);

      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: clone.scrollHeight,
        windowWidth: 794,
        windowHeight: clone.scrollHeight,
      });

      document.body.removeChild(clone);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      if (imgHeight <= pdfHeight) {
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          0,
          0,
          pdfWidth,
          imgHeight,
          undefined,
          'FAST'
        );
      } else {
        const scale = pdfHeight / imgHeight;
        const scaledWidth = pdfWidth * scale;
        const xOffset = (pdfWidth - scaledWidth) / 2;
        
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          xOffset,
          0,
          scaledWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
      }

      const customerName = bill?.customerDetails?.name || 'Customer';
      const invoiceNumber = bill?.invoiceNumber || 'Invoice';
      const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
      
      pdf.save(`Invoice_${sanitizedName}_${invoiceNumber}.pdf`);
      
      toast.dismiss(loadingToast);
      toast.success('PDF downloaded!');

    } catch (error) {
      console.error('PDF Error:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const phoneNumber = prompt('Enter customer phone number with country code (e.g., 91XXXXXXXXXX):');
    if (!phoneNumber) return;

    const text = `🧾 *Invoice from ${business?.businessName || 'Us'}*\n\n` +
                 `📋 Invoice No: *${bill?.invoiceNumber}*\n` +
                 `💰 Total Amount: *₹${bill?.grandTotal}*\n` +
                 `📅 Date: ${new Date(bill?.createdAt).toLocaleDateString()}\n\n` +
                 `Thank you for your purchase! 🙏\n\n` +
                 `For queries: 📞 ${business?.phone || 'N/A'}`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
    toast.success('WhatsApp opened');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading invoice...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3 mb-6 no-print">
          <button
            onClick={() => navigate(`/edit-bill/${id}`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md border border-gray-300 hover:border-blue-400 transition-all duration-200 font-medium text-sm"
          >
            <PencilIcon className="h-4 w-4" />
            Edit Bill
          </button>
          
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg shadow-sm hover:shadow-md hover:bg-green-700 transition-all duration-200 font-medium text-sm"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            WhatsApp
          </button>
          
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm hover:shadow-md hover:bg-blue-700 transition-all duration-200 font-medium text-sm"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Download PDF
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-900 transition-all duration-200 font-medium text-sm"
          >
            <PrinterIcon className="h-4 w-4" />
            Print Bill
          </button>
        </div>
        
        {/* Invoice - Flexbox column to push signature to bottom */}
        <div id="bill-preview" className="print-container bg-white w-full max-w-[794px] mx-auto relative">
          {/* Watermark */}
          <div className="watermark">INVOICE</div>
          
          {/* Main Content Area */}
          <div className="invoice-content" style={{position: 'relative', zIndex: 1}}>
            {/* Header */}
            <div className="invoice-header">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  {business?.logo && (
                    <div className="flex-shrink-0">
                      <img
                        src={business.logo}
                        alt="Logo"
                        crossOrigin="anonymous"
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain border border-gray-200 rounded-lg p-1"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="invoice-company">{business?.businessName || 'Company'}</h1>
                    <p className="invoice-tagline">{business?.tagline || 'Trusted EV Partner'}</p>
                  </div>
                </div>
                <div className="invoice-number">
                  
                  <p>No: <strong>{bill.invoiceNumber}</strong></p>
                  <p>Date: <strong>{new Date(bill.createdAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}</strong></p>
                </div>
              </div>
            </div>
            
            {/* Business & Customer */}
            <div className="details-section">
              <div className="details-grid">
                <div className="details-card">
                  <h3>🏢 Business Details</h3>
                  <p><strong>Address:</strong> {business?.address || 'N/A'}</p>
                  <p><strong>GSTIN:</strong> {business?.gstinNumber || 'N/A'}</p>
                  <p><strong>Phone:</strong> {business?.phone || 'N/A'}</p>
                  {business?.email && <p><strong>Email:</strong> {business.email}</p>}
                </div>
                <div className="details-card">
                  <h3>👤 Customer Details</h3>
                  <p><strong>Name:</strong> {bill.customerDetails.name}</p>
                  <p><strong>Phone:</strong> {bill.customerDetails.phoneNumber}</p>
                  <p><strong>Aadhar:</strong> {bill.customerDetails.aadharNumber || 'N/A'}</p>
                  {bill.customerDetails.address && (
                    <p><strong>Address:</strong> {bill.customerDetails.address}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bike Specs */}
            <div className="bike-specs">
              <h3 className="bike-specs-title">🔧 Vehicle Specifications</h3>
              {bill.products.map((product, index) => (
                <div key={index} className="bike-specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Model</span>
                    <span className="spec-value">{product.model || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Color</span>
                    <span className="spec-value">{product.color || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Battery</span>
                    <span className="spec-value">{product.batteryType || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Motor</span>
                    <span className="spec-value">{product.motorPower || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Range</span>
                    <span className="spec-value">{product.range || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Speed</span>
                    <span className="spec-value">{product.topSpeed || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Charge</span>
                    <span className="spec-value">{product.chargingTime || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Wheel</span>
                    <span className="spec-value">{product.wheelSize || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Chassis</span>
                    <span className="spec-value">{product.chassisNumber || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Products Table */}
            <div className="invoice-table-wrapper">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.products.map((product, index) => (
                    <tr key={index}>
                      <td className="font-semibold">{product.name}</td>
                      <td>
                        <p>{product.description}</p>
                        <p><strong>Motor No:</strong> {product.motorNumber || 'N/A'}</p>
                        <span className="gst-amount">GST: ₹{product.gstAmount || 0}</span>
                      </td>
                      <td className="text-right">{product.quantity || 1}</td>
                      <td className="text-right">₹{product.unitPrice?.toLocaleString() || 0}</td>
                      <td className="text-right font-semibold">₹{product.totalPrice?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="total-wrapper">
              <div className="total-box">
                <span className="payment-mode-badge">
                  💳 {bill.paymentMode?.replace('_', ' ').toUpperCase() || 'CASH'}
                </span>
                <div className="total-row" style={{marginTop: '10px'}}>
                  <span>Subtotal</span>
                  <span>₹{bill.subTotal?.toLocaleString() || 0}</span>
                </div>
                <div className="total-row">
                  <span>GST ({business?.gstRate || 0}%)</span>
                  <span>₹{bill.gstTotal?.toLocaleString() || 0}</span>
                </div>
                <div className="total-grand">
                  <span>TOTAL</span>
                  <span>₹{bill.grandTotal?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Warranty */}
            <div className="warranty-box">
              <h3 className="warranty-title">Warranty Information</h3>
              <div className="warranty-content whitespace-pre-line">
                {bill.specialInstructions?.otherComments || 
                 '• Motor, Controller & Charger: 12 Months Warranty\n• Battery: 12 Months Warranty\n\nIf you have any questions about this invoice, please contact the above given numbers.'}
              </div>
            </div>

            {/* Footer Text */}
            <div className="invoice-footer">
              <p className="invoice-footer-text">
                If you have any questions about this invoice, please contact us at {business?.phone || 'N/A'}
              </p>
              <p className="invoice-footer-text" style={{fontWeight: '600', color: '#1e293b'}}>
                Thank you!
              </p>
            </div>
          </div>
          
          {/* Signature - Pushed to Bottom */}
          <div className="signature-area">
            <div className="signature-box">
              <div className="signature-stamp">AUTHORIZED</div>
              <div className="signature-line">Authorized Signatory</div>
              <p className="signature-name">{business?.businessName || 'Company'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}