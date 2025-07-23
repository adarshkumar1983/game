const Booking = require('../models/bookingModel');
const Court = require('../models/courtModel');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/Player
exports.createBooking = async (req, res) => {
  try {
    const { courtId, date, startTime, endTime } = req.body;
    
    const court = await Court.findById(courtId);
    if(!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    // Basic check for availability (a real app needs more robust logic)
    const existingBooking = await Booking.findOne({
      court: courtId,
      date: new Date(date),
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'Time slot is already booked' });
    }

    // Basic price calculation
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    const duration = end - start;
    const totalPrice = duration * court.pricePerHour;
    
    const booking = await Booking.create({
      court: courtId,
      player: req.user.id,
      date,
      startTime,
      endTime,
      totalPrice,
    });
    
    // In a real app, you would integrate payment logic here before confirming the booking

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get bookings for the logged-in user
// @route   GET /api/bookings/mybookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ player: req.user.id }).populate('court', 'name sport location');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
     res.status(400).json({ success: false, message: error.message });
  }
};