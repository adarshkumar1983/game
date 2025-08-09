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

// @desc    Get bookings for a specific court and time window (owner only)
// @route   GET /api/bookings/court/:courtId
// @access  Private/Owner
exports.getCourtBookings = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { date, startTime, endTime } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'date (YYYY-MM-DD) is required' });
    }

    // Verify ownership
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }
    if (court.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view bookings for this court' });
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const timeFilter = startTime && endTime ? {
      $or: [
        { startTime: { $gte: startTime, $lt: endTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    } : {};

    const bookings = await Booking.find({
      court: courtId,
      date: { $gte: dayStart, $lt: dayEnd },
      ...timeFilter,
      status: 'Confirmed'
    }).sort({ startTime: 1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get owner booking summary across their courts for a time window
// @route   GET /api/bookings/owner/summary
// @access  Private/Owner
exports.getOwnerBookingSummary = async (req, res) => {
  try {
    const { date, startTime = '09:00', endTime = '21:00' } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'date (YYYY-MM-DD) is required' });
    }

    // Find all courts owned by the user
    const courts = await Court.find({ owner: req.user.id }, '_id name sport');
    const courtIds = courts.map(c => c._id);

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Fetch bookings overlapping the time window
    const bookings = await Booking.find({
      court: { $in: courtIds },
      date: { $gte: dayStart, $lt: dayEnd },
      status: 'Confirmed',
      $or: [
        { startTime: { $gte: startTime, $lt: endTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    }, 'court startTime endTime');

    // Helper to compute slot counts (1-hour slots)
    const parseHour = (t) => parseInt(String(t).split(':')[0], 10);
    const totalSlots = Math.max(0, parseHour(endTime) - parseHour(startTime));

    // Aggregate bookings per court (count overlapping slots)
    const summaryMap = new Map();
    courts.forEach(c => summaryMap.set(String(c._id), {
      courtId: String(c._id),
      name: c.name,
      sport: c.sport,
      bookedSlots: 0,
      totalSlots,
      slotsLeft: totalSlots,
    }));

    bookings.forEach(b => {
      const id = String(b.court);
      const s = summaryMap.get(id);
      if (!s) return;
      // Count as 1 slot per booking (simplified); could refine to multiple hours if needed
      s.bookedSlots += 1;
      s.slotsLeft = Math.max(0, s.totalSlots - s.bookedSlots);
    });

    const perCourt = Array.from(summaryMap.values());

    const totals = {
      totalCourts: courts.length,
      totalBookedSlots: perCourt.reduce((sum, x) => sum + x.bookedSlots, 0),
      totalSlots: perCourt.reduce((sum, x) => sum + x.totalSlots, 0),
      totalLeft: perCourt.reduce((sum, x) => sum + x.slotsLeft, 0),
    };

    res.status(200).json({ success: true, date, startTime, endTime, totals, perCourt });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};