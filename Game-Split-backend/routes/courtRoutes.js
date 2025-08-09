const express = require('express');
const {
  getCourts,
  getCourt,
  createCourt,
  updateCourt,
  createBulkCourts,
  getNearbyCourts,
  geocodeAllCourts,
  geocodeAddress,
} = require('../controllers/courtController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Special routes (must come before parameterized routes)
router.get('/nearby', getNearbyCourts);
router.get('/geocode', geocodeAddress);
router.put('/geocode-all', protect, authorize('owner'), geocodeAllCourts);
router.post('/bulk', protect, authorize('owner'), createBulkCourts);

// General routes
router.route('/')
  .get(getCourts)
  .post(protect, authorize('owner'), createCourt);

router.route('/:id')
  .get(getCourt)
  .put(protect, authorize('owner'), updateCourt);

module.exports = router;