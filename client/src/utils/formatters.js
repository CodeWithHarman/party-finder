/**
 * Format a Firestore Timestamp or JS Date to a readable string.
 * e.g. "Sat, Mar 22 · 9:00 PM"
 */
export const formatPartyDate = (timestamp) => {
  if (!timestamp) return 'TBD';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Returns how long ago a Firestore Timestamp was.
 * e.g. "3 hours ago", "2 days ago"
 */
export const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
};

/**
 * Capitalise the first letter of a string.
 */
export const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';