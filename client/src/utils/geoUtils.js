export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

export const formatDistance = (distanceMiles) => {
  if (distanceMiles < 1) {
    return `${Math.round(distanceMiles * 5280)} ft`; // convert miles to feet
  } else if (distanceMiles < 10) {
    return `${distanceMiles.toFixed(1)} mi`;
  } else {
    return `${Math.round(distanceMiles)} mi`;
  }
};