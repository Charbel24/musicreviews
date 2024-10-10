const router = require("express").Router();
const prisma = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {auth,adminAuth} = require("../middleware/auth");

router.post("/", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hash,
      },
    });
    res.status(201).json({ message: "User Created" });
  } catch (error) {
    res.status(500).json({ error: "Internal error" });
  }
});

// GET all users
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or Password" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or Password" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({ message: "Login Succesful", token });
  } catch (error) {
    res.status(500).json({ error: "Internal error" });
    console.log(error);
  }
});

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isAdmin: true,
        reviews: {
          select: {
            id: true,
            content: true,
            rating: true,
            createdAt: true,
            album: {
              select: {
                id: true,
                title: true,
                artist: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        comments:{
          select:{
            id: true,
            content: true,
            createdAt: true,
            review: {
              select: {
                id:true,
                album: true,
              }
            }
          }
        },
        reports: true
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    res.json(user);
  } catch (error) { 
    console.log(error)
    res.status(500).json({error:'Internal Error'})
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.userId;

   
    // const existingUser = await prisma.user.findUnique({ where: { email } });
    // if (existingUser && existingUser.id !== userId) {
    //   return res.status(400).json({ error: 'Email is already in use' });
    // }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        // Add any other fields you want to return, but exclude sensitive info like password
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
