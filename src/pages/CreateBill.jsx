import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
export default function CreateBill() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [motorNumber, setMotorNumber] = useState('');
  const [batteryNumber, setBatteryNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');

  const [paymentMode, setPaymentMode] = useState('cash');
  const [business, setBusiness] = useState(null);

  const [comments, setComments] = useState(
    'Motor, Controller & Charger Warranty: 12 Months\nBattery Warranty: 12 Months'
  );

useEffect(() => {

  const fetchBusiness = async () => {

    try {

      const token = localStorage.getItem('token');

      const response = await axios.get(
        'http://localhost:5000/api/business/details',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBusiness(response.data);

    } catch (error) {

      console.log(error);

      toast.error('Failed to load business details');

    }

  };

  fetchBusiness();

}, []);

const gstRate = business?.gstRate || 0;



const grandTotal = Number(price || 0);

const gstAmount = Number(
  ((grandTotal * gstRate) / 100).toFixed(2)
);

const subTotal = Number(
  (grandTotal - gstAmount).toFixed(2)
);

const handleCreateBill = async (e) => {

  e.preventDefault();

  try {

    const token = localStorage.getItem('token');

    const billData = {

      customerDetails: {
        name: customerName,
        phoneNumber: phoneNumber,
        address: address,
        aadharNumber: aadharNumber
      },

      products: [
        {
          quantity: Number(quantity),
          name: productName,
          description: description,
          chassisNumber: chassisNumber,
          motorNumber: motorNumber,
          battery: batteryNumber,
          unitPrice: `₹${price} (GST ${gstRate}% Included)`,
          priceWithoutGst: Number(subTotal.toFixed(2)),
          gstAmount: Number(gstAmount.toFixed(2)),
          totalPrice: Number(grandTotal.toFixed(2)),
        }
      ],

      subTotal: Number(subTotal.toFixed(2)),
      gstTotal: Number(gstAmount.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),

      paymentMode: paymentMode.toLowerCase(),

      specialInstructions: {
        motorWarranty: '12 Months',
        batteryWarranty: '12 Months',
        otherComments: comments
      }

    };

    console.log(billData);

    const response = await axios.post(
      'http://localhost:5000/api/bills/create',
      billData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log(response.data);

    toast.success('Bill Created Successfully');
    navigate(`/bill/${response.data._id}`);

  } catch (error) {

    console.log(error.response?.data || error);

    toast.error('Failed To Create Bill');

  }

};

  return (

    <div className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">

        <h1 className="text-3xl font-bold text-center text-green-600 mb-8">
          Create Bill
        </h1>

        <form onSubmit={handleCreateBill}>

          {/* Customer Details */}

          <div className="mb-8">

            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Customer Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="border p-3 rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="border p-3 rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="Aadhar Number"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value)}
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border p-3 rounded-lg"
              />

            </div>

          </div>

          {/* Product Details */}

          <div className="mb-8">

            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Product Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="text"
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="border p-3 rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="Motor Number"
                value={motorNumber}
                onChange={(e) => setMotorNumber(e.target.value)}
                className="border p-3 rounded-lg"
              />
               <input
                   type="text"
                   placeholder="Chassis Number"
                   value={chassisNumber}
                   onChange={(e) => setChassisNumber(e.target.value)}
                    className="border p-3 rounded-lg"
                />

              <input
                type="text"
                placeholder="Battery Number"
                value={batteryNumber}
                onChange={(e) => setBatteryNumber(e.target.value)}
                className="border p-3 rounded-lg"
              />

              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border p-3 rounded-lg"
              />

              <input
                type="number"
                placeholder="Unit Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border p-3 rounded-lg"
              />

            </div>

          </div>

          {/* Payment */}

          <div className="mb-8">

            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Payment Details
            </h2>

            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="border p-3 rounded-lg w-full"
            >
              <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
            </select>

          </div>

          {/* Comments */}

          <div className="mb-8">

            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Warranty / Comments
            </h2>

            <textarea
              rows="5"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="border p-3 rounded-lg w-full"
            />

          </div>
              {/* Total */}

              <div className="mb-8 text-right">

                <div className="space-y-2 text-right">

                  <h2 className="text-lg font-semibold">
                    Subtotal: ₹ {subTotal}
                  </h2>

                  <h2 className="text-lg font-semibold">
                    GST ({gstRate}%): ₹ {gstAmount}
                  </h2>

                  <h2 className="text-3xl font-bold text-green-600">
                    Grand Total: ₹ {grandTotal}
                  </h2>

                </div>

              </div>

          {/* Submit */}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-green-700"
          >
            Create Bill
          </button>

        </form>

      </div>

    </div>

  );

}