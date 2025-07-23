// app/courts/[id]/page.tsx
import { fetchApi } from '../../lib/api';
import BookingForm from '../../components/BookingForm'; // We will create this next

async function getCourtDetails(id: string) {
  try {
    const data = await fetchApi(`/courts/${id}`);
    return data.data;
  } catch (error) {
    console.error("Failed to fetch court details:", error);
    return null;
  }
}

export default async function CourtDetailPage({ params }: { params: { id: string } }) {
  const court = await getCourtDetails(params.id);

  if (!court) {
    return <div>Court not found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">{court.name}</h1>
        <p className="text-xl text-gray-700 mb-2">{court.location}</p>
        <p className="text-lg font-semibold mb-2">{court.sport}</p>
        <p className="text-2xl font-bold text-green-600 mb-4">₹{court.pricePerHour}/hour</p>
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Amenities</h3>
          <ul className="list-disc list-inside">
            {court.amenities.map((amenity: string) => <li key={amenity}>{amenity}</li>)}
          </ul>
        </div>
      </div>
      
      {/* Booking Form Section */}
      <div className="border rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Book Your Slot</h2>
        <BookingForm court={court} />
      </div>
    </div>
  );
}