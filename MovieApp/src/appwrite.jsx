import { Client, Databases, ID, Query } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

export const database = new Databases(client);

// Update search count for the given search term
export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // Fetch documents with the given search term
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm),
    ]);

    if (result.documents.length > 0) {
      // If the document exists, increment the count
      const documentId = result.documents[0].$id;
      const currentCount = result.documents[0].count || 0;  // Safely access count
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, documentId, {
        count: currentCount + 1,
      });
    } else {
      // If the document does not exist, create a new document
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
  }
};

// Get top trending movies from Appwrite database
export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),             // Limit to top 5 results
      Query.orderDesc("count"),   // Order by the count in descending order
    ]);
    return result.documents;  // Return the trending movies
  } catch (error) {
    console.error("Error fetching trending movies:", error);
  }
};
