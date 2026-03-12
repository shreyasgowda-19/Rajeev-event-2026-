const express = require('express');
const router = express.Router();
const { searchNearbyPlaces, geocodeAddress } = require('../utils/mapService');
const { auth } = require('../middleware/auth');

// Search nearby hospitals/places
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 5000, type = 'hospital' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const places = await searchNearbyPlaces(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius),
      type
    );

    res.json({
      success: true,
      count: places.length,
      places,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Geocode address
router.get('/geocode', auth, async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: 'Address required' });
    }

    const result = await geocodeAddress(address);

    if (!result) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({
      success: true,
      location: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
