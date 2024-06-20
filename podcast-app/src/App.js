import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PodcastLists from './Components/podcastLists.jsx'; // Corrected import
import PodcastDetails from './Components/podcastDetails.jsx'; // Corrected import
import AudioPlayer from './Components/audioPlayer.jsx'; // Corrected import
import Favorites from './Components/favorites.jsx'; // Corrected import
import './App.css';

const App = () => {
  const [currentEpisode, setCurrentEpisode] = useState(null);

  const toggleFavorite = ({ podcastId, seasonId, episode }) => {
    // Implement logic to handle favorites, possibly using localStorage or API
    console.log(`Toggle favorite: ${episode.title}`);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1 className="header-text">PodCastaway</h1>
          <nav className="App-nav">
            <ul className="header-links">
              <li>
                <Link to="/" className="button">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="button">
                  Favorites
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<PodcastLists setCurrentEpisode={setCurrentEpisode} />} />
          <Route
            path="/podcast/:id"
            element={<PodcastDetails setCurrentEpisode={setCurrentEpisode} toggleFavorite={toggleFavorite} />}
          />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>

        {/* Always render PodcastPlayer */}
        <AudioPlayer currentEpisode={currentEpisode} />
      </div>
    </Router>
  );
};

export default App;
