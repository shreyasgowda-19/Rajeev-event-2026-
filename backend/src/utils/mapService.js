const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Search nearby hospitals/clinics using Google Places API
const searchNearbyPlaces = async (lat, lng, radius = 5000, type = 'hospital') => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: `${lat},${lng}`,
          radius: radius,
          type: type, // hospital, doctor, health, clinic
          key: GOOGLE_API_KEY,
        },
      }
    );

    return response.data.results.map((place) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      rating: place.rating,
      totalRatings: place.user_ratings_total,
      isOpen: place.opening_hours?.open_now,
      photos: place.photos?.map((p) => p.photo_reference),
      types: place.types,
    }));
  } catch (error) {
    console.error('Google Places API error:', error.message);
    return [];
  }
};

// Geocode address to coordinates
const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: address,
          key: GOOGLE_API_KEY,
        },
      }
    );

    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: response.data.results[0].formatted_address,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
};

// Reverse geocode coordinates to address
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          latlng: `${lat},${lng}`,
          key: GOOGLE_API_KEY,
        },
      }
    );

    if (response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return null;
  }
};

module.exports = {
  searchNearbyPlaces,
  geocodeAddress,
  reverseGeocode,
};
