import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPreviews } from '../services/Api';
import '../App.css';

const PodcastList = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('AZ'); // Default sort by A-Z
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPodcasts, setFilteredPodcasts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPodcastDetails = async () => {
      try {
        const data = await fetchPreviews();
        const podcastDetails = await Promise.all(
          data.map(async (podcast) => {
            const response = await fetch(`https://podcast-api.netlify.app/id/${podcast.id}`);
            const podcastData = await response.json();
            return {
              ...podcast,
              seasons: podcastData.seasons.length,
              genres: podcastData.genres || [],
            };
          })
        );

        const sortedPodcasts = sortPodcasts(podcastDetails, sortBy);
        setPodcasts(sortedPodcasts);
        setFilteredPodcasts(sortedPodcasts); // Initially set filteredPodcasts to all podcasts
      } catch (error) {
        console.error('Error fetching podcast details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcastDetails();
  }, [sortBy]);

  const sortPodcasts = (podcasts, sortBy) => {
    switch (sortBy) {
      case 'AZ':
        return [...podcasts].sort((a, b) => a.title.localeCompare(b.title));
      case 'ZA':
        return [...podcasts].sort((a, b) => b.title.localeCompare(a.title));
      case 'NEW':
        return [...podcasts].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      case 'OLD':
        return [...podcasts].sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated));
      default:
        return podcasts;
    }
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    filterPodcasts(event.target.value);
  };

  const filterPodcasts = (term) => {
    const filtered = podcasts.filter((podcast) =>
      podcast.title.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredPodcasts(filtered);
  };

  const handlePodcastClick = (event, podcast) => {
    event.stopPropagation(); // Stop event from bubbling up to parent div
    navigate(`/podcast/${podcast.id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <div className="Sidebar">
        <Link to="/" className="SidebarLink">Home</Link>
        <Link to="/favorites" className="SidebarLink">Favorites</Link>
      </div>
      <div className="MainContent">
        <div className="PodcastListContainer">
          <h2>Podcast categories</h2>
          <div className="FilterAndSearch">
            <div className="SortOptions">
              <label htmlFor="sortBy">Sort By:</label>
              <select id="sortBy" value={sortBy} onChange={handleSortChange}>
                <option value="AZ">Title A-Z</option>
                <option value="ZA">Title Z-A</option>
                <option value="NEW">Newly Updated Shows</option>
                <option value="OLD">Oldest Updated Shows</option>
              </select>
            </div>
            <div className="SearchBar">
              <label htmlFor="searchInput">Search :</label>
              <input
                type="text"
                id="searchInput"
                placeholder="Search podcasts..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="PodcastList">
            {filteredPodcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="PodcastItem"
                onClick={() => navigate(`/podcast/${podcast.id}`)} // Directly navigate from the div
              >
                <img
                  src={podcast.image}
                  alt={podcast.title}
                  className="PodcastItemImage"
                  onClick={(event) => handlePodcastClick(event, podcast)} // Pass event and podcast to handler
                />
                <div className="PodcastDetails">
                  <h3 className="PodcastItemTitle">{podcast.title}</h3>
                  <p className="PodcastItemSeasons">Seasons: {podcast.seasons}</p>
                  <p className="PodcastItemGenres">
                    Genres: {podcast.genres.length > 0 ? podcast.genres.join(', ') : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastList;
