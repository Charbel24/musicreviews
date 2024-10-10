const router = require('express').Router();
const prisma  = require('../db');
const {auth} = require('../middleware/auth');

// POST: Create a new report
router.post('/', auth, async (req, res) => {
  try {
    const { content, type, albumId, reviewId } = req.body;
    const userId = req.userId;

    if (type !== 'ALBUM' && type !== 'REVIEW') {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    if (type === 'ALBUM' && !albumId) {
      return res.status(400).json({ error: 'Album ID is required for album reports' });
    }

    if (type === 'REVIEW' && !reviewId) {
      return res.status(400).json({ error: 'Review ID is required for review reports' });
    }

    const newReport = await prisma.report.create({
      data: {
        content,
        type,
        userId,
        albumId: type === 'ALBUM' ? parseInt(albumId) : undefined,
        reviewId: type === 'REVIEW' ? parseInt(reviewId) : undefined,
      },
    });

    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'An error occurred while creating the report' });
  }
});

// GET: Fetch reports (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin rights required.' });
    }

    const reports = await prisma.report.findMany({
      include: {
        user: { select: { id: true, name: true } },
        album: { select: { id: true, title: true } },
        review: { select: { id: true, content: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'An error occurred while fetching reports' });
  }
});

// PUT: Update report status (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin rights required.' });
    }

    if (!['PENDING', 'RESOLVED', 'DISMISSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedReport = await prisma.report.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'An error occurred while updating the report' });
  }
});

module.exports = router;