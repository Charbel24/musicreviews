import { useState } from 'react';

const CommentForm = ({ reviewId, onCommentAdded }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCommentAdded(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        required
      />
      <button type="submit">Add Comment</button>
    </form>
  );
};

export default CommentForm;