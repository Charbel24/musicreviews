const router = require('express').Router();
const prisma  = require('../db');
const {auth} = require('../middleware/auth');

// POST: Create a new comment
router.post('/', auth, async (req, res) => {
  try {
    const { albumId, content,reviewId, isOwnerResponse } = req.body;
    const userId = req.userId;

    if (isOwnerResponse) {
      const album = await prisma.album.findUnique({
        where: { id: parseInt(albumId) },
      });

      if (!album || album.ownerId !== userId) {
        return res.status(403).json({ error: 'Not authorized to respond as owner' });
      }
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        userId:parseInt(userId),
        reviewId: parseInt(reviewId),
        isOwnerResponse,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'An error occurred while creating the comment' });
  }
});

// GET: Fetch comments for a review
router.get('/review/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { reviewId: parseInt(reviewId) },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'An error occurred while fetching comments' });
  }
});

// GET: Fetch user's comments
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const comments = await prisma.comment.findMany({
      where: { userId },
      include: {
        review: {
          select: { id: true, content: true, album: { select: { id: true, title: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching user comments:', error);
    res.status(500).json({ error: 'An error occurred while fetching user comments' });
  }
});

// PUT: Update a comment
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'An error occurred while updating the comment' });
  }
});

// DELETE: Delete a comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'An error occurred while deleting the comment' });
  }
});

module.exports = router;