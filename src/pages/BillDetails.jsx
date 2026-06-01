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
  PrinterIcon,
  PhoneIcon,
  EnvelopeIcon
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

      const loadingToast = toast.loading('Generating professional PDF...');

      // Store original styles
      const originalStyles = {
        width: input.style.width,
        maxWidth: input.style.maxWidth,
        minHeight: input.style.minHeight,
        maxHeight: input.style.maxHeight,
        overflow: input.style.overflow,
        transform: input.style.transform,
        zoom: input.style.zoom
      };

      // Force exact A4 dimensions
      input.style.width = '794px';
      input.style.maxWidth = '794px';
      input.style.minHeight = '1123px';
      input.style.maxHeight = '1123px';
      input.style.overflow = 'hidden';
      input.style.transform = 'none';
      input.style.zoom = '1';

      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('bill-preview');
          if (clonedElement) {
            clonedElement.style.width = '794px';
            clonedElement.style.maxWidth = '794px';
            clonedElement.style.minHeight = '1123px';
            clonedElement.style.maxHeight = '1123px';
            clonedElement.style.overflow = 'hidden';
            clonedElement.style.transform = 'none';
            clonedElement.style.zoom = '1';
          }
        }
      });

      // Restore original styles
      Object.assign(input.style, originalStyles);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210;
      const pdfHeight = 297;

      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        'FAST'
      );

      const customerName = bill?.customerDetails?.name || 'Customer';
      const invoiceNumber = bill?.invoiceNumber || 'Invoice';
      const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Invoice_${sanitizedName}_${invoiceNumber}.pdf`;

      pdf.save(filename);
      
      toast.dismiss(loadingToast);
      toast.success('PDF downloaded successfully!');

    } catch (error) {
      console.error('PDF Generation Error:', error);
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
                 `For any queries, contact:\n` +
                 `📞 ${business?.phone || 'N/A'}`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
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
        {/* Action Buttons - Professional Style */}
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
            Send WhatsApp
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
        
        {/* Professional Invoice */}
        <div id="bill-preview" className="print-container bg-white w-full max-w-[794px] mx-auto overflow-hidden relative">
          {/* Subtle Watermark */}
          <div className="watermark">INVOICE</div>
          
          {/* Header */}
          <div className="invoice-header">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-center gap-4">
                {business?.logo && (
                  <div className="flex-shrink-0">
                    <img
                      src={business.logo}
                      alt="Company Logo"
                      crossOrigin="anonymous"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain border border-gray-200 rounded-lg p-1"
                    />
                  </div>
                )}
                <div>
                  <h1 className="invoice-company">{business?.businessName || 'Company Name'}</h1>
                  <p className="invoice-tagline">{business?.tagline || 'Your trusted EV partner'}</p>
                </div>
              </div>
              <div className="invoice-number">
                <p><strong>TAX INVOICE</strong></p>
                <p>Invoice #: <strong>{bill.invoiceNumber}</strong></p>
                <p>Date: <strong>{new Date(bill.createdAt).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</strong></p>
              </div>
            </div>
          </div>
          
          {/* Business & Customer Info */}
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
          
          {/* Bike Specifications */}
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
                  <span className="spec-label">Motor Power</span>
                  <span className="spec-value">{product.motorPower || 'N/A'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Range</span>
                  <span className="spec-value">{product.range || 'N/A'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Top Speed</span>
                  <span className="spec-value">{product.topSpeed || 'N/A'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Charging</span>
                  <span className="spec-value">{product.chargingTime || 'N/A'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Wheel Size</span>
                  <span className="spec-value">{product.wheelSize || 'N/A'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Chassis No</span>
                  <span className="spec-value">{product.chassisNumber || 'N/A'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Motor No</span>
                  <span className="spec-value">{product.motorNumber || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Products Table */}
          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th style={{width: '20%'}}>Item</th>
                  <th style={{width: '35%'}}>Description</th>
                  <th className="text-right" style={{width: '10%'}}>Qty</th>
                  <th className="text-right" style={{width: '15%'}}>Unit Price</th>
                  <th className="text-right" style={{width: '20%'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.products.map((product, index) => (
                  <tr key={index}>
                    <td className="font-semibold">{product.name}</td>
                    <td>
                      <p>{product.description}</p>
                      <p><strong>Chassis:</strong> {product.chassisNumber || 'N/A'}</p>
                      <p><strong>Motor:</strong> {product.motorNumber || 'N/A'}</p>
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
              <div className="total-row" style={{marginTop: '12px'}}>
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
            <h3 className="warranty-title">🛡️ Warranty Information</h3>
            <div className="warranty-content whitespace-pre-line">
              {bill.specialInstructions?.otherComments || 
               '• Motor: 12 Months Warranty\n• Controller: 12 Months Warranty\n• Charger: 12 Months Warranty\n• Battery: 12 Months Warranty'}
            </div>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            <p className="invoice-footer-text">
              <strong>📞 For any queries, please contact us at:</strong> {business?.phone || 'N/A'}
            </p>
            {business?.email && (
              <p className="invoice-footer-text">
                <strong>✉️ Email:</strong> {business.email}
              </p>
            )}
            <p className="invoice-footer-text" style={{marginTop: '8px', fontWeight: '600', color: '#1e293b'}}>
              Thank you for your business! 🙏
            </p>
          </div>
          
          {/* Signature */}
          <div className="signature-area">
            <div className="signature-box">
              <div className="signature-stamp">AUTHORIZED</div>
              <div className="signature-line">Authorized Signatory</div>
              <p className="signature-name">{business?.businessName || 'Company Name'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}