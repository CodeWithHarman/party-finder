import { useState, useEffect } from 'react';
import { fetchActiveParties } from '../firebase/firestore';

export const useParties = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadParties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchActiveParties();
      setParties(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching parties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParties();
  }, []);

  const refetch = () => loadParties();

  return { parties, loading, error, refetch };
};
