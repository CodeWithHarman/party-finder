import { useState, useEffect } from 'react';

export const useParties = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for now
  useEffect(() => {
    // Simulate loading parties
    setLoading(true);
    setTimeout(() => {
      setParties([
        {
          id: 1,
          title: 'Campus House Party',
          description: 'Join us for an epic night!',
          latitude: 40.7128,
          longitude: -74.0060,
          date: new Date().toISOString(),
          host: 'John Doe',
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return { parties, loading, error, refetch: () => {} };
};
