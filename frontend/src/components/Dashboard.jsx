import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Header Component
const Header = ({ user, onLogout }) => (
  <div className="flex justify-between items-center border-b pb-6 mb-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
      {user && (
        <p className="text-gray-600 mt-1">
          Welcome back, <span className="font-medium">{user.username}</span>
        </p>
      )}
    </div>
    <button
      onClick={onLogout}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
    >
      Logout
    </button>
  </div>
);

// Search Form Component
const SearchForm = ({ formData, onChange, onSubmit, isLoading }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Concerts</h2>
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search Concerts
          </label>
          <input
            id="search"
            type="text"
            value={formData}
            onChange={onChange}
            placeholder="Artist, venue, or event name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search Concerts'}
          </button>
        </div>
      </div>
    </form>
  </div>
);

// Search Results Component
const SearchResults = ({ searchResults, onAddConcert, searchCheck }) => {
  if (!searchCheck) {
    return (<div className='mt-6'></div>)
  }

  return (
    <div className="mt-6">
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((event) => (
            <div
              key={event.id}
              className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
            >
              <h3 className="text-lg font-semibold">{event.name}</h3>
              {event.dates?.start?.localDate && (
                <p className="text-sm text-gray-600">
                  {new Date(event.dates.start.localDate).toLocaleDateString()}
                </p>
              )}
              {event._embedded?.venues && (
                <p className="text-sm text-gray-500">
                  {event._embedded.venues[0].name}
                </p>
              )}
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline mt-2 inline-block"
              >
                View Details
              </a>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => onAddConcert(event)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Add Concert
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No concerts found. Try searching for another keyword.</p>
      )}
    </div>
  );
};


// Saved Concerts Component
const SavedConcerts = ({ savedConcerts, concertMsg, onRemoveConcert}) => (
  <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Upcoming Concerts</h2>
    {savedConcerts.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedConcerts.map((concert) => (
          <div
            key={concert.id}
            className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
          >
            <h3 className="text-lg font-semibold">{concert.name}</h3>
            {concert.dates?.start?.localDate && (
              <p className="text-sm text-gray-600">
                {new Date(concert.dates.start.localDate).toLocaleDateString()}
              </p>
            )}
            {concert._embedded?.venues && (
              <p className="text-sm text-gray-500">
                {concert._embedded.venues[0].name}
              </p>
            )}
            <button onClick={() => onRemoveConcert(concert)}>x</button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-600">{concertMsg}</p>
    )}
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savedConcerts, setSavedConcerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [concertMsg, setConcertMsg] = useState("No upcoming concerts yet.");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/users/rememberUser', {
          credentials: 'include',
        });
        const data = await response.json();
        if (!data) {
          navigate('/login');
          return;
        }
        setUser(data);
      } catch (error) {
        console.error('Error:', error);
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=STcPLGTPO3TApNAVFHfXdo9viwy3yfoT&keyword=${formData}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data from Ticketmaster API');
      }

      const data = await response.json();
      setSearchResults(data._embedded?.events || []);
      setSearched(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConcert = (newConcert) => {
    setSavedConcerts((prevSavedConcerts) => [...prevSavedConcerts, newConcert]);
    setConcertMsg('');
  };

  const handleRemoveConcert = (concertToRemove) => {
    setSavedConcerts(savedConcerts.filter((concert) => concert != concertToRemove));
    setConcertMsg('');

  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <Header user={user} onLogout={handleLogout} />
          {user && (
            <>
              <SearchForm
                formData={formData}
                onChange={(e) => setFormData(e.target.value)}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
              <SearchResults searchResults={searchResults} onAddConcert={handleAddConcert} searchCheck = {searched} />
              <SavedConcerts savedConcerts={savedConcerts} concertMsg={concertMsg} onRemoveConcert={handleRemoveConcert}/>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
