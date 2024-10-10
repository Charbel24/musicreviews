const router = require("express").Router();
const prisma = require("../db");
const { auth, adminAuth } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};
    if (search) {
      whereClause = {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { artist: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const albums = await prisma.album.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        artist: true,
        year: true,
        genre: true,
        imageUrl: true,
        createdAt: true,
        _count: {
          select: { reviews: true },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    const albumsWithAverageRating = albums.map((album) => ({
      ...album,
      averageRating:
        album.reviews.length > 0
          ? (
              album.reviews.reduce((sum, review) => sum + review.rating, 0) /
              album.reviews.length
            ).toFixed(1)
          : null,
      reviewCount: album.reviews.length,
    }));

    res.json({ albums: albumsWithAverageRating });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Failed To Get Albums" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const albums = await prisma.album.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        title: true,
        artist: true,
        year: true,
        genre: true,
        imageUrl: true,
        createdAt: true,
        ownerId: true,
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            createdAt: true,
            comments: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    res.json({ albums });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Failed To Get Albums" });
  }
});

router.post("/", auth, adminAuth, async (req, res) => {
  try {
    const { title, artist, year, genre, imageUrl } = req.body;
    if (!title || !artist || !year) {
      return res
        .status(400)
        .json({ error: "title, artist, year Are Required " });
    }
    const newAlbum = await prisma.album.create({
      data: { title, artist, genre, year, imageUrl },
    });
    res.status(201).json(newAlbum);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create album" });
  }
});

// POST: Claim ownership of an album
router.post('/:id/claim', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const album = await prisma.album.update({
      where: { id: parseInt(id) },
      data: { ownerId: userId },
    });

    res.json(album);
  } catch (error) {
    console.error('Error claiming album ownership:', error);
    res.status(500).json({ error: 'An error occurred while claiming album ownership' });
  }
});

// POST: Request ownership of an album
router.post('/:id/request-ownership', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const album = await prisma.album.findUnique({ where: { id: parseInt(id) } });

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    if (album.ownerId) {
      return res.status(400).json({ error: 'This album already has an owner' });
    }

    const existingRequest = await prisma.ownershipRequest.findFirst({
      where: {
        albumId: parseInt(id),
        userId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending ownership request for this album' });
    }

    const newRequest = await prisma.ownershipRequest.create({
      data: {
        userId,
        albumId: parseInt(id),
      },
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error requesting album ownership:', error);
    res.status(500).json({ error: 'An error occurred while requesting album ownership' });
  }
});

// PUT: Edit album information (owner only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, artist, year, genre } = req.body;

    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!req.isAdmin) {
      if (!album || album.ownerId !== userId  ) {      
        return res.status(403).json({ error: 'Not authorized to edit this album' });
      }
    }

    const updatedAlbum = await prisma.album.update({
      where: { id: parseInt(id) },
      data: { title, artist, year: parseInt(year), genre },
    });

    res.json(updatedAlbum);
  } catch (error) {
    console.error('Error updating album:', error);
    res.status(500).json({ error: 'An error occurred while updating the album' });
  }
});

router.put("/:id", auth, adminAuth, async (req, res) => {
  try {
    const { title, artist, year, genre, imageUrl } = req.body;
    if (!title || !artist || !year) {
      return res
        .status(400)
        .json({ error: "title, artist, year Are Required " });
    }
    const album = await prisma.album.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!album) {
      return res.status(400).json({ error: "Album Not Found" });
    }
    const updatedAlbum = await prisma.album.update({
      where: { id: parseInt(req.params.id) },
      data: { title, artist, genre, year, imageUrl },
    });
    res.status(200).json(updatedAlbum);
  } catch (error) {
    res.status(500).json({ error: "Failed To Update Album" });
  }
});

router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const album = await prisma.album.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!album) {
      return res.status(400).json({ error: "Album Not Found" });
    }
    const deletedAlbum = await prisma.album.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(200).json({ message: "Album Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to Delete Album" });
  }
});

module.exports = router;
