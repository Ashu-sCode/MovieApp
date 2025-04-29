import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import "./App.css";
import Search from "./components/search";
import Loader from "./components/Loader";
import MovieCard from "./components/MovieCard";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedText] = useDebounce(searchTerm, 1000);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?include_adult=true&include_video=true&language=en-US&query=${encodeURIComponent(
            query
          )}&page=1&sort_by=popularity.desc`
        : `${API_BASE_URL}/discover/movie?include_adult=true&include_video=true&language=en-US&with_original_language=hi&page=1&sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(
          data.Error ||
            "An error occurred while fetching movies. Please try again later."
        );
        setMovieList([]);
        return;
      }

      const moviesWithTrailers = await Promise.all(
        data.results.map(async (movie) => {
          const videoResponse = await fetch(
            `${API_BASE_URL}/movie/${movie.id}/videos?language=en-US`,
            API_OPTIONS
          );
          const videoData = await videoResponse.json();
          const trailer = videoData.results.find(
            (video) => video.type === "Trailer"
          );

          return {
            ...movie,
            trailerUrl: trailer
              ? `https://www.youtube.com/embed/${trailer.key}` // Use the /embed/ URL format
              : null,
          };
        })
      );

      setMovieList(moviesWithTrailers);
    } catch (error) {
      console.log(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.log(`Error fetching movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedText);
  }, [debouncedText]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main className="pattern">
      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1 className="text-gradient">MovieApp</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2 className="mt-[40px]">Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Loader />
          ) : errorMessage ? (
            <h2 className="text-red-500">{errorMessage}</h2>
          ) : (
            <div className="movie-grid">
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
