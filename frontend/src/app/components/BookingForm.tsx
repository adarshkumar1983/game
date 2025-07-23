// src/components/BookingForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';
import Link from 'next/link';

// This lets TypeScript know that the Razorpay object exists on the window
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingForm({ court }: { court: any }) {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (!date || !startTime) {
      setError('Please select a date and time.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create a Razorpay Order on the backend
      const order = await fetchApi('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: court.pricePerHour }),
      });

      // 2. Open the Razorpay Checkout form
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Court Booking',
        description: `Booking for ${court.name}`,
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify the payment on the backend
          const verificationData = {
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount: court.pricePerHour,
            courtId: court._id,
            date,
            startTime,
            endTime: `${parseInt(startTime.split(':')[0]) + 1}:00`,
          };

          const result = await fetchApi('/payments/verify-payment', {
            method: 'POST',
            body: JSON.stringify(verificationData),
          });

          if (result.success) {
            setSuccess('Booking successful! Check "My Bookings" page.');
          } else {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
            name: user?.name,
            email: user?.email,
        },
        theme: {
            color: '#3399cc'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p>Please <Link href="/login" className="text-blue-500 underline">login</Link> to book a court.</p>;
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <div>
        <label className="block">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block">Start Time</label>
        <input type="time" step="3600" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full p-2 border rounded" />
      </div>
      <button onClick={handlePayment} disabled={loading} className="w-full bg-green-500 text-white p-2 rounded disabled:bg-gray-400">
        {loading ? 'Processing...' : `Pay & Book Now (₹${court.pricePerHour})`}
      </button>
    </div>
  );
}