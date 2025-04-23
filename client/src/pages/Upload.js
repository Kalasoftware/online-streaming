import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!video) return setError('Please select a video file');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('video', video);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:4000/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Upload failed');
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input type="file" accept="video/*" onChange={e => setVideo(e.target.files[0])} required />
        <button type="submit">Upload</button>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

export default Upload;
