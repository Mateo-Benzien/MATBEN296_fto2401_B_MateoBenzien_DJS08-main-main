import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../App.css';

const PodcastDetail = ({ setCurrentEpisode }) => {
  const { id } = useParams();
  const [podcast, setPodcast] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchPodcastDetails = async () => {
      try {
        const response = await fetch(`https://podcast-api.netlify.app/id/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch podcast details');
        }
        const data = await response.json();

        const seasons = Array.isArray(data.seasons) ? data.seasons : [];

        const podcastDetails = {
          id: data.id,
          title: data.title,
          image: data.image,
          description: data.description,
          seasons: seasons.map((season, index) => ({
            id: season.id,
            title: `Season ${index + 1}`,
            episodes: season.episodes,
            previewImage: season.image,
          })),
        };

        setPodcast(podcastDetails);
      } catch (error) {
        console.error('Error fetching podcast details:', error);
      }
    };

    fetchPodcastDetails();
  }, [id]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const toggleFavorite = (episode) => {
    if (!podcast) return;

    const { id: podcastId, seasons } = podcast;
    const { id: episodeId } = episode;
    const seasonId = seasons[selectedSeason].id;

    const isFavorited = favorites.some(fav =>
      fav.podcastId === podcastId &&
      fav.seasonId === seasonId &&
      fav.episodeId === episodeId
    );

    const updatedFavorites = isFavorited
      ? favorites.filter(fav =>
          !(fav.podcastId === podcastId &&
            fav.seasonId === seasonId &&
            fav.episodeId === episodeId)
        )
      : [
          ...favorites,
          {
            podcastId,
            seasonId,
            episodeId,
            title: episode.title,
            timestamp: new Date().toISOString(),
          },
        ];

    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const handleSeasonChange = (index) => {
    setSelectedSeason(index);
    setSeasonDropdownOpen(false);
  };

  const isFavorite = (episodeId) => {
    return favorites.some(fav => fav.episodeId === episodeId);
  };

  if (!podcast) {
    return (
      <div className="loading-screen">
        <div className="App-logo">Loading...</div>
      </div>
    );
  }

  return (
    <div className="PodcastDetailContainer" style={{ paddingTop: '50px' }}>
      <h2>{podcast.title}</h2>
      <img src={podcast.image} alt={podcast.title} className="PodcastDetailImage" />
      <div className="PodcastDetailDescription">{podcast.description}</div>

      <div className="SeasonSelector">
        <button onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)} className="SeasonButton">
          {podcast.seasons[selectedSeason].title}
          <span className="DropdownArrow">{seasonDropdownOpen ? '▲' : '▼'}</span>
        </button>
        {seasonDropdownOpen && (
          <div className="SeasonDropdown">
            {podcast.seasons.map((season, index) => (
              <button
                key={season.id}
                onClick={() => handleSeasonChange(index)}
                className={`SeasonButton ${index === selectedSeason ? 'active' : ''}`}
              >
                {season.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="PodcastSeason">
        <h3>{podcast.seasons[selectedSeason].title}</h3>
        {podcast.seasons[selectedSeason].previewImage && (
          <img
            src={podcast.seasons[selectedSeason].previewImage}
            alt={`Preview for ${podcast.seasons[selectedSeason].title}`}
            className="SeasonPreviewImage"
          />
        )}
        <div className="EpisodeList">
          <div className="EpisodesHeader">
            <h4>Episodes:</h4>
          </div>
          {podcast.seasons[selectedSeason].episodes.length > 0 ? (
            podcast.seasons[selectedSeason].episodes.map((episode, index) => (
              <div
                key={episode.id}
                className="Episode"
                onClick={() => setCurrentEpisode(episode)}
              >
                <span className="EpisodeNumber">{index + 1}.</span>
                <span className="EpisodeTitle">{episode.title}</span>
                <button
                  className="FavoriteButton"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(episode);
                  }}
                >
                  {isFavorite(episode.id) ? 'Favorited' : 'Add to Favorites'}
                </button>
              </div>
            ))
          ) : (
            <div className="Episode">
              <span className="EpisodeTitle">PLACEHOLDER AUDIO TRACK</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

PodcastDetail.propTypes = {
  setCurrentEpisode: PropTypes.func.isRequired,
};

export default PodcastDetail;
