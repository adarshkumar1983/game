'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

interface Owner {
  _id: string;
  name: string;
  email: string;
  role?: 'player' | 'owner';
}

interface Court {
  _id: string;
  name: string;
  sport: string;
  location: string;
  pricePerHour: number;
  description?: string;
  amenities: string[];
  photos: string[];
  owner: Owner;
  coordinates?: {
    type: string;
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

interface OwnerSummaryResponse {
  success: boolean;
  date: string;
  startTime: string;
  endTime: string;
  totals: {
    totalCourts: number;
    totalBookedSlots: number;
    totalSlots: number;
    totalLeft: number;
  };
  perCourt: Array<{
    courtId: string;
    name: string;
    sport: string;
    bookedSlots: number;
    totalSlots: number;
    slotsLeft: number;
  }>;
}

export default function MyCourtsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCourts: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averagePrice: 0
  });

  // Booking summary filters
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('21:00');
  const [bookingSummary, setBookingSummary] = useState<OwnerSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Fetch owner's courts
  const fetchMyCourts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await fetchApi('/courts');

      if (data.success) {
        // Filter courts by current user
        const myCourts = data.data.filter((court: Court) => court.owner._id === user._id);
        setCourts(myCourts);

        // Calculate stats
        const totalCourts = myCourts.length;
        const averagePrice = totalCourts > 0
          ? myCourts.reduce((sum: number, court: Court) => sum + court.pricePerHour, 0) / totalCourts
          : 0;

        setStats((s) => ({
          ...s,
          totalCourts,
          averagePrice: Math.round(averagePrice)
        }));
      } else {
        setError('Failed to fetch courts');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings summary for owner
  const fetchBookingSummary = async () => {
    if (!user || user.role !== 'owner') return;
    setSummaryError(null);
    setSummaryLoading(true);
    try {
      const qs = new URLSearchParams({ date, startTime, endTime }).toString();
      const data: OwnerSummaryResponse = await fetchApi(`/bookings/owner/summary?${qs}`);
      setBookingSummary(data);
      setStats((s) => ({
        ...s,
        totalBookings: data.totals.totalBookedSlots,
      }));
    } catch (err: any) {
      setSummaryError(err.message || 'Failed to load booking summary');
      console.error('Summary error:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Delete court
  const deleteCourt = async (courtId: string) => {
    if (!confirm('Are you sure you want to delete this court?')) return;

    try {
      await fetchApi(`/courts/${courtId}`, {
        method: 'DELETE'
      });

      setCourts(courts.filter(court => court._id !== courtId));

      // Update stats
      const newStats = { ...stats };
      newStats.totalCourts -= 1;
      if (newStats.totalCourts > 0) {
        newStats.averagePrice = Math.round(
          courts.filter(c => c._id !== courtId)
            .reduce((sum, court) => sum + court.pricePerHour, 0) / newStats.totalCourts
        );
      } else {
        newStats.averagePrice = 0;
      }
      setStats(newStats);

    } catch (err: any) {
      alert('Error deleting court: ' + err.message);
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchMyCourts();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user && user.role === 'owner') {
      fetchBookingSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login to view your courts dashboard</p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Show owner-only message if user is not an owner
  if (user.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Owner Access Required</h2>
          <p className="text-gray-600 mb-4">Only court owners can access this dashboard</p>
          <Link
            href="/courts"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Courts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courts Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.name}! Manage your sports courts and bookings</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/courts/create"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                ➕ Add New Court
              </Link>
              <button
                onClick={() => { fetchMyCourts(); fetchBookingSummary(); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bookings Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bookings Overview</h2>
              <p className="text-gray-600 text-sm">Select a date and time window to see total booked slots and slots left</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full md:w-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="flex items-end">
                <button onClick={fetchBookingSummary} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Update</button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Courts</div>
              <div className="text-2xl font-bold text-gray-900">{bookingSummary?.totals.totalCourts ?? stats.totalCourts}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Slots</div>
              <div className="text-2xl font-bold text-gray-900">{bookingSummary?.totals.totalSlots ?? '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Booked</div>
              <div className="text-2xl font-bold text-green-600">{bookingSummary?.totals.totalBookedSlots ?? stats.totalBookings}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Left</div>
              <div className="text-2xl font-bold text-blue-600">{bookingSummary?.totals.totalLeft ?? '-'}</div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="mt-6">
            {summaryLoading && (
              <div className="text-gray-600">Loading booking summary...</div>
            )}
            {summaryError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-800">{summaryError}</div>
            )}
            {bookingSummary && bookingSummary.perCourt.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Slots</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Left</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookingSummary.perCourt.map((row) => (
                      <tr key={row.courtId}>
                        <td className="px-6 py-4 text-sm text-gray-900">{row.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{row.sport}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">{row.bookedSlots}</td>
                        <td className="px-6 py-4 text-sm">{row.totalSlots}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">{row.slotsLeft}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-600 mt-2">No booking data for the selected window.</div>
            )}
          </div>
        </div>

        {/* Owner Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🏟️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Booked (Current Window)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Price/Hour</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.averagePrice}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courts Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Courts</h2>
            </div>

            {courts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏟️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courts yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first sports court</p>
                <Link
                  href="/courts/create"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                >
                  ➕ Add Your First Court
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Court
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sport
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Hour
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courts.map((court) => (
                      <tr key={court._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-2xl mr-3">
                              {court.sport === 'Badminton' && '🏸'}
                              {court.sport === 'Football' && '⚽'}
                              {court.sport === 'Cricket' && '🏏'}
                              {court.sport === '8 Ball Pool' && '🎱'}
                              {court.sport === 'Snooker' && '🎯'}
                              {court.sport === 'Tennis' && '🎾'}
                              {court.sport === 'Basketball' && '🏀'}
                              {court.sport === 'Futsal' && '⚽'}
                              {court.sport === 'Volleyball' && '🏐'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {court.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {court.amenities.length} amenities
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {court.sport}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="mr-1">📍</span>
                            <span className="truncate max-w-xs">{court.location}</span>
                          </div>
                          {court.coordinates && (
                            <div className="text-xs text-gray-500 mt-1">
                              Coordinates available
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ₹{court.pricePerHour}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/courts/${court._id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link
                              href={`/courts/${court._id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => deleteCourt(court._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}