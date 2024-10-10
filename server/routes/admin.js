const router = require('express').Router();
const prisma  = require('../db');
const {auth,adminAuth} = require('../middleware/auth');

// GET: Fetch all ownership requests
router.get('/ownership-requests', auth, adminAuth, async (req, res) => {
  try {
    const requests = await prisma.ownershipRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        album: { select: { id: true, title: true, artist: true } },
      },
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching ownership requests:', error);
    res.status(500).json({ error: 'An error occurred while fetching ownership requests' });
  }
});

// PUT: Update ownership request status
router.put('/ownership-requests/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await prisma.ownershipRequest.findUnique({
      where: { id: parseInt(id) },
      include: { album: true },
    });

    if (!request) {
      return res.status(404).json({ error: 'Ownership request not found' });
    }

    if (status === 'APPROVED') {
      // Check if the album already has an owner
      if (request.album.ownerId) {
        return res.status(400).json({ error: 'This album already has an owner' });
      }

      // Update album ownership and request status in a transaction
      await prisma.$transaction([
        prisma.album.update({
          where: { id: request.albumId },
          data: { ownerId: request.userId },
        }),
        prisma.ownershipRequest.update({
          where: { id: parseInt(id) },
          data: { status },
        }),
      ]);
    } else {
      // Just update the request status if rejected
      await prisma.ownershipRequest.update({
        where: { id: parseInt(id) },
        data: { status },
      });
    }

    res.json({ message: `Ownership request ${status.toLowerCase()}` });
  } catch (error) {
    console.error('Error updating ownership request:', error);
    res.status(500).json({ error: 'An error occurred while updating the ownership request' });
  }
});

// PUT: Assign album ownership directly
router.put('/assign-ownership', auth, adminAuth, async (req, res) => {
  try {
    const { userId, albumId } = req.body;

    const album = await prisma.album.findUnique({ where: { id: parseInt(albumId) } });

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    if (album.ownerId) {
      return res.status(400).json({ error: 'This album already has an owner' });
    }

    const updatedAlbum = await prisma.album.update({
      where: { id: parseInt(albumId) },
      data: { ownerId: parseInt(userId) },
    });

    res.json(updatedAlbum);
  } catch (error) {
    console.error('Error assigning ownership:', error);
    res.status(500).json({ error: 'An error occurred while assigning ownership' });
  }
});

module.exports = router;