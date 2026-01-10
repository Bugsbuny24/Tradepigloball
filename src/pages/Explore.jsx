// src/pages/Explore.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import RFQCard from '../components/RFQCard';

export default function Explore() {
  const [rfqs, setRfqs] = useState([]);

  useEffect(() => {
    supabase
      .from('rfqs')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('current_credit', { ascending: false })
      .then(({ data }) => setRfqs(data || []));
  }, []);

  return (
    <div>
      <h1>Explore RFQs</h1>
      {rfqs.map(r => <RFQCard key={r.id} rfq={r} />)}
    </div>
  );
}
