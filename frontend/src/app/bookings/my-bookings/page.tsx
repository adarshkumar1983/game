'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

interface Booking {
  id: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setError('Please log in to view your bookings');
        setLoading(false);
        return;
      }

      try {
        const response = await fetchApi('/bookings/mybookings');
        setBookings(response.data || []);
      } catch (err) {
        setError('Failed to fetch bookings');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading your bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">You haven't made any bookings yet.</p>
          <a 
            href="/" 
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Courts
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{booking.courtName}</h3>
                  <p className="text-gray-600">Date: {new Date(booking.date).toLocaleDateString()}</p>
                  <p className="text-gray-600">
                    Time: {booking.startTime} - {booking.endTime}
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    Total: ₹{booking.totalPrice}
                  </p>
                </div>
                <div className="text-right">
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}