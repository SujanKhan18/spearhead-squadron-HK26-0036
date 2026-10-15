const express = require('express');
const router = express.Router();
const { getNearbyPlaces, addPlace, reportSafety, searchPlaces } = require('../controllers/mapController');
const { protect } = require('../middleware/authMiddleware');

router.get('/nearby', getNearbyPlaces);
router.get('/search', searchPlaces);

router.use(protect);
router.post('/', addPlace);
router.post('/:placeId/report', reportSafety);

module.exports = router;
