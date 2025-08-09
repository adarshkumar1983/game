'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Owner {
  _id: string;
  name: string;
  email: string;
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
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  player: {
    name: string;
    email: string;
  };
}

export default function CourtDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courtId = params.id as string;

  const [court, setCourt] = useState<Court | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'bookings' | 'location'>('details');

  // Fetch court details
  const fetchCourtDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/courts/${courtId}`);
      const data = await response.json();

      if (data.success) {
        setCourt(data.data);
      } else {
        setError('Court not found');
      }
    } catch (err) {
      setError('Error loading court details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch court bookings (if you have this endpoint)
  const fetchCourtBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings?court=${courtId}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  useEffect(() => {
    if (courtId) {
      fetchCourtDetails();
      fetchCourtBookings();
    }
  }, [courtId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading court details...</p>
        </div>
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Court Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/courts"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Courts
          </Link>
        </div>
      </div>
    );
  }

  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      'Badminton': '🏸',
      'Football': '⚽',
      'Cricket': '🏏',
      '8 Ball Pool': '🎱',
      'Snooker': '🎯',
      'Tennis': '🎾',
      'Basketball': '🏀',
      'Futsal': '⚽',
      'Volleyball': '🏐'
    };
    return icons[sport] || '🏟️';
  };

  const openInMaps = () => {
    if (court.coordinates) {
      const [lng, lat] = court.coordinates.coordinates;
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(court.location)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{getSportIcon(court.sport)}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{court.name}</h1>
                <p className="text-gray-600">{court.sport} Court</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg h-64 flex items-center justify-center mb-6">
              <div className="text-white text-center">
                <div className="text-6xl mb-4">{getSportIcon(court.sport)}</div>
                <p className="text-xl font-semibold">{court.sport} Court</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'details', label: 'Details', icon: '📋' },
                    { id: 'bookings', label: 'Bookings', icon: '📅' },
                    { id: 'location', label: 'Location', icon: '📍' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Description */}
                    {court.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p className="text-gray-700 leading-relaxed">{court.description}</p>
                      </div>
                    )}

                    {/* Amenities */}
                    {court.amenities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {court.amenities.map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
                            >
                              <span className="text-blue-600">✓</span>
                              <span className="text-gray-900">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Court Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Court Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">Sport</div>
                          <div className="text-lg font-semibold text-gray-900">{court.sport}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">Price per Hour</div>
                          <div className="text-lg font-semibold text-green-600">₹{court.pricePerHour}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">Added</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {new Date(court.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">Last Updated</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {new Date(court.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                    {bookings.length > 0 ? (
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map((booking) => (
                          <div key={booking._id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {new Date(booking.date).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {booking.startTime} - {booking.endTime}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Player: {booking.player.name}
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                booking.status === 'Confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📅</div>
                        <p className="text-gray-600">No bookings yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Location Tab */}
                {activeTab === 'location' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="text-gray-500 mt-1">📍</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{court.location}</div>
                          {court.coordinates && (
                            <div className="text-sm text-gray-600">
                              Coordinates: {court.coordinates.coordinates[1].toFixed(6)}, {court.coordinates.coordinates[0].toFixed(6)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={openInMaps}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      🗺️ Open in Google Maps
                    </button>

                    {/* Map placeholder */}
                    <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">🗺️</div>
                        <p>Map integration coming soon</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Owner Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Court Owner</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {court.owner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{court.owner.name}</div>
                    <div className="text-sm text-gray-600">{court.owner.email}</div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    📞 Contact Owner
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ₹{court.pricePerHour}
                </div>
                <div className="text-gray-600 mb-4">per hour</div>
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  📅 Book Now
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-semibold">{bookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amenities</span>
                  <span className="font-semibold">{court.amenities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sport</span>
                  <span className="font-semibold">{court.sport}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}