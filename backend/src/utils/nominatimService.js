const axios = require('axios');

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Search for hospitals/clinics near a location
const searchNearbyHospitals = async (lat, lng, radius = 10000) => {
  try {
    // Convert radius to degrees (approximate)
    const radiusDeg = radius / 111000; // 1 degree ≈ 111km
    
    // Build bounding box
    const minLat = parseFloat(lat) - radiusDeg;
    const maxLat = parseFloat(lat) + radiusDeg;
    const minLon = parseFloat(lng) - radiusDeg;
    const maxLon = parseFloat(lng) + radiusDeg;

    // Query for hospitals and clinics
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](${minLat},${minLon},${maxLat},${maxLon});
        node["amenity"="clinic"](${minLat},${minLon},${maxLat},${maxLon});
        node["healthcare"="hospital"](${minLat},${minLon},${maxLat},${maxLon});
        node["healthcare"="clinic"](${minLat},${minLon},${maxLat},${maxLon});
        node["healthcare"="doctor"](${minLat},${minLon},${maxLat},${maxLon});
      );
      out body;
    `;

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MediLink Healthcare App'
        },
        timeout: 10000
      }
    );

    return response.data.elements.map(element => ({
      id: element.id,
      name: element.tags.name || 'Unknown Hospital/Clinic',
      type: element.tags.amenity || element.tags.healthcare,
      address: buildAddress(element.tags),
      location: {
        lat: element.lat,
        lng: element.lon
      },
      phone: element.tags.phone || element.tags['contact:phone'] || null,
      website: element.tags.website || element.tags['contact:website'] || null,
      openingHours: element.tags.opening_hours || null,
      emergency: element.tags.emergency === 'yes',
      wheelchair: element.tags.wheelchair,
      distance: calculateDistance(lat, lng, element.lat, element.lon)
    })).sort((a, b) => a.distance - b.distance);

  } catch (error) {
    console.error('Nominatim search error:', error.message);
    return [];
  }
};

// Geocode address to coordinates
const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'MediLink Healthcare App'
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        address: result.address
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
    const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
      params: {
        lat: lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'MediLink Healthcare App'
      }
    });

    return {
      displayName: response.data.display_name,
      address: response.data.address,
      lat: parseFloat(response.data.lat),
      lng: parseFloat(response.data.lon)
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return null;
  }
};

// Build address string from tags
const buildAddress = (tags) => {
  const parts = [];
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:housenumber']) parts.unshift(tags['addr:housenumber']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
  if (tags['addr:state']) parts.push(tags['addr:state']);
  
  return parts.join(', ') || 'Address not available';
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return Math.round(R * c); // Distance in meters
};

module.exports = {
  searchNearbyHospitals,
  geocodeAddress,
  reverseGeocode,
  calculateDistance
};
