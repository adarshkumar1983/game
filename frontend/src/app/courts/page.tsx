'use client';

import { useState, useEffect } from 'react';
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
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: Court[];
}

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    sport: '',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Sports options
  const sports = [
    'Badminton', 'Football', 'Cricket', '8 Ball Pool', 'Snooker', 
    'Tennis', 'Basketball', 'Futsal', 'Volleyball'
  ];

  // Fetch courts from API
  const fetchCourts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.sport) {
        queryParams.append('sport', filters.sport);
      }

      const response = await fetch(`http://localhost:5000/api/courts?${queryParams}`);
      const data: ApiResponse = await response.json();

      if (data.success) {
        setCourts(data.data);
      } else {
        setError('Failed to fetch courts');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching courts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Fetch nearby courts with user location
  const fetchNearbyCourts = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
        radius: '50' // 50km radius
      });

      if (filters.sport) {
        queryParams.append('sport', filters.sport);
      }

      const response = await fetch(`http://localhost:5000/api/courts/nearby?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setCourts(data.data);
      } else {
        setError('Failed to fetch nearby courts');
      }
    } catch (err) {
      setError('Error fetching nearby courts');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort courts
  const filteredAndSortedCourts = courts
    .filter(court => {
      const matchesSearch = court.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           court.location.toLowerCase().includes(filters.search.toLowerCase()) ||
                           court.owner.name.toLowerCase().includes(filters.search.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.pricePerHour;
          bValue = b.pricePerHour;
          break;
        case 'sport':
          aValue = a.sport.toLowerCase();
          bValue = b.sport.toLowerCase();
          break;
        case 'distance':
          aValue = a.distance || 999999;
          bValue = b.distance || 999999;
          break;
        case 'owner':
          aValue = a.owner.name.toLowerCase();
          bValue = b.owner.name.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  useEffect(() => {
    fetchCourts();
    getCurrentLocation();
  }, [filters.sport]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courts Directory</h1>
              <p className="text-gray-600 mt-1">Find and book sports courts near you</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchCourts}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh
              </button>
              {userLocation && (
                <button
                  onClick={fetchNearbyCourts}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  📍 Show Nearby
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Courts
              </label>
              <input
                type="text"
                placeholder="Search by name, location, or owner..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sport Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sport
              </label>
              <select
                value={filters.sport}
                onChange={(e) => handleFilterChange('sport', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sports</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="sport">Sport</option>
                <option value="owner">Owner</option>
                {userLocation && <option value="distance">Distance</option>}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredAndSortedCourts.length} of {courts.length} courts
            {userLocation && (
              <span className="ml-2 text-green-600">
                📍 Location enabled
              </span>
            )}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading courts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Courts Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCourts.map((court) => (
              <div key={court._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Court Image Placeholder */}
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">
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
                    <p className="font-semibold">{court.sport}</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Court Name & Distance */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {court.name}
                    </h3>
                    {court.distance && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                        {court.distance} km
                      </span>
                    )}
                  </div>

                  {/* Owner Information */}
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">👤 Owner:</span>
                      <span className="text-sm text-gray-900 font-semibold">{court.owner.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">📧 Contact:</span>
                      <span className="text-sm text-gray-600">{court.owner.email}</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">📍</span>
                      <div>
                        <p className="text-sm text-gray-900 font-medium">{court.location}</p>
                        {court.coordinates && (
                          <p className="text-xs text-gray-500 mt-1">
                            {court.coordinates.coordinates[1].toFixed(4)}, {court.coordinates.coordinates[0].toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-green-600">₹{court.pricePerHour}</span>
                    <span className="text-gray-500 text-sm">/hour</span>
                  </div>

                  {/* Amenities */}
                  {court.amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {court.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                        {court.amenities.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            +{court.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {court.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {court.description}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/courts/${court._id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                      Book Now
                    </button>
                  </div>

                  {/* Timestamps */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Added: {new Date(court.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredAndSortedCourts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏸</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courts found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => setFilters({ sport: '', search: '', sortBy: 'name', sortOrder: 'asc' })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}