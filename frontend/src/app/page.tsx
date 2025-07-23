// app/page.tsx
import CourtCard from './components/CourtCard';
import { fetchApi } from './lib/api';

async function getCourts() {
  try {
    const data = await fetchApi('/courts');
    return data.data; // The API returns { success, count, data }
  } catch (error) {
    console.error("Failed to fetch courts:", error);
    return [];
  }
}

export default async function HomePage() {
  const courts = await getCourts();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Find Your Court</h1>
      {courts.length === 0 ? (
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