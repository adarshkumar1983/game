// app/page.tsx
'use client'; // This needs to be a client component

import CourtCard from './components/CourtCard';
import { fetchApi } from './lib/api';
import { useState } from 'react';


const sports = [
  { name: 'Badminton', icon: '🏸' },
  { name: 'Football', icon: '⚽' },
  { name: 'Cricket', icon: '🏏' },
  { name: '8 Ball Pool', icon: '🎱' },
  { name: 'Snooker', icon: '🎯' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Futsal', icon: '⚽' },
  { name: 'Volleyball', icon: '🏐' },
];

async function getCourts(sport = '') {
  try {
    const query = sport ? `?sport=${encodeURIComponent(sport)}` : '';
    const data = await fetchApi(`/courts${query}`);
    return data.data;
  } catch (error) {
    console.error("Failed to fetch courts:", error);
    return [];
  }
}


import { useEffect } from 'react';

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState('');
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCourts(selectedSport).then((data) => {
      setCourts(data);
      setLoading(false);
    });
  }, [selectedSport]);

  return (
    <div>
     

      {/* Sport Category Selector */}
      <div className="overflow-x-auto pb-2 mb-8 flex justify-center">
        <div className="flex gap-3 min-w-max justify-center">
          {sports.map((sport) => (
            <button
              key={sport.name}
              onClick={() => setSelectedSport(selectedSport === sport.name ? '' : sport.name)}
              className={`flex flex-col items-center justify-center w-28 h-20 md:w-32 md:h-24 px-2 py-2 rounded-xl border transition-colors whitespace-nowrap
                ${selectedSport === sport.name ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
              style={{ minWidth: '7rem', minHeight: '5rem' }}
            >
              <span className="text-2xl mb-1">{sport.icon}</span>
              <span className="text-xs font-medium">{sport.name}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading courts...</p>
      ) : courts.length === 0 ? (
        <p>No courts available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courts.map((court: any) => (
            <CourtCard key={court._id} court={court} />
          ))}
        </div>
      )}
    </div>
  );
}