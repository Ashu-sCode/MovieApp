import React, { useState } from "react";

const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="movie-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        className="movie-poster"
        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
        alt={movie.title}
      />

      {isHovered && movie.trailerUrl && (
        <div className="trailer-preview">
          <iframe
            width="300"
            height="169"
            src={movie.trailerUrl}
            title="Movie Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-rating">⭐ {movie.vote_average.toFixed(1)}</p>
        <p className="movie-overview">
          {movie.overview.length > 120
            ? movie.overview.slice(0, 120) + "..."
            : movie.overview}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
