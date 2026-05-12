const EARTH_RADIUS_M = 6371000;

/**
 * Returns distance in metres between two GPS coordinates.
 * Uses the Haversine formula.
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_M * c;
};

/**
 * Returns true if (lat, lng) is within radiusMetres of (centerLat, centerLng).
 */
const isWithinRadius = (lat, lng, centerLat, centerLng, radiusMetres) => {
  const distance = haversineDistance(lat, lng, centerLat, centerLng);
  return { allowed: distance <= radiusMetres, distance: Math.round(distance) };
};

module.exports = { haversineDistance, isWithinRadius };
