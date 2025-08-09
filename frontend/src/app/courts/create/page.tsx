'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

export default function CreateCourtPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    location: '',
    pricePerHour: '',
    description: '',
    amenities: [] as string[]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sports options
  const sports = [
    'Badminton', 'Football', 'Cricket', '8 Ball Pool', 'Snooker', 
    'Tennis', 'Basketball', 'Futsal', 'Volleyball'
  ];

  // Available amenities
  const availableAmenities = [
    'Parking', 'Washroom', 'Changing Room', 'Lockers', 
    'Drinking Water', 'Cafeteria', 'AC', 'Lighting'
  ];

  // Check if user is owner
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login to create a court</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Owner Access Required</h2>
          <p className="text-gray-600 mb-4">Only court owners can create new courts</p>
          <button
            onClick={() => router.push('/courts')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Courts
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const courtData = {
        ...formData,
        pricePerHour: parseInt(formData.pricePerHour)
      };

      await fetchApi('/courts', {
        method: 'POST',
        body: JSON.stringify(courtData)
      });

      router.push('/courts/my-courts');
    } catch (err: any) {
      setError(err.message || 'Failed to create court');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Court</h1>
              <p className="text-gray-600 mt-1">Add a new sports court to your listings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Court Information</h2>
            <p className="text-gray-600 mt-1">Fill in the details for your new court</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">❌ {error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Elite Badminton Court"
                />
              </div>

              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                  Sport *
                </label>
                <select
                  id="sport"
                  name="sport"
                  value={formData.sport}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a sport</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., DLF Phase 3, Gurugram"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the full address. Coordinates will be automatically generated.
              </p>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700 mb-2">
                Price per Hour (₹) *
              </label>
              <input
                type="number"
                id="pricePerHour"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 500"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your court, facilities, and any special features..."
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableAmenities.map(amenity => (
                  <label
                    key={amenity}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {loading ? 'Creating Court...' : 'Create Court'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Card */}
        {formData.name && formData.sport && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
              <p className="text-gray-600 mt-1">How your court will appear to users</p>
            </div>
            <div className="p-6">
              <div className="max-w-sm">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg h-32 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-3xl mb-2">
                      {formData.sport === 'Badminton' && '🏸'}
                      {formData.sport === 'Football' && '⚽'}
                      {formData.sport === 'Cricket' && '🏏'}
                      {formData.sport === '8 Ball Pool' && '🎱'}
                      {formData.sport === 'Snooker' && '🎯'}
                      {formData.sport === 'Tennis' && '🎾'}
                      {formData.sport === 'Basketball' && '🏀'}
                      {formData.sport === 'Futsal' && '⚽'}
                      {formData.sport === 'Volleyball' && '🏐'}
                    </div>
                    <p className="font-semibold">{formData.sport}</p>
                  </div>
                </div>
                <div className="border border-t-0 border-gray-200 rounded-b-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{formData.name}</h4>
                  {formData.location && (
                    <p className="text-sm text-gray-600 mb-2">📍 {formData.location}</p>
                  )}
                  {formData.pricePerHour && (
                    <p className="text-lg font-bold text-green-600 mb-2">
                      ₹{formData.pricePerHour}/hour
                    </p>
                  )}
                  {formData.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.amenities.slice(0, 3).map(amenity => (
                        <span
                          key={amenity}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {formData.amenities.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{formData.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}