const router = require('express').Router();
const prisma  = require('../db');
const {auth, adminAuth} = require('../middleware/auth');



// GET all reviews
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        album: {
          select: {
            id: true,
            title: true,
            artist: true,
          }
        }
      }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'An error occurred while fetching reviews' });
  }
});

// POST: Create a new review
router.post('/', auth, async (req, res) => {  
  try {
    const { albumId, content, rating } = req.body;
    
    // Check if user has already reviewed this album
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.userId,
        albumId: parseInt(albumId)
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this album' });
    }

    const newReview = await prisma.review.create({
      data: {
        content,
        rating: parseInt(rating),
        user: { connect: { id: req.userId } },
        album: { connect: { id: parseInt(albumId) } },
      },
      include: {
        user: {
          select: { id: true, name: true }
        },
        album: {
          select: { id: true, title: true }
        }
      }
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create review' });
  }
});

// GET: Retrieve reviews for a specific album
router.get('/album/:albumId', async (req, res) => {
  try {
    const { albumId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { albumId: parseInt(albumId) },
      include: { 
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({reviews});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to retrieve reviews' });
  }
});

// GET: Retrieve a single review by ID
router.get('/:id', async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, name: true } },
        album: { select: { id: true, title: true, artist: true } }
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to retrieve review' });
  }
});

// PUT: Update a review
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, rating } = req.body;
    const reviewId = parseInt(req.params.id);

    // Check if the review belongs to the user
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review || review.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { content, rating: parseInt(rating) },
      include: {
        user: { select: { id: true, name: true } },
        album: { select: { id: true, title: true } }
      }
    });

    res.json(updatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to update review' });
  }
});

// DELETE: Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    // Check if the review belongs to the user
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review || review.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await prisma.review.delete({
      where: { id: reviewId }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to delete review' });
  }
});

// GET: Retrieve reviews by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);

    const reviews = await prisma.review.findMany({
      where: { userId: parseInt(userId) },
      include: { 
        album: { select: { id: true, title: true, artist: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const totalReviews = await prisma.review.count({
      where: { userId: parseInt(userId) }
    });

    res.json({
      reviews,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to retrieve user reviews' });
  }
});

module.exports = router;