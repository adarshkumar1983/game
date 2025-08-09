const Court = require('../models/courtModel');
const Booking = require('../models/bookingModel');
const { geocodeAddress, calculateDistance } = require('../utils/geocoding');

// @desc    Get all courts with filtering
// @route   GET /api/courts
exports.getCourts = async (req, res) => {
  try {
    let query = {};
    if (req.query.sport) {
      query.sport = req.query.sport;
    }
    const courts = await Court.find(query).populate('owner', 'name email');
    res.status(200).json({ success: true, count: courts.length, data: courts });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get a single court by ID
// @route   GET /api/courts/:id
exports.getCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }
    res.status(200).json({ success: true, data: court });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create a new court
// @route   POST /api/courts
// @access  Private/Owner
exports.createCourt = async (req, res) => {
  try {
    req.body.owner = req.user.id; // Add owner from logged in user
    
    // Geocode the location if provided
    if (req.body.location) {
      try {
        const coords = await geocodeAddress(req.body.location);
        req.body.coordinates = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat] // MongoDB expects [longitude, latitude]
        };
      } catch (geocodeError) {
        console.warn('Geocoding failed:', geocodeError.message);
        // Continue without coordinates if geocoding fails
      }
    }
    
    const court = await Court.create(req.body);
    res.status(201).json({ success: true, data: court });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a court
// @route   PUT /api/courts/:id
// @access  Private/Owner
exports.updateCourt = async (req, res) => {
  try {
    let court = await Court.findById(req.params.id);

    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    // Make sure user is court owner
    if (court.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this court' });
    }

    court = await Court.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: court });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create multiple courts in bulk
// @route   POST /api/courts/bulk
// @access  Private/Owner
exports.createBulkCourts = async (req, res) => {
  try {
    const { courts } = req.body;

    // Basic validation
    if (!courts || !Array.isArray(courts) || courts.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of courts.' });
    }

    // Add the owner ID to each court object
    const courtsWithOwner = courts.map(court => ({
      ...court,
      owner: req.user.id,
    }));

    // Insert all courts into the database at once
    const createdCourts = await Court.insertMany(courtsWithOwner);

    res.status(201).json({ success: true, data: createdCourts });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create courts in bulk', error: error.message });
  }
};

// @desc    Get nearby courts with availability
// @route   GET /api/courts/nearby
// @access  Public
exports.getNearbyCourts = async (req, res) => {
  try {
    const { lat, lng, radius = 10, date, startTime, endTime, sport } = req.query;

    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid coordinates provided' 
      });
    }

    // Build query for courts
    let courtQuery = {
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: searchRadius * 1000 // Convert km to meters
        }
      }
    };

    // Add sport filter if provided
    if (sport) {
      courtQuery.sport = sport;
    }

    // Find nearby courts
    const courts = await Court.find(courtQuery).populate('owner', 'name email');

    // If date and time are provided, check availability
    let availableCourts = courts;
    if (date && startTime && endTime) {
      const searchDate = new Date(date);
      
      // Get all bookings for the specified date and time range
      const bookings = await Booking.find({
        date: {
          $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
          $lt: new Date(searchDate.setHours(23, 59, 59, 999))
        },
        status: 'Confirmed',
        $or: [
          // Booking starts during our time slot
          { startTime: { $gte: startTime, $lt: endTime } },
          // Booking ends during our time slot
          { endTime: { $gt: startTime, $lte: endTime } },
          // Booking completely encompasses our time slot
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
      });

      // Get IDs of booked courts
      const bookedCourtIds = bookings.map(booking => booking.court.toString());

      // Filter out booked courts
      availableCourts = courts.filter(court => 
        !bookedCourtIds.includes(court._id.toString())
      );
    }

    // Calculate distances and add to response
    const courtsWithDistance = availableCourts.map(court => {
      let distance = null;
      if (court.coordinates && court.coordinates.coordinates) {
        const [courtLng, courtLat] = court.coordinates.coordinates;
        distance = calculateDistance(latitude, longitude, courtLat, courtLng);
      }

      return {
        ...court.toObject(),
        distance: distance ? Math.round(distance * 100) / 100 : null // Round to 2 decimal places
      };
    });

    // Sort by distance
    courtsWithDistance.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    res.status(200).json({ 
      success: true, 
      count: courtsWithDistance.length,
      searchParams: {
        latitude,
        longitude,
        radius: searchRadius,
        date: date || null,
        timeSlot: date && startTime && endTime ? `${startTime} - ${endTime}` : null,
        sport: sport || null
      },
      data: courtsWithDistance 
    });

  } catch (error) {
    console.error('Error in getNearbyCourts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update coordinates for existing courts
// @route   PUT /api/courts/geocode-all
// @access  Private/Admin
exports.geocodeAllCourts = async (req, res) => {
  try {
    const courts = await Court.find({ coordinates: { $exists: false } });
    let updated = 0;
    let failed = 0;

    for (const court of courts) {
      try {
        const coords = await geocodeAddress(court.location);
        await Court.findByIdAndUpdate(court._id, {
          coordinates: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat]
          }
        });
        updated++;
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`Failed to geocode court ${court._id}:`, error.message);
        failed++;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Geocoding completed. Updated: ${updated}, Failed: ${failed}`,
      updated,
      failed
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get coordinates for an address
// @route   GET /api/courts/geocode
// @access  Public
exports.geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Address parameter is required' 
      });
    }

    const coordinates = await geocodeAddress(address);
    
    res.status(200).json({ 
      success: true, 
      address: address,
      coordinates: {
        latitude: coordinates.lat,
        longitude: coordinates.lng
      }
    });

  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: `Geocoding failed: ${error.message}` 
    });
  }
};