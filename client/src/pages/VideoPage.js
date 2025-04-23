import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth';

function SkeletonComments() {
  return (
    <div>
      {Array.from({length: 3}).map((_,i) => (
        <div key={i} className="mb-6">
          <div className="skeleton skeleton-user mb-2 w-24 h-5"></div>
          <div className="skeleton h-6 w-4/5 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}

function VideoPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [likeState, setLikeState] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef();
  const commentInputRef = useRef();

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:4000/api/videos/${id}`)
      .then(res => {
        setVideo(res.data);
        setLikeCount(res.data.likes?.length || 0);
        setLikeState(res.data.likes?.includes(user?._id));
        setSubscribed(res.data.subscribers?.includes(user?._id));
        setLoading(false);
      });
    axios.get(`http://localhost:4000/api/comments/${id}`)
      .then(res => setComments(res.data));
  }, [id, user?._id]);

  const handleLike = async () => {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    try {
      if (!likeState) {
        const res = await axios.post(`http://localhost:4000/api/videos/${id}/like`, {}, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        setLikeCount(res.data.likes);
        setLikeState(true);
      } else {
        const res = await axios.post(`http://localhost:4000/api/videos/${id}/unlike`, {}, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        setLikeCount(res.data.likes);
        setLikeState(false);
      }
    } catch {}
    setLikeLoading(false);
  };

  const handleSubscribe = async () => {
    if (!user || subLoading || !video) return;
    setSubLoading(true);
    try {
      if (!subscribed) {
        await axios.post(`http://localhost:4000/api/videos/${id}/subscribe`, {}, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        await refreshUser();
        setSubscribed(true);
      } else {
        await axios.post(`http://localhost:4000/api/videos/${id}/unsubscribe`, {}, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        await refreshUser();
        setSubscribed(false);
      }
    } catch {}
    setSubLoading(false);
  };

  const handleComment = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await axios.post(`http://localhost:4000/api/comments/${id}`,
        { text: newComment },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      setComments([res.data.comment, ...comments]);
      setNewComment('');
    } catch {}
    setCommentLoading(false);
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="video-page-container rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-8">
        <div className="skeleton w-full h-72 mb-6 rounded-lg"></div>
        <SkeletonComments />
      </div>
    </div>
  );

  if (!video) return <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">Video not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="video-page-container rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-8">
        <video
          ref={videoRef}
          className="w-full rounded-lg mb-6 bg-black aspect-video"
          src={`http://localhost:4000${video.videoUrl}`}
          poster={video.thumbnailUrl || undefined}
          controls
          autoPlay={false}
        />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{video.title}</h1>
            <div className="text-pink-600 dark:text-pink-400 font-semibold text-sm mb-1">by {video.user?.username || 'User'}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">Uploaded: {new Date(video.createdAt).toLocaleDateString()}</div>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={handleLike} disabled={likeLoading} className={`px-4 py-2 rounded-full font-bold transition-colors ${likeState ? 'bg-pink-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-pink-600 dark:text-pink-400'} hover:bg-pink-600 hover:text-white`}>
              ❤️ {likeCount}
            </button>
            <button onClick={handleSubscribe} disabled={subLoading} className={`px-4 py-2 rounded-full font-bold transition-colors ${subscribed ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 dark:bg-gray-800 text-yellow-500'} hover:bg-yellow-400 hover:text-gray-900`}>
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
        </div>
        <div className="video-desc text-gray-700 dark:text-gray-200 mb-6">
          {video.description || <span className="italic text-gray-400">No description.</span>}
        </div>
        <div className="comment-section">
          <h3 className="font-bold text-lg mb-3 text-pink-600 dark:text-pink-400">Comments</h3>
          {user ? (
            <form onSubmit={handleComment} className="w-full mb-6">
              <div className="flex flex-col gap-2 w-full">
                <textarea
                  ref={commentInputRef}
                  className="w-full resize-none px-6 py-4 rounded-3xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg shadow-lg placeholder-gray-400 dark:placeholder-gray-500 transition-all min-h-[56px] max-h-40"
                  rows={2}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  disabled={commentLoading}
                  autoComplete="off"
                />
                <button type="submit" className="w-full px-6 py-4 bg-pink-500 text-white rounded-3xl hover:bg-pink-600 transition-colors font-semibold text-lg shadow-lg" disabled={commentLoading || !newComment.trim()}>{commentLoading ? '...' : 'Post'}</button>
              </div>
            </form>
          ) : (
            <div className="text-gray-500 mb-6">Login to comment.</div>
          )}
          {comments.length === 0 ? (
            <div className="text-gray-500">No comments yet.</div>
          ) : (
            comments.map(comment => (
              <div key={comment._id} className="comment bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <div className="font-bold text-pink-600 dark:text-pink-400 mb-1">{comment.user?.username || 'User'}</div>
                <div className="text-gray-900 dark:text-gray-100 mb-1">{comment.text}</div>
                <div className="text-xs text-gray-400">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoPage;
