// components/CourtCard.tsx
import Link from 'next/link';

export default function CourtCard({ court }: { court: any }) {
  return (
    <div className="border rounded-lg p-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-2">{court.name}</h2>
      <p className="text-gray-600 mb-2">{court.location}</p>
      <p className="font-semibold mb-2">{court.sport}</p>
      <p className="text-lg font-bold text-green-600 mb-4">₹{court.pricePerHour}/hour</p>
      <Link href={`/courts/${court._id}`} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        View Details & Book
      </Link>
    </div>
  );
}