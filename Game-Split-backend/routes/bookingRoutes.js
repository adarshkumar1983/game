const express = require('express');
const { createBooking, getMyBookings } = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// A player creates a booking
router.post('/', protect, authorize('player'), createBooking);

// Any authenticated user can see their own bookings
router.get('/mybookings', protect, getMyBookings);

module.exports = router;