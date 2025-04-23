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

function Subscriptions() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recent');
  const [selectedCreator, setSelectedCreator] = useState('all');

  useEffect(() => {
    if (!user) return;
    axios.get('http://localhost:4000/api/videos/subscriptions/list', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    }).then(res => {
      setVideos(res.data.videos);
      setCreators(res.data.creators);
      setLoading(false);
    });
  }, [user]);

  function sortVideos(videos) {
    let sorted = [...videos];
    if (sort === 'recent') sorted.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'popular') sorted.sort((a,b) => (b.likes?.length||0)-(a.likes?.length||0));
    return sorted;
  }

  const filtered = selectedCreator === 'all' ? videos : videos.filter(v => v.user?._id === selectedCreator);
  const sorted = sortVideos(filtered);

  if (!user) return <div className="form-container">Login to see your subscriptions.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-pink-600 dark:text-pink-400 text-center">My Subscriptions</h2>
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={selectedCreator} onChange={e=>setSelectedCreator(e.target.value)}>
          <option value="all">All Creators</option>
          {creators.map(c => <option key={c._id} value={c._id}>{c.username}</option>)}
        </select>
        <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="recent">Most Recent</option>
          <option value="popular">Most Liked</option>
        </select>
      </div>
      <div className="video-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {loading ? (
          Array.from({length: 8}).map((_, i) => <SkeletonCard key={i} />)
        ) : sorted.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 text-xl py-12">No videos from subscriptions yet.</div>
        ) : (
          sorted.map(video => (
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

export default Subscriptions;
