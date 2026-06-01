import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PencilIcon, DocumentArrowDownIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

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

      // Store original styles
      const originalStyles = {
        width: input.style.width,
        maxWidth: input.style.maxWidth,
        height: input.style.height,
        maxHeight: input.style.maxHeight,
        overflow: input.style.overflow,
        transform: input.style.transform,
        zoom: input.style.zoom
      };

      // Force single page A4 dimensions (794px × 1123px at 96dpi)
      input.style.width = '794px';
      input.style.maxWidth = '794px';
      input.style.height = '1123px';
      input.style.maxHeight = '1123px';
      input.style.overflow = 'hidden';
      input.style.transform = 'none';
      input.style.zoom = '1';

      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 200));

      // Capture with html2canvas
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
            clonedElement.style.height = '1123px';
            clonedElement.style.maxHeight = '1123px';
            clonedElement.style.overflow = 'hidden';
            clonedElement.style.transform = 'none';
            clonedElement.style.zoom = '1';
          }
        }
      });

      // Restore original styles
      Object.assign(input.style, originalStyles);

      // Create single page A4 PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210;
      const pdfHeight = 297;

      // Add image to exactly fit one A4 page
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

      // Generate filename
      const customerName = bill?.customerDetails?.name || 'Customer';
      const invoiceNumber = bill?.invoiceNumber || 'Invoice';
      const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${sanitizedName}-${invoiceNumber}.pdf`;

      pdf.save(filename);
      
      toast.dismiss(loadingToast);
      toast.success('PDF Downloaded Successfully');

    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleSendWhatsApp = () => {
    const phoneNumber = prompt('Enter customer phone number with country code (e.g., 91XXXXXXXXXX):');
    if (!phoneNumber) return;

    const text = `Thank you for your purchase from ${business?.businessName || 'Us'}.\n\nInvoice Number: ${bill?.invoiceNumber}\nTotal Amount: ₹${bill?.grandTotal}\n\nFor any queries contact:\n${business?.phone || 'N/A'}`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-2 sm:gap-4 mb-4 no-print">
          <button
            onClick={() => navigate(`/edit-bill/${id}`)}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <PencilIcon className="h-4 w-4 mr-1 sm:mr-2" />
            Edit
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1 sm:mr-2" />
            WhatsApp
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1 sm:mr-2" />
            Download PDF
          </button>
        </div>
        
        {/* Invoice */}
        <div id="bill-preview" className="print-container bg-white w-full max-w-[794px] mx-auto overflow-hidden text-[11px] sm:text-[12px]">
          {/* Header */}
          <div className="invoice-header">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="flex items-center gap-3">
                {business?.logo && (
                  <img
                    src={business.logo}
                    alt="Logo"
                    crossOrigin="anonymous"
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-[20px] sm:text-[24px] font-bold text-black leading-tight">
                    {business?.businessName}
                  </h1>
                  <p className="text-gray-600 text-[11px]">{business?.tagline}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-600">Invoice #{bill.invoiceNumber}</p>
                <p className="text-[11px] text-gray-600">
                  Date: {new Date(bill.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          {/* Business & Customer Info */}
          <div className="details-section">
            <div className="details-grid">
              <div className="details-card">
                <h3>Business Details</h3>
                <p>{business?.address}</p>
                <p>GSTIN: {business?.gstinNumber || 'N/A'}</p>
                <p>Phone: {business?.phone}</p>
              </div>
              <div className="details-card">
                <h3>Customer Details</h3>
                <p>Name: {bill.customerDetails.name}</p>
                <p>Phone: {bill.customerDetails.phoneNumber}</p>
                <p>Aadhar: {bill.customerDetails.aadharNumber}</p>
                {bill.customerDetails.address && (
                  <p>Address: {bill.customerDetails.address}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Bike Specifications */}
          <div className="bike-specs">
            <h3 className="bike-specs-title">Bike Specifications</h3>
            {bill.products.map((product, index) => (
              <div key={index} className="bike-specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Model</span>
                  <span className="spec-value">{product.model}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Color</span>
                  <span className="spec-value">{product.color}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Battery</span>
                  <span className="spec-value">{product.batteryType}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Motor</span>
                  <span className="spec-value">{product.motorPower}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Range</span>
                  <span className="spec-value">{product.range}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Speed</span>
                  <span className="spec-value">{product.topSpeed}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Charge</span>
                  <span className="spec-value">{product.chargingTime}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Wheel</span>
                  <span className="spec-value">{product.wheelSize}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Chassis</span>
                  <span className="spec-value">{product.chassisNumber}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Motor No</span>
                  <span className="spec-value">{product.motorNumber}</span>
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
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.products.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>
                      <p>{product.description}</p>
                      <p><strong>Chassis:</strong> {product.chassisNumber}</p>
                      <p><strong>Motor:</strong> {product.motorNumber}</p>
                      <p className="gst-amount">GST: ₹{product.gstAmount}</p>
                    </td>
                    <td className="text-right">{product.quantity}</td>
                    <td className="text-right">₹{product.unitPrice}</td>
                    <td className="text-right">₹{product.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Totals */}
          <div className="total-wrapper">
            <div className="total-box">
              <div className="payment-mode-badge">
                {bill.paymentMode?.replace('_', ' ').toUpperCase()}
              </div>
              <div className="total-row" style={{marginTop: '8px'}}>
                <span>Subtotal:</span>
                <span>₹{bill.subTotal}</span>
              </div>
              <div className="total-row">
                <span>GST ({business?.gstRate || 0}%):</span>
                <span>₹{bill.gstTotal}</span>
              </div>
              <div className="total-grand">
                <span>Total:</span>
                <span>₹{bill.grandTotal}</span>
              </div>
            </div>
          </div>
          
          {/* Warranty & Footer */}
          <div>
            <div className="warranty-box">
              <h3 className="warranty-title">Warranty Details</h3>
              <div className="warranty-content whitespace-pre-line">
                {bill.specialInstructions?.otherComments || 'Standard warranty applies.'}
              </div>
            </div>

            <p className="invoice-footer-text">
              If you have any questions about this invoice, please contact us at {business?.phone}
            </p>
            <p className="invoice-footer-text" style={{marginTop: '2px'}}>Thank you for your business!</p>
            
            <div className="signature-area">
              <div className="signature-box">
                <div style={{height: '20px'}}></div>
                <p className="signature-line">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}