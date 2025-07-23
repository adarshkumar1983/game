const express = require('express');
const {
  getCourts,
  getCourt,
  createCourt,
  updateCourt,
  createBulkCourts,
} = require('../controllers/courtController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();
router.post('/bulk', protect, authorize('owner'), createBulkCourts);
router.route('/')
  .get(getCourts)
  .post(protect, authorize('owner'), createCourt);

router.route('/:id')
  .get(getCourt)
  .put(protect, authorize('owner'), updateCourt);

module.exports = router;