const Court = require('../models/courtModel');

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