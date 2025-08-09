const https = require('https');

/**
 * Convert address to latitude and longitude coordinates
 * Using OpenStreetMap Nominatim API (free geocoding service)
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number}>} - Coordinates object
 */
const geocodeAddress = async (address) => {
  return new Promise((resolve, reject) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const options = {
      headers: {
        'User-Agent': 'GameSplit-App/1.0.0' // Required by Nominatim
      }
    };

    https.get(url, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const results = JSON.parse(data);
          
          if (results && results.length > 0) {
            const { lat, lon } = results[0];
            resolve({
              lat: parseFloat(lat),
              lng: parseFloat(lon)
            });
          } else {
            reject(new Error('Address not found'));
          }
        } catch (error) {
          reject(new Error('Failed to parse geocoding response'));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Geocoding request failed: ${error.message}`));
    });
  });
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

module.exports = {
  geocodeAddress,
  calculateDistance
};