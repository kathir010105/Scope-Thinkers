import { useEffect, useState } from "react";
import { fetchBooks } from "./services/api";
import BookTable from "./components/BookTable";

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);

        const data = await fetchBooks();

        setBooks(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load books.");
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">Loading books...</p>

          <p className="text-gray-400 mt-2">Fetching data from Open Library</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Book Management</h1>

          <p className="text-gray-400 mt-2">
            {books.length} books loaded from Open Library
          </p>
        </div>

        <BookTable data={books} />
      </div>
    </div>
  );
}

export default App;
