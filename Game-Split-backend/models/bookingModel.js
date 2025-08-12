const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  court: {
    type: mongoose.Schema.ObjectId,
    ref: 'Court',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled'],
    default: 'Confirmed',
  },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;