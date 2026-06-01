import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function BillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef(null);
  
  useEffect(() => {
    fetchBillDetails();
  }, [id]);
  
  const fetchBillDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const [billRes, businessRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/bills/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/business/details`, {
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
    if (!previewRef.current || isGenerating) return;
    
    setIsGenerating(true);
    const loadingToast = toast.loading('Generating PDF...');
    
    try {
      const element = previewRef.current;
      
      // Store original styles
      const originalStyles = {
        width: element.style.width,
        maxWidth: element.style.maxWidth,
        margin: element.style.margin,
        padding: element.style.padding
      };
      
      // Set fixed width for PDF generation
      element.style.width = '794px';
      element.style.maxWidth = '794px';
      element.style.margin = '0 auto';
      
      // Wait for any images to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        onclone: (clonedDoc, element) => {
          // Ensure all styles are applied in cloned document
          const clonedElement = clonedDoc.getElementById('bill-preview');
          if (clonedElement) {
            clonedElement.style.width = '794px';
            clonedElement.style.maxWidth = '794px';
          }
        }
      });
      
      // Restore original styles
      element.style.width = originalStyles.width;
      element.style.maxWidth = originalStyles.maxWidth;
      element.style.margin = originalStyles.margin;
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      let pageNum = 1;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
        pageNum++;
      }
      
      const fileName = `Invoice_${bill.invoiceNumber.replace(/\//g, '_')}_${bill.customerDetails.name.replace(/\s/g, '_')}.pdf`;
      pdf.save(fileName);
      
      toast.dismiss(loadingToast);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF Error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printContent = previewRef.current.innerHTML;
    const originalTitle = document.title;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${bill.invoiceNumber}</title>
          <meta charset="utf-8">
          <style>
            /* Copy all invoice styles */
            ${Array.from(document.styleSheets).map(sheet => {
              try {
                return Array.from(sheet.cssRules || []).map(rule => rule.cssText).join('');
              } catch(e) { return ''; }
            }).join('')}
            body {
              margin: 0;
              padding: 20px;
              background: white;
            }
            .no-print {
              display: none !important;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSendWhatsApp = () => {
    const phoneNumber = prompt('Enter customer phone number with country code (e.g., 91XXXXXXXXXX):');
    if (!phoneNumber) return;

    const text = `🧾 *Invoice from ${business?.businessName || 'EV Showroom'}*\n\n` +
                 `📋 Invoice No: *${bill?.invoiceNumber}*\n` +
                 `👤 Customer: ${bill?.customerDetails?.name}\n` +
                 `💰 Total Amount: *₹${bill?.grandTotal?.toLocaleString()}*\n` +
                 `📅 Date: ${new Date(bill?.createdAt).toLocaleDateString('en-IN')}\n\n` +
                 `Thank you for your purchase! 🙏\n\n` +
                 `For queries: 📞 ${business?.phone || 'N/A'}`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleSendSMS = () => {
    const phoneNumber = prompt('Enter customer phone number:');
    if (!phoneNumber) return;
    
    const message = `Invoice from ${business?.businessName || 'EV Showroom'}\n` +
                    `Invoice No: ${bill?.invoiceNumber}\n` +
                    `Total: ₹${bill?.grandTotal?.toLocaleString()}\n` +
                    `Date: ${new Date(bill?.createdAt).toLocaleDateString('en-IN')}`;
    
    window.open(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`, '_blank');
    toast.success('Opening SMS...');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading invoice...</p>
        </div>
      </div>
    );
  }
  
  if (!bill || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg">Bill not found</p>
          <button
            onClick={() => navigate('/bills')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Go to Bills
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-4 no-print">
          <button
            onClick={() => navigate('/bills')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Bills
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3 mb-6 no-print">
          <button
            onClick={() => navigate(`/edit-bill/${id}`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md border border-gray-300 hover:border-green-400 transition-all duration-200 font-medium text-sm"
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
            onClick={handleSendSMS}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg shadow-sm hover:shadow-md hover:bg-purple-700 transition-all duration-200 font-medium text-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            SMS
          </button>
          
          <button
            onClick={downloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm hover:shadow-md hover:bg-blue-700 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-900 transition-all duration-200 font-medium text-sm"
          >
            <PrinterIcon className="h-4 w-4" />
            Print Bill
          </button>
        </div>
        
        {/* Invoice Preview */}
        <div ref={previewRef} id="bill-preview" className="print-container bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Header with Logo */}
          <div className="invoice-header">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-center gap-4">
                {business?.logo && (
                  <img
                    src={business.logo}
                    alt="Logo"
                    className="w-14 h-14 object-contain border border-gray-200 rounded-lg p-1"
                    crossOrigin="anonymous"
                  />
                )}
                <div>
                  <h1 className="invoice-company">{business.businessName}</h1>
                  <p className="invoice-tagline">{business.tagline || 'Your Trusted EV Partner'}</p>
                </div>
              </div>
              <div className="invoice-number">
                <p>Invoice #: <strong>{bill.invoiceNumber}</strong></p>
                <p>Date: <strong>{new Date(bill.createdAt).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</strong></p>
              </div>
            </div>
          </div>
          
          {/* Business & Customer Details */}
          <div className="details-section">
            <div className="details-grid">
              <div className="details-card">
                <h3>🏢 Business Details</h3>
                <p><strong>Address:</strong> {business.address}</p>
                {business.gstinNumber && <p><strong>GSTIN:</strong> {business.gstinNumber}</p>}
                <p><strong>Phone:</strong> {business.phone}</p>
                {business.email && <p><strong>Email:</strong> {business.email}</p>}
              </div>
              <div className="details-card">
                <h3>👤 Customer Details</h3>
                <p><strong>Name:</strong> {bill.customerDetails.name}</p>
                <p><strong>Phone:</strong> {bill.customerDetails.phoneNumber}</p>
                {bill.customerDetails.aadharNumber && <p><strong>Aadhar:</strong> {bill.customerDetails.aadharNumber}</p>}
                {bill.customerDetails.address && <p><strong>Address:</strong> {bill.customerDetails.address}</p>}
              </div>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Description</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.products.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{product.name}</td>
                    <td>
                      {product.description && <div>{product.description}</div>}
                      {product.chassisNumber && <div><strong>Chassis:</strong> {product.chassisNumber}</div>}
                      {product.motorNumber && <div><strong>Motor:</strong> {product.motorNumber}</div>}
                      {product.battery && <div><strong>Battery:</strong> {product.battery}</div>}
                      {product.gstAmount > 0 && (
                        <span className="gst-amount">GST: ₹{product.gstAmount.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="text-right">{product.quantity}</td>
                    <td className="text-right">₹{product.unitPrice.toLocaleString()}</td>
                    <td className="text-right font-semibold">₹{(product.quantity * product.unitPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Totals */}
          <div className="total-wrapper">
            <div className="total-box">
              <div className="payment-mode-badge">
                💳 {bill.paymentMode.replace('_', ' ').toUpperCase()}
              </div>
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{bill.subTotal?.toLocaleString() || 0}</span>
              </div>
              {bill.gstTotal > 0 && (
                <div className="total-row">
                  <span>GST ({business.gstRate}%)</span>
                  <span>₹{bill.gstTotal?.toLocaleString() || 0}</span>
                </div>
              )}
              <div className="total-grand">
                <span>GRAND TOTAL</span>
                <span>₹{bill.grandTotal?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Warranty Information */}
          <div className="warranty-box">
            <h3 className="warranty-title">🛡️ Warranty Information</h3>
            <div className="warranty-content">
              {bill.specialInstructions?.motorWarranty && (
                <p><strong>Motor & Controller:</strong> {bill.specialInstructions.motorWarranty}</p>
              )}
              {bill.specialInstructions?.batteryWarranty && (
                <p><strong>Battery:</strong> {bill.specialInstructions.batteryWarranty}</p>
              )}
              {bill.specialInstructions?.otherComments && (
                <p><strong>Additional Comments:</strong> {bill.specialInstructions.otherComments}</p>
              )}
              {!bill.specialInstructions?.motorWarranty && !bill.specialInstructions?.batteryWarranty && (
                <p>Standard warranty applies as per company policy.</p>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="invoice-footer">
            <p className="invoice-footer-text">
              If you have any questions about this invoice, please contact us at {business.phone}
            </p>
            <p className="invoice-footer-text" style={{ fontWeight: '600', color: '#1e293b', marginTop: '8px' }}>
              Thank you for your business! 🙏
            </p>
          </div>
          
          {/* Signature */}
          <div className="signature-area">
            <div className="signature-box">
              <div className="signature-line">Authorized Signatory</div>
              <div className="signature-name">{business.businessName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}