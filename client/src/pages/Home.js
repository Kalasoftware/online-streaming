import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth';

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

function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:4000/api/videos')
      .then(res => {
        setVideos(res.data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Modern Hero Section */}
      <section className="home-hero bg-gradient-to-br from-gray-900 via-pink-700 to-pink-400 text-white rounded-b-3xl shadow-2xl mb-10 py-14 px-2 text-center relative overflow-hidden">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight bg-gradient-to-r from-pink-400 via-yellow-400 to-pink-600 bg-clip-text text-transparent">Welcome to kalsoftware</h1>
        <p className="text-lg md:text-2xl opacity-90 mb-6 max-w-2xl mx-auto">The modern place to upload, discover, and share amazing videos. Experience a beautiful, fast, and interactive platform inspired by the best of YouTube!</p>
        <div className="home-cta flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link to="/upload" className="navbar-link px-8 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg shadow-lg transition-all">Upload Video</Link>
          <Link to="/subscriptions" className="navbar-link-btn px-8 py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg shadow-lg transition-all">My Subscriptions</Link>
        </div>
      </section>

      {/* Video Grid Section */}
      <div className="video-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 md:px-8 max-w-7xl mx-auto">
        {loading ? (
          Array.from({length: 8}).map((_, i) => <SkeletonCard key={i} />)
        ) : videos.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 text-xl py-12">No videos found.</div>
        ) : (
          videos.map(video => (
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

export default Home;
