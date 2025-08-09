const express = require('express');
const { createBooking, getMyBookings, getCourtBookings, getOwnerBookingSummary } = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// A player creates a booking
router.post('/', protect, authorize('player'), createBooking);

// Any authenticated user can see their own bookings
router.get('/mybookings', protect, getMyBookings);

// Owner: bookings for a specific court and time window
router.get('/court/:courtId', protect, authorize('owner'), getCourtBookings);

// Owner: booking summary across owned courts
router.get('/owner/summary', protect, authorize('owner'), getOwnerBookingSummary);

module.exports = router;