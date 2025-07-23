const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a court name'],
    trim: true,
  },
  sport: {
    type: String,
    required: [true, 'Please specify the sport'],
       enum: [
      'Badminton',
      'Football',
      'Cricket',
      '8 Ball Pool',
      'Snooker',
      'Tennis',
      'Basketball',
      'Futsal',
      'Volleyball'
    ],
  },
  description: {
    type: String,
    maxlength: 500,
  },
  location: {
    type: String,
    required: true,
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Please provide a price per hour'],
  },
  photos: {
    type: [String],
    default: [],
  },
  amenities: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

const Court = mongoose.model('Court', courtSchema);
module.exports = Court;