export const fetchBooks = async () => {
  const response = await fetch(
    "https://openlibrary.org/search.json?q=harry+potter&limit=400&fields=key,title,author_name,first_publish_year,publisher,isbn,language,edition_count",
  );

  if (!response.ok) {
    throw new Error("Failed to fetch books");
  }

  const data = await response.json();

  return data.docs.map((book, index) => ({
    id: index + 1,

    title: book.title || "Unknown",

    author: book.author_name?.join(", ") || "Unknown",

    year: book.first_publish_year || "N/A",

    publisher: book.publisher?.slice(0, 2).join(", ") || "Unknown",

    isbn: book.isbn?.[0] || "N/A",

    language: book.language?.[0] || "N/A",

    editions: book.edition_count || 0,
  }));
};
