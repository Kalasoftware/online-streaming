import React, { useEffect, useState } from 'react';
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

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    axios.get(`http://localhost:4000/api/auth/profile/me`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    }).then(res => {
      setProfile(res.data);
      setLoading(false);
    });
  }, [user]);

  if (!user) return <div className="form-container">Login to see your profile.</div>;
  if (loading || !profile) return <div className="form-container"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
        <div className="avatar-placeholder avatar-initial text-3xl md:text-5xl w-20 h-20 flex items-center justify-center bg-gradient-to-br from-pink-500 to-yellow-400 text-white font-extrabold rounded-full shadow-lg">
          {profile.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{profile.username}</div>
          <div className="text-gray-500 dark:text-gray-300 mb-2">{profile.email}</div>
          <div className="text-pink-600 dark:text-pink-400 font-semibold">Joined {new Date(profile.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
      <h2 className="text-xl font-bold text-pink-600 dark:text-pink-400 mb-6">My Videos</h2>
      <div className="video-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {profile.videos.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 text-xl py-10">No videos uploaded yet.</div>
        ) : (
          profile.videos.map(video => (
            <div key={video.id} className="video-card group hover:scale-105 hover:shadow-2xl transition-transform duration-200 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col">
              <video
                className="video-thumb w-full aspect-video object-cover bg-black rounded-t-2xl group-hover:brightness-110"
                src={`http://localhost:4000${video.videoUrl}`}
                poster={video.thumbnailUrl || undefined}
                preload="metadata"
                muted
              />
              <div className="video-info p-4 flex-1 flex flex-col justify-between">
                <div className="video-title text-lg font-bold text-gray-900 dark:text-gray-100 truncate mb-1">{video.title}</div>
                <div className="video-user text-gray-500 dark:text-gray-400 text-xs">Views: {video.views}</div>
                <div className="video-user text-pink-600 dark:text-pink-400 font-medium text-xs">Uploaded: {new Date(video.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;
