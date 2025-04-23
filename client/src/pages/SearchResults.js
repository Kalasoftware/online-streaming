import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SkeletonCard() {
  return (
    <div className="video-card animate-pulse">
      <div className="skeleton skeleton-thumb"></div>
      <div className="video-info">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-user"></div>
      </div>
    </div>
  );
}

function SearchResults() {
  const query = useQuery();
  const searchTerm = query.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchTerm) return;
    setLoading(true);
    axios.get(`http://localhost:4000/api/videos`)
      .then(res => {
        // Simple search: filter by title or description
        const filtered = res.data.filter(v =>
          v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setResults(filtered);
        setLoading(false);
      });
  }, [searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      <section className="py-8 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-pink-600 dark:text-pink-400">Search Results</h2>
        <div className="text-gray-700 dark:text-gray-300 mb-8 text-lg">Showing results for <span className="font-semibold text-pink-500">{searchTerm}</span></div>
      </section>
      <div className="video-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {loading ? (
          Array.from({length: 8}).map((_, i) => <SkeletonCard key={i} />)
        ) : results.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 text-xl py-12">No results found.</div>
        ) : (
          results.map(video => (
            <Link to={`/video/${video._id}`} key={video._id} className="video-card group hover:scale-105 hover:shadow-2xl transition-transform duration-200 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col">
              <video
                className="video-thumb w-full aspect-video object-cover bg-black rounded-t-2xl group-hover:brightness-110"
                src={`http://localhost:4000${video.videoUrl}`}
                poster={video.thumbnailUrl || undefined}
                preload="metadata"
                muted
              />
              <div className="video-info p-4 flex-1 flex flex-col justify-between">
                <div className="video-title text-lg font-bold text-gray-900 dark:text-gray-100 truncate mb-1">{video.title}</div>
                <div className="video-user text-pink-600 dark:text-pink-400 font-medium text-sm">by {video.user?.username || 'User'}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default SearchResults;
