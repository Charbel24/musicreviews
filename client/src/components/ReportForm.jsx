import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ReportForm = ({ type, itemId, onReportSubmitted }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit a report');
      return;
    }

    try {
      await axios.post('/api/reports', {
        content,
        type,
        [type === 'ALBUM' ? 'albumId' : 'reviewId']: itemId,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setContent('');
      setError('');
      onReportSubmitted();
    } catch (error) {
      setError('Failed to submit report. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Describe the issue..."
        required
      />
      <button type="submit">Submit Report</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default ReportForm;